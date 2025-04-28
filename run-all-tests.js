/**
 * Script to find and run all Jest test files in the project
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Root directory to search for test files
const rootDir = path.resolve(__dirname, 'src');

/**
 * Recursively find all test files in a directory
 * @param {string} dir - Directory to search in
 * @returns {Array<string>} - Array of test file paths
 */
function findTestFiles(dir) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
        // Recursively search subdirectories
        results = results.concat(findTestFiles(filePath));
      } else if (
        (file.endsWith('.test.js') || file.endsWith('.test.jsx') || 
         file.endsWith('.spec.js') || file.endsWith('.spec.jsx'))
      ) {
        // Found a test file
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
  
  return results;
}

/**
 * Main function to run all tests
 */
async function runAllTests() {
  // Find all test files
  console.log('Finding test files...');
  const testFiles = findTestFiles(rootDir);
  console.log(`Found ${testFiles.length} test files to run`);
  
  if (testFiles.length === 0) {
    console.log('No test files found. Exiting.');
    return;
  }
  
  // Run each test file with Jest
  let failedTests = [];
  let passedTests = 0;
  
  for (const file of testFiles) {
    // Get the relative path for display
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\nRunning tests in ${relativePath}`);
    
    try {
      // Run Jest with environment variables to avoid warnings
      const result = await execPromise(`npx cross-env NODE_OPTIONS=--no-deprecation jest ${file} --no-cache`);
      console.log(result.stdout);
      console.log(`✅ Tests passed in ${relativePath}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ Tests failed in ${relativePath}`);
      console.error(error.stdout);
      failedTests.push({ file: relativePath, error: error.message });
    }
  }
  
  // Log summary
  console.log('\n----------------------------------------');
  console.log(`Test Summary: ${passedTests} passed, ${failedTests.length} failed`);
  
  // Print failed tests details
  if (failedTests.length > 0) {
    console.log('\nFailed tests:');
    failedTests.forEach(({ file, error }) => {
      console.log(`  ${file}`);
    });
    
    // Exit with error code for CI systems
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});