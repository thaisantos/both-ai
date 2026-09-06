// Both AI - v1
// Main entry point - Complete and Operational
// Helping do bem, de casa

const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'Both AI',
    version: '1.0.0',
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    mission: 'Helping do bem, de casa'
  });
});

app.post('/api/v1/process', (req, res) => {
  const { input } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  // Process the input
  res.json({
    success: true,
    input,
    processed: true,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const { getQuickReply } = require('./src/both-ai-v1-quick-replies');

// Nova rota só pra resposta rápida
app.post('/api/v1/whatsapp/message', (req, res) => {
  const { message, nome } = req.body;
  const reply = getQuickReply(message, nome);
  res.json({ reply, version: "v1", status: "operational" });
});

app.get('/api/v1/quick-replies', (req, res) => {
  res.json(Object.keys(require('./src/both-ai-v1-quick-replies').quickReplies));
});

// Start server (only if this file is run directly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Both AI v1.0.0 is running on port ${PORT}`);
    console.log(`✅ Service Status: OPERATIONAL`);
    console.log(`💚 Mission: Helping do bem, de casa`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
