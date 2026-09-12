import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Award, CheckCircle2, User, MapPin, RefreshCw } from 'lucide-react';

export default function FarmerIDCard({ farmer }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const handleFingerprintTap = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1200);
  };

  const name = farmer?.name || "Ramesh Kumar";
  const farmerId = farmer?.farmerId || "FMR-883920";
  const location = farmer?.location || "Palakkad, Kerala";

  return (
    <div className="rounded-3xl p-6 border border-[#C8E6C9] bg-[#F1F8E9] text-[#1A1A1A] space-y-6 shadow-sm">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#2E7D32] text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#1A1A1A]">Kisan Digital Identity</h3>
            <span className="text-[10px] font-mono text-[#F57F17] font-bold">
              [Simulated Biometric Prototype]
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VERIFIED FARMER</span>
        </div>
      </div>

      {/* Main Identity Content */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="flex flex-col items-center sm:items-start space-y-2">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#2E7D32] p-1 flex items-center justify-center relative shadow-sm">
            <User className="w-12 h-12 text-[#2E7D32]" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-[#F57F17] text-white rounded-full">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <h4 className="text-xl font-black text-[#1A1A1A] tracking-tight">{name}</h4>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#555555]">
            <span className="font-bold text-[#2E7D32]">ID:</span>
            <span>{farmerId}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[#555555]">
            <MapPin className="w-3.5 h-3.5 text-[#F57F17]" />
            <span>{location}</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#C8E6C9] font-bold text-[#2E7D32]">
              🌾 Paddy / Wheat Producer
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFF8E1] border border-[#FFE082] font-bold text-[#F57F17]">
              ⭐ Tier A Mandi Partner
            </span>
          </div>
        </div>
      </div>

      {/* Fingerprint Interactive Sensor Area */}
      <div className="pt-4 border-t border-[#C8E6C9] flex items-center justify-between">
        <div className="text-xs text-[#555555]">
          <p className="font-bold text-[#1A1A1A]">Tap to simulate identity verification:</p>
          <p className="text-[10px]">Biometric token generation demo</p>
        </div>

        <button
          onClick={handleFingerprintTap}
          disabled={isVerifying}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            isVerifying
              ? 'bg-[#F57F17] text-white animate-pulse'
              : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-sm'
          }`}
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4 text-white" />
              <span>Simulate Biometric Scan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
