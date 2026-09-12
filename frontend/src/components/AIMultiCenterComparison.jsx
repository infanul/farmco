import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Building2, CheckCircle2 } from 'lucide-react';

export default function AIMultiCenterComparison({ selectedCenterId }) {
  const [compData, setCompData] = useState(null);

  useEffect(() => {
    loadComparison(selectedCenterId);
  }, [selectedCenterId]);

  const loadComparison = async (centerId) => {
    try {
      const res = await api.getAiRecommendation(centerId || 1);
      setCompData(res);
    } catch (err) {
      console.error('Failed to load multi-center comparison:', err);
    }
  };

  if (!compData) return null;

  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
      
      <div className="flex justify-between items-center pb-3 border-b border-[#C8E6C9]">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-base font-black text-[#1A1A1A] uppercase tracking-wider">MULTI-CENTER AI COMPARISON</h2>
          </div>
          <p className="text-xs text-[#555555] mt-0.5">
            Side-by-side queue analysis across nearby procurement yards.
          </p>
        </div>
        <span className="text-xs text-[#2E7D32] font-mono font-bold bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
          ✦ AI Optimal Choice
        </span>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {compData.comparisons?.map((center) => {
          const isRecommended = center.name === compData.recommended_center;

          return (
            <div
              key={center.center_id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isRecommended
                  ? 'bg-[#E8F5E9] border-2 border-[#2E7D32] shadow-sm'
                  : 'bg-[#F1F8E9] border border-[#C8E6C9]'
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 right-4 bg-[#2E7D32] text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full tracking-widest shadow-sm">
                  RECOMMENDED YARD
                </span>
              )}

              <div>
                <h3 className="font-extrabold text-[#1A1A1A] text-sm">{center.name}</h3>
                <span className="text-[11px] text-[#555555] block mt-0.5">{center.location}</span>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#C8E6C9] text-xs">
                  <div>
                    <span className="text-[10px] text-[#555555] uppercase font-mono block">PREDICTED QUEUE</span>
                    <span className="font-extrabold text-[#1A1A1A]">{center.predicted_queue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#555555] uppercase font-mono block">PREDICTED WAIT</span>
                    <span className={`font-black ${center.status_color === 'green' ? 'text-[#2E7D32]' : 'text-[#F57F17]'}`}>
                      {center.predicted_wait}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#C8E6C9] flex justify-between items-center text-[10px]">
                <span className="text-[#555555]">Counters: {center.open_counters} Active</span>
                <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                  center.status_color === 'green' ? 'bg-white text-[#2E7D32] border border-[#C8E6C9]' : 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]'
                }`}>
                  {center.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation Summary */}
      <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9] text-xs flex items-center justify-between text-[#1A1A1A]">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <div>
            <span className="font-black text-[#2E7D32] block">AI Choice: {compData.recommended_center}</span>
            <span className="text-[#555555] text-[11px]">{compData.reason}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
