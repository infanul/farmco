const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'procurement.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'farmer',
        center_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Centers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS centers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        location_name TEXT NOT NULL,
        capacity_per_slot INTEGER DEFAULT 15,
        open_counters INTEGER DEFAULT 3,
        avg_processing_mins INTEGER DEFAULT 20,
        status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'delayed' | 'closed'
        status_note TEXT DEFAULT ''
      )
    `);

    // 3. Crops Table
    db.run(`
      CREATE TABLE IF NOT EXISTS crops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price_per_kg REAL NOT NULL
      )
    `);

    // 4. Bookings Table
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_number TEXT UNIQUE NOT NULL,
        farmer_id INTEGER,
        farmer_name TEXT NOT NULL,
        farmer_phone TEXT NOT NULL,
        center_id INTEGER NOT NULL,
        crop_id INTEGER NOT NULL,
        quantity_kg REAL NOT NULL,
        booking_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        is_walkin INTEGER DEFAULT 0,
        procurement_status TEXT NOT NULL DEFAULT 'Booked', 
        -- Stages: 'Booked' -> 'Checked-in' -> 'Quality Verification' -> 'Accepted' | 'Rejected'
        payment_status TEXT NOT NULL DEFAULT 'Not Initiated', 
        -- Stages: 'Not Initiated' -> 'Payment Initiated' -> 'Payment Pending' -> 'Payment Complete'
        quality_grade TEXT DEFAULT 'A',
        rejection_reason TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(center_id) REFERENCES centers(id),
        FOREIGN KEY(crop_id) REFERENCES crops(id)
      )
    `);

    // 5. Notifications Table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        center_id INTEGER,
        farmer_phone TEXT NOT NULL,
        farmer_name TEXT,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'SMS',
        status TEXT DEFAULT 'Delivered',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Market Prices Table (Previous Day Baseline & Expected Price Engine)
    db.run(`
      CREATE TABLE IF NOT EXISTS market_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_id INTEGER NOT NULL,
        crop_name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT DEFAULT 'quintal',
        previous_day_price REAL NOT NULL,
        current_price REAL NOT NULL,
        expected_price REAL NOT NULL,
        price_change REAL NOT NULL,
        price_change_percentage REAL NOT NULL,
        trend TEXT NOT NULL DEFAULT 'increasing',
        confidence_level TEXT DEFAULT 'Moderate',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Initial Data if empty
    db.get('SELECT COUNT(*) as count FROM centers', [], (err, row) => {
      if (err) return console.error('Error checking centers count:', err);
      if (row.count === 0) {
        console.log('Seeding initial database tables...');

        // Seed Centers
        const stmtCenter = db.prepare(`
          INSERT INTO centers (name, code, location_name, capacity_per_slot, open_counters, avg_processing_mins, status, status_note)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmtCenter.run('Ludhiana Zone A Procurement Yard', 'PB-LUD-01', 'Sector 14 GT Road, Ludhiana, Punjab', 20, 3, 20, 'open', 'Normal operation, 3 counters active');
        stmtCenter.run('Karnal Grain Hub #2', 'HR-KAR-02', 'Market Yard, GT Road, Karnal, Haryana', 15, 2, 25, 'open', 'Smooth queue flow');
        stmtCenter.run('Nashik Agricultural Yard', 'MH-NAS-01', 'APMC Market, Nashik, Maharashtra', 25, 4, 15, 'open', 'High throughput center');
        stmtCenter.finalize();

        // Seed Users
        const stmtUser = db.prepare(`
          INSERT INTO users (name, phone, password, role, center_id)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmtUser.run('Ramesh Patel', '9876543210', 'password123', 'farmer', null);
        stmtUser.run('Harpreet Singh', '9876543211', 'password123', 'farmer', null);
        stmtUser.run('Sunita Devi', '9876543212', 'password123', 'farmer', null);
        stmtUser.run('Vikram Sharma (Staff)', '9123456789', 'staff123', 'center_staff', 1);
        stmtUser.run('Rajesh Kumar (Staff)', '9123456790', 'staff123', 'center_staff', 2);
        stmtUser.run('System Admin', '9000000000', 'admin123', 'admin', null);
        stmtUser.finalize();

        // Seed Crops
        const stmtCrop = db.prepare(`
          INSERT INTO crops (name, category, price_per_kg)
          VALUES (?, ?, ?)
        `);
        stmtCrop.run('Wheat (Grade A)', 'Cereal', 22.75);
        stmtCrop.run('Paddy Rice (Basmati)', 'Cereal', 21.83);
        stmtCrop.run('Mustard Seed', 'Oilseed', 56.50);
        stmtCrop.run('Maize', 'Cereal', 20.90);
        stmtCrop.run('Cotton', 'Fiber', 66.20);
        stmtCrop.finalize();

        // Seed Bookings (Today + Historical Records for realistic User Search & Crop Analytics)
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const prevWeekStr = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

        const stmtBooking = db.prepare(`
          INSERT INTO bookings (token_number, farmer_id, farmer_name, farmer_phone, center_id, crop_id, quantity_kg, booking_date, time_slot, is_walkin, procurement_status, payment_status, quality_grade, rejection_reason)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Today's Active Queue
        stmtBooking.run('TK-A101', 1, 'Ramesh Patel', '9876543210', 1, 1, 2500, todayStr, '09:00 AM - 10:00 AM', 0, 'Checked-in', 'Not Initiated', 'A', '');
        stmtBooking.run('TK-A102', 2, 'Harpreet Singh', '9876543211', 1, 2, 4000, todayStr, '10:00 AM - 11:00 AM', 0, 'Quality Verification', 'Not Initiated', 'A', '');
        stmtBooking.run('TK-A103', 3, 'Sunita Devi', '9876543212', 1, 3, 1200, todayStr, '10:00 AM - 11:00 AM', 0, 'Booked', 'Not Initiated', 'A', '');
        stmtBooking.run('TK-W201', null, 'Gurpreet Kaur', '9876500001', 1, 1, 1800, todayStr, '11:00 AM - 12:00 PM', 1, 'Accepted', 'Payment Initiated', 'A', '');
        stmtBooking.run('TK-W202', null, 'Baldev Raj', '9876500002', 1, 4, 3200, todayStr, '11:00 AM - 12:00 PM', 1, 'Accepted', 'Payment Complete', 'A', '');

        // Yesterday's Completed Transactions
        stmtBooking.run('TK-H090', 1, 'Ramesh Patel', '9876543210', 1, 2, 3500, yesterdayStr, '09:00 AM - 10:00 AM', 0, 'Accepted', 'Payment Complete', 'A', '');
        stmtBooking.run('TK-H091', 2, 'Harpreet Singh', '9876543211', 1, 1, 5200, yesterdayStr, '10:00 AM - 11:00 AM', 0, 'Accepted', 'Payment Complete', 'A', '');
        stmtBooking.run('TK-H092', 3, 'Sunita Devi', '9876543212', 1, 4, 2100, yesterdayStr, '02:00 PM - 03:00 PM', 0, 'Accepted', 'Payment Pending', 'B', '');
        stmtBooking.run('TK-H093', null, 'Jaswant Singh', '9876500003', 1, 5, 1500, yesterdayStr, '03:00 PM - 04:00 PM', 1, 'Accepted', 'Payment Complete', 'A', '');

        // Last Week's Completed Transactions
        stmtBooking.run('TK-H040', 1, 'Ramesh Patel', '9876543210', 1, 3, 1400, prevWeekStr, '11:00 AM - 12:00 PM', 0, 'Accepted', 'Payment Complete', 'A', '');
        stmtBooking.run('TK-H041', 2, 'Harpreet Singh', '9876543211', 1, 5, 2800, prevWeekStr, '12:00 PM - 01:00 PM', 0, 'Accepted', 'Payment Complete', 'A', '');
        stmtBooking.run('TK-H042', 3, 'Sunita Devi', '9876543212', 1, 1, 3100, prevWeekStr, '02:00 PM - 03:00 PM', 0, 'Accepted', 'Payment Complete', 'A', '');

        stmtBooking.finalize();

        // Seed Market Prices (Baseline previous-day prices & calculated expected movement)
        const stmtMarket = db.prepare(`
          INSERT INTO market_prices (crop_id, crop_name, category, unit, previous_day_price, current_price, expected_price, price_change, price_change_percentage, trend, confidence_level)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Wheat: Previous Day = ₹2420, Expected = ₹2455 (+35, +1.45%)
        stmtMarket.run(1, 'Wheat (Grade A)', 'Cereal', 'quintal', 2420, 2435, 2455, 35, 1.45, 'increasing', 'Moderate');
        // Paddy: Previous Day = ₹2180, Expected = ₹2205 (+25, +1.15%)
        stmtMarket.run(2, 'Paddy Rice (Basmati)', 'Cereal', 'quintal', 2180, 2190, 2205, 25, 1.15, 'increasing', 'Moderate');
        // Mustard: Previous Day = ₹5450, Expected = ₹5520 (+70, +1.28%)
        stmtMarket.run(3, 'Mustard Seed', 'Oilseed', 'quintal', 5450, 5480, 5520, 70, 1.28, 'increasing', 'High');
        // Maize: Previous Day = ₹2150, Expected = ₹2125 (-25, -1.16%)
        stmtMarket.run(4, 'Maize', 'Cereal', 'quintal', 2150, 2140, 2125, -25, -1.16, 'decreasing', 'Moderate');
        // Cotton: Previous Day = ₹6500, Expected = ₹6620 (+120, +1.85%)
        stmtMarket.run(5, 'Cotton', 'Fiber', 'quintal', 6500, 6560, 6620, 120, 1.85, 'increasing', 'High');

        stmtMarket.finalize();

        console.log('Database seeded successfully!');
      }
    });
  });
}

initDb();

module.exports = db;
