import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export default function MarketPriceTable({ prices = [] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#C8E6C9] bg-white shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#C8E6C9] text-[#555555] font-black uppercase tracking-widest text-[10px] bg-[#F1F8E9]">
            <th className="py-4 px-5">Crop Name</th>
            <th className="py-4 px-5">Category</th>
            <th className="py-4 px-5">Previous Day Baseline</th>
            <th className="py-4 px-5 text-right">Expected Today Rate</th>
            <th className="py-4 px-5 text-right">Estimated Change</th>
            <th className="py-4 px-5 text-center">Trend Indicator</th>
            <th className="py-4 px-5 text-center">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C8E6C9] font-medium text-[#1A1A1A]">
          {prices.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-[#555555] italic">
                No market price data available.
              </td>
            </tr>
          ) : (
            prices.map((p) => {
              const isUp = p.trend === 'increasing' || p.price_change > 0;
              const isDown = p.trend === 'decreasing' || p.price_change < 0;

              return (
                <tr key={p.id || p.crop_name} className="hover:bg-[#F1F8E9] transition-all">
                  
                  <td className="py-4 px-5 font-black text-sm text-[#1A1A1A]">
                    {p.crop_name}
                  </td>

                  <td className="py-4 px-5">
                    <span className="text-[10px] font-extrabold uppercase text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                      {p.category || 'Cereal'}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-mono text-sm font-bold text-[#555555]">
                    ₹{p.previous_day_price ? p.previous_day_price.toLocaleString('en-IN') : '2,420'} <span className="text-[10px] font-normal text-[#888888]">/ quintal</span>
                  </td>

                  <td className="py-4 px-5 text-right font-mono font-black text-base text-[#2E7D32]">
                    ₹{p.expected_price ? p.expected_price.toLocaleString('en-IN') : '2,455'} <span className="text-[10px] font-normal text-[#2E7D32]">/ quintal</span>
                  </td>

                  <td className={`py-4 px-5 text-right font-mono font-bold text-xs ${
                    isUp ? 'text-emerald-600' :
                    isDown ? 'text-rose-600' :
                    'text-slate-600'
                  }`}>
                    {isUp ? '+' : ''}{p.price_change ? p.price_change : 0} ₹ ({p.price_change_percentage ? `${p.price_change_percentage > 0 ? '+' : ''}${p.price_change_percentage}%` : '0%'})
                  </td>

                  <td className="py-4 px-5 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase ${
                      isUp ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      isDown ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}>
                      {isUp && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                      {isDown && <TrendingDown className="w-3 h-3 text-rose-600" />}
                      {!isUp && !isDown && <Minus className="w-3 h-3 text-slate-500" />}
                      <span>{isUp ? 'Increasing' : isDown ? 'Decreasing' : 'Stable'}</span>
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center font-bold text-xs text-[#555555]">
                    <span className="px-2 py-0.5 rounded bg-[#F1F8E9] border border-[#C8E6C9] text-[10px]">
                      {p.confidence_level || 'Moderate'}
                    </span>
                  </td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
