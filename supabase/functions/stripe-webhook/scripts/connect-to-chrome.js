// Script to connect to Chrome's remote debugging port
const CDP = require('chrome-remote-interface');

async function connectToChrome() {
  try {
    // Connect to Chrome
    const client = await CDP();
    const { Network, Page } = client;

    // Enable events
    await Promise.all([
      Network.enable(),
      Page.enable()
    ]);

    // Setup handlers
    Network.requestWillBeSent((params) => {
      console.log(`Request: ${params.request.url}`);
      if (params.request.postData) {
        console.log('POST Data:', params.request.postData);
      }
    });

    Network.responseReceived((params) => {
      console.log(`Response: ${params.response.url}`);
      console.log('Status:', params.response.status);
      if (params.response.headers) {
        console.log('Headers:', params.response.headers);
      }
    });

    // Log any errors
    Network.loadingFailed((params) => {
      console.error('Loading failed:', params.errorText);
    });

    // Navigate to webhook endpoint
    await Page.navigate({
      url: 'http://localhost:54321/functions/v1/stripe-webhook'
    });

    // Wait for page load
    await Page.loadEventFired();

    console.log('Connected to Chrome debugging port');
    console.log('Monitoring network requests...');
    console.log('Press Ctrl+C to exit');

  } catch (err) {
    console.error('Failed to connect to Chrome:', err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nDisconnecting from Chrome...');
  process.exit();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Start monitoring
connectToChrome();