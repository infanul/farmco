import React, { useState, useEffect } from 'react';
import { Radio, Truck, Building2, Sprout, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Agri3DScene() {
  const [truckPos, setTruckPos] = useState(15);
  const [activeSector, setActiveSector] = useState('wheat');

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPos((prev) => (prev >= 85 ? 15 : prev + 2.5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[380px] bg-[#07130f] rounded-3xl border border-emerald-500/30 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl group">
      
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3ec488 1px, transparent 1px), radial-gradient(#5ed4fa 1px, #07130f 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Top Telemetry Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            3D DIGITAL TWIN • REAL-TIME TELEMETRY
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/80">
          HUB #PB-LUD-01 ACTIVE
        </span>
      </div>

      {/* Interactive 3D Sector Diagram & Animated Supply Route */}
      <div className="relative z-10 my-auto py-6">
        
        {/* Connection Line */}
        <div className="absolute top-1/2 left-[10%] right-[10%] -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500 rounded-full" />

        {/* Animated Moving Truck */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 z-20 flex flex-col items-center"
          style={{ left: `${truckPos}%` }}
        >
          <div className="bg-cyan-950 p-2 rounded-xl border border-cyan-400 shadow-xl pulse-cyan">
            <Truck className="w-5 h-5 text-cyan-300 transform -scale-x-100" />
          </div>
          <span className="text-[9px] font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">
            TK-A101 (2.5t)
          </span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-3 gap-4 items-center text-center">
          
          {/* Node 1: Wheat Sector A */}
          <div 
            onClick={() => setActiveSector('wheat')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSector === 'wheat'
                ? 'bg-emerald-950/90 border-emerald-400 shadow-xl shadow-emerald-950 scale-105'
                : 'bg-slate-950/80 border-slate-850 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 text-amber-400 text-xl shadow-lg">
              🌾
            </div>
            <span className="text-xs font-black text-white block">Sector A (Wheat)</span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Harvest Ready</span>
          </div>

          {/* Node 2: Central Mandi Warehouse */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-950 to-slate-950 border border-cyan-400/60 shadow-2xl scale-110 relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 absolute -top-1.5 left-1/2 -translate-x-1/2 animate-ping" />
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/90 border border-cyan-400 flex items-center justify-center mx-auto mb-2 text-cyan-300 shadow-xl pulse-cyan">
              🏢
            </div>
            <span className="text-xs font-black text-white block">Procurement Yard</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold block mt-0.5">3 Counters Active</span>
          </div>

          {/* Node 3: Mustard Sector C */}
          <div 
            onClick={() => setActiveSector('mustard')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSector === 'mustard'
                ? 'bg-amber-950/90 border-amber-400 shadow-xl shadow-amber-950 scale-105'
                : 'bg-slate-950/80 border-slate-850 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 text-amber-400 text-xl shadow-lg">
              🌱
            </div>
            <span className="text-xs font-black text-white block">Sector C (Mustard)</span>
            <span className="text-[10px] text-amber-400 font-mono block mt-0.5">In Transit</span>
          </div>

        </div>

      </div>

      {/* Bottom Telemetry Footer */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 border-t border-slate-900 z-10">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Activity className="w-3.5 h-3.5" />
          Queue Velocity: 420 kg / min
        </span>
        <span className="text-amber-400 font-mono font-bold">Est Wait: ~20 mins</span>
      </div>

    </div>
  );
}
