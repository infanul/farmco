import React from 'react';
import { Sprout, TrendingUp, TrendingDown, Minus, Calendar, ArrowRight } from 'lucide-react';

export default function CropCard({ crop, onBookSlot, onViewDetails }) {
  const isUp = crop.trend === 'increasing' || crop.price_change > 0;
  const isDown = crop.trend === 'decreasing' || crop.price_change < 0;

  return (
    <div className="p-6 rounded-3xl border border-[#C8E6C9] bg-white shadow-sm hover:shadow-md transition-all space-y-4 text-[#1A1A1A] flex flex-col justify-between">
      <div className="space-y-3">
        {/* Category & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9] tracking-wider">
            {crop.category || 'Cereal'}
          </span>
          <div className={`flex items-center space-x-1 text-xs font-black px-2.5 py-0.5 rounded-lg ${
            isUp ? 'bg-emerald-100 text-emerald-700' :
            isDown ? 'bg-rose-100 text-rose-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {isUp && <TrendingUp className="w-3.5 h-3.5" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5" />}
            {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
            <span>{crop.price_change_percentage ? `${crop.price_change_percentage > 0 ? '+' : ''}${crop.price_change_percentage}%` : '0%'}</span>
          </div>
        </div>

        {/* Crop Name */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] text-[#2E7D32] flex items-center justify-center font-black text-lg">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#1A1A1A]">{crop.crop_name || crop.name}</h3>
            <span className="text-xs text-[#555555] font-medium">Govt. MSP Procurement Grade</span>
          </div>
        </div>

        {/* Price Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] text-xs">
          <div>
            <span className="text-[10px] text-[#555555] font-bold block uppercase">Previous Day Baseline</span>
            <span className="font-mono font-bold text-[#1A1A1A]">
              ₹{crop.previous_day_price ? crop.previous_day_price.toLocaleString('en-IN') : (crop.price_per_kg ? (crop.price_per_kg * 100).toFixed(0) : '2,420')} / quintal
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#2E7D32] font-black block uppercase">Expected Today</span>
            <span className="font-mono font-black text-sm text-[#2E7D32]">
              ₹{crop.expected_price ? crop.expected_price.toLocaleString('en-IN') : (crop.price_per_kg ? (crop.price_per_kg * 100 * 1.015).toFixed(0) : '2,455')} / quintal
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center space-x-2">
        {onBookSlot && (
          <button
            onClick={() => onBookSlot(crop)}
            className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Slot</span>
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(crop)}
            className="px-3.5 py-2.5 bg-[#F1F8E9] hover:bg-[#E8F5E9] text-[#1A1A1A] text-xs font-bold rounded-xl border border-[#C8E6C9] transition cursor-pointer"
          >
            <span>Details</span>
          </button>
        )}
      </div>
    </div>
  );
}
