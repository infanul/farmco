import React from 'react';
import { Calendar as CalendarIcon, Sprout } from 'lucide-react';
import BookingCalendar from '../components/BookingCalendar';

export default function BookingCalendarView({ currentUser, onSelectSlot, userBookings }) {
  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] uppercase tracking-widest mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Farmco Harvest Calendar Scheduling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">Booking Calendar</h1>
          <p className="text-xs text-[#555555] mt-1 max-w-2xl">
            Choose your preferred arrival date and time slot. Reserving ahead eliminates long waiting queues at the procurement yard.
          </p>
        </div>
      </div>

      {/* Booking Calendar Component */}
      <BookingCalendar
        selectedCenterId={currentUser?.center_id || 1}
        userBookings={userBookings}
        onSelectSlot={onSelectSlot}
      />

    </div>
  );
}
