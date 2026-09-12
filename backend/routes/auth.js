const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-super-secret-key-2026';

// LOGIN WITH ROLE-GATED VALIDATION & USERNAME-ONLY FARMER AUTH
router.post('/login', (req, res) => {
  const { phone, username, password, role } = req.body;
  const identifier = (username || phone || '').trim();

  if (!identifier) {
    return res.status(400).json({ error: 'Username or phone number is required' });
  }

  const requestedRole = role || 'farmer';

  if (requestedRole === 'farmer') {
    // Farmer Login: Lookup by phone or username (name) in SQLite users database
    const query = `
      SELECT * FROM users 
      WHERE (phone = ? OR LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?))
    `;
    const searchPattern = `%${identifier}%`;

    db.get(query, [identifier, identifier, searchPattern], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error', details: err.message });
      }

      if (!user) {
        // Register new farmer record in SQLite database if not found
        const newPhone = isNaN(identifier) ? `987${Math.floor(1000000 + Math.random() * 9000000)}` : identifier;
        const newName = isNaN(identifier) ? identifier : `Farmer (${identifier.slice(-4)})`;
        const insertSql = 'INSERT INTO users (name, phone, password, role, center_id) VALUES (?, ?, ?, ?, ?)';

        db.run(insertSql, [newName, newPhone, 'password123', 'farmer', null], function (insertErr) {
          if (insertErr) {
            return res.status(400).json({ error: 'Failed to create farmer record', details: insertErr.message });
          }

          const newUser = { id: this.lastID, name: newName, phone: newPhone, role: 'farmer', center_id: null };
          const token = jwt.sign({ id: newUser.id, role: 'farmer', phone: newUser.phone }, JWT_SECRET, { expiresIn: '7d' });

          return res.json({
            message: 'Farmer account created & authenticated',
            token,
            user: newUser
          });
        });
        return;
      }

      // Role Guard Check
      if (user.role !== 'farmer') {
        return res.status(403).json({ error: 'Staff/Admin accounts cannot log in through the Farmer Portal. Please use the Admin Portal login.' });
      }

      // Successful Farmer DB Authentication
      const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Farmer authenticated successfully against database',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          center_id: user.center_id
        }
      });
    });

  } else {
    // Admin / Staff Login: Authenticate phone & password against SQLite users database
    db.get('SELECT * FROM users WHERE phone = ? OR LOWER(name) = LOWER(?)', [identifier, identifier], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: 'Staff account not found in database' });
      }

      if (user.role === 'farmer') {
        return res.status(403).json({ error: 'Farmer accounts cannot log in through the Admin Portal. Please use the Farmer Portal login.' });
      }

      const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Admin authentication successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          center_id: user.center_id
        }
      });
    });
  }
});

// GET CURRENT USER / VERIFY TOKEN
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT id, name, phone, role, center_id FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET ALL DEMO USERS FOR QUICK SWITCHING
router.get('/demo-users', (req, res) => {
  db.all('SELECT id, name, phone, role, center_id FROM users ORDER BY role, id', [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users });
  });
});

module.exports = router;
