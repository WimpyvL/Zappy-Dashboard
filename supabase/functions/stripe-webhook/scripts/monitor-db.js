#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  outputDir: path.join(__dirname, '../.metrics'),
  tables: [
    'stripe_events',
    'patient_invoices',
    'payment_recovery_attempts'
  ],
  alertThresholds: {
    rowCount: 1000000,      // Alert if any table exceeds this
    storageSize: 1000000000, // 1GB
    indexBloat: 20,         // 20% bloat
    slowQueries: 1000,      // 1 second
    errorRate: 0.05,        // 5% error rate
  },
  retention: {
    metricsRetentionDays: 30,
    eventsRetentionDays: 90,
  }
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Metrics collection
async function collectTableMetrics(tableName) {
  const metrics = {
    timestamp: new Date().toISOString(),
    tableName,
    rowCount: 0,
    sizeBytes: 0,
    indexSize: 0,
    indexBloat: 0,
    avgQueryTime: 0,
    errorCount: 0,
    deadRows: 0,
  };

  try {
    // Get row count and size
    const { data: stats } = await supabase.rpc('get_table_stats', {
      table_name: tableName
    });
    
    if (stats) {
      metrics.rowCount = stats.row_count;
      metrics.sizeBytes = stats.total_bytes;
      metrics.indexSize = stats.index_bytes;
      metrics.deadRows = stats.dead_rows;
    }

    // Get performance metrics
    const { data: perf } = await supabase.rpc('get_table_performance', {
      table_name: tableName,
      hours: 24
    });
    
    if (perf) {
      metrics.avgQueryTime = perf.avg_query_time;
      metrics.errorCount = perf.error_count;
    }

    return metrics;
  } catch (error) {
    console.error(`Error collecting metrics for ${tableName}:`, error);
    return metrics;
  }
}

// Storage analysis
function analyzeStorage(metrics) {
  const alerts = [];
  let totalSize = 0;

  for (const tableMetrics of metrics) {
    totalSize += tableMetrics.sizeBytes;

    if (tableMetrics.rowCount > config.alertThresholds.rowCount) {
      alerts.push(`High row count in ${tableMetrics.tableName}: ${tableMetrics.rowCount.toLocaleString()}`);
    }

    if (tableMetrics.deadRows > tableMetrics.rowCount * 0.1) {
      alerts.push(`High dead row ratio in ${tableMetrics.tableName}: ${((tableMetrics.deadRows / tableMetrics.rowCount) * 100).toFixed(1)}%`);
    }

    const bloatPercentage = (tableMetrics.indexSize / tableMetrics.sizeBytes) * 100;
    if (bloatPercentage > config.alertThresholds.indexBloat) {
      alerts.push(`High index bloat in ${tableMetrics.tableName}: ${bloatPercentage.toFixed(1)}%`);
    }
  }

  if (totalSize > config.alertThresholds.storageSize) {
    alerts.push(`Total storage size exceeds threshold: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)}GB`);
  }

  return alerts;
}

// Performance analysis
function analyzePerformance(metrics) {
  const alerts = [];

  for (const tableMetrics of metrics) {
    if (tableMetrics.avgQueryTime > config.alertThresholds.slowQueries) {
      alerts.push(`Slow queries on ${tableMetrics.tableName}: ${tableMetrics.avgQueryTime.toFixed(2)}ms average`);
    }

    const errorRate = tableMetrics.errorCount / tableMetrics.rowCount;
    if (errorRate > config.alertThresholds.errorRate) {
      alerts.push(`High error rate on ${tableMetrics.tableName}: ${(errorRate * 100).toFixed(1)}%`);
    }
  }

  return alerts;
}

// Maintenance recommendations
function generateRecommendations(metrics) {
  const recommendations = [];

  for (const tableMetrics of metrics) {
    // Vacuum recommendations
    if (tableMetrics.deadRows > tableMetrics.rowCount * 0.2) {
      recommendations.push({
        table: tableMetrics.tableName,
        action: 'VACUUM',
        priority: 'HIGH',
        reason: `${((tableMetrics.deadRows / tableMetrics.rowCount) * 100).toFixed(1)}% dead rows`,
      });
    }

    // Reindex recommendations
    const bloatPercentage = (tableMetrics.indexSize / tableMetrics.sizeBytes) * 100;
    if (bloatPercentage > 30) {
      recommendations.push({
        table: tableMetrics.tableName,
        action: 'REINDEX',
        priority: 'MEDIUM',
        reason: `${bloatPercentage.toFixed(1)}% index bloat`,
      });
    }

    // Partitioning recommendations
    if (tableMetrics.rowCount > 5000000) {
      recommendations.push({
        table: tableMetrics.tableName,
        action: 'PARTITION',
        priority: 'LOW',
        reason: 'Large table size',
      });
    }
  }

  return recommendations;
}

// Report generation
function generateReport(metrics) {
  const storageAlerts = analyzeStorage(metrics);
  const performanceAlerts = analyzePerformance(metrics);
  const recommendations = generateRecommendations(metrics);

  const report = {
    timestamp: new Date().toISOString(),
    metrics,
    alerts: [...storageAlerts, ...performanceAlerts],
    recommendations,
    summary: {
      totalTables: metrics.length,
      totalSize: metrics.reduce((sum, m) => sum + m.sizeBytes, 0),
      totalRows: metrics.reduce((sum, m) => sum + m.rowCount, 0),
      avgQueryTime: metrics.reduce((sum, m) => sum + m.avgQueryTime, 0) / metrics.length,
    },
  };

  return report;
}

// Save metrics to file
function saveReport(report) {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const filename = path.join(
    config.outputDir,
    `db-metrics-${new Date().toISOString().split('T')[0]}.json`
  );

  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${filename}`);
}

// Main execution
async function main() {
  console.log('Collecting database metrics...');

  const metrics = [];
  for (const table of config.tables) {
    const tableMetrics = await collectTableMetrics(table);
    metrics.push(tableMetrics);
    process.stdout.write('.');
  }
  console.log('\n');

  const report = generateReport(metrics);
  saveReport(report);

  // Print summary
  console.log('\nDatabase Monitoring Report');
  console.log('========================\n');

  console.log('Summary:');
  console.log(`Total Tables: ${report.summary.totalTables}`);
  console.log(`Total Rows: ${report.summary.totalRows.toLocaleString()}`);
  console.log(`Total Size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Average Query Time: ${report.summary.avgQueryTime.toFixed(2)}ms\n`);

  if (report.alerts.length > 0) {
    console.log('Alerts:');
    report.alerts.forEach(alert => console.log(`⚠️  ${alert}`));
    console.log('');
  }

  if (report.recommendations.length > 0) {
    console.log('Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`[${rec.priority}] ${rec.table}: ${rec.action}`);
      console.log(`  Reason: ${rec.reason}`);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  collectTableMetrics,
  analyzeStorage,
  analyzePerformance,
  generateRecommendations,
  config,
};