// connect-to-chrome.js
const { chromium } = require('@playwright/test');

async function connectToChrome() {
  try {
    // Connect to the browser
    console.log('Connecting to Chrome browser with debugging port 9222...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('Successfully connected to Chrome browser!');
    
    // Get all pages that are already open
    const contexts = browser.contexts();
    console.log(`Found ${contexts.length} browser context(s)`);
    
    for (const context of contexts) {
      const pages = context.pages();
      console.log(`Found ${pages.length} page(s) in this context`);
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        console.log(`Page ${i + 1}: ${page.url()}`);
      }
      
      if (pages.length > 0) {
        // Create a new page in the existing context
        console.log('Creating a new page...');
        const newPage = await context.newPage();
        await newPage.goto('https://www.example.com');
        console.log('Navigated to example.com');
        
        // You can automate this page as needed
        await newPage.screenshot({ path: 'screenshot.png' });
        console.log('Screenshot saved as screenshot.png');
      }
    }
    
    console.log('Script completed successfully. The browser will stay open.');
    
    // Don't close the browser as it was opened externally
    // await browser.close();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

connectToChrome();
