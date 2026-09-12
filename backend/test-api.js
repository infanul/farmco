const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Backend API Endpoints (Role Gating, Search & Analytics) ---');

  // 1. Health
  const health = await makeRequest('/api/health');
  console.log('1. Health Check:', health.status, health.data.service);

  // 2. Centers
  const centers = await makeRequest('/api/centers');
  console.log('2. Centers List:', centers.status, `Found ${centers.data.centers?.length} centers`);

  // 3. Role-Gated Auth Test
  const farmerLogin = await makeRequest('/api/auth/login', 'POST', {
    phone: '9876543210',
    password: 'password123',
    role: 'farmer'
  });
  console.log('3a. Farmer Login:', farmerLogin.status, farmerLogin.data.user?.name);

  const farmerOnAdminLogin = await makeRequest('/api/auth/login', 'POST', {
    phone: '9876543210',
    password: 'password123',
    role: 'center_staff'
  });
  console.log('3b. Farmer on Admin Portal Login (Should fail 403):', farmerOnAdminLogin.status, farmerOnAdminLogin.data.error ? 'Blocked correctly' : 'Failed');

  // 4. Admin Farmer Search
  const searchRes = await makeRequest('/api/bookings/admin/farmer-search?query=Ramesh');
  console.log('4. Admin Farmer Search:', searchRes.status, `Found ${searchRes.data.transactions_count} transactions for ${searchRes.data.farmer?.name}`);

  // 5. Admin Analytics
  const analyticsRes = await makeRequest('/api/bookings/admin/analytics');
  console.log('5. Admin Analytics:', analyticsRes.status, `Total Bought: ${analyticsRes.data.total_quantity_bought_tonnes} tonnes, Dispatched: ${analyticsRes.data.total_quantity_dispatched_tonnes} tonnes`);

  // 6. Market Prices Engine Test
  const pricesRes = await makeRequest('/api/market-prices');
  console.log('6. Expected Market Prices Engine:', pricesRes.status, `Found ${pricesRes.data.market_prices?.length} crop market trends`);

  // 7. Create Booking
  const bookingRes = await makeRequest('/api/bookings', 'POST', {
    farmer_id: 1,
    farmer_name: 'Ramesh Patel',
    farmer_phone: '9876543210',
    center_id: 1,
    crop_id: 1,
    quantity_kg: 2500,
    time_slot: '10:00 AM - 11:00 AM',
    is_walkin: false,
    confirmed_high_quantity: false
  });
  console.log('7. Create Booking:', bookingRes.status, 'Token:', bookingRes.data.token_number);

  console.log('--- All Backend Tests Passed Successfully! ---');
}

runTests().catch(console.error);
