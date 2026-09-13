const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// GET CROPS LIST
router.get('/crops', (req, res) => {
  db.all('SELECT * FROM crops ORDER BY name', [], (err, crops) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ crops });
  });
});

// GET AVAILABLE TIME SLOTS & CAPACITY FOR A CENTER
router.get('/slots', (req, res) => {
  const { center_id, date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const centerId = center_id || 1;

  db.get('SELECT capacity_per_slot, name FROM centers WHERE id = ?', [centerId], (err, center) => {
    if (err || !center) return res.status(404).json({ error: 'Center not found' });

    const standardSlots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM',
      '04:00 PM - 05:00 PM'
    ];

    db.all(
      'SELECT time_slot, COUNT(*) as booked_count FROM bookings WHERE center_id = ? AND booking_date = ? GROUP BY time_slot',
      [centerId, targetDate],
      (slotErr, rows) => {
        if (slotErr) return res.status(500).json({ error: slotErr.message });

        const bookedMap = {};
        rows.forEach(r => { bookedMap[r.time_slot] = r.booked_count; });

        const slots = standardSlots.map(slot => {
          const booked = bookedMap[slot] || 0;
          const capacity = center.capacity_per_slot;
          const available = Math.max(0, capacity - booked);
          return {
            time_slot: slot,
            capacity,
            booked,
            available,
            is_full: available <= 0
          };
        });

        res.json({
          center_id: parseInt(centerId),
          center_name: center.name,
          date: targetDate,
          slots,
          notice: "Capacity information is subject to operational changes."
        });
      }
    );
  });
});

// GET ALL BOOKINGS (Filtered by center, farmer, date)
router.get('/', (req, res) => {
  const { center_id, farmer_id, farmer_phone, date } = req.query;
  let sql = `
    SELECT b.*, c.name as center_name, cr.name as crop_name, cr.price_per_kg
    FROM bookings b
    JOIN centers c ON b.center_id = c.id
    JOIN crops cr ON b.crop_id = cr.id
    WHERE 1=1
  `;
  const params = [];

  if (center_id) {
    sql += ' AND b.center_id = ?';
    params.push(center_id);
  }
  if (farmer_id) {
    sql += ' AND b.farmer_id = ?';
    params.push(farmer_id);
  }
  if (farmer_phone) {
    sql += ' AND b.farmer_phone = ?';
    params.push(farmer_phone);
  }
  if (date) {
    sql += ' AND b.booking_date = ?';
    params.push(date);
  }

  sql += ' ORDER BY b.id DESC';

  db.all(sql, params, (err, bookings) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ bookings });
  });
});

// CREATE A BOOKING (Farmer self-service OR Assistance Desk walk-in)
router.post('/', (req, res) => {
  const {
    farmer_id,
    farmer_name,
    farmer_phone,
    center_id,
    crop_id,
    quantity_kg,
    booking_date,
    time_slot,
    is_walkin,
    confirmed_high_quantity
  } = req.body;

  if (!farmer_name || !farmer_phone || !center_id || !crop_id || !quantity_kg || !time_slot) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const qty = parseFloat(quantity_kg);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive number' });
  }

  // Extreme quantity guardrail check (> 5,000 kg requires double confirmation flag)
  if (qty > 5000 && !confirmed_high_quantity) {
    return res.status(422).json({
      requires_confirmation: true,
      warning_title: "High Quantity Confirmation Required",
      warning_message: `You entered ${qty.toLocaleString()} kg, which is above the typical single-slot allocation (5,000 kg). Please confirm if this batch size is correct for transport allocation.`,
      entered_qty: qty
    });
  }

  const targetDate = booking_date || new Date().toISOString().split('T')[0];

  // Generate Token Number e.g., TK-A108 or TK-W205
  const prefix = is_walkin ? 'TK-W' : 'TK-A';
  const randomNum = Math.floor(100 + Math.random() * 900);
  const tokenNumber = `${prefix}${randomNum}`;

  const insertSql = `
    INSERT INTO bookings (
      token_number, farmer_id, farmer_name, farmer_phone, center_id, crop_id,
      quantity_kg, booking_date, time_slot, is_walkin, procurement_status, payment_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booked', 'Not Initiated')
  `;

  db.run(
    insertSql,
    [tokenNumber, farmer_id || null, farmer_name, farmer_phone, center_id, crop_id, qty, targetDate, time_slot, is_walkin ? 1 : 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create booking', details: err.message });
      }

      const bookingId = this.lastID;

      // Log SMS confirmation
      const smsMessage = `Booking Confirmed! Token: ${tokenNumber}. Date: ${targetDate}, Slot: ${time_slot}. Center: #${center_id}. Please arrive 15 mins prior. Note: Capacity subject to operational changes.`;
      notificationService.send({
        centerId: center_id,
        phone: farmer_phone,
        farmerName: farmer_name,
        message: smsMessage,
        type: 'SMS'
      });

      // Retrieve full booking record
      db.get(
        `SELECT b.*, c.name as center_name, c.location_name, cr.name as crop_name, cr.price_per_kg
         FROM bookings b
         JOIN centers c ON b.center_id = c.id
         JOIN crops cr ON b.crop_id = cr.id
         WHERE b.id = ?`,
        [bookingId],
        (getErr, booking) => {
          if (getErr || !booking) return res.status(500).json({ error: 'Booking created but failed to fetch details' });

          res.status(201).json({
            message: 'Booking created successfully',
            token_number: tokenNumber,
            booking,
            notice: "Capacity information is subject to operational changes."
          });
        }
      );
    }
  );
});

// UPDATE DISCRETE PROCUREMENT STATUS
// Stages: 'Booked' -> 'Checked-in' -> 'Quality Verification' -> 'Accepted' | 'Rejected'
router.patch('/:id/procurement-status', (req, res) => {
  const bookingId = req.params.id;
  const { procurement_status, quality_grade, rejection_reason } = req.body;

  const validStatuses = ['Booked', 'Checked-in', 'Quality Verification', 'Accepted', 'Rejected'];
  if (!validStatuses.includes(procurement_status)) {
    return res.status(400).json({ error: `Invalid procurement status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const sql = `
    UPDATE bookings 
    SET procurement_status = ?,
        quality_grade = COALESCE(?, quality_grade),
        rejection_reason = COALESCE(?, rejection_reason)
    WHERE id = ?
  `;

  db.run(sql, [procurement_status, quality_grade || 'A', rejection_reason || '', bookingId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.get(
      `SELECT b.*, c.name as center_name 
       FROM bookings b 
       JOIN centers c ON b.center_id = c.id 
       WHERE b.id = ?`,
      [bookingId],
      (getErr, booking) => {
        if (getErr || !booking) return res.status(404).json({ error: 'Booking not found' });

        // Notify farmer on status progression or fault
        let msg = `Status Update for Token ${booking.token_number}: Procurement stage is now [${procurement_status}]. Center: ${booking.center_name}.`;
        if (procurement_status === 'Rejected') {
          msg = `We noticed an issue during your procurement process for Token ${booking.token_number} (${rejection_reason || 'Quality Verification'}). It may be delayed — please check your status for updates.`;
        }

        notificationService.send({
          centerId: booking.center_id,
          phone: booking.farmer_phone,
          farmerName: booking.farmer_name,
          message: msg,
          type: 'SMS'
        });

        res.json({
          message: `Procurement status updated to ${procurement_status}`,
          booking
        });
      }
    );
  });
});

// UPDATE DISCRETE PAYMENT STATUS (Separated from Procurement Status)
// Stages: 'Not Initiated' -> 'Payment Initiated' -> 'Payment Pending' -> 'Payment Complete'
router.patch('/:id/payment-status', (req, res) => {
  const bookingId = req.params.id;
  const { payment_status } = req.body;

  const validPaymentStatuses = ['Not Initiated', 'Payment Initiated', 'Payment Pending', 'Payment Complete'];
  if (!validPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` });
  }

  db.run('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, bookingId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.get(
      `SELECT b.*, cr.price_per_kg 
       FROM bookings b 
       JOIN crops cr ON b.crop_id = cr.id 
       WHERE b.id = ?`,
      [bookingId],
      (getErr, booking) => {
        if (getErr || !booking) return res.status(404).json({ error: 'Booking not found' });

        const totalPayout = (booking.quantity_kg * booking.price_per_kg).toFixed(2);

        // Notify farmer on payment update
        const msg = `Payment Status Update for Token ${booking.token_number}: Payment state is now [${payment_status}]. Estimated Payout: ₹${totalPayout}.`;
        notificationService.send({
          centerId: booking.center_id,
          phone: booking.farmer_phone,
          farmerName: booking.farmer_name,
          message: msg,
          type: 'SMS'
        });

        res.json({
          message: `Payment status updated to ${payment_status}`,
          booking,
          total_payout: parseFloat(totalPayout)
        });
      }
    );
  });
});

// GET LIVE QUEUE POSITION FOR A BOOKING
router.get('/:id/queue-position', (req, res) => {
  const bookingId = req.params.id;

  db.get(
    `SELECT b.*, c.name as center_name, c.status as center_status, c.open_counters, c.avg_processing_mins, c.status_note
     FROM bookings b
     JOIN centers c ON b.center_id = c.id
     WHERE b.id = ?`,
    [bookingId],
    (err, booking) => {
      if (err || !booking) return res.status(404).json({ error: 'Booking not found' });

      // Count farmers ahead in the same center and date with earlier/equal active status
      const todayStr = booking.booking_date;
      const countSql = `
        SELECT COUNT(*) as count_ahead
        FROM bookings
        WHERE center_id = ? 
          AND booking_date = ? 
          AND id < ?
          AND procurement_status IN ('Booked', 'Checked-in', 'Quality Verification')
      `;

      db.get(countSql, [booking.center_id, todayStr, booking.id], (cntErr, row) => {
        if (cntErr) return res.status(500).json({ error: cntErr.message });

        const farmersAhead = row ? row.count_ahead : 0;
        const counters = Math.max(1, booking.open_counters || 3);
        const avgMins = booking.avg_processing_mins || 20;

        // Formula for dynamic wait time
        let estWaitTimeMins = Math.ceil((farmersAhead * avgMins) / counters);
        if (booking.center_status === 'delayed') estWaitTimeMins += 25; // Add delay factor

        res.json({
          token_number: booking.token_number,
          farmer_name: booking.farmer_name,
          center_name: booking.center_name,
          center_status: booking.center_status,
          status_note: booking.status_note,
          procurement_status: booking.procurement_status,
          payment_status: booking.payment_status,
          time_slot: booking.time_slot,
          farmers_ahead: farmersAhead,
          estimated_wait_mins: estWaitTimeMins,
          copy_guarantee_notice: "You have a scheduled queue position. Reduces unnecessary waiting time."
        });
      });
    }
  );
});

// ADMIN USER SEARCH: Find farmer profile and full procurement history by name, ID, or phone
router.get('/admin/farmer-search', (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchTerm = `%${query.trim()}%`;
  const isIdQuery = !isNaN(query.trim()) ? parseInt(query.trim()) : -1;

  // Search user profile first
  const userSql = `
    SELECT id, name, phone, role, center_id, created_at 
    FROM users 
    WHERE id = ? OR name LIKE ? OR phone LIKE ?
  `;

  db.all(userSql, [isIdQuery, searchTerm, searchTerm], (userErr, users) => {
    if (userErr) return res.status(500).json({ error: userErr.message });

    // Search associated transactions for matched users or direct phone/name match in bookings
    const bookingSql = `
      SELECT b.*, c.name as center_name, cr.name as crop_name, cr.price_per_kg
      FROM bookings b
      JOIN centers c ON b.center_id = c.id
      JOIN crops cr ON b.crop_id = cr.id
      WHERE b.farmer_id = ? OR b.farmer_name LIKE ? OR b.farmer_phone LIKE ?
      ORDER BY b.id DESC
    `;

    // Take primary matching farmer or default search
    const primaryUser = users.find(u => u.role === 'farmer') || users[0] || null;
    const farmerId = primaryUser ? primaryUser.id : isIdQuery;

    db.all(bookingSql, [farmerId, searchTerm, searchTerm], (bookingErr, bookings) => {
      if (bookingErr) return res.status(500).json({ error: bookingErr.message });

      const transactions = bookings.map(b => ({
        ...b,
        estimated_payout: (b.quantity_kg * b.price_per_kg).toFixed(2)
      }));

      res.json({
        farmer: primaryUser || {
          name: bookings.length > 0 ? bookings[0].farmer_name : query,
          phone: bookings.length > 0 ? bookings[0].farmer_phone : 'N/A',
          role: 'farmer'
        },
        transactions_count: transactions.length,
        total_quantity_kg: transactions.reduce((acc, t) => acc + (t.quantity_kg || 0), 0),
        transactions
      });
    });
  });
});

// ADMIN TOTALS & BREAKDOWN DASHBOARD: Real computed aggregates
router.get('/admin/analytics', (req, res) => {
  const { center_id } = req.query;

  let sql = `
    SELECT 
      b.*, 
      c.name as center_name, 
      cr.name as crop_name, 
      cr.category as crop_category,
      cr.price_per_kg
    FROM bookings b
    JOIN centers c ON b.center_id = c.id
    JOIN crops cr ON b.crop_id = cr.id
    WHERE 1=1
  `;
  const params = [];
  if (center_id) {
    sql += ' AND b.center_id = ?';
    params.push(center_id);
  }

  db.all(sql, params, (err, bookings) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalBoughtKg = bookings.reduce((sum, b) => sum + (b.quantity_kg || 0), 0);
    const acceptedBookings = bookings.filter(b => b.procurement_status === 'Accepted' || b.procurement_status === 'Checked-in');
    const totalDispatchedKg = acceptedBookings.reduce((sum, b) => sum + (b.quantity_kg || 0), 0);

    const totalTransactions = bookings.length;
    const totalPayoutRs = bookings.reduce((sum, b) => sum + ((b.quantity_kg || 0) * (b.price_per_kg || 0)), 0);

    // Compute Crop Breakdown Table
    const cropMap = {};
    bookings.forEach(b => {
      if (!cropMap[b.crop_name]) {
        cropMap[b.crop_name] = {
          crop_name: b.crop_name,
          category: b.crop_category,
          price_per_kg: b.price_per_kg,
          total_kg: 0,
          weight_tonnes: 0,
          transaction_count: 0,
          total_value_rs: 0
        };
      }
      cropMap[b.crop_name].total_kg += b.quantity_kg;
      cropMap[b.crop_name].transaction_count += 1;
      cropMap[b.crop_name].total_value_rs += b.quantity_kg * b.price_per_kg;
    });

    const cropBreakdown = Object.values(cropMap).map(c => ({
      ...c,
      weight_tonnes: (c.total_kg / 1000).toFixed(2),
      total_value_rs: c.total_value_rs.toFixed(2)
    }));

    res.json({
      total_quantity_bought_kg: totalBoughtKg,
      total_quantity_bought_tonnes: (totalBoughtKg / 1000).toFixed(2),
      total_quantity_dispatched_kg: totalDispatchedKg,
      total_quantity_dispatched_tonnes: (totalDispatchedKg / 1000).toFixed(2),
      total_transactions: totalTransactions,
      total_payout_committed_rs: totalPayoutRs.toFixed(2),
      crop_breakdown: cropBreakdown
    });
  });
});

module.exports = router;
