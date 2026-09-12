import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, RefreshCw, Layers, PieChart, Coins, PackageCheck } from 'lucide-react';
import { api } from '../api';

export default function AdminTotalsDashboard({ centerId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [centerId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics(centerId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1A1A1A]">

      {/* Title & Refresh Bar */}
      <div className="p-6 rounded-3xl border border-[#BBDEFB] bg-[#E3F2FD] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1565C0] uppercase tracking-widest mb-1">
            <PieChart className="w-4 h-4" />
            <span>Procurement Totals & Onward Dispatch Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">Real-Time Aggregates & Crop Breakdown</h2>
        </div>

        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-white hover:bg-[#BBDEFB] border border-[#BBDEFB] text-[#1565C0] font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {analytics && (
        <>
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Bought */}
            <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-[#2E7D32]">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Quantity Procured</span>
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#1A1A1A]">
                  {parseFloat(analytics.total_quantity_bought_kg || 0).toLocaleString()} <span className="text-xs text-[#555555]">kg</span>
                </span>
                <span className="text-xs text-[#2E7D32] font-bold block mt-0.5 font-mono">
                  = {analytics.total_quantity_bought_tonnes} Tonnes
                </span>
              </div>
              <p className="text-[10px] text-[#555555]">Total grain volume received from farmers</p>
            </div>

            {/* Card 2: Total Dispatched Onward */}
            <div className="p-5 rounded-3xl border border-[#BBDEFB] bg-[#E3F2FD] space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-[#1565C0]">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Dispatched Onward</span>
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#1565C0]">
                  {parseFloat(analytics.total_quantity_dispatched_kg || 0).toLocaleString()} <span className="text-xs text-[#555555]">kg</span>
                </span>
                <span className="text-xs text-[#1565C0] font-bold block mt-0.5 font-mono">
                  = {analytics.total_quantity_dispatched_tonnes} Tonnes
                </span>
              </div>
              <p className="text-[10px] text-[#555555]">Cleared batches dispatched for regional supply</p>
            </div>

            {/* Card 3: Total Transactions */}
            <div className="p-5 rounded-3xl border border-[#FFE082] bg-[#FFF8E1] space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-[#F57F17]">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Transactions</span>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#1A1A1A]">
                  {analytics.total_transactions}
                </span>
                <span className="text-xs text-[#F57F17] font-bold block mt-0.5 font-mono">
                  Token Reservations
                </span>
              </div>
              <p className="text-[10px] text-[#555555]">Total completed and active bookings</p>
            </div>

            {/* Card 4: Total Payout Value */}
            <div className="p-5 rounded-3xl border border-[#C8E6C9] bg-white space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-[#2E7D32]">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Committed Value</span>
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#2E7D32] font-mono">
                  ₹{parseFloat(analytics.total_payout_committed_rs || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#555555] font-bold block mt-0.5">
                  MSP Calculated Payout
                </span>
              </div>
              <p className="text-[10px] text-[#555555]">Sum of all procurement MSP values</p>
            </div>

          </div>

          {/* Per-Crop Breakdown Table */}
          <div className="p-6 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#C8E6C9] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">
                  Per-Crop Procurement & Weight Composition
                </h3>
                <p className="text-xs text-[#555555]">Calculated dynamically from seeded transaction records.</p>
              </div>
              <span className="text-[10px] bg-[#F1F8E9] text-[#2E7D32] px-2.5 py-1 rounded-full border border-[#C8E6C9] font-mono font-bold">
                {analytics.crop_breakdown?.length || 0} Crop Categories
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#C8E6C9]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F1F8E9] border-b border-[#C8E6C9] text-[#1A1A1A] font-black text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Crop Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">MSP Rate (₹/kg)</th>
                    <th className="py-3 px-4">Total Quantity (kg)</th>
                    <th className="py-3 px-4">Total Weight (Tonnes)</th>
                    <th className="py-3 px-4">Transactions</th>
                    <th className="py-3 px-4 text-right">Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0] text-[11px] font-medium">
                  {analytics.crop_breakdown?.map((crop) => (
                    <tr key={crop.crop_name} className="hover:bg-[#F9FBE7] transition">
                      <td className="py-3.5 px-4 font-black text-[#1A1A1A]">{crop.crop_name}</td>
                      <td className="py-3.5 px-4 text-[#555555] font-bold">{crop.category}</td>
                      <td className="py-3.5 px-4 font-mono text-[#555555]">₹{crop.price_per_kg}/kg</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A1A]">{crop.total_kg?.toLocaleString()} kg</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1565C0]">{crop.weight_tonnes} T</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#555555]">{crop.transaction_count}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-[#2E7D32]">
                        ₹{parseFloat(crop.total_value_rs || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
