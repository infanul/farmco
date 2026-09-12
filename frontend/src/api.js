const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  login: async (identifier, password, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: identifier, username: identifier, password, role })
    });
    return res.json();
  },

  getDemoUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  // Centers
  getCenters: async () => {
    const res = await fetch(`${API_BASE}/centers`);
    return res.json();
  },

  getCenter: async (id) => {
    const res = await fetch(`${API_BASE}/centers/${id}`);
    return res.json();
  },

  updateCenterStatus: async (id, status, status_note, delay_mins, notify_farmers = false) => {
    const res = await fetch(`${API_BASE}/centers/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, status_note, delay_mins, notify_farmers })
    });
    return res.json();
  },

  getNotifications: async (centerId) => {
    const res = await fetch(`${API_BASE}/centers/${centerId}/notifications`);
    return res.json();
  },

  // Bookings & Slots
  getCrops: async () => {
    const res = await fetch(`${API_BASE}/bookings/crops`);
    return res.json();
  },

  getSlots: async (centerId, date) => {
    const res = await fetch(`${API_BASE}/bookings/slots?center_id=${centerId}&date=${date || ''}`);
    return res.json();
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}`);
    return res.json();
  },

  createBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok && res.status !== 422) {
      throw new Error(data.error || 'Failed to create booking');
    }
    return { status: res.status, data };
  },

  updateProcurementStatus: async (id, procurement_status, quality_grade, rejection_reason) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/procurement-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procurement_status, quality_grade, rejection_reason })
    });
    return res.json();
  },

  updatePaymentStatus: async (id, payment_status) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/payment-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status })
    });
    return res.json();
  },

  getQueuePosition: async (id) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/queue-position`);
    return res.json();
  },

  // AI & Forecasting Engine
  getAiForecast: async (centerId) => {
    const res = await fetch(`${API_BASE}/ai/forecast?center_id=${centerId || 1}`);
    return res.json();
  },

  get7DayForecast: async (centerId) => {
    const res = await fetch(`${API_BASE}/ai/forecast/7-day?center_id=${centerId || 1}`);
    return res.json();
  },

  getAiRecommendation: async (centerId) => {
    const res = await fetch(`${API_BASE}/ai/recommendation?center_id=${centerId || 1}`);
    return res.json();
  },

  askAiAssistant: async (question, centerId) => {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, center_id: centerId || 1 })
    });
    return res.json();
  },

  // Admin Portal Tools
  searchFarmerHistory: async (query) => {
    const res = await fetch(`${API_BASE}/bookings/admin/farmer-search?query=${encodeURIComponent(query)}`);
    return res.json();
  },

  getAdminAnalytics: async (centerId) => {
    const res = await fetch(`${API_BASE}/bookings/admin/analytics?center_id=${centerId || ''}`);
    return res.json();
  },

  // Market Prices API
  getMarketPrices: async () => {
    const res = await fetch(`${API_BASE}/market-prices`);
    return res.json();
  },

  getCropMarketPrice: async (cropId) => {
    const res = await fetch(`${API_BASE}/market-prices/${cropId}`);
    return res.json();
  }
};
