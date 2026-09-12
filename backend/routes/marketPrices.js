const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL MARKET PRICES
router.get('/', (req, res) => {
  db.all('SELECT * FROM market_prices ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!rows || rows.length === 0) {
      // Fallback default dataset if empty
      const defaultPrices = [
        { id: 1, crop_id: 1, crop_name: 'Wheat (Grade A)', category: 'Cereal', unit: 'quintal', previous_day_price: 2420, current_price: 2435, expected_price: 2455, price_change: 35, price_change_percentage: 1.45, trend: 'increasing', confidence_level: 'Moderate' },
        { id: 2, crop_id: 2, crop_name: 'Paddy Rice (Basmati)', category: 'Cereal', unit: 'quintal', previous_day_price: 2180, current_price: 2190, expected_price: 2205, price_change: 25, price_change_percentage: 1.15, trend: 'increasing', confidence_level: 'Moderate' },
        { id: 3, crop_id: 3, crop_name: 'Mustard Seed', category: 'Oilseed', unit: 'quintal', previous_day_price: 5450, current_price: 5480, expected_price: 5520, price_change: 70, price_change_percentage: 1.28, trend: 'increasing', confidence_level: 'High' },
        { id: 4, crop_id: 4, crop_name: 'Maize', category: 'Cereal', unit: 'quintal', previous_day_price: 2150, current_price: 2140, expected_price: 2125, price_change: -25, price_change_percentage: -1.16, trend: 'decreasing', confidence_level: 'Moderate' }
      ];
      return res.json({ market_prices: defaultPrices, calculation_basis: "Based on previous-day market price and recent market trend." });
    }

    res.json({
      market_prices: rows,
      calculation_basis: "Based on previous-day market price and recent market movement.",
      disclaimer: "Expected market prices are calculated estimations and not guaranteed purchase rates."
    });
  });
});

// GET MARKET PRICE FOR A SPECIFIC CROP
router.get('/:cropId', (req, res) => {
  const { cropId } = req.params;
  db.get('SELECT * FROM market_prices WHERE crop_id = ? OR id = ?', [cropId, cropId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Market price data not found for this crop' });

    res.json({
      market_price: row,
      calculation_basis: "Based on previous-day market price and recent market movement.",
      disclaimer: "Expected market prices are calculated estimations."
    });
  });
});

module.exports = router;
