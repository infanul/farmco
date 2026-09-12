import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function AIQueueForecastCard({ selectedCenterId }) {
  const [forecastData, setForecastData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForecast(selectedCenterId);
  }, [selectedCenterId]);

  const loadForecast = async (centerId) => {
    setLoading(true);
    try {
      const res = await api.get7DayForecast(centerId || 1);
      setForecastData(res);
      if (res.forecast?.length > 0) {
        const recommended = res.forecast.find(f => f.isBest) || res.forecast[2];
        setSelectedDay(recommended);
      }
    } catch (err) {
      console.error('Failed to load 7-day forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!forecastData) return null;

  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#C8E6C9]">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-wider">AI QUEUE FORECAST</h2>
          </div>
          <p className="text-xs text-[#555555] mt-0.5">
            Predicted procurement-center queue conditions for upcoming days.
          </p>
        </div>

        {/* Confidence Score Badge */}
        {selectedDay && (
          <div className="flex items-center space-x-3 bg-[#F1F8E9] px-4 py-2 rounded-2xl border border-[#C8E6C9] shrink-0">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span className="text-xs font-black text-[#2E7D32]">{selectedDay.confidence}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#555555] font-bold uppercase tracking-widest block">AI CONFIDENCE</span>
              <span className="text-xs font-black text-[#2E7D32]">{selectedDay.confidence}% Reliable</span>
            </div>
          </div>
        )}
      </div>

      {/* 7-DAY QUEUE BADGES ROW */}
      <div className="grid grid-cols-7 gap-2">
        {forecastData.forecast.map((item) => {
          const isSelected = selectedDay?.day === item.day;
          
          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] font-black shadow-sm'
                  : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] hover:bg-white'
              }`}
            >
              <span className="text-xs font-black block">{item.day}</span>
              <span className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-full uppercase tracking-wider block ${
                item.status === 'LOW' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' :
                item.status === 'MODERATE' ? 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]' :
                'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
              }`}>
                {item.status === 'LOW' ? '🟢 LOW' : item.status === 'MODERATE' ? '🟠 MOD' : '🔴 HIGH'}
              </span>
            </button>
          );
        })}
      </div>

      {/* SELECTED DAY PREDICTION METRICS */}
      {selectedDay && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#555555] block mb-1">
              EXPECTED QUEUE
            </span>
            <span className="text-2xl font-black text-[#1A1A1A]">{selectedDay.farmers} <span className="text-xs text-[#555555] font-normal">farmers</span></span>
          </div>

          <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#555555] block mb-1">
              EXPECTED WAIT TIME
            </span>
            <span className="text-2xl font-black text-[#F57F17]">{selectedDay.wait}</span>
          </div>

          <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#555555] block mb-1">
              BEST ARRIVAL WINDOW
            </span>
            <span className="text-sm font-extrabold text-[#1565C0] block mt-1">{selectedDay.bestTime}</span>
          </div>

        </div>
      )}

      {/* AI RECOMMENDATION BOX */}
      <div className="bg-[#E8F5E9] p-4 sm:p-5 rounded-2xl border border-[#C8E6C9] text-xs space-y-2 text-[#1A1A1A]">
        <div className="flex items-center space-x-2 text-[#2E7D32] font-black uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>AI RECOMMENDATION</span>
        </div>
        <p className="text-[#1A1A1A] leading-relaxed font-semibold">
          "{forecastData.best_recommendation?.summary}"
        </p>
        <div className="text-[10px] text-[#555555] italic pt-1 border-t border-[#C8E6C9]">
          * Predicted queue estimates based on historical arrival trends & dynamic counter velocity.
        </div>
      </div>

    </div>
  );
}
