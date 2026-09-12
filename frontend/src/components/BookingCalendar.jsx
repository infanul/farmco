import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, ArrowRight, Check } from 'lucide-react';

export default function BookingCalendar({ selectedCenterId = 1, onSelectSlot, userBookings = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState('1');
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedCenterId, selectedDate);
    }
  }, [selectedCenterId, selectedDate]);

  const loadCrops = async () => {
    try {
      const res = await api.getCrops();
      setCrops(res.crops || []);
    } catch (err) {
      console.error('Failed to load crops:', err);
    }
  };

  const loadSlots = async (centerId, date) => {
    setLoadingSlots(true);
    try {
      const res = await api.getSlots(centerId, date);
      setSlotsData(res);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Generate 14 days calendar items
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      // Check if farmer has booking on this date
      const hasMyBooking = userBookings.some(b => b.booking_date === dateStr);

      days.push({
        dateStr,
        dayName,
        dayNum,
        monthName,
        isToday: i === 0,
        hasMyBooking
      });
    }
    return days;
  };

  const calendarDays = generateDays();

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-6 shadow-sm text-[#1A1A1A]">
      
      {/* Calendar Header & Crop Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C8E6C9] pb-4">
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#2E7D32]" />
            Interactive Harvest Booking Calendar
          </h2>
          <p className="text-xs text-[#555555] mt-0.5">
            Select an available harvest date to view real-time capacity and reserve an arrival slot.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#555555]">Crop:</span>
          <select
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            className="text-xs font-black rounded-xl px-3 py-2 border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] focus:outline-none cursor-pointer flex-1 sm:w-48"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Carousel Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-[#555555]">
          <span>Available Harvest Dates:</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4CAF50]" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF9800]" /> Limited</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2196F3]" /> My Booking</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
          {calendarDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md font-black ring-2 ring-[#2E7D32]/30'
                    : d.hasMyBooking
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] hover:border-[#2E7D32]'
                }`}
              >
                {d.hasMyBooking && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{d.dayName}</span>
                <span className="text-2xl font-black my-0.5">{d.dayNum}</span>
                <span className="text-[10px] font-semibold">{d.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Slot Picker Cards */}
      <div className="space-y-4 pt-2 border-t border-[#C8E6C9]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2E7D32]" />
            Arrival Slots for Date: <span className="font-mono text-[#2E7D32]">{selectedDate}</span>
          </h3>
          <span className="text-[10px] text-[#555555] font-semibold">
            Capacity info subject to operational changes
          </span>
        </div>

        {loadingSlots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-[#F1F8E9] animate-pulse" />)}
          </div>
        ) : slotsData?.slots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slotsData.slots.map((s) => {
              const isFull = s.is_full;
              return (
                <div
                  key={s.time_slot}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                    isFull
                      ? 'bg-slate-100 border-slate-300 text-slate-400'
                      : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] hover:border-[#2E7D32]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-black text-xs">{s.time_slot}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isFull ? 'bg-rose-100 text-rose-700' :
                      s.available <= 5 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isFull ? 'FULL' : `${s.available} slots`}
                    </span>
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => onSelectSlot && onSelectSlot({ date: selectedDate, time_slot: s.time_slot, crop_id: selectedCropId })}
                    className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 ${
                      isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-sm cursor-pointer'
                    }`}
                  >
                    <span>{isFull ? 'Fully Booked' : 'Book This Slot'}</span>
                    {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#555555] italic bg-[#F1F8E9] rounded-2xl">
            Select a date to view slot capacity.
          </div>
        )}
      </div>

    </div>
  );
}
