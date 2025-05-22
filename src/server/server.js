const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { handleFormSubmissionWebhook } = require('./webhooks/formSubmissionWebhook');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Webhook routes
app.post('/webhooks/form-submissions', handleFormSubmissionWebhook);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;