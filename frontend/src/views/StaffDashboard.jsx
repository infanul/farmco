import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Building2, Users, Scale, Clock, ShieldAlert, Bell, 
  Search, CheckCircle, AlertCircle, Coins, UserCheck
} from 'lucide-react';

export default function StaffDashboard({ currentUser, onDataChanged }) {
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(currentUser?.center_id || 1);
  const [centerData, setCenterData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Center Status Toggle State
  const [statusNote, setStatusNote] = useState('');
  const [delayMins, setDelayMins] = useState(30);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Rejection Modal State
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Moisture content exceeds 14% limit');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    if (selectedCenterId) {
      loadCenterDetails(selectedCenterId);
      loadCenterBookings(selectedCenterId);
      loadCenterNotifications(selectedCenterId);
    }
  }, [selectedCenterId]);

  const loadCenters = async () => {
    try {
      const res = await api.getCenters();
      setCenters(res.centers || []);
    } catch (err) {
      console.error('Failed to load centers:', err);
    }
  };

  const loadCenterDetails = async (centerId) => {
    try {
      const res = await api.getCenter(centerId);
      setCenterData(res.center);
      setStatusNote(res.center?.status_note || '');
    } catch (err) {
      console.error('Failed to load center details:', err);
    }
  };

  const loadCenterBookings = async (centerId) => {
    try {
      const res = await api.getBookings({ center_id: centerId });
      setBookings(res.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const loadCenterNotifications = async (centerId) => {
    try {
      const res = await api.getNotifications(centerId);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleStatusChange = async (newStatus, notify = false) => {
    setBroadcasting(true);
    setBroadcastMsg('');
    try {
      const res = await api.updateCenterStatus(selectedCenterId, newStatus, statusNote, delayMins, notify);
      setCenterData(res.center);
      if (res.notifications_sent_count > 0) {
        setBroadcastMsg(`Successfully dispatched delay SMS alerts to ${res.notifications_sent_count} scheduled farmers!`);
      } else {
        setBroadcastMsg(`Yard operational status updated to ${newStatus.toUpperCase()}`);
      }
      await loadCenterNotifications(selectedCenterId);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Status change error:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleProcurementStatusUpdate = async (bookingId, newStatus, qualityGrade = 'A', reason = '') => {
    try {
      await api.updateProcurementStatus(bookingId, newStatus, qualityGrade, reason);
      await loadCenterBookings(selectedCenterId);
      await loadCenterDetails(selectedCenterId);
      await loadCenterNotifications(selectedCenterId);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Procurement status update failed:', err);
    }
  };

  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus) => {
    try {
      await api.updatePaymentStatus(bookingId, newPaymentStatus);
      await loadCenterBookings(selectedCenterId);
      await loadCenterNotifications(selectedCenterId);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Payment status update failed:', err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.token_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmer_phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || b.procurement_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">

      {/* Header & Center Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 sm:p-8 rounded-3xl border border-[#BBDEFB] bg-[#E3F2FD] shadow-sm">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-3 py-1 bg-[#1565C0] text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              Central Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">Central Overview & Operations Control</h1>
          <p className="text-xs text-[#555555] mt-1">
            Real-time center monitoring, live yard status controls, capacity tracking, and outbound alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2 p-2 rounded-2xl bg-white border border-[#BBDEFB]">
          <span className="text-xs font-bold text-[#555555] pl-1">Select Yard:</span>
          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(parseInt(e.target.value))}
            className="text-xs font-black px-3 py-1.5 rounded-xl border border-[#BBDEFB] bg-[#E3F2FD] text-[#1565C0] focus:outline-none cursor-pointer"
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SINGLE-CONTROL CENTER STATUS */}
          {centerData && (
            <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-base font-black flex items-center gap-2 text-[#1A1A1A]">
                    <ShieldAlert className="w-5 h-5 text-[#F57F17]" />
                    Yard Operational Status Control (Single-Tap Switcher)
                  </h2>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Capacity information subject to operational changes. Instantly dispatch SMS alerts.
                  </p>
                </div>

                {/* Status Control Buttons */}
                <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9]">
                  <button
                    onClick={() => handleStatusChange('open')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      centerData.status === 'open'
                        ? 'bg-[#2E7D32] text-white shadow-sm'
                        : 'text-[#1A1A1A] hover:text-[#2E7D32]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                    🟢 Open
                  </button>

                  <button
                    onClick={() => handleStatusChange('delayed')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      centerData.status === 'delayed'
                        ? 'bg-[#F57F17] text-white shadow-sm'
                        : 'text-[#1A1A1A] hover:text-[#F57F17]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFB300]" />
                    🟠 Delayed
                  </button>

                  <button
                    onClick={() => handleStatusChange('closed')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      centerData.status === 'closed'
                        ? 'bg-[#C62828] text-white shadow-sm'
                        : 'text-[#1A1A1A] hover:text-[#C62828]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                    🔴 Closed
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Operational Note (e.g. Weighbridge maintenance delay)"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full rounded-2xl px-4 py-2.5 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={delayMins}
                    onChange={(e) => setDelayMins(parseInt(e.target.value))}
                    className="w-full rounded-2xl px-4 py-2.5 text-xs font-black border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none"
                  >
                    <option value={15}>Delay: +15 minutes</option>
                    <option value={30}>Delay: +30 minutes</option>
                    <option value={60}>Delay: +60 minutes</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={() => handleStatusChange('delayed', true)}
                    disabled={broadcasting}
                    className="w-full py-2.5 bg-[#F57F17] hover:bg-[#E65100] text-white font-black text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Delay SMS'}</span>
                  </button>
                </div>
              </div>

              {broadcastMsg && (
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{broadcastMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* METRICS GRID */}
          {centerData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9]">
                <div className="flex justify-between items-center text-[#555555] mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D32]">Today's Farmers</span>
                  <Users className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <span className="text-3xl font-black text-[#1A1A1A]">{centerData.today_bookings_count}</span>
                <span className="text-[11px] text-[#555555] block mt-1">Scheduled arrivals</span>
              </div>

              <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9]">
                <div className="flex justify-between items-center text-[#555555] mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1565C0]">Expected Volume</span>
                  <Scale className="w-5 h-5 text-[#1565C0]" />
                </div>
                <span className="text-3xl font-black text-[#1A1A1A]">{centerData.today_expected_kg?.toLocaleString()} <span className="text-sm font-bold text-[#555555]">kg</span></span>
                <span className="text-[11px] text-[#555555] block mt-1">Allocated harvest volume</span>
              </div>

              <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9]">
                <div className="flex justify-between items-center text-[#555555] mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F57F17]">Active Queue</span>
                  <Clock className="w-5 h-5 text-[#F57F17]" />
                </div>
                <span className="text-3xl font-black text-[#F57F17]">{centerData.active_queue_length}</span>
                <span className="text-[11px] text-[#555555] block mt-1">Checked-in / Verifying</span>
              </div>

              <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9]">
                <div className="flex justify-between items-center text-[#555555] mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6A1B9A]">Open Counters</span>
                  <Building2 className="w-5 h-5 text-[#6A1B9A]" />
                </div>
                <span className="text-3xl font-black text-[#6A1B9A]">{centerData.open_counters}</span>
                <span className="text-[11px] text-[#555555] block mt-1">Avg speed: {centerData.avg_processing_mins} min</span>
              </div>
            </div>
          )}

          {/* QUEUE MANAGEMENT TABLE */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2E7D32]" />
                  Live Queue & Procurement Stage Management
                </h2>
                <p className="text-xs text-[#555555] mt-0.5">
                  One-tap procurement stage progression & payment tracking.
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#555555] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search token / farmer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl pl-9 pr-4 py-2 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-black rounded-2xl px-3 py-2 border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="Booked">Booked</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Quality Verification">Quality Verification</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C8E6C9] text-[#555555] font-black uppercase tracking-widest text-[10px]">
                    <th className="py-3 px-4">Token & Farmer</th>
                    <th className="py-3 px-4">Crop & Volume</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Procurement Stage</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">One-Tap Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8E6C9] font-medium text-[#1A1A1A]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#555555] italic">
                        No bookings found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F1F8E9] transition-all">
                        
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-xs font-mono px-2.5 py-1 rounded-lg bg-[#F1F8E9] border border-[#C8E6C9] text-[#2E7D32]">
                              {b.token_number}
                            </span>
                            {b.is_walkin === 1 && (
                              <span className="text-[10px] bg-[#FFF8E1] text-[#F57F17] px-1.5 py-0.5 rounded border border-[#FFE082] font-bold">
                                Walk-in
                              </span>
                            )}
                          </div>
                          <div className="font-black text-[#1A1A1A] mt-1">{b.farmer_name}</div>
                          <div className="text-[10px] text-[#555555] font-mono">{b.farmer_phone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold block">{b.crop_name}</span>
                          <span className="text-[#2E7D32] font-extrabold">{b.quantity_kg?.toLocaleString()} kg</span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#555555]">
                          {b.time_slot}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-black text-[10px] ${
                            b.procurement_status === 'Booked' ? 'bg-[#F5F5F5] text-[#616161] border border-[#E0E0E0]' :
                            b.procurement_status === 'Checked-in' ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]' :
                            b.procurement_status === 'Quality Verification' ? 'bg-[#F3E5F5] text-[#7B1FA2] border border-[#E1BEE7]' :
                            b.procurement_status === 'Accepted' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' :
                            'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                          }`}>
                            {b.procurement_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-black text-[10px] ${
                            b.payment_status === 'Not Initiated' ? 'text-[#888888]' :
                            b.payment_status === 'Payment Initiated' ? 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]' :
                            b.payment_status === 'Payment Pending' ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]' :
                            'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                          }`}>
                            {b.payment_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-y-1">
                          <div className="flex justify-end space-x-1">
                            {b.procurement_status === 'Booked' && (
                              <button
                                onClick={() => handleProcurementStatusUpdate(b.id, 'Checked-in')}
                                className="px-3 py-1 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                              >
                                Check-In
                              </button>
                            )}
                            {b.procurement_status === 'Checked-in' && (
                              <button
                                onClick={() => handleProcurementStatusUpdate(b.id, 'Quality Verification')}
                                className="px-3 py-1 bg-[#7B1FA2] hover:bg-[#4A148C] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                              >
                                Verify Quality
                              </button>
                            )}
                            {b.procurement_status === 'Quality Verification' && (
                              <>
                                <button
                                  onClick={() => handleProcurementStatusUpdate(b.id, 'Accepted', 'A')}
                                  className="px-3 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => setRejectingBookingId(b.id)}
                                  className="px-2.5 py-1 bg-[#C62828] hover:bg-[#B71C1C] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>

                          {b.procurement_status === 'Accepted' && (
                            <div className="flex justify-end space-x-1 pt-1">
                              {b.payment_status === 'Not Initiated' && (
                                <button
                                  onClick={() => handlePaymentStatusUpdate(b.id, 'Payment Initiated')}
                                  className="px-2.5 py-1 bg-[#F57F17] hover:bg-[#E65100] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                                >
                                  Initiate Payout
                                </button>
                              )}
                              {b.payment_status === 'Payment Initiated' && (
                                <button
                                  onClick={() => handlePaymentStatusUpdate(b.id, 'Payment Pending')}
                                  className="px-2.5 py-1 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                                >
                                  Mark Pending
                                </button>
                              )}
                              {b.payment_status === 'Payment Pending' && (
                                <button
                                  onClick={() => handlePaymentStatusUpdate(b.id, 'Payment Complete')}
                                  className="px-2.5 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-[10px] rounded-lg cursor-pointer shadow-sm"
                                >
                                  Complete Payout
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* NOTIFICATION LOGS PANEL */}
          <div className="p-6 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#2E7D32] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2E7D32]" />
                Outbound SMS & Notification Dispatch Log
              </h3>
              <span className="text-[10px] text-[#555555] font-mono">{notifications.length} total logged</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-2xl border border-[#C8E6C9] bg-white text-xs flex justify-between items-center text-[#1A1A1A]">
                  <div>
                    <span className="font-bold text-[#2E7D32]">{n.farmer_name} ({n.farmer_phone}): </span>
                    <span>{n.message}</span>
                  </div>
                  <span className="text-[10px] text-[#555555] font-mono shrink-0 ml-4">{n.created_at?.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          </div>

      {/* REJECTION MODAL */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#C62828] max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4 text-[#1A1A1A]">
            <h3 className="text-lg font-black text-[#C62828] flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Reject Crop Quality Verification
            </h3>
            <p className="text-xs text-[#555555]">
              Enter official quality rejection reason:
            </p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#F1F8E9] border border-[#C8E6C9] rounded-2xl px-4 py-2.5 text-xs font-medium text-[#1A1A1A] focus:outline-none"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectingBookingId(null)}
                className="px-4 py-2 bg-[#F5F5F5] text-[#1A1A1A] text-xs font-bold rounded-xl border border-[#E0E0E0]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleProcurementStatusUpdate(rejectingBookingId, 'Rejected', 'Rejected', rejectionReason);
                  setRejectingBookingId(null);
                }}
                className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-black rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

