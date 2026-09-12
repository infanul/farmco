import React, { useState } from 'react';
import { Ticket, Search } from 'lucide-react';
import BookingTracker from '../components/BookingTracker';

export default function BookingTrackerView({ activeBooking, userBookings, onSearchToken }) {
  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] uppercase tracking-widest mb-1">
            <Ticket className="w-4 h-4" />
            <span>Farmco Real-time Token Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">Track Procurement Booking</h1>
          <p className="text-xs text-[#555555] mt-1 max-w-2xl">
            Monitor your live Mandi queue progress, quality check stage, weighing verification, and direct payout status step-by-step.
          </p>
        </div>
      </div>

      {/* Booking Tracker Component */}
      <BookingTracker
        booking={activeBooking}
        userBookings={userBookings}
        onSearchToken={onSearchToken}
      />

    </div>
  );
}
