import React, { useState } from 'react';
import { History, CheckCircle } from 'lucide-react';

export default function ProcurementHistory({ bookings = [] }) {
  const [filter, setFilter] = useState('ALL');

  const sampleHistory = [
    {
      id: 'HIST-101',
      token: 'TK-A098',
      date: '2026-09-08',
      crop: 'Paddy (Grade A)',
      quantity: 1200,
      center: 'Palakkad Central Hub',
      status: 'COMPLETED',
      estimatedPayment: '₹26,400',
    },
    {
      id: 'HIST-102',
      token: 'TK-A084',
      date: '2026-08-28',
      crop: 'Wheat',
      quantity: 850,
      center: 'Alathur Agri Depot',
      status: 'COMPLETED',
      estimatedPayment: '₹19,250',
    },
    {
      id: 'HIST-103',
      token: 'TK-A071',
      date: '2026-08-14',
      crop: 'Paddy (Grade B)',
      quantity: 1500,
      center: 'Ottapalam Harvest Point',
      status: 'COMPLETED',
      estimatedPayment: '₹31,500',
    }
  ];

  const allRecords = bookings.length > 0 
    ? bookings.map(b => ({
        id: b.id,
        token: b.tokenNumber || `TK-${b.id}`,
        date: b.date || new Date().toISOString().split('T')[0],
        crop: b.cropType || 'Paddy',
        quantity: b.quantityKg || 1000,
        center: b.centerName || 'Procurement Center',
        status: b.status || 'COMPLETED',
        estimatedPayment: `₹${((b.quantityKg || 1000) * 22).toLocaleString('en-IN')}`
      }))
    : sampleHistory;

  const filteredRecords = filter === 'ALL' 
    ? allRecords 
    : allRecords.filter(r => r.status === filter);

  return (
    <div className="rounded-3xl p-6 border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#2E7D32] text-white">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">Procurement History</h3>
            <p className="text-xs text-[#555555]">Past crop deliveries and estimated payment records</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#F1F8E9] border border-[#C8E6C9]">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#1A1A1A] hover:text-[#2E7D32]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filter === 'COMPLETED'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#1A1A1A] hover:text-[#2E7D32]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Table / List */}
      <div className="space-y-3">
        {filteredRecords.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-[#C8E6C9] bg-[#F1F8E9] hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-center font-mono font-black text-xs text-[#2E7D32]">
                {item.token}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">{item.crop}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-[#2E7D32] border border-[#C8E6C9] font-bold">
                    {item.quantity} kg
                  </span>
                </div>
                <div className="text-xs text-[#555555] mt-0.5">
                  {item.center} • <span className="font-mono">{item.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C8E6C9]">
              <div className="text-left sm:text-right">
                <div className="text-xs font-semibold text-[#555555]">Estimated Payment</div>
                <div className="text-sm font-extrabold font-mono text-[#2E7D32]">
                  {item.estimatedPayment}
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>COMPLETED</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
