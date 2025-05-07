#!/usr/bin/env node
const { execSync, exec, spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);

// Configuration
const config = {
  jestCommand: 'npx jest',
  playwrightCommand: 'npx playwright test',
  jestConfig: '--no-cache --detectOpenHandles --forceExit',
  playwrightConfig: '',
  testTypes: ['unit', 'integration', 'e2e'],
  retry: 1, // Add retry for flaky tests
  debugMode: args.includes('--debug'),
  parallelMode: args.includes('--parallel'),
  filterTests: args.find(arg => arg.startsWith('--filter=')),
  reportDir: './test-results',
  timeoutMinutes: 20
};

if (config.filterTests) {
  config.filterTests = config.filterTests.split('=')[1].toLowerCase();
}

/**
 * Main function to run all tests
 */
async function runAllTests() {
  console.log(chalk.blue('==========================================='));
  console.log(chalk.blue('🧪 Running all tests for Zappy Dashboard 🧪'));
  console.log(chalk.blue('==========================================='));
  
  let startTime = Date.now();
  let results = {
    jest: { passed: 0, failed: 0 },
    playwright: { passed: 0, failed: 0 },
    skipped: []
  };
  
  try {
    // Create report directory if it doesn't exist
    ensureDirectoryExists(config.reportDir);
    
    // Show current options
    console.log(chalk.yellow('\nTest Configuration:'));
    console.log(chalk.yellow(`- Debug Mode: ${config.debugMode ? 'ON' : 'OFF'}`));
    console.log(chalk.yellow(`- Parallel Execution: ${config.parallelMode ? 'ON' : 'OFF'}`));
    console.log(chalk.yellow(`- Test Filter: ${config.filterTests || 'NONE (running all tests)'}`));
    console.log(chalk.yellow(`- Retry Attempts: ${config.retry}`));
    console.log();
    
    // Check if development server is running
    console.log(chalk.yellow('Checking development environment...'));
    const devServerRunning = await isPortInUse(3000) || await isPortInUse(5000) || await isPortInUse(8000);
    
    if (!devServerRunning) {
      console.log(chalk.yellow('⚠️ No development server detected! E2E tests may fail.'));
      console.log(chalk.yellow('Consider running "npm start" in a separate terminal first.'));
      
      if (await promptYesNo('Would you like to start the dev server now?')) {
        startDevServer();
        // Give the server some time to start up
        console.log(chalk.yellow('Waiting for dev server to start...'));
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Determine tests to run based on filter
    const runJestTests = !config.filterTests || ['unit', 'integration', 'all'].includes(config.filterTests);
    const runPlaywrightTests = !config.filterTests || ['e2e', 'all'].includes(config.filterTests);
    
    // Parallel or sequential execution
    if (config.parallelMode && runJestTests && runPlaywrightTests) {
      console.log(chalk.cyan('\n⚡ Running Jest and Playwright tests in parallel\n'));
      const [jestResult, playwrightResult] = await Promise.allSettled([
        runJestTestsAsync(),
        runPlaywrightTestsAsync()
      ]);
      
      results.jest = jestResult.status === 'fulfilled' ? jestResult.value : { passed: 0, failed: 1 };
      results.playwright = playwrightResult.status === 'fulfilled' ? playwrightResult.value : { passed: 0, failed: 1 };
    } else {
      // Sequential execution
      if (runJestTests) {
        const jestResult = await runJestTestsAsync();
        results.jest = jestResult;
      } else {
        results.skipped.push('Jest Tests (unit & integration)');
      }
      
      if (runPlaywrightTests) {
        const playwrightResult = await runPlaywrightTestsAsync();
        results.playwright = playwrightResult;
      } else {
        results.skipped.push('Playwright Tests (e2e)');
      }
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error running tests: ${error.message}\n`));
    if (config.debugMode) {
      console.log(chalk.yellow('Full error:'));
      console.log(error);
    }
  }
  
  // Print summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(chalk.blue('\n==========================================='));
  console.log(chalk.blue('📊 Test Results Summary:'));
  console.log(chalk.blue('==========================================='));
  
  if (!config.filterTests || ['unit', 'integration', 'all'].includes(config.filterTests)) {
    console.log(chalk.cyan('Jest Tests:'), results.jest.failed === 0 ? chalk.green('PASSED') : chalk.red('FAILED'));
  }
  
  if (!config.filterTests || ['e2e', 'all'].includes(config.filterTests)) {
    console.log(chalk.cyan('Playwright Tests:'), results.playwright.failed === 0 ? chalk.green('PASSED') : chalk.red('FAILED'));
  }
  
  if (results.skipped.length > 0) {
    console.log(chalk.yellow('\nSkipped Tests:'));
    results.skipped.forEach(test => console.log(chalk.yellow(`- ${test}`)));
  }
  
  console.log(chalk.blue('\n==========================================='));
  console.log(chalk.blue(`⏱️ Total time: ${totalTime} seconds`));
  console.log(chalk.blue('===========================================\n'));
  
  // Print troubleshooting tips if tests failed
  if (results.jest.failed > 0 || results.playwright.failed > 0) {
    printTroubleshootingTips(results);
  }
  
  // Exit with error code if any tests failed
  if (results.jest.failed > 0 || results.playwright.failed > 0) {
    process.exit(1);
  }
}

/**
 * Run Jest tests asynchronously
 * @returns {Promise<{passed: number, failed: number}>} - Test results
 */
async function runJestTestsAsync() {
  console.log(chalk.cyan('\n📋 Running Jest Tests (Unit & Integration):\n'));
  
  try {
    // Make sure the app is built before running tests
    console.log(chalk.yellow('Building app for testing...'));
    execSync('npm run build', { stdio: 'inherit' });
    
    // Run Jest tests
    const jestCommand = `${config.jestCommand} ${config.jestConfig} --json --outputFile=${path.join(config.reportDir, 'jest-results.json')}`;
    if (config.debugMode) console.log(chalk.gray(`Running: ${jestCommand}`));
    
    execSync(jestCommand, { stdio: 'inherit' });
    
    // Check for test coverage if available
    try {
      const coverageFile = path.join('coverage', 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
        const totalCoverage = coverage.total.statements.pct;
        console.log(chalk.green(`\n📊 Test coverage: ${totalCoverage}%\n`));
      }
    } catch (e) {
      if (config.debugMode) {
        console.log(chalk.yellow('Could not read coverage information:'));
        console.log(e.message);
      }
    }
    
    console.log(chalk.green('\n✅ All Jest tests passed!\n'));
    return { passed: 1, failed: 0 };
  } catch (error) {
    console.log(chalk.red('\n❌ Some Jest tests failed\n'));
    
    if (config.debugMode) {
      console.log(chalk.yellow('Debug info:'));
      console.log(error.message);
    }
    
    return { passed: 0, failed: 1 };
  }
}

/**
 * Run Playwright tests asynchronously 
 * @returns {Promise<{passed: number, failed: number}>} - Test results
 */
async function runPlaywrightTestsAsync() {
  console.log(chalk.cyan('\n🎭 Running Playwright Tests (E2E):\n'));
  
  try {
    // Verify Playwright installation
    try {
      execSync('npx playwright install --with-deps', { stdio: 'pipe' });
    } catch (e) {
      console.log(chalk.yellow('⚠️ Could not verify Playwright installation. Continuing anyway.'));
    }
    
    // Run Playwright tests with potential retry for flaky tests
    for (let attempt = 0; attempt <= config.retry; attempt++) {
      if (attempt > 0) {
        console.log(chalk.yellow(`\nRetrying Playwright tests (Attempt ${attempt}/${config.retry})...\n`));
      }
      
      try {
        // Run Playwright tests
        const playwrightCommand = `${config.playwrightCommand} ${config.playwrightConfig}`;
        if (config.debugMode) console.log(chalk.gray(`Running: ${playwrightCommand}`));
        
        execSync(playwrightCommand, { stdio: 'inherit' });
        console.log(chalk.green('\n✅ All Playwright tests passed!\n'));
        return { passed: 1, failed: 0 }; // Exit the retry loop if tests pass
      } catch (error) {
        if (attempt === config.retry) {
          console.log(chalk.red('\n❌ Playwright tests failed after all retry attempts\n'));
          
          if (config.debugMode) {
            console.log(chalk.yellow('Debug info:'));
            console.log(error.message);
          }
          
          return { passed: 0, failed: 1 };
        }
      }
    }
    
    return { passed: 0, failed: 1 }; // This line should never be reached due to the return statements above
  } catch (error) {
    console.log(chalk.red('\n❌ Some Playwright tests failed\n'));
    
    if (config.debugMode) {
      console.log(chalk.yellow('Debug info:'));
      console.log(error.message);
    }
    
    return { passed: 0, failed: 1 };
  }
}

/**
 * Check if a port is in use
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if port is in use
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', () => {
      // Port is in use
      resolve(true);
    });
    
    server.once('listening', () => {
      // Port is not in use
      server.close(() => {
        resolve(false);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Start the development server
 */
function startDevServer() {
  const serverProcess = spawn('npm', ['start'], {
    detached: true,
    stdio: 'ignore'
  });
  
  serverProcess.unref();
  console.log(chalk.green('Development server started in the background'));
}

/**
 * Ensure a directory exists
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Prompt for yes/no input
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} - True if yes
 */
async function promptYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Print troubleshooting tips
 * @param {object} results - Test results
 */
function printTroubleshootingTips(results) {
  console.log(chalk.yellow('\n🔍 Troubleshooting Tips:'));
  
  if (results.jest.failed > 0) {
    console.log(chalk.yellow('- For Jest test failures:'));
    console.log(chalk.yellow('  1. Check for any pending async operations in your tests'));
    console.log(chalk.yellow('  2. Try running with "npm test -- --verbose" for more details'));
    console.log(chalk.yellow('  3. Run specific test files with "npm test -- [path-to-file]"'));
  }
  
  if (results.playwright.failed > 0) {
    console.log(chalk.yellow('- For Playwright test failures:'));
    console.log(chalk.yellow('  1. Check the screenshots in the test-results directory'));
    console.log(chalk.yellow('  2. Make sure the development server is running'));
    console.log(chalk.yellow('  3. Try running with "npx playwright test --debug" for step-by-step execution'));
    console.log(chalk.yellow('  4. Check for timeouts - you might need to increase wait times'));
  }
  
  console.log(chalk.yellow('- General tips:'));
  console.log(chalk.yellow('  1. Check for environment variables in .env file'));
  console.log(chalk.yellow('  2. Make sure all dependencies are properly installed'));
  console.log(chalk.yellow('  3. Try clearing cache: "npm run clean && npm ci"'));
  console.log();
}

// Start the test run
runAllTests().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
});

// Add timeout to prevent hanging test runs
const timeoutMs = config.timeoutMinutes * 60 * 1000;
setTimeout(() => {
  console.error(chalk.red(`\n⏰ Test run timed out after ${config.timeoutMinutes} minutes!`));
  process.exit(2);
}, timeoutMs);

// Display usage information
if (args.includes('--help')) {
  console.log(chalk.cyan('\nZappy Dashboard Test Runner Usage:'));
  console.log(chalk.cyan('=========================================='));
  console.log('node run-all-tests.js [options]');
  console.log('\nOptions:');
  console.log('  --debug         Enable debug output');
  console.log('  --parallel      Run Jest and Playwright tests in parallel');
  console.log('  --filter=type   Run only specific test type (unit, integration, e2e, all)');
  console.log('  --help          Show this help message');
  console.log('\nExamples:');
  console.log('  node run-all-tests.js --debug');
  console.log('  node run-all-tests.js --filter=e2e');
  console.log('  node run-all-tests.js --parallel --filter=all');
  process.exit(0);
}