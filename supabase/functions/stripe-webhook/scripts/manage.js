#!/usr/bin/env node

const { program } = require('commander');
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  metricsDir: path.join(__dirname, '../.metrics'),
  logsDir: path.join(__dirname, '../.logs'),
  scripts: {
    maintain: './maintain.sh',
    recover: './recover-db.sql',
    reconcile: './reconcile.js',
    analyze: './analyze-logs.js',
    monitor: './monitor-db.js',
  },
  alertThresholds: {
    errors: 10,
    mismatches: 5,
    recoveryAttempts: 3,
  },
};

// Helper functions
function ensureDirectories() {
  [config.metricsDir, config.logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

async function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.quiet ? 'ignore' : 'inherit',
      shell: true,
    });

    let output = '';
    if (options.quiet) {
      child.stdout?.on('data', data => output += data);
      child.stderr?.on('data', data => output += data);
    }

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function checkHealth() {
  console.log('\nChecking system health...');
  
  const results = {
    database: false,
    webhookEndpoint: false,
    diskSpace: false,
  };

  try {
    // Check database
    await executeCommand('node', ['monitor-db.js', '--check'], { quiet: true });
    results.database = true;
  } catch (error) {
    console.error('Database check failed:', error.message);
  }

  try {
    // Check webhook endpoint
    const response = await fetch(process.env.WEBHOOK_URL);
    results.webhookEndpoint = response.status === 405; // Should reject GET with 405
  } catch (error) {
    console.error('Webhook endpoint check failed:', error.message);
  }

  try {
    // Check disk space
    const { stdout } = await executeCommand('df -h .', [], { quiet: true });
    const usage = parseInt(stdout.split('\n')[1].split(/\s+/)[4].replace('%', ''));
    results.diskSpace = usage < 90;
  } catch (error) {
    console.error('Disk space check failed:', error.message);
  }

  return results;
}

async function runMaintenance(options = {}) {
  console.log('\nRunning maintenance tasks...');

  try {
    // Run database maintenance
    await executeCommand(config.scripts.maintain, options.quick ? ['--quick'] : []);

    // Run analysis
    if (!options.quick) {
      await executeCommand('node', [config.scripts.analyze]);
    }

    console.log('Maintenance completed successfully');
  } catch (error) {
    console.error('Maintenance failed:', error);
    throw error;
  }
}

async function runRecovery(options = {}) {
  console.log('\nRunning recovery procedures...');

  try {
    // Execute recovery SQL
    await executeCommand('psql', ['-f', config.scripts.recover]);

    // Run reconciliation if requested
    if (!options.skipReconcile) {
      await executeCommand('node', [config.scripts.reconcile, 'all']);
    }

    console.log('Recovery completed successfully');
  } catch (error) {
    console.error('Recovery failed:', error);
    throw error;
  }
}

async function generateReport() {
  console.log('\nGenerating comprehensive report...');

  const report = {
    timestamp: new Date().toISOString(),
    health: await checkHealth(),
    metrics: {},
    alerts: [],
  };

  try {
    // Collect metrics
    const dbMetrics = JSON.parse(
      await executeCommand('node', [config.scripts.monitor, '--json'], { quiet: true })
    );
    report.metrics.database = dbMetrics;

    // Analyze logs
    const logMetrics = JSON.parse(
      await executeCommand('node', [config.scripts.analyze, '--json'], { quiet: true })
    );
    report.metrics.logs = logMetrics;

    // Generate alerts
    if (logMetrics.errors > config.alertThresholds.errors) {
      report.alerts.push({
        level: 'high',
        message: `High error count: ${logMetrics.errors}`,
      });
    }

    if (dbMetrics.mismatches > config.alertThresholds.mismatches) {
      report.alerts.push({
        level: 'medium',
        message: `Data mismatches found: ${dbMetrics.mismatches}`,
      });
    }

    // Save report
    const reportPath = path.join(
      config.metricsDir,
      `report-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`Report saved to ${reportPath}`);
    return report;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}

// CLI setup
program
  .name('manage')
  .description('Manage webhook handler maintenance and recovery');

program
  .command('health')
  .description('Check system health')
  .action(async () => {
    try {
      const results = await checkHealth();
      console.log('\nHealth Check Results:');
      console.table(results);
      process.exit(Object.values(results).every(r => r) ? 0 : 1);
    } catch (error) {
      console.error('Health check failed:', error);
      process.exit(1);
    }
  });

program
  .command('maintain')
  .description('Run maintenance tasks')
  .option('-q, --quick', 'Run quick maintenance only')
  .action(async (options) => {
    try {
      await runMaintenance(options);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('recover')
  .description('Run recovery procedures')
  .option('--skip-reconcile', 'Skip reconciliation step')
  .action(async (options) => {
    try {
      await runRecovery(options);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate comprehensive report')
  .action(async () => {
    try {
      const report = await generateReport();
      if (report.alerts.length > 0) {
        console.log('\nAlerts:');
        report.alerts.forEach(alert => {
          console.log(`[${alert.level.toUpperCase()}] ${alert.message}`);
        });
      }
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('auto')
  .description('Run automated maintenance and recovery if needed')
  .action(async () => {
    try {
      const health = await checkHealth();
      const needsMaintenance = !Object.values(health).every(h => h);

      if (needsMaintenance) {
        console.log('Health check failed, running maintenance...');
        await runMaintenance();
        await runRecovery();
      }

      await generateReport();
    } catch (error) {
      console.error('Automated management failed:', error);
      process.exit(1);
    }
  });

// Execute CLI
program.parse();