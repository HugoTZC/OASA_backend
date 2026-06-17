const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// Manual CORS middleware to ensure headers are not stripped by proxies (e.g., ngrok)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Disable the cors package to avoid double-header conflicts
// app.use(cors({ origin: true, credentials: true }));

// Other middleware
// app.use(helmet()); // Disabled for CORS testing
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'OASA Backend API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/settings', require('./routes/site-settings'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/db-admin', require('./routes/db-admin'));
app.use('/api/images', require('./routes/images'));

// Serve product images as static files
app.use('/images', express.static('/Users/hugomeza/Dev Projects/oasaimages'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: "Backend funcionando correctamente en Render" });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 OASA Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
