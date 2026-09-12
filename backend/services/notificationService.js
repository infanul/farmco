const db = require('../db');

/**
 * Mock Notification Service Interface
 * Can be swapped with Twilio, Firebase Cloud Messaging, or Telephony Provider in production.
 */
const notificationService = {
  /**
   * Send notification (SMS or IVR voice mock)
   * @param {Object} options
   * @param {number} options.centerId
   * @param {string} options.phone
   * @param {string} options.farmerName
   * @param {string} options.message
   * @param {string} options.type - 'SMS' | 'IVR'
   */
  send: async ({ centerId, phone, farmerName = 'Farmer', message, type = 'SMS' }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO notifications (center_id, farmer_phone, farmer_name, message, type, status)
        VALUES (?, ?, ?, ?, ?, 'Delivered')
      `;
      db.run(sql, [centerId || null, phone, farmerName, message, type], function (err) {
        if (err) {
          console.error('[NotificationService] Error logging notification:', err);
          return reject(err);
        }
        console.log(`[NotificationService] [${type}] Sent to ${farmerName} (${phone}): "${message}"`);
        resolve({
          id: this.lastID,
          phone,
          farmerName,
          message,
          type,
          status: 'Delivered',
          timestamp: new Date().toISOString()
        });
      });
    });
  },

  /**
   * Broadcast delay notification to all active/booked farmers for a center
   */
  broadcastCenterDelay: async (centerId, centerName, delayMins, reason) => {
    return new Promise((resolve, reject) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const sql = `
        SELECT DISTINCT farmer_phone, farmer_name 
        FROM bookings 
        WHERE center_id = ? AND booking_date = ? AND procurement_status IN ('Booked', 'Checked-in')
      `;
      db.all(sql, [centerId, todayStr], async (err, rows) => {
        if (err) return reject(err);
        
        const message = `IMPORTANT UPDATE from ${centerName}: Operations are currently delayed by approximately ${delayMins} mins due to ${reason}. Please check your updated estimated slot time.`;
        
        const logs = [];
        for (const farmer of rows) {
          try {
            const log = await notificationService.send({
              centerId,
              phone: farmer.farmer_phone,
              farmerName: farmer.farmer_name,
              message,
              type: 'SMS'
            });
            logs.push(log);
          } catch (e) {
            console.error('Failed to notify farmer:', farmer.farmer_phone, e);
          }
        }
        resolve(logs);
      });
    });
  }
};

module.exports = notificationService;
