import React from 'react';
import { Sprout } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  const handleNav = (tab) => {
    if (setActiveTab) setActiveTab(tab);
  };

  return (
    <footer className="border-t border-[#C8E6C9] bg-[#F9FBE7] py-10 text-xs text-[#1A1A1A] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Summary */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center font-bold">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-[#1A1A1A]">Farmco</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#555555]">
              An intelligent, assisted-access coordination layer connecting farmers with mandi procurement yards through predictive scheduling and digital tokens.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-2">
            <span className="font-extrabold text-[#1A1A1A] block uppercase tracking-wider text-[11px]">Platform</span>
            <ul className="space-y-1 text-[11px] text-[#555555]">
              <li><button onClick={() => handleNav('farmer')} className="hover:text-[#2E7D32]">Farmer Self-Service</button></li>
              <li><button onClick={() => handleNav('assistance')} className="hover:text-[#2E7D32]">Assistance Desk</button></li>
              <li><button onClick={() => handleNav('kiosk')} className="hover:text-[#2E7D32]">Smart Kiosk</button></li>
              <li><button onClick={() => handleNav('ivr')} className="hover:text-[#2E7D32]">Voice IVR Hotline</button></li>
            </ul>
          </div>

          {/* Column 3: Operations Links */}
          <div className="space-y-2">
            <span className="font-extrabold text-[#1A1A1A] block uppercase tracking-wider text-[11px]">Operations</span>
            <ul className="space-y-1 text-[11px] text-[#555555]">
              <li><button onClick={() => handleNav('staff')} className="hover:text-[#2E7D32]">Yard Operations Dashboard</button></li>
              <li><button onClick={() => handleNav('ai')} className="hover:text-[#2E7D32]">AI Demand Forecast</button></li>
              <li><button onClick={() => handleNav('farmer')} className="hover:text-[#2E7D32]">Queue Tracking</button></li>
            </ul>
          </div>

          {/* Column 4: Guardrail Policy */}
          <div className="space-y-2">
            <span className="font-extrabold text-[#1A1A1A] block uppercase tracking-wider text-[11px]">Guardrail Policy</span>
            <p className="text-[11px] leading-relaxed text-[#555555]">
              Reduces unnecessary waiting time through predictive load balancing. Capacity information is subject to operational changes.
            </p>
          </div>

        </div>

        {/* Responsible Positioning Statement */}
        <div className="pt-4 border-t border-[#C8E6C9] text-[10px] text-center md:text-left text-[#666666] leading-relaxed italic">
          Farmco — Smart & Inclusive Farm Procurement Management System is designed as an intelligent coordination layer around existing procurement processes. Availability, acceptance, quality verification, capacity and payment timelines remain subject to operational conditions and applicable procurement rules.
        </div>

      </div>
    </footer>
  );
}
