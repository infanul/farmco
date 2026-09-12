import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BarChart2, Activity } from 'lucide-react';

export default function AIForecastGraph7Day({ selectedCenterId }) {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    loadData(selectedCenterId);
  }, [selectedCenterId]);

  const loadData = async (centerId) => {
    try {
      const res = await api.get7DayForecast(centerId || 1);
      setForecastData(res);
    } catch (err) {
      console.error('Failed to load 7-day graph data:', err);
    }
  };

  if (!forecastData || !forecastData.forecast) return null;

  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
      
      <div className="flex justify-between items-center pb-4 border-b border-[#C8E6C9]">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-base font-black text-[#1A1A1A] uppercase tracking-wider">7-DAY QUEUE FORECAST GRAPH</h2>
          </div>
          <p className="text-xs text-[#555555] mt-0.5">
            Interactive arrival volume & wait-time trajectory.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-[#2E7D32] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /> Low Period
          </span>
          <span className="flex items-center gap-1 text-[#F57F17] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F57F17]" /> Peak Period
          </span>
        </div>
      </div>

      {/* 7-DAY BAR GRAPH VISUALIZATION */}
      <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#C8E6C9] relative">
        
        {/* Background Target Line */}
        <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-[#C8E6C9] text-[10px] text-[#555555] font-mono pl-2 pointer-events-none">
          Threshold Capacity: 40 Farmers
        </div>

        {forecastData.forecast.map((item) => {
          const heightPercent = item.score; // 0 to 100
          const isLow = item.status === 'LOW';

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
              
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-[#1A1A1A] text-white px-2.5 py-1 rounded-xl text-[10px] font-mono pointer-events-none shrink-0 whitespace-nowrap shadow-md">
                {item.farmers} farmers ({item.wait})
              </div>

              {/* Animated Volume Bar */}
              <div
                className={`w-full rounded-t-2xl transition-all duration-300 ${
                  isLow 
                    ? 'bg-[#2E7D32]'
                    : item.status === 'MODERATE'
                    ? 'bg-[#F57F17]'
                    : 'bg-[#C62828]'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              <span className="text-xs font-black text-[#1A1A1A] mt-2 block">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[11px] text-[#555555]">
        <span className="flex items-center gap-1.5 text-[#2E7D32] font-bold">
          <Activity className="w-3.5 h-3.5 text-[#2E7D32]" />
          Optimal Arrival Window: Tuesday & Wednesday Morning
        </span>
        <span className="italic font-mono">Source: Dynamic Queue Simulation Engine</span>
      </div>

    </div>
  );
}
