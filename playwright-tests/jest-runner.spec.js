// This file has been renamed to jest-runner.spec.js.bak to prevent it from running
// Running Jest tests inside Playwright causes environment conflicts
// Please use the run-all-tests.js script instead which runs Jest and Playwright separately

// Original implementation:
// @ts-check
// const { test, expect } = require('@playwright/test');
// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// const util = require('util');
// const execPromise = util.promisify(exec);

// /**
//  * This test will find and run all Jest test files in the project
//  */
// test('Run all Jest tests', async ({ page }) => {
//   // Find all test files in the src directory
//   const testFiles = await findTestFiles('c:\\Git Repos\\Zappy-Dashboard\\src');
//   console.log(`Found ${testFiles.length} test files to run`);
  
//   // Run each test file with Jest
//   let failedTests = [];
//   let passedTests = 0;
  
//   for (const file of testFiles) {
//     console.log(`Running tests in ${file}`);
    
//     try {
//       const result = await execPromise(`npx jest ${file} --no-cache`);
//       console.log(`✅ Tests passed in ${file}`);
//       passedTests++;
//     } catch (error) {
//       console.error(`❌ Tests failed in ${file}: ${error.message}`);
//       failedTests.push({ file, error: error.message });
//     }
//   }
  
//   // Log summary
//   console.log('----------------------------------------');
//   console.log(`Test Summary: ${passedTests} passed, ${failedTests.length} failed`);
  
//   // Print failed tests details
//   if (failedTests.length > 0) {
//     console.log('Failed tests:');
//     failedTests.forEach(({ file, error }) => {
//       console.log(`  ${file}: ${error}`);
//     });
//   }
  
//   // Make the test fail if any Jest test failed
//   expect(failedTests.length).toBe(0, `${failedTests.length} Jest tests failed`);
// });

// /**
//  * Recursively find all test files in a directory
//  * @param {string} dir - Directory to search in
//  * @returns {Promise<string[]>} - Array of test file paths
//  */
// async function findTestFiles(dir) {
//   let results = [];
  
//   try {
//     const files = fs.readdirSync(dir);
    
//     for (const file of files) {
//       const filePath = path.join(dir, file);
//       const stat = fs.statSync(filePath);
      
//       if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
//         // Recursively search subdirectories
//         results = results.concat(await findTestFiles(filePath));
//       } else if (
//         (file.endsWith('.test.js') || file.endsWith('.test.jsx') || 
//          file.endsWith('.spec.js') || file.endsWith('.spec.jsx'))
//       ) {
//         // Found a test file
//         results.push(filePath);
//       }
//     }
//   } catch (error) {
//     console.error(`Error scanning directory ${dir}: ${error.message}`);
//   }
  
//   return results;
// }