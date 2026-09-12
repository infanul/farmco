import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  UserCheck, Printer, MessageSquare, Ticket, CheckCircle2, AlertCircle, Sprout,
  Calendar, Clock, CreditCard, Search, ArrowRight, PhoneCall, HelpCircle, PhoneOff, Delete, Headphones
} from 'lucide-react';

export default function AssistanceDeskView({ onNavigate, onBookingCreated }) {
  const [crops, setCrops] = useState([]);
  const [centers, setCenters] = useState([]);

  // Form State for Assisted Walk-In Registration
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('1');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');

  const [loading, setLoading] = useState(false);
  const [issuedToken, setIssuedToken] = useState(null);
  const [error, setError] = useState('');
  const [smsNotice, setSmsNotice] = useState(false);

  // Customer Service Call Dialer State
  const [dialDigits, setDialDigits] = useState('1800-425-1999');
  const [callState, setCallState] = useState('idle'); // 'idle' | 'connecting' | 'active'
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    loadCropsAndCenters();
  }, []);

  useEffect(() => {
    let timer;
    if (callState === 'active') {
      timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const loadCropsAndCenters = async () => {
    try {
      const [cropsRes, centersRes] = await Promise.all([
        api.getCrops(),
        api.getCenters()
      ]);
      setCrops(cropsRes.crops || []);
      setCenters(centersRes.centers || []);
      if (cropsRes.crops?.length > 0) setSelectedCrop(cropsRes.crops[0].id.toString());
      if (centersRes.centers?.length > 0) setSelectedCenter(centersRes.centers[0].id.toString());
    } catch (err) {
      console.error('Assistance desk failed to load metadata:', err);
    }
  };

  const handleAssistedSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!farmerName || !farmerPhone || !quantity || isNaN(quantity)) {
      setError('Please fill in farmer name, valid phone number, and crop quantity.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        center_id: parseInt(selectedCenter),
        crop_id: parseInt(selectedCrop),
        quantity_kg: parseFloat(quantity),
        time_slot: timeSlot,
        is_walkin: true,
        confirmed_high_quantity: true
      };

      const res = await api.createBooking(payload);
      setIssuedToken(res.data.booking);

      setFarmerName('');
      setFarmerPhone('');
      setQuantity('');
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      setError(err.message || 'Failed to create assisted booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendSMS = () => {
    setSmsNotice(true);
    setTimeout(() => setSmsNotice(false), 3500);
  };

  const handleDialKeyPress = (key) => {
    if (callState !== 'idle') return;
    setDialDigits((prev) => prev + key);
  };

  const handleDialBackspace = () => {
    if (callState !== 'idle') return;
    setDialDigits((prev) => prev.slice(0, -1));
  };

  const startCustomerCall = () => {
    setCallState('connecting');
    setTimeout(() => {
      setCallState('active');
    }, 1500);
  };

  const endCustomerCall = () => {
    setCallState('idle');
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const quickActions = [
    {
      id: 'book-slot',
      title: 'Book a Slot',
      subtitle: 'Schedule harvest delivery',
      icon: Calendar,
      bgColor: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
      textColor: 'text-white',
      badge: 'Step-by-Step',
      action: () => onNavigate && onNavigate('book-slot')
    },
    {
      id: 'check-queue',
      title: 'Check Queue',
      subtitle: 'View live mandi waiting times',
      icon: Clock,
      bgColor: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
      textColor: 'text-white',
      badge: 'Live Status',
      action: () => onNavigate && onNavigate('calendar')
    },
    {
      id: 'check-status',
      title: 'Check Procurement Status',
      subtitle: 'Track lot inspection & weight',
      icon: Search,
      bgColor: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
      textColor: 'text-white',
      badge: 'Token Lookup',
      action: () => onNavigate && onNavigate('track-booking')
    },
    {
      id: 'check-payment',
      title: 'Check Payment',
      subtitle: 'Verify DBT bank transfer status',
      icon: CreditCard,
      bgColor: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
      textColor: 'text-white',
      badge: 'DBT Direct',
      action: () => onNavigate && onNavigate('track-booking')
    },
    {
      id: 'print-token',
      title: 'Print Token Slip',
      subtitle: 'Generate physical paper pass',
      icon: Printer,
      bgColor: 'bg-white border border-[#C8E6C9] hover:bg-[#F1F8E9]',
      textColor: 'text-[#1A1A1A]',
      badge: 'Physical Slip',
      action: () => {
        const formEl = document.getElementById('assisted-walkin-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'send-sms',
      title: 'Send SMS Pass',
      subtitle: 'Receive SMS token on basic phone',
      icon: MessageSquare,
      bgColor: 'bg-white border border-[#C8E6C9] hover:bg-[#F1F8E9]',
      textColor: 'text-[#1A1A1A]',
      badge: 'Feature Phone',
      action: () => {
        const formEl = document.getElementById('assisted-walkin-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 text-[#1A1A1A] transition-colors duration-300">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3.5 py-1 bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082] rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <UserCheck className="w-3.5 h-3.5" />
                Farmer Assistance Desk
              </span>
              <span className="text-xs text-[#555555] font-medium">Simplified Access & Walk-In Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
              Guided & Staff-Assisted Service Point
            </h1>
            <p className="text-xs text-[#555555] mt-1 max-w-2xl">
              Designed for farmers, family members, or yard staff assisting walk-in visitors. Quick one-tap entry into all portal services, phone dialer support, or issuing physical paper passes.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('ivr')}
            className="px-4 py-2.5 bg-white border border-[#C8E6C9] text-[#2E7D32] font-bold rounded-2xl text-xs flex items-center gap-2 hover:shadow-md transition cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[#2E7D32]" />
            <span>Need Telephony IVR Hotline?</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: HIGH-CONTRAST LARGE MINIMAL-TEXT QUICK ACTION BUTTONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2E7D32]" />
            Quick Task Shortcuts (Large Touch Buttons)
          </h2>
          <span className="text-xs text-[#555555] font-semibold">Tap any button to trigger flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((item) => {
            const IconComponent = item.icon;
            const isWhite = item.bgColor.includes('bg-white');
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`${item.bgColor} ${item.textColor} p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden`}
              >
                <div className="flex items-start justify-between w-full mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isWhite ? 'bg-[#F1F8E9] text-[#2E7D32]' : 'bg-white/20 text-white'}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isWhite ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' : 'bg-white/20 text-white'}`}>
                    {item.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight mb-1 group-hover:translate-x-1 transition-transform flex items-center justify-between ${isWhite ? 'text-[#1A1A1A]' : 'text-white'}`}>
                    <span>{item.title}</span>
                    <ArrowRight className={`w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isWhite ? 'text-[#2E7D32]' : 'text-white'}`} />
                  </h3>
                  <p className={`text-xs font-medium ${isWhite ? 'text-[#555555]' : 'text-white/90'}`}>{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CUSTOMER SERVICE CALL DIAL KEYPAD & ASSISTED FORM */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* CUSTOMER SERVICE PHONE DIALER KEYPAD */}
        <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-6 shadow-sm">
          <div className="border-b border-[#C8E6C9] pb-3">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#2E7D32]">
              <Headphones className="w-4 h-4" />
              <span>Customer Service Call Dialer</span>
            </div>
            <h3 className="text-base font-black text-[#1A1A1A] mt-1">
              Direct Helpline Dialer
            </h3>
            <p className="text-xs text-[#555555]">
              Visual phone keypad to call mandi assistance officer for live guidance.
            </p>
          </div>

          {/* Screen Display */}
          <div className={`p-4 rounded-2xl border transition-all text-center space-y-1 ${
            callState === 'active'
              ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
              : callState === 'connecting'
              ? 'bg-[#FFF8E1] border-[#FFE082] text-[#F57F17]'
              : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A]'
          }`}>
            <div className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              {callState === 'active' ? 'Connected to Helpline' : callState === 'connecting' ? 'Connecting Call...' : 'Target Support Number'}
            </div>
            <div className="text-2xl font-black font-mono tracking-wider min-h-[32px] flex items-center justify-center">
              {dialDigits || <span className="text-[#888888] text-sm italic">Enter Phone Number</span>}
            </div>
            {callState === 'active' && (
              <div className="text-xs font-mono font-bold text-[#2E7D32] animate-pulse">
                Call Duration: {formatTimer(callSeconds)}
              </div>
            )}
          </div>

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDialKeyPress(key)}
                disabled={callState !== 'idle'}
                className={`py-3.5 rounded-2xl font-black text-lg transition border flex items-center justify-center ${
                  callState === 'idle'
                    ? 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] hover:bg-[#2E7D32] hover:text-white cursor-pointer shadow-sm active:scale-95'
                    : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#AAAAAA] cursor-not-allowed'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Action Buttons: Backspace & Call/Hangup */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={handleDialBackspace}
              disabled={callState !== 'idle' || !dialDigits}
              className="p-3.5 rounded-2xl bg-white text-[#1A1A1A] border border-[#C8E6C9] hover:bg-[#F1F8E9] disabled:opacity-40 cursor-pointer"
              title="Delete last digit"
            >
              <Delete className="w-5 h-5" />
            </button>

            {callState === 'idle' ? (
              <button
                type="button"
                onClick={startCustomerCall}
                disabled={!dialDigits}
                className="flex-1 py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 text-white" />
                <span>Call Customer Service</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={endCustomerCall}
                className="flex-1 py-4 bg-[#C62828] hover:bg-[#B71C1C] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer animate-pulse"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Support Call</span>
              </button>
            )}
          </div>
        </div>

        {/* STAFF-ASSISTED WALK-IN FORM & TOKEN PRINT */}
        <div id="assisted-walkin-form" className="md:col-span-7 space-y-6">

          {/* Assisted Form */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
            <div className="border-b border-[#C8E6C9] pb-3">
              <h2 className="text-base font-black flex items-center gap-2 text-[#1A1A1A]">
                <Sprout className="w-5 h-5 text-[#2E7D32]" />
                Staff-Assisted Walk-In Booking Form
              </h2>
              <p className="text-xs text-[#555555] mt-0.5">
                Issue an instant token slip for farmers without smartphones or internet access.
              </p>
            </div>

            {error && (
              <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3.5 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAssistedSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold mb-1 text-[#1A1A1A]">Farmer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gurpreet Kaur"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1A1A1A]">Farmer Phone Number (Feature Phone OK)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876500001"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 text-xs font-mono font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-[#1A1A1A]">Crop Type</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full rounded-2xl px-3 py-3 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#1A1A1A]">Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1800"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-2xl px-3 py-3 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1A1A1A]">Procurement Yard</label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full rounded-2xl px-3 py-3 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1A1A1A]">Target Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full rounded-2xl px-3 py-3 text-xs font-medium border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-white" />
                <span>{loading ? 'Issuing Token...' : 'Issue Assisted Digital Token'}</span>
              </button>
            </form>
          </div>

          {/* Issued Token Slip Preview */}
          <div className="space-y-4">
            <h2 className="text-base font-black flex items-center gap-2 text-[#1A1A1A]">
              <Ticket className="w-4 h-4 text-[#F57F17]" />
              Issued Token Pass Preview
            </h2>

            {issuedToken ? (
              <div className="p-6 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm text-[#1A1A1A]">
                <div className="text-center py-5 bg-white rounded-2xl border border-[#C8E6C9]">
                  <span className="text-[10px] text-[#F57F17] uppercase tracking-widest block font-black">
                    WALK-IN ASSISTED TOKEN PASS
                  </span>
                  <span className="text-4xl font-black tracking-wider my-1 block font-mono text-[#2E7D32]">
                    {issuedToken.token_number}
                  </span>
                  <span className="text-xs font-bold text-[#555555]">
                    Time Slot: {issuedToken.time_slot}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#C8E6C9]/60">
                    <span className="text-[#555555] block text-[10px] uppercase tracking-wider font-semibold">Farmer Name</span>
                    <span className="font-bold text-[#1A1A1A]">{issuedToken.farmer_name}</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#C8E6C9]/60">
                    <span className="text-[#555555] block text-[10px] uppercase tracking-wider font-semibold">Phone</span>
                    <span className="font-bold font-mono text-[#1A1A1A]">{issuedToken.farmer_phone}</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#C8E6C9]/60">
                    <span className="text-[#555555] block text-[10px] uppercase tracking-wider font-semibold">Crop & Quantity</span>
                    <span className="font-bold text-[#1A1A1A]">{issuedToken.crop_name} ({issuedToken.quantity_kg} kg)</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#C8E6C9]/60">
                    <span className="text-[#555555] block text-[10px] uppercase tracking-wider font-semibold">Yard Location</span>
                    <span className="font-bold text-[#1A1A1A]">{issuedToken.center_name}</span>
                  </div>
                </div>

                {smsNotice && (
                  <div className="bg-[#E8F5E9] text-[#2E7D32] p-3 rounded-2xl text-xs text-center flex items-center justify-center gap-1.5 font-bold border border-[#C8E6C9]">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    SMS token notification dispatched to {issuedToken.farmer_phone}!
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleSendSMS}
                    className="px-4 py-2.5 bg-white hover:bg-[#E8F5E9] text-xs font-bold rounded-xl border border-[#C8E6C9] flex items-center gap-1.5 text-[#1A1A1A] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#F57F17]" />
                    Send SMS Pass
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Physical Slip
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-3xl border border-[#C8E6C9] bg-white text-center space-y-2 text-[#555555]">
                <Ticket className="w-10 h-10 text-[#2E7D32] opacity-30 mx-auto" />
                <p className="text-xs">No token issued yet. Complete the form to generate a physical token slip.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
