import React, { useState, useEffect } from 'react';
import { Truck, Building2, Sprout, Sun, Moon, Cloud, Activity } from 'lucide-react';

export default function LivingDigitalFarm3D({ isDarkMode }) {
  const [truckPos, setTruckPos] = useState(15);
  const [activeSector, setActiveSector] = useState('wheat');

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPos((prev) => (prev >= 85 ? 15 : prev + 2.5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full h-full min-h-[420px] rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-700 shadow-2xl ${
      isDarkMode
        ? 'bg-[#07130f] border-emerald-500/30 text-slate-100'
        : 'bg-[#FFFDF6] border-[#2F6B45]/30 text-[#173322]'
    }`}>
      
      {/* 3D Atmospheric Lighting Layer */}
      {isDarkMode ? (
        // NIGHT ATMOSPHERE (Moon, Dark Fields, Stars, Fireflies)
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{
               backgroundImage: `radial-gradient(#3ec488 1px, transparent 1px), radial-gradient(#5ed4fa 1px, #07130f 1px)`,
               backgroundSize: '24px 24px',
               backgroundPosition: '0 0, 12px 12px'
             }}
        />
      ) : (
        // DAY ATMOSPHERE (Sunlight Rays, Morning Sky, Green Crop Soil Texture)
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{
               backgroundImage: `radial-gradient(#2F6B45 1.5px, transparent 1.5px), radial-gradient(#D6B46A 1.5px, #F7F4E8 1.5px)`,
               backgroundSize: '28px 28px',
               backgroundPosition: '0 0, 14px 14px'
             }}
        />
      )}

      {/* Top Digital Twin Environment Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-cyan-400 animate-pulse" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 animate-spin" />
          )}
          <span className="text-xs font-black uppercase tracking-widest font-mono">
            LIVING DIGITAL FARM • {isDarkMode ? 'NIGHT TELEMETRY' : 'DAY SUNLIGHT TELEMETRY'}
          </span>
        </div>

        <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold border ${
          isDarkMode
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : 'bg-[#B8C9A9]/50 text-[#17452D] border-[#2F6B45]/40'
        }`}>
          HUB #PB-LUD-01 • ONLINE
        </span>
      </div>

      {/* Interactive 3D Farm Ecosystem Layout */}
      <div className="relative z-10 my-auto py-8">
        
        {/* Supply Route Track */}
        <div className={`absolute top-1/2 left-[10%] right-[10%] -translate-y-1/2 h-1 rounded-full ${
          isDarkMode
            ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500'
            : 'bg-gradient-to-r from-[#2F6B45] via-[#D6B46A] to-[#17452D]'
        }`} />

        {/* Animated Harvest Transport Vehicle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 z-20 flex flex-col items-center"
          style={{ left: `${truckPos}%` }}
        >
          <div className={`p-2 rounded-xl border shadow-xl ${
            isDarkMode 
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 pulse-cyan'
              : 'bg-[#17452D] border-[#D6B46A] text-[#FFFDF6]'
          }`}>
            <Truck className="w-5 h-5 transform -scale-x-100" />
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border mt-1 whitespace-nowrap bg-slate-950 text-cyan-300 border-slate-800">
            TRUCK #TK-A101 (2.5t)
          </span>
        </div>

        {/* 3D Farm Nodes */}
        <div className="grid grid-cols-3 gap-6 items-center text-center">
          
          {/* Node 1: Wheat Fields */}
          <div 
            onClick={() => setActiveSector('wheat')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSector === 'wheat'
                ? isDarkMode
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-xl scale-105'
                  : 'bg-[#FFFDF6] border-[#2F6B45] shadow-xl scale-105'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 text-amber-500 text-2xl shadow-md">
              🌾
            </div>
            <span className="text-xs font-black block">Sector A (Wheat)</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5 font-bold">
              Harvest Active
            </span>
          </div>

          {/* Node 2: Central Procurement Warehouse Hub */}
          <div className={`p-5 rounded-3xl border shadow-2xl scale-110 relative ${
            isDarkMode
              ? 'bg-gradient-to-b from-teal-950 to-slate-950 border-cyan-400/60'
              : 'bg-gradient-to-b from-[#FFFDF6] to-[#E2EBE6] border-[#2F6B45]'
          }`}>
            <div className="w-3 h-3 rounded-full bg-cyan-400 absolute -top-1.5 left-1/2 -translate-x-1/2 animate-ping" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-400 flex items-center justify-center mx-auto mb-2 text-emerald-300 text-3xl shadow-xl">
              🏢
            </div>
            <span className="text-xs font-black block">Central Mandi Hub</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold block mt-0.5">
              3 Counters Active
            </span>
          </div>

          {/* Node 3: Mustard Sector */}
          <div 
            onClick={() => setActiveSector('mustard')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSector === 'mustard'
                ? isDarkMode
                  ? 'bg-amber-950/90 border-amber-400 shadow-xl scale-105'
                  : 'bg-[#FFFDF6] border-[#D6B46A] shadow-xl scale-105'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 text-amber-500 text-2xl shadow-md">
              🌱
            </div>
            <span className="text-xs font-black block">Sector C (Mustard)</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-0.5 font-bold">
              Transport Active
            </span>
          </div>

        </div>

      </div>

      {/* Telemetry Footer */}
      <div className="flex justify-between items-center text-[11px] font-bold pt-3 border-t border-slate-800/40 z-10">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Activity className="w-3.5 h-3.5" />
          Processing Speed: 420 kg / min
        </span>
        <span className="text-amber-600 dark:text-amber-400 font-mono">Est Wait: ~20 mins</span>
      </div>

    </div>
  );
}
