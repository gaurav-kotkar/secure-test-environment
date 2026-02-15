const express = require('express');
const cors = require('cors');
require('dotenv').config();

const runMigrations = require('./migrations/runMigrations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 🚀 Start Server AFTER migrations
async function startServer() {
  try {
    await runMigrations();
    console.log('✓ Migrations completed successfully');

    app.listen(PORT, () => {
      console.log('=====================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API endpoint: /api`);
      console.log('=====================================');
    });

  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1); // Stop app if DB setup fails
  }
}

startServer();

module.exports = app;
