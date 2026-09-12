import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Cpu, TrendingUp, Clock, Scale, Info, RefreshCw } from 'lucide-react';
import AIForecastGraph7Day from '../components/AIForecastGraph7Day';
import AIMultiCenterComparison from '../components/AIMultiCenterComparison';

export default function AIDemoPanel() {
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(1);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    if (selectedCenterId) {
      loadAiForecast(selectedCenterId);
    }
  }, [selectedCenterId]);

  const loadCenters = async () => {
    try {
      const res = await api.getCenters();
      setCenters(res.centers || []);
    } catch (err) {
      console.error('Failed to load centers:', err);
    }
  };

  const loadAiForecast = async (centerId) => {
    setLoading(true);
    try {
      const res = await api.getAiForecast(centerId);
      setAiData(res);
    } catch (err) {
      console.error('Failed to load AI forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-[#1A1A1A]">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-3.5 py-1 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                AI Capacity Planning Engine
              </span>
              <span className="text-xs text-[#555555] font-mono">Sample Data Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">AI Queue Forecast & Demand Predictor</h1>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-2xl bg-white border border-[#C8E6C9]">
            <span className="text-xs font-bold text-[#555555] pl-2">Mandi Yard:</span>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(parseInt(e.target.value))}
              className="text-xs font-black px-3 py-2 rounded-xl border border-[#C8E6C9] bg-[#F1F8E9] text-[#2E7D32] focus:outline-none cursor-pointer"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadAiForecast(selectedCenterId)}
              className="p-2 rounded-xl bg-white hover:bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32]"
              title="Recalculate Model"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Explicit Copy Rule Labeling */}
        <div className="bg-[#FFF8E1] border border-[#FFE082] p-4 rounded-2xl text-xs text-[#1A1A1A] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#F57F17] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-black text-[#F57F17] block">AI-Assisted Forecast — Demo based on sample historical data</span>
            <p className="text-[#555555]">
              Reduces unnecessary waiting time through AI-assisted demand forecasting. Capacity information is subject to operational changes.
            </p>
          </div>
        </div>
      </div>

      {/* Main AI Forecast Metrics Grid */}
      {aiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Metric 1: Tomorrow's Predicted Procurement */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-[#555555]">
              <span className="text-xs font-black uppercase tracking-widest text-[#F57F17] flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Tomorrow's Predicted Procurement
              </span>
              <span className="text-[10px] bg-[#FFF8E1] text-[#F57F17] px-2 py-0.5 rounded border border-[#FFE082] font-mono font-bold">
                Sample Historical Model
              </span>
            </div>

            <div>
              <span className="text-4xl sm:text-5xl font-black text-[#1A1A1A] tracking-tight">
                {aiData.tomorrow_predicted_procurement_kg?.toLocaleString()} <span className="text-xl text-[#555555] font-semibold">kg</span>
              </span>
              <div className="flex items-center space-x-2 mt-2 text-xs text-[#2E7D32] font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Demand Trend: {aiData.demand_trend}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#C8E6C9] text-xs space-y-2 font-medium text-[#555555]">
              <div className="flex justify-between">
                <span>Recommended Counter Allocation:</span>
                <span className="font-bold text-[#1A1A1A]">{aiData.recommended_counters} counters</span>
              </div>
              <div className="flex justify-between">
                <span>Target Unloading Velocity:</span>
                <span className="font-bold font-mono text-[#1A1A1A]">420 kg / min</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Dynamic Expected Waiting Time */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-[#555555]">
              <span className="text-xs font-black uppercase tracking-widest text-[#1565C0] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expected Waiting Time (Dynamic)
              </span>
              <span className="text-[10px] bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded border border-[#BBDEFB] font-mono font-bold">
                Real-Time Queue Formula
              </span>
            </div>

            <div>
              <span className="text-4xl sm:text-5xl font-black text-[#1565C0] tracking-tight">
                {aiData.dynamic_estimated_wait_mins} <span className="text-xl text-[#555555] font-semibold">minutes</span>
              </span>
              <p className="text-xs text-[#555555] mt-2 font-mono">
                Formula: <code className="px-2 py-1 rounded border border-[#C8E6C9] bg-[#F1F8E9] font-bold text-[#2E7D32]">(active_queue × avg_proc_time) / open_counters</code>
              </p>
            </div>

            <div className="pt-4 border-t border-[#C8E6C9] text-xs space-y-2 font-medium text-[#555555]">
              <div className="flex justify-between">
                <span>Active Queue Length:</span>
                <span className="font-bold text-[#1A1A1A]">{aiData.active_queue_length} checked-in</span>
              </div>
              <div className="flex justify-between">
                <span>Active Counters:</span>
                <span className="font-bold text-[#1A1A1A]">{aiData.open_counters} counters</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 7-DAY FORECAST GRAPH & MULTI-CENTER COMPARISON */}
      <div className="space-y-8 pt-4">
        <AIForecastGraph7Day selectedCenterId={selectedCenterId} />
        <AIMultiCenterComparison selectedCenterId={selectedCenterId} />
      </div>

    </div>
  );
}
