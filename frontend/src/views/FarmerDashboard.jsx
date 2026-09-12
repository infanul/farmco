import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sprout, Calendar, MapPin, Ticket, AlertTriangle, 
  CheckCircle, ArrowRight, Printer, AlertCircle, Coins, User, History, Landmark
} from 'lucide-react';

import FarmerIDCard from '../components/FarmerIDCard';
import ProcurementHistory from '../components/ProcurementHistory';
import GovernmentBenefits from '../components/GovernmentBenefits';

export default function FarmerDashboard({ currentUser, onBookingCreated }) {
  const [crops, setCrops] = useState([]);
  const [centers, setCenters] = useState([]);
  const [slotsData, setSlotsData] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);

  // Active Tab: 'DASHBOARD' | 'ID_CARD' | 'HISTORY' | 'BENEFITS'
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Form State
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('1');
  const [quantity, setQuantity] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation Modal State (>5,000 kg)
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qtyWarningData, setQtyWarningData] = useState(null);

  // Print & SMS Token Modal State
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedCenter) {
      loadSlots(selectedCenter);
    }
  }, [selectedCenter]);

  const loadData = async () => {
    try {
      const [cropsRes, centersRes] = await Promise.all([
        api.getCrops(),
        api.getCenters()
      ]);
      setCrops(cropsRes.crops || []);
      setCenters(centersRes.centers || []);

      if (centersRes.centers?.length > 0 && !selectedCenter) {
        setSelectedCenter(centersRes.centers[0].id.toString());
      }
      if (cropsRes.crops?.length > 0 && !selectedCrop) {
        setSelectedCrop(cropsRes.crops[0].id.toString());
      }

      await loadMyBookings();
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadSlots = async (centerId) => {
    try {
      const res = await api.getSlots(centerId);
      setSlotsData(res);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const loadMyBookings = async () => {
    try {
      const res = await api.getBookings({ farmer_phone: currentUser?.phone });
      const bookings = res.bookings || [];
      setMyBookings(bookings);

      if (bookings.length > 0) {
        const latest = bookings[0];
        setActiveBooking(latest);
        loadQueueInfo(latest.id);
      } else {
        setActiveBooking(null);
        setQueueInfo(null);
      }
    } catch (err) {
      console.error('Failed to load farmer bookings:', err);
    }
  };

  const loadQueueInfo = async (bookingId) => {
    try {
      const qRes = await api.getQueuePosition(bookingId);
      setQueueInfo(qRes);
    } catch (err) {
      console.error('Failed to load queue info:', err);
    }
  };

  const handleBookingSubmit = async (confirmedHighQty = false) => {
    setError('');
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      setError('Please enter a valid crop quantity in kg.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select a preferred arrival time slot.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        farmer_id: currentUser?.id || 1,
        farmer_name: currentUser?.name || 'Ramesh Kumar',
        farmer_phone: currentUser?.phone || '9876543210',
        center_id: parseInt(selectedCenter),
        crop_id: parseInt(selectedCrop),
        quantity_kg: parseFloat(quantity),
        time_slot: selectedSlot,
        is_walkin: false,
        confirmed_high_quantity: confirmedHighQty
      };

      const result = await api.createBooking(payload);

      if (result.status === 422 && result.data?.requires_confirmation) {
        setQtyWarningData(result.data);
        setShowQtyModal(true);
        setLoading(false);
        return;
      }

      setShowQtyModal(false);
      setQuantity('');
      setSelectedSlot('');
      await loadMyBookings();
      if (selectedCenter) loadSlots(selectedCenter);
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      setError(err.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMSMock = () => {
    setSmsSentNotice(true);
    setTimeout(() => setSmsSentNotice(false), 3000);
  };

  const procurementStages = ['Booked', 'Checked-in', 'Quality Verification', 'Accepted'];

  const getStageIndex = (stages, current) => {
    if (current === 'Rejected') return -1;
    return stages.indexOf(current);
  };

  const selectedCropObj = crops.find(c => c.id.toString() === selectedCrop);
  const estimatedPayoutVal = (quantity && selectedCropObj) 
    ? (parseFloat(quantity) * selectedCropObj.price_per_kg).toLocaleString('en-IN')
    : (activeBooking ? ((activeBooking.quantity_kg || 1000) * 22).toLocaleString('en-IN') : '0');

  return (
    <div className="space-y-8 pb-16">

      {/* Header & Sub-Tab Bar (No Greeting Text, Only Farmer Name) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] uppercase tracking-widest mb-1">
              <Sprout className="w-4 h-4" />
              <span>Farmco Farmer Access Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
              {currentUser?.name || 'Farmer'}
            </h1>
            <p className="text-xs text-[#555555] mt-1">
              Know your time. Skip the wait. Reduces unnecessary waiting time through scheduled procurement slots.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white border border-[#C8E6C9]">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('ID_CARD')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'ID_CARD'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Digital ID</span>
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('BENEFITS')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'BENEFITS'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Schemes</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: DIGITAL ID */}
      {activeTab === 'ID_CARD' && (
        <FarmerIDCard farmer={currentUser} />
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'HISTORY' && (
        <ProcurementHistory bookings={myBookings} />
      )}

      {/* TAB CONTENT: BENEFITS */}
      {activeTab === 'BENEFITS' && (
        <GovernmentBenefits />
      )}

      {/* TAB CONTENT: MAIN DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8">
          {activeBooking ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* ACTIVE TOKEN CARD */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
                  
                  {/* Token Header */}
                  <div className="flex justify-between items-start border-b border-[#C8E6C9] pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                        <Ticket className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                          You have a scheduled queue position
                        </span>
                        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-wider mt-1">{activeBooking.token_number}</h2>
                        <span className="text-xs text-[#555555] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                          {activeBooking.center_name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowTokenModal(true)}
                      className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Pass Slip
                    </button>
                  </div>

                  {/* Queue Position Radar / Wait Time */}
                  {queueInfo && (
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9]">
                      <div className="text-center border-r border-[#C8E6C9]">
                        <span className="text-[10px] text-[#555555] font-bold uppercase block">Farmers Ahead in Line</span>
                        <span className="text-3xl font-black text-[#2E7D32]">{queueInfo.farmers_ahead}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-[#555555] font-bold uppercase block">Estimated Wait Time</span>
                        <span className="text-3xl font-black text-[#F57F17]">~{queueInfo.estimated_wait_mins}m</span>
                      </div>
                    </div>
                  )}

                  {/* Procurement Status Timeline */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                          Procurement Status Timeline
                        </span>
                        <span className="text-xs font-bold text-[#2E7D32]">
                          {activeBooking.procurement_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        {procurementStages.map((stage, idx) => {
                          const currentIdx = getStageIndex(procurementStages, activeBooking.procurement_status);
                          const isDone = idx <= currentIdx;
                          return (
                            <div 
                              key={stage} 
                              className={`py-2 px-1 rounded-xl border font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                                isDone 
                                  ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]' 
                                  : 'bg-white border-[#E0E0E0] text-[#888888]'
                              }`}
                            >
                              <span>{stage}</span>
                              {isDone && <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Decoupled Payment Card (Strict Copy Enforced) */}
                    <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] space-y-2 text-[#1A1A1A]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-[#F57F17]" />
                          <span className="text-xs font-black">Payment Tracking</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#F57F17] px-2 py-0.5 rounded bg-white border border-[#FFE082]">
                          {activeBooking.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#FFE082]">
                        <span className="text-[#555555]">Estimated Payment:</span>
                        <span className="font-mono font-extrabold text-sm text-[#2E7D32]">
                          ₹{((activeBooking.quantity_kg || 1000) * 22).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#666666] italic">
                        * Estimated payment figure subject to final quality verification & MSP rules.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* HARVEST BOOKING FORM & VOICE SEARCH (DIRECT FLOW) */}
              <div className="lg:col-span-6 space-y-6">
                


                <div id="booking-form" className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] space-y-4 shadow-sm scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2E7D32]" />
                      Book New Harvest Slot
                    </h3>
                    <span className="text-[10px] text-[#555555] font-semibold">
                      Capacity info subject to operational changes
                    </span>
                  </div>

                  {error && (
                    <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3.5 rounded-2xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4 text-xs font-medium">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1 text-[#1A1A1A]">Crop Type</label>
                        <select
                          value={selectedCrop}
                          onChange={(e) => setSelectedCrop(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none cursor-pointer"
                        >
                          {crops.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} (₹{c.price_per_kg}/kg)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#1A1A1A]">Quantity (kg)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-[#1A1A1A]">Procurement Center</label>
                      <select
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none cursor-pointer"
                      >
                        {centers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {slotsData && (
                      <div>
                        <label className="block font-bold mb-1 text-[#1A1A1A]">Arrival Time Slot</label>
                        <div className="grid grid-cols-3 gap-2">
                          {slotsData.slots.slice(0, 6).map((s) => (
                            <button
                              key={s.time_slot}
                              type="button"
                              onClick={() => setSelectedSlot(s.time_slot)}
                              className={`p-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                                selectedSlot === s.time_slot
                                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                                  : 'bg-white border-[#C8E6C9] text-[#1A1A1A] hover:border-[#2E7D32]'
                              }`}
                            >
                              {s.time_slot.split(' - ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estimated Payout Calculator Banner */}
                    {quantity && parseFloat(quantity) > 0 && (
                      <div className="p-3 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#555555]">Estimated Payment:</span>
                        <span className="font-mono font-black text-sm text-[#2E7D32]">
                          ₹{estimatedPayoutVal}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleBookingSubmit(false)}
                      className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <span>{loading ? 'Issuing Digital Token...' : 'Book Slot & Generate Token'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="p-8 rounded-3xl border border-[#C8E6C9] bg-white text-center space-y-3 text-[#1A1A1A]">
                <Ticket className="w-12 h-12 text-[#2E7D32] opacity-40 mx-auto" />
                <h3 className="text-base font-bold">No Active Scheduled Token</h3>
                <p className="text-xs text-[#555555]">Select your crop, target center, and arrival time slot below to issue a digital token.</p>
              </div>

              {/* HARVEST BOOKING FORM (DIRECT FLOW) */}
              <div id="booking-form" className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] space-y-4 shadow-sm scroll-mt-24">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2E7D32]" />
                    Book New Harvest Slot
                  </h3>
                  <span className="text-[10px] text-[#555555] font-semibold">
                    Capacity info subject to operational changes
                  </span>
                </div>

                {error && (
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3.5 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-[#1A1A1A]">Crop Type</label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none cursor-pointer"
                      >
                        {crops.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} (₹{c.price_per_kg}/kg)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-[#1A1A1A]">Quantity (kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#1A1A1A]">Procurement Center</label>
                    <select
                      value={selectedCenter}
                      onChange={(e) => setSelectedCenter(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 bg-white border border-[#C8E6C9] text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      {centers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {slotsData && (
                    <div>
                      <label className="block font-bold mb-1 text-[#1A1A1A]">Arrival Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {slotsData.slots.slice(0, 6).map((s) => (
                          <button
                            key={s.time_slot}
                            type="button"
                            onClick={() => setSelectedSlot(s.time_slot)}
                            className={`p-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                              selectedSlot === s.time_slot
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                                : 'bg-white border-[#C8E6C9] text-[#1A1A1A] hover:border-[#2E7D32]'
                            }`}
                          >
                            {s.time_slot.split(' - ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Payout Calculator Banner */}
                  {quantity && parseFloat(quantity) > 0 && (
                    <div className="p-3 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#555555]">Estimated Payment:</span>
                      <span className="font-mono font-black text-sm text-[#2E7D32]">
                        ₹{estimatedPayoutVal}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleBookingSubmit(false)}
                    className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>{loading ? 'Issuing Digital Token...' : 'Book Slot & Generate Token'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* EXTREME QUANTITY MODAL (>5,000 kg) */}
      {showQtyModal && qtyWarningData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#F57F17] max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4 text-[#1A1A1A]">
            <div className="flex items-center space-x-3 text-[#F57F17]">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-black">{qtyWarningData.warning_title}</h3>
                <span className="text-xs text-[#F57F17] font-mono">Capacity Verification Required</span>
              </div>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              {qtyWarningData.warning_message}
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowQtyModal(false)}
                className="px-4 py-2 bg-[#F1F8E9] text-[#1A1A1A] text-xs font-bold rounded-xl border border-[#C8E6C9]"
              >
                Edit Quantity
              </button>
              <button
                onClick={() => handleBookingSubmit(true)}
                className="px-4 py-2 bg-[#F57F17] hover:bg-[#E65100] text-white text-xs font-black rounded-xl shadow-sm"
              >
                Confirm High Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTED / SMS TOKEN MODAL */}
      {showTokenModal && activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#1A1A1A] border-4 border-[#2E7D32] max-w-lg w-full p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#C8E6C9]">
              <h3 className="text-lg font-black text-[#2E7D32]">Official Mandi Token Slip</h3>
              <button onClick={() => setShowTokenModal(false)} className="text-[#555555] hover:text-[#1A1A1A] font-bold text-sm">✕</button>
            </div>

            <div id="printable-token" className="bg-[#F1F8E9] p-6 rounded-2xl border-2 border-[#2E7D32] text-[#1A1A1A] space-y-4 font-mono">
              <div className="text-center py-2 border-b border-dashed border-[#C8E6C9] pb-4">
                <span className="text-xs text-[#555555] uppercase tracking-widest block font-bold">TOKEN NUMBER</span>
                <span className="text-4xl font-black text-[#2E7D32] tracking-wider my-1 block">{activeBooking.token_number}</span>
                <span className="text-xs font-bold text-[#F57F17] bg-[#FFF8E1] px-3 py-0.5 rounded-full inline-block mt-1 border border-[#FFE082]">
                  Arrival Slot: {activeBooking.time_slot}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div><span className="text-[#555555] block">Farmer:</span><span className="font-bold text-[#1A1A1A]">{activeBooking.farmer_name}</span></div>
                <div><span className="text-[#555555] block">Crop:</span><span className="font-bold text-[#1A1A1A]">{activeBooking.crop_name || 'Paddy'} ({activeBooking.quantity_kg} kg)</span></div>
              </div>
              <div className="text-[10px] text-[#555555] italic pt-2 border-t border-[#C8E6C9]">
                ✔ Reduces unnecessary waiting time.<br />
                ✔ Present this slip at Gate Counter #1.
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={handleSendSMSMock} 
                className="px-4 py-2 bg-[#F1F8E9] hover:bg-[#E8F5E9] text-[#1A1A1A] text-xs font-bold rounded-xl border border-[#C8E6C9]"
              >
                {smsSentNotice ? '✓ SMS Sent' : 'Send SMS Slip'}
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
