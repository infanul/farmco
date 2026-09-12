import React, { useState } from 'react';
import { Search, Ticket, CheckCircle2, Clock, MapPin, Coins, Printer, AlertCircle } from 'lucide-react';

export default function BookingTracker({ booking, onSearchToken, userBookings = [] }) {
  const [inputToken, setInputToken] = useState('');
  const [activeTab, setActiveTab] = useState('TIMELINE'); // 'TIMELINE' | 'MY_BOOKINGS'
  const [printModal, setPrintModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputToken.trim() && onSearchToken) {
      onSearchToken(inputToken.trim());
    }
  };

  // Timeline stage definitions
  const timelineStages = [
    { key: 'Booked', label: 'Booking Confirmed', icon: '✓' },
    { key: 'Token', label: 'Token Generated', icon: '✓' },
    { key: 'Checked-in', label: 'Checked In', icon: '●' },
    { key: 'Quality Verification', label: 'Quality Check', icon: '○' },
    { key: 'Weighing', label: 'Weighing & Verification', icon: '○' },
    { key: 'Accepted', label: 'Accepted', icon: '○' },
    { key: 'Payment', label: 'Payment Dispatched', icon: '○' },
    { key: 'Completed', label: 'Completed', icon: '○' }
  ];

  const getStageStatus = (stageKey) => {
    if (!booking) return 'pending';
    const status = booking.procurement_status;
    const payment = booking.payment_status;

    if (stageKey === 'Booked' || stageKey === 'Token') return 'done';
    if (status === 'Rejected') return 'rejected';

    if (stageKey === 'Checked-in') {
      return (status === 'Checked-in' || status === 'Quality Verification' || status === 'Accepted') ? 'done' : 'pending';
    }
    if (stageKey === 'Quality Verification') {
      return (status === 'Quality Verification' || status === 'Accepted') ? 'done' : (status === 'Checked-in' ? 'current' : 'pending');
    }
    if (stageKey === 'Weighing') {
      return (status === 'Accepted') ? 'done' : (status === 'Quality Verification' ? 'current' : 'pending');
    }
    if (stageKey === 'Accepted') {
      return (status === 'Accepted') ? 'done' : 'pending';
    }
    if (stageKey === 'Payment') {
      return (payment === 'Payment Complete' || payment === 'Payment Initiated' || payment === 'Payment Pending') ? 'done' : 'pending';
    }
    if (stageKey === 'Completed') {
      return (status === 'Accepted' && payment === 'Payment Complete') ? 'done' : 'pending';
    }
    return 'pending';
  };

  return (
    <div className="space-y-6 text-[#1A1A1A]">
      
      {/* Search Bar & Tab Controls */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#2E7D32]" />
              Real-time Token & Status Tracker
            </h2>
            <p className="text-xs text-[#555555] mt-0.5">
              Enter your token number or mobile number to track live queue status and payment updates.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9]">
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'TIMELINE'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              Live Tracker
            </button>
            <button
              onClick={() => setActiveTab('MY_BOOKINGS')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'MY_BOOKINGS'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              My Bookings ({userBookings.length})
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Token Number (e.g. TK-A101 or 9876543210)..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs rounded-2xl shadow-sm transition cursor-pointer shrink-0"
          >
            Track Token
          </button>
        </form>
      </div>

      {/* TAB CONTENT: LIVE TRACKER */}
      {activeTab === 'TIMELINE' && (
        booking ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Card: Token Info & Queue Radar */}
            <div className="lg:col-span-5 p-6 rounded-3xl border border-[#C8E6C9] bg-white space-y-5 shadow-sm">
              <div className="flex justify-between items-start border-b border-[#C8E6C9] pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                    Active Procurement Token
                  </span>
                  <h3 className="text-3xl font-black text-[#1A1A1A] tracking-wider mt-1.5">{booking.token_number}</h3>
                  <span className="text-xs text-[#555555] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                    {booking.center_name || 'Ludhiana Zone A'}
                  </span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#F1F8E9] text-[#1A1A1A] hover:text-[#2E7D32] text-xs font-bold rounded-xl border border-[#C8E6C9] flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Pass
                </button>
              </div>

              {/* Crop & Quantity */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9]">
                <div>
                  <span className="text-[10px] text-[#555555] font-bold block uppercase">Farmer & Crop</span>
                  <span className="font-bold text-[#1A1A1A] block">{booking.farmer_name}</span>
                  <span className="text-xs text-[#2E7D32] font-bold">{booking.crop_name || 'Wheat'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#555555] font-bold block uppercase">Quantity</span>
                  <span className="font-mono font-black text-sm text-[#1A1A1A]">{booking.quantity_kg?.toLocaleString()} kg</span>
                  <span className="text-[10px] text-[#555555] block font-mono">Slot: {booking.time_slot}</span>
                </div>
              </div>

              {/* Queue Status Radar */}
              <div className="p-4 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] text-[#1A1A1A] space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#2E7D32]" />
                  <span className="text-xs font-black">Live Mandi Queue Position</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-xs">
                  <span>Farmers Ahead: <strong className="text-[#2E7D32]">3</strong></span>
                  <span>Est. Waiting: <strong>~20 mins</strong></span>
                </div>
              </div>

              {/* Decoupled Payment Box */}
              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#2E7D32] flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    Payment Stage:
                  </span>
                  <span className="font-black text-[#2E7D32] bg-white px-2 py-0.5 rounded border border-[#C8E6C9]">
                    {booking.payment_status || 'Not Initiated'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#C8E6C9]/60">
                  <span className="text-[#555555]">Estimated Payout:</span>
                  <span className="font-mono font-black text-sm text-[#2E7D32]">
                    ₹{((booking.quantity_kg || 1000) * 22.75).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Step-by-Step Visual Timeline */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-6 shadow-sm">
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                Procurement Journey Timeline
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C8E6C9]">
                {timelineStages.map((stage, idx) => {
                  const state = getStageStatus(stage.key);
                  const isDone = state === 'done';
                  const isCurrent = state === 'current';
                  const isRejected = state === 'rejected';

                  return (
                    <div key={stage.key} className="flex items-start space-x-4 relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                        isDone ? 'bg-[#2E7D32] text-white shadow-sm' :
                        isCurrent ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100' :
                        isRejected ? 'bg-rose-600 text-white' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {isDone ? '✓' : isCurrent ? '●' : isRejected ? '✕' : idx + 1}
                      </div>

                      <div className={`p-3.5 rounded-2xl border flex-1 text-xs transition-all ${
                        isDone ? 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A]' :
                        isCurrent ? 'bg-[#FFF8E1] border-[#FFE082] text-[#F57F17] font-bold' :
                        'bg-white border-[#E0E0E0] text-slate-400'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm">{stage.label}</span>
                          <span className="text-[10px] uppercase font-mono font-bold">
                            {isDone ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : isRejected ? 'REJECTED' : 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-[#C8E6C9] bg-white text-center space-y-3">
            <Ticket className="w-12 h-12 text-[#2E7D32] opacity-40 mx-auto" />
            <h3 className="text-base font-bold text-[#1A1A1A]">No Active Booking Selected</h3>
            <p className="text-xs text-[#555555]">Enter a token number above or select from your booking history below.</p>
          </div>
        )
      )}

      {/* TAB CONTENT: MY BOOKINGS LIST */}
      {activeTab === 'MY_BOOKINGS' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
          <h3 className="text-base font-black text-[#1A1A1A]">Farmer Booking History</h3>
          <div className="divide-y divide-[#C8E6C9]">
            {userBookings.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#555555] italic">No bookings recorded for this account.</p>
            ) : (
              userBookings.map((b) => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <span className="font-mono font-black text-sm text-[#2E7D32]">{b.token_number}</span>
                    <span className="ml-2 font-bold text-[#1A1A1A]">{b.crop_name || 'Wheat'} ({b.quantity_kg} kg)</span>
                    <div className="text-[10px] text-[#555555] mt-0.5">
                      Date: {b.booking_date} | Slot: {b.time_slot} | Center: {b.center_name || 'Ludhiana'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#F1F8E9] border border-[#C8E6C9] text-[#2E7D32]">
                      {b.procurement_status}
                    </span>
                    <button
                      onClick={() => {
                        if (onSearchToken) onSearchToken(b.token_number);
                        setActiveTab('TIMELINE');
                      }}
                      className="px-3 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                    >
                      Track
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
