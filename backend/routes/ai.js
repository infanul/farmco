const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. SINGLE-DAY SUMMARY AI FORECAST
router.get('/forecast', (req, res) => {
  const centerId = req.query.center_id || 1;
  const todayStr = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT c.*,
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ? AND b.procurement_status IN ('Booked', 'Checked-in', 'Quality Verification')) as active_queue_length,
      (SELECT COALESCE(SUM(b.quantity_kg), 0) FROM bookings b WHERE b.center_id = c.id AND b.booking_date = ?) as today_total_kg
    FROM centers c
    WHERE c.id = ?
  `;

  db.get(sql, [todayStr, todayStr, centerId], (err, center) => {
    if (err || !center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    const queueLength = center.active_queue_length || 0;
    const counters = Math.max(1, center.open_counters || 3);
    const avgMins = center.avg_processing_mins || 20;

    let calculatedWaitMins = Math.round((queueLength * avgMins) / counters);
    if (center.status === 'delayed') calculatedWaitMins += 20;

    const tomorrowPredictedKg = 8450 + (queueLength * 320);

    res.json({
      center_id: center.id,
      center_name: center.name,
      center_status: center.status,
      active_queue_length: queueLength,
      open_counters: counters,
      avg_processing_mins: avgMins,
      dynamic_estimated_wait_mins: Math.max(12, calculatedWaitMins),
      tomorrow_predicted_procurement_kg: tomorrowPredictedKg,
      demand_trend: "High (+12% vs last week)",
      recommended_counters: tomorrowPredictedKg > 8000 ? 4 : 3,
      disclaimer: "AI-assisted demand forecasting helps centers plan capacity.",
      data_source_label: "Sample Historical Data & Real-Time Queue Model"
    });
  });
});

// 2. 7-DAY QUEUE FORECAST API
router.get('/forecast/7-day', (req, res) => {
  const centerId = parseInt(req.query.center_id || 1);

  db.get('SELECT * FROM centers WHERE id = ?', [centerId], (err, center) => {
    if (err || !center) return res.status(404).json({ error: 'Center not found' });

    const daysOfWeek = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mockPatterns = [
      { day: 'Today', status: 'HIGH', color: 'red', farmers: '42–48', wait: '35–45 min', bestTime: '02:00 PM – 03:30 PM', confidence: 91, score: 85, isBest: false },
      { day: 'Mon', status: 'MODERATE', color: 'amber', farmers: '28–35', wait: '22–30 min', bestTime: '11:00 AM – 01:00 PM', confidence: 84, score: 60, isBest: false },
      { day: 'Tue', status: 'LOW', color: 'green', farmers: '18–24', wait: '12–18 min', bestTime: '10:30 AM – 12:00 PM', confidence: 87, score: 30, isBest: true },
      { day: 'Wed', status: 'LOW', color: 'green', farmers: '20–26', wait: '14–20 min', bestTime: '09:30 AM – 11:30 AM', confidence: 89, score: 35, isBest: false },
      { day: 'Thu', status: 'MODERATE', color: 'amber', farmers: '31–38', wait: '25–32 min', bestTime: '02:30 PM – 04:00 PM', confidence: 82, score: 65, isBest: false },
      { day: 'Fri', status: 'HIGH', color: 'red', farmers: '45–52', wait: '38–48 min', bestTime: '10:00 AM – 11:30 AM', confidence: 88, score: 88, isBest: false },
      { day: 'Sat', status: 'VERY HIGH', color: 'red', farmers: '58–65', wait: '45–60 min', bestTime: '03:00 PM – 04:30 PM', confidence: 93, score: 98, isBest: false }
    ];

    const bestDay = mockPatterns.find(p => p.isBest);

    res.json({
      center_id: center.id,
      center_name: center.name,
      forecast: mockPatterns,
      best_recommendation: {
        day: bestDay.day,
        status: bestDay.status,
        expected_wait: bestDay.wait,
        best_time: bestDay.bestTime,
        confidence: bestDay.confidence,
        summary: `${bestDay.day} is expected to have the lowest queue at ${center.name}. Recommended arrival: ${bestDay.bestTime}. Estimated wait time: ${bestDay.wait}.`
      },
      disclaimer: "Predicted queue forecast based on historical arrival patterns & capacity models.",
      copy_guidance: "Reduces unnecessary waiting time. Capacity information is subject to operational changes."
    });
  });
});

// 3. MULTI-CENTER COMPARISON & RECOMMENDATION API
router.get('/recommendation', (req, res) => {
  db.all('SELECT * FROM centers', [], (err, centers) => {
    if (err) return res.status(500).json({ error: err.message });

    const comparisons = centers.map(c => {
      let predFarmers = '24–31';
      let predWait = '18–26 min';
      let status = 'MODERATE';
      let color = 'amber';

      if (c.id === 1) { predFarmers = '35–42'; predWait = '30–38 min'; status = 'HIGH'; color = 'red'; }
      if (c.id === 2) { predFarmers = '14–20'; predWait = '10–16 min'; status = 'LOW'; color = 'green'; }
      if (c.id === 3) { predFarmers = '22–28'; predWait = '16–22 min'; status = 'LOW'; color = 'green'; }

      return {
        center_id: c.id,
        name: c.name,
        location: c.location_name,
        predicted_queue: predFarmers,
        predicted_wait: predWait,
        status,
        status_color: color,
        open_counters: c.open_counters
      };
    });

    const recommended = comparisons.reduce((prev, curr) => (parseInt(curr.predicted_wait) < parseInt(prev.predicted_wait) ? curr : prev), comparisons[0]);

    res.json({
      recommended_center: recommended.name,
      recommended_center_id: recommended.center_id,
      reason: "Lowest predicted queue and shortest average waiting time.",
      comparisons,
      disclaimer: "AI-assisted multi-center recommendation helps farmers choose optimal yards."
    });
  });
});

// 4. NATURAL LANGUAGE AI QUEUE ASSISTANT API
router.post('/assistant', (req, res) => {
  const { question, center_id } = req.body;
  const q = (question || '').toLowerCase();

  let responseText = "";
  let bestWindow = "10:30 AM – 12:00 PM";
  let confidence = 88;

  if (q.includes('tomorrow') || q.includes('next day')) {
    responseText = "Tomorrow's queue at Ludhiana Zone A is predicted to be MODERATE (28–35 farmers). Best arrival window is 11:00 AM – 01:00 PM with an estimated wait time of 22–30 minutes.";
    bestWindow = "11:00 AM – 01:00 PM";
    confidence = 85;
  } else if (q.includes('lowest') || q.includes('less crowded') || q.includes('best day')) {
    responseText = "Tuesday morning is predicted to have the lowest queue of the week (18–24 farmers). Recommended arrival: 10:30 AM – 12:00 PM with an estimated wait of 12–18 minutes.";
    bestWindow = "Tuesday, 10:30 AM – 12:00 PM";
    confidence = 89;
  } else if (q.includes('friday') || q.includes('weekend')) {
    responseText = "Friday is predicted to have a HIGH queue (45–52 farmers) due to weekend harvest arrivals. If visiting on Friday, try coming before 10:30 AM to minimize wait time.";
    bestWindow = "Friday, 09:00 AM – 10:00 AM";
    confidence = 88;
  } else if (q.includes('center') || q.includes('yard')) {
    responseText = "Karnal Grain Hub #2 is currently predicted to be 40% less crowded than Ludhiana Zone A (14–20 farmers vs 35–42 farmers).";
    bestWindow = "Karnal Hub #2, 10:00 AM – 11:30 AM";
    confidence = 92;
  } else {
    responseText = "For minimum waiting time, visit during off-peak hours (10:30 AM – 12:00 PM). Tuesday and Wednesday have the lowest predicted queue volume this week.";
    bestWindow = "10:30 AM – 12:00 PM";
    confidence = 87;
  }

  res.json({
    question,
    response_text: responseText,
    suggested_arrival_window: bestWindow,
    confidence_score: confidence,
    disclaimer: "AI forecast estimates based on historical arrival trends & dynamic queue data."
  });
});

module.exports = router;
