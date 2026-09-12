import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Landmark } from 'lucide-react';

export default function GovernmentBenefits() {
  const [appliedScheme, setAppliedScheme] = useState(null);

  const schemes = [
    {
      id: 'SCH-01',
      title: 'PM-Kisan Samman Nidhi',
      category: 'Direct Income Support',
      benefit: '₹6,000 / year',
      status: 'ACTIVE ELIGIBLE',
      description: 'Financial support of ₹6,000 per year in three equal installments to small & marginal farmer families.',
    },
    {
      id: 'SCH-02',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Crop Insurance',
      benefit: 'Up to 90% Premium Coverage',
      status: 'ENROLLED',
      description: 'Comprehensive risk coverage for crops from pre-sowing to post-harvest against natural calamities.',
    },
    {
      id: 'SCH-03',
      title: 'Kisan Credit Card (KCC) Scheme',
      category: 'Subsidized Credit',
      benefit: '4% Concessional Interest Rate',
      status: 'AVAILABLE',
      description: 'Timely credit support to farmers for their cultivation and farm procurement logistics expenses.',
    },
    {
      id: 'SCH-04',
      title: 'Agri Infrastructure & Storage Subsidy',
      category: 'Infrastructure Subsidy',
      benefit: '35% Capital Grant',
      status: 'AVAILABLE',
      description: 'Financial assistance for building mini farm storage, grain drying units, and transport crates.',
    }
  ];

  const handleApply = (schemeId) => {
    setAppliedScheme(schemeId);
    setTimeout(() => {
      setAppliedScheme(null);
    }, 3000);
  };

  return (
    <div className="rounded-3xl p-6 border border-[#C8E6C9] bg-white text-[#1A1A1A] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#2E7D32] text-white">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">Government Agri Schemes & Subsidies</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#555555]">Integrated Welfare Portal</span>
              <span className="font-mono text-[10px] font-bold text-[#F57F17] bg-[#FFF8E1] px-2 py-0.5 rounded border border-[#FFE082]">
                [Demo / Simulated Data]
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#555555]">
          Showing 4 Eligible Schemes
        </div>
      </div>

      {/* Grid of Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-5 rounded-2xl border border-[#C8E6C9] bg-[#F1F8E9] hover:bg-white transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#2E7D32]">
                  {scheme.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  scheme.status === 'ENROLLED'
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                    : 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]'
                }`}>
                  {scheme.status}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-[#1A1A1A] tracking-tight mb-1">{scheme.title}</h4>
              <p className="text-xs text-[#555555] leading-relaxed mb-3">{scheme.description}</p>
            </div>

            <div className="pt-3 border-t border-[#C8E6C9] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#555555] block font-medium">BENEFIT VALUE</span>
                <span className="text-sm font-extrabold font-mono text-[#2E7D32]">
                  {scheme.benefit}
                </span>
              </div>

              <button
                onClick={() => handleApply(scheme.id)}
                disabled={appliedScheme === scheme.id}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
                  appliedScheme === scheme.id
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-white hover:bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                }`}
              >
                {appliedScheme === scheme.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Application Sent</span>
                  </>
                ) : (
                  <>
                    <span>Apply Support</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
