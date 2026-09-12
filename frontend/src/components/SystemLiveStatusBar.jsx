import React from 'react';
import { Activity, Clock, Truck, Users, CheckCircle2 } from 'lucide-react';

export default function SystemLiveStatusBar() {
  return (
    <div className="p-3.5 rounded-2xl bg-white border border-[#C8E6C9] shadow-sm text-[#1A1A1A]">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold font-mono">
        
        {/* System Live Pill */}
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="text-[#2E7D32] tracking-widest font-black uppercase text-[11px]">
            ● SYSTEM LIVE & COORDINATING
          </span>
        </div>

        {/* Status Metrics Items */}
        <div className="flex items-center space-x-6 text-[11px]">
          
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#FFF8E1] border border-[#FFE082]">
            <Users className="w-3.5 h-3.5 text-[#F57F17]" />
            <span className="text-[#555555]">WAITING:</span>
            <span className="font-extrabold text-[#F57F17]">24 FARMERS</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9]">
            <Clock className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span className="text-[#555555]">COUNTERS:</span>
            <span className="font-extrabold text-[#2E7D32]">06 ACTIVE</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#E3F2FD] border border-[#BBDEFB]">
            <Truck className="w-3.5 h-3.5 text-[#1565C0]" />
            <span className="text-[#555555]">FLEET:</span>
            <span className="font-extrabold text-[#1565C0]">03 TRUCKS</span>
          </div>

        </div>

      </div>
    </div>
  );
}
