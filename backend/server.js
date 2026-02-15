const express = require('express');
const cors = require('cors');
require('dotenv').config();

const runMigrations = require('./migrations/runMigrations');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://secure-test-environment-ashen.vercel.app', // your frontend
  'http://localhost:3000' // local dev
];

// Middleware
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies if needed
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
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
