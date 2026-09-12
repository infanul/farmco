import React from 'react';
import Agri3DScene from './Agri3DScene';
import { ArrowRight, Activity, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function HeroSection({ onGetStarted, onViewNetwork }) {
  return (
    <section className="pt-24 pb-12 relative overflow-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT SIDE: Asymmetric Editorial Typography & Action CTAs */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Label */}
            <div className="inline-flex items-center space-x-2 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">
                SMART AGRICULTURAL INFRASTRUCTURE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
              SMARTER <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                PROCUREMENT.
              </span> <br />
              LESS WAITING.
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
              An assisted-access digital twin platform connecting farmers with state mandi procurement yards through predictive slot scheduling, digital tokens, live queue tracking, and end-to-end payout transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-2xl shadow-emerald-950 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewNetwork}
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 font-bold text-sm rounded-2xl border border-emerald-500/30 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>VIEW LIVE NETWORK</span>
              </button>
            </div>

            {/* Live Metrics Highlights Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-500/15 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Active Counters</span>
                <span className="text-xl font-black text-emerald-400">3 Hubs</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Avg Processing</span>
                <span className="text-xl font-black text-cyan-400">20 Mins</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Expected Volume</span>
                <span className="text-xl font-black text-amber-400">8,450 kg</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Large Interactive 3D Agricultural Environment Canvas */}
          <div className="lg:col-span-6 relative">
            <div className="w-full h-[420px] rounded-3xl overflow-hidden glass-panel p-2 border border-emerald-500/30 shadow-2xl relative">
              <Agri3DScene />

              {/* Live Connection Telemetry Overlay Card */}
              <div className="absolute top-4 right-4 z-10 bg-slate-950/90 backdrop-blur border border-cyan-500/40 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-extrabold text-white">Live Logistics Telemetry</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Truck TK-A101 → Ludhiana Yard (2.5t Wheat)
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Queue Position: 3 Farmers Ahead
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
