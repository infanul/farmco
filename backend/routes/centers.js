const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// GET ALL PROCUREMENT CENTERS WITH ACTIVE SUMMARY
router.get('/', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const sql = `
    SELECT c.*, 
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ?) as today_bookings_count,
      (SELECT COALESCE(SUM(b.quantity_kg), 0) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ?) as today_expected_kg,
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ? AND b.procurement_status IN ('Checked-in', 'Quality Verification')) as active_queue_length
    FROM centers c
  `;

  db.all(sql, [todayStr, todayStr, todayStr], (err, centers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json({ centers });
  });
});

// GET SINGLE CENTER DETAILS
router.get('/:id', (req, res) => {
  const centerId = req.params.id;
  const todayStr = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT c.*, 
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ?) as today_bookings_count,
      (SELECT COALESCE(SUM(b.quantity_kg), 0) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ?) as today_expected_kg,
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ? AND b.procurement_status IN ('Checked-in', 'Quality Verification')) as active_queue_length
    FROM centers c
    WHERE c.id = ?
  `;

  db.get(sql, [todayStr, todayStr, todayStr, centerId], (err, center) => {
    if (err || !center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    res.json({ center });
  });
});

// UPDATE CENTER STATUS (Open / Delayed / Closed) & TRIGGER DELAY NOTIFICATIONS
router.post('/:id/status', (req, res) => {
  const centerId = req.params.id;
  const { status, status_note, delay_mins, notify_farmers } = req.body;

  if (!['open', 'delayed', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be open, delayed, or closed.' });
  }

  const updateSql = `
    UPDATE centers 
    SET status = ?, status_note = ?
    WHERE id = ?
  `;

  db.run(updateSql, [status, status_note || '', centerId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update center status', details: err.message });
    }

    db.get('SELECT * FROM centers WHERE id = ?', [centerId], async (getErr, center) => {
      if (getErr || !center) {
        return res.status(404).json({ error: 'Center not found after update' });
      }

      let sentLogs = [];
      // Trigger notifications if requested or if status set to delayed/closed
      if (notify_farmers || status === 'delayed' || status === 'closed') {
        const mins = delay_mins || 30;
        const reason = status_note || (status === 'delayed' ? 'Heavy morning arrivals and unloading delay' : 'Weather / Technical maintenance');
        try {
          sentLogs = await notificationService.broadcastCenterDelay(centerId, center.name, mins, reason);
        } catch (notifErr) {
          console.error('Broadcast failed:', notifErr);
        }
      }

      res.json({
        message: `Center status updated to ${status.toUpperCase()}`,
        center,
        notifications_sent_count: sentLogs.length,
        notifications: sentLogs
      });
    });
  });
});

// GET FARMER-SPECIFIC NOTIFICATIONS (Filtered by phone or center)
router.get('/farmer-notifications', (req, res) => {
  const { phone, center_id } = req.query;
  let sql = `SELECT * FROM notifications WHERE 1=1`;
  const params = [];

  if (phone) {
    sql += ` AND (farmer_phone = ? OR farmer_phone = 'all' OR farmer_phone IS NULL OR center_id = ?)`;
    params.push(phone, center_id || 1);
  } else if (center_id) {
    sql += ` AND center_id = ?`;
    params.push(center_id);
  }

  sql += ` ORDER BY id DESC LIMIT 30`;

  db.all(sql, params, (err, notifications) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ notifications: notifications || [] });
  });
});

// GET NOTIFICATION AUDIT LOGS FOR A CENTER
router.get('/:id/notifications', (req, res) => {
  const centerId = req.params.id;
  db.all('SELECT * FROM notifications WHERE center_id = ? ORDER BY id DESC LIMIT 50', [centerId], (err, notifications) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ notifications });
  });
});

module.exports = router;
