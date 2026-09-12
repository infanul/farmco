import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { TrendingUp, Info, AlertTriangle, RefreshCw, Landmark } from 'lucide-react';
import MarketPriceTable from '../components/MarketPriceTable';

export default function MarketPricesView({ onBookSlotClick }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const res = await api.getMarketPrices();
      setPrices(res.market_prices || []);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] uppercase tracking-widest mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Farmco Dynamic Price Analytics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">Expected Market Prices</h1>
            <p className="text-xs text-[#555555] mt-1 max-w-2xl">
              Real-time Mandi market rates calculated deterministically using previous-day baseline market transactions and recent arrival movement.
            </p>
          </div>

          <button
            onClick={loadPrices}
            className="px-4 py-2.5 bg-white text-[#1A1A1A] border border-[#C8E6C9] hover:border-[#2E7D32] text-xs font-bold rounded-2xl shadow-sm flex items-center space-x-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2E7D32]' : ''}`} />
            <span>Refresh Rates</span>
          </button>
        </div>
      </div>

      {/* FORMULA & CALCULATION BASIS DISCLAIMER BOX */}
      <div className="p-5 rounded-3xl border border-[#BBDEFB] bg-[#E3F2FD] text-[#1565C0] space-y-2 text-xs font-medium">
        <div className="flex items-center space-x-2 font-black">
          <Info className="w-4 h-4 text-[#1565C0] shrink-0" />
          <span>Expected Price Calculation Basis & Formula:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#1565C0]/90">
          Expected Market Price = Previous Day Baseline Price + Estimated Market Movement.
          This system uses real previous-day APMC Mandi closing rates as baseline context. Confidence rating: <strong>Moderate</strong>.
        </p>
      </div>

      {/* Market Prices Table */}
      {loading ? (
        <div className="h-64 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] animate-pulse" />
      ) : (
        <MarketPriceTable prices={prices} />
      )}

      {/* CTA Box */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left shadow-sm">
        <div>
          <h3 className="text-base font-black text-[#1A1A1A]">Ready to Lock in Your Procurement Slot?</h3>
          <p className="text-xs text-[#555555] mt-0.5">Secure your time slot to ensure zero queue waiting at your regional procurement yard.</p>
        </div>
        <button
          onClick={() => onBookSlotClick()}
          className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          Book Harvest Slot Now
        </button>
      </div>

    </div>
  );
}
