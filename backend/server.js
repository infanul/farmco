const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const authRoutes = require('./routes/auth');
const centersRoutes = require('./routes/centers');
const bookingsRoutes = require('./routes/bookings');
const aiRoutes = require('./routes/ai');
const marketPricesRoutes = require('./routes/marketPrices');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market-prices', marketPricesRoutes);

// Health check & root route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Farm Procurement API',
    timestamp: new Date().toISOString(),
    notice: 'Assisted-access coordination layer active'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 Smart Farm Procurement Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
