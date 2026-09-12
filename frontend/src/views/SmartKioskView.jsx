import React, { useState } from 'react';
import { Monitor, Printer, History, Search, Ticket, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import ProcurementHistory from '../components/ProcurementHistory';
import { api } from '../api';

export default function SmartKioskView({ userBookings = [] }) {
  const [activeKioskTab, setActiveKioskTab] = useState('PRINT'); // 'PRINT' | 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  const handleTokenSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setFoundBooking(null);

    try {
      // Search by phone or token number
      let res = await api.getBookings({ farmer_phone: searchQuery.trim() });
      if (res.bookings && res.bookings.length > 0) {
        setFoundBooking(res.bookings[0]);
      } else {
        res = await api.getBookings({ token_number: searchQuery.trim() });
        if (res.bookings && res.bookings.length > 0) {
          setFoundBooking(res.bookings[0]);
        } else {
          setSearchError('No active booking found matching token or phone number.');
        }
      }
    } catch (err) {
      setSearchError('Failed to search kiosk token.');
    } finally {
      setSearching(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 text-[#1A1A1A] dark:text-slate-100 transition-colors duration-300">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] dark:border-slate-700 bg-[#F1F8E9] dark:bg-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3.5 py-1 bg-[#2E7D32] dark:bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <Monitor className="w-3.5 h-3.5" />
                Mandi Self-Service Kiosk
              </span>
              <span className="text-xs text-[#555555] dark:text-slate-400 font-medium">Touchscreen Yard Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
              Smart Kiosk Self-Service Portal
            </h1>
            <p className="text-xs text-[#555555] dark:text-slate-400 mt-1 max-w-2xl">
              Walk-up touch kiosk terminal for farmers to quickly print physical token slips or review historical procurement records.
            </p>
          </div>

          {/* Kiosk Mode Toggle Tabs */}
          <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-[#C8E6C9] dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setActiveKioskTab('PRINT')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeKioskTab === 'PRINT'
                  ? 'bg-[#2E7D32] dark:bg-emerald-600 text-white shadow-sm'
                  : 'text-[#1A1A1A] dark:text-slate-300 hover:text-[#2E7D32]'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Print Token</span>
            </button>
            <button
              onClick={() => setActiveKioskTab('HISTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeKioskTab === 'HISTORY'
                  ? 'bg-[#2E7D32] dark:bg-emerald-600 text-white shadow-sm'
                  : 'text-[#1A1A1A] dark:text-slate-300 hover:text-[#2E7D32]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Procurement History</span>
            </button>
          </div>
        </div>
      </div>

      {/* KIOSK TAB 1: PRINT TOKEN & PASS */}
      {activeKioskTab === 'PRINT' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Token Search Bar */}
          <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] dark:border-slate-700 bg-white dark:bg-slate-800 space-y-6 shadow-sm">
            <div className="border-b border-[#C8E6C9] dark:border-slate-700 pb-3">
              <h2 className="text-base font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#2E7D32] dark:text-emerald-400" />
                Find Token to Print
              </h2>
              <p className="text-xs text-[#555555] dark:text-slate-400 mt-1">
                Enter registered phone number or Token ID (e.g. 9876543210 or TK-A101).
              </p>
            </div>

            <form onSubmit={handleTokenSearch} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold mb-1 text-[#1A1A1A] dark:text-slate-200">
                  Phone Number or Token ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 9876543210 or TK-A101"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#C8E6C9] dark:border-slate-700 bg-[#F1F8E9] dark:bg-slate-900 text-[#1A1A1A] dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={searching}
                className="w-full py-3.5 bg-[#2E7D32] dark:bg-emerald-600 hover:bg-[#1B5E20] dark:hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>{searching ? 'Locating Record...' : 'Search & Preview Pass'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-[#C8E6C9] dark:border-slate-700 text-xs">
              <span className="font-bold text-[#555555] dark:text-slate-400 block mb-1.5">Quick Demo Lookup:</span>
              <div className="flex flex-wrap gap-2">
                {['9876543210', '9876500001', 'TK-A101'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setSearchQuery(val);
                      handleTokenSearch({ preventDefault: () => {} });
                    }}
                    className="px-3 py-1 bg-[#F1F8E9] dark:bg-slate-900 border border-[#C8E6C9] dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-[#2E7D32] dark:text-emerald-400 hover:bg-[#E8F5E9] cursor-pointer"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Token Slip Display & Physical Print */}
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-base font-black flex items-center gap-2 text-[#1A1A1A] dark:text-white">
              <Ticket className="w-5 h-5 text-[#F57F17] dark:text-amber-400" />
              Kiosk Token Pass Output
            </h2>

            {foundBooking ? (
              <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] dark:border-slate-700 bg-[#F1F8E9] dark:bg-slate-800 space-y-4 shadow-sm text-[#1A1A1A] dark:text-slate-100">
                <div className="text-center py-6 bg-white dark:bg-slate-900 rounded-2xl border border-[#C8E6C9] dark:border-slate-700">
                  <span className="text-[10px] text-[#F57F17] dark:text-amber-400 uppercase tracking-widest block font-black">
                    OFFICIAL MANDI PROCUREMENT TOKEN
                  </span>
                  <span className="text-5xl font-black tracking-wider my-2 block font-mono text-[#2E7D32] dark:text-emerald-400">
                    {foundBooking.token_number || foundBooking.tokenNumber || 'TK-A101'}
                  </span>
                  <span className="text-xs font-bold text-[#555555] dark:text-slate-400 block">
                    Time Slot: {foundBooking.time_slot || foundBooking.timeSlot || '09:00 AM - 10:00 AM'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-[#C8E6C9] dark:border-slate-700">
                    <span className="text-[#555555] dark:text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-white">{foundBooking.farmer_name || foundBooking.farmerName || 'Ramesh Patel'}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-[#C8E6C9] dark:border-slate-700">
                    <span className="text-[#555555] dark:text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-bold font-mono text-[#1A1A1A] dark:text-white">{foundBooking.farmer_phone || foundBooking.farmerPhone || '9876543210'}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-[#C8E6C9] dark:border-slate-700">
                    <span className="text-[#555555] dark:text-slate-400 block text-[10px] uppercase font-bold">Crop & Weight</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-white">{foundBooking.crop_name || 'Wheat (Grade A)'} ({foundBooking.quantity_kg || 1500} kg)</span>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-[#C8E6C9] dark:border-slate-700">
                    <span className="text-[#555555] dark:text-slate-400 block text-[10px] uppercase font-bold">Mandi Yard</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-white">{foundBooking.center_name || 'Palakkad Central Hub'}</span>
                  </div>
                </div>

                {smsSent && (
                  <div className="bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2E7D32] dark:text-emerald-300 p-3 rounded-2xl text-xs text-center flex items-center justify-center gap-1.5 font-bold border border-[#C8E6C9] dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400" />
                    Kiosk SMS token pass dispatched!
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleSendSMS}
                    className="px-4 py-3 bg-white dark:bg-slate-900 hover:bg-[#E8F5E9] dark:hover:bg-slate-700 text-xs font-bold rounded-xl border border-[#C8E6C9] dark:border-slate-700 flex items-center gap-2 text-[#1A1A1A] dark:text-slate-200 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#F57F17] dark:text-amber-400" />
                    <span>Send SMS Token</span>
                  </button>

                  <button
                    onClick={handlePrintSlip}
                    className="px-6 py-3 bg-[#2E7D32] dark:bg-emerald-600 hover:bg-[#1B5E20] dark:hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Physical Token Pass</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-3xl border border-[#C8E6C9] dark:border-slate-700 bg-white dark:bg-slate-800 text-center space-y-3 text-[#555555] dark:text-slate-400">
                <Printer className="w-12 h-12 text-[#2E7D32] dark:text-emerald-400 opacity-30 mx-auto" />
                <p className="text-xs font-medium">Use the search form on the left to locate your booking token and trigger physical paper printing.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* KIOSK TAB 2: PROCUREMENT HISTORY */}
      {activeKioskTab === 'HISTORY' && (
        <div className="space-y-4">
          <ProcurementHistory bookings={userBookings} />
        </div>
      )}

    </div>
  );
}
