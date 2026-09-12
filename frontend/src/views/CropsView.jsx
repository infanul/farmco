import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Sprout, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import CropCard from '../components/CropCard';

export default function CropsView({ onBookSlotClick }) {
  const [crops, setCrops] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cropsRes, pricesRes] = await Promise.all([
        api.getCrops(),
        api.getMarketPrices()
      ]);
      setCrops(cropsRes.crops || []);
      setMarketPrices(pricesRes.market_prices || []);
    } catch (err) {
      console.error('Failed to load crop catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine crop info with market price data
  const combinedCrops = crops.map((c) => {
    const priceData = marketPrices.find(p => p.crop_id === c.id || p.crop_name.toLowerCase().includes(c.name.toLowerCase()));
    return {
      ...c,
      crop_name: c.name,
      previous_day_price: priceData ? priceData.previous_day_price : (c.price_per_kg * 100).toFixed(0),
      expected_price: priceData ? priceData.expected_price : (c.price_per_kg * 100 * 1.015).toFixed(0),
      price_change: priceData ? priceData.price_change : 35,
      price_change_percentage: priceData ? priceData.price_change_percentage : 1.45,
      trend: priceData ? priceData.trend : 'increasing',
      confidence_level: priceData ? priceData.confidence_level : 'Moderate'
    };
  });

  const filteredCrops = combinedCrops.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] uppercase tracking-widest mb-1">
              <Sprout className="w-4 h-4" />
              <span>Farmco Crop Catalog & Procurement Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">Supported Agricultural Crops</h1>
            <p className="text-xs text-[#555555] mt-1 max-w-2xl">
              View official Mandi MSP rates, expected market trends, moisture tolerance limits, and quality verification standards for all eligible harvest crops.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#555555] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs font-medium border border-[#C8E6C9] bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Crops */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] animate-pulse" />
          ))}
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="p-12 rounded-3xl border border-[#C8E6C9] bg-white text-center space-y-3">
          <Sprout className="w-12 h-12 text-[#2E7D32] opacity-40 mx-auto" />
          <h3 className="text-base font-bold text-[#1A1A1A]">No Crops Match Your Search</h3>
          <p className="text-xs text-[#555555]">Try searching for Wheat, Paddy, Mustard, or Maize.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onBookSlot={(c) => onBookSlotClick(c)}
              onViewDetails={(c) => setSelectedCropModal(c)}
            />
          ))}
        </div>
      )}

      {/* CROP DETAILS MODAL */}
      {selectedCropModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#1A1A1A] border-2 border-[#2E7D32] max-w-lg w-full p-6 rounded-3xl shadow-xl space-y-5">
            
            <div className="flex justify-between items-start border-b border-[#C8E6C9] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] flex items-center justify-center font-black">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1A1A]">{selectedCropModal.name}</h3>
                  <span className="text-xs font-bold text-[#2E7D32]">{selectedCropModal.category} Category</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCropModal(null)} 
                className="text-[#555555] hover:text-[#1A1A1A] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9]">
                <div>
                  <span className="text-[#555555] block font-semibold">Previous Day Baseline</span>
                  <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                    ₹{selectedCropModal.previous_day_price} / quintal
                  </span>
                </div>
                <div>
                  <span className="text-[#2E7D32] block font-bold">Expected Today Rate</span>
                  <span className="font-mono font-black text-sm text-[#2E7D32]">
                    ₹{selectedCropModal.expected_price} / quintal
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1A1A1A]">Official Quality & Moisture Standards:</h4>
                <ul className="space-y-1.5 text-[#555555]">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span>Maximum Moisture Content: <strong>14.0%</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span>Foreign Matter Limit: <strong>&lt; 0.75%</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span>Quality Grade Requirements: <strong>Grade A Standard Bulk</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#C8E6C9]">
              <button
                onClick={() => setSelectedCropModal(null)}
                className="px-4 py-2 bg-[#F1F8E9] text-[#1A1A1A] text-xs font-bold rounded-xl border border-[#C8E6C9]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const c = selectedCropModal;
                  setSelectedCropModal(null);
                  onBookSlotClick(c);
                }}
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm"
              >
                Book Harvest Slot
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
