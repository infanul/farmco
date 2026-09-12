import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Scale, Ticket, Coins, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function AdminUserSearch() {
  const [query, setQuery] = useState('Ramesh');
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    handleSearch('Ramesh');
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q || !q.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.searchFarmerHistory(q.trim());
      if (res.error) {
        setError(res.error);
        setSearchData(null);
      } else {
        setSearchData(res);
      }
    } catch (err) {
      setError('Failed to perform farmer lookup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1A1A1A]">
      
      {/* Search Header Bar */}
      <div className="p-6 rounded-3xl border border-[#BBDEFB] bg-[#E3F2FD] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#1565C0] uppercase tracking-widest mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Admin Control Center • Farmer Lookup</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">Farmer Profile & Transaction Search</h2>
          </div>

          {/* Quick Demo Search Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] text-[#555555] font-bold">Quick Lookup:</span>
            {['Ramesh', 'Harpreet', 'Sunita', '9876543210'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setQuery(name);
                  handleSearch(name);
                }}
                className="px-2.5 py-1 bg-white hover:bg-[#BBDEFB] border border-[#BBDEFB] text-[#1565C0] font-bold rounded-lg text-xs transition cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1565C0] absolute left-3 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by farmer name, ID (e.g. 1), or phone number..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[#BBDEFB] bg-white text-xs font-medium text-[#1A1A1A] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black text-xs rounded-2xl shadow-sm transition cursor-pointer shrink-0"
          >
            {loading ? 'Searching...' : 'Search Profile'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-bold">
          {error}
        </div>
      )}

      {/* Search Results Display */}
      {searchData && (
        <div className="space-y-6">

          {/* Farmer Profile Card */}
          <div className="p-6 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] space-y-4 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#C8E6C9] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2E7D32] bg-white px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                  Farmer Profile
                </span>
                <h3 className="text-2xl font-black text-[#1A1A1A] mt-1">{searchData.farmer.name}</h3>
                <p className="text-xs text-[#555555] font-mono mt-0.5">
                  Phone: {searchData.farmer.phone} | Role: {searchData.farmer.role}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-medium">
                <div className="bg-white p-3 rounded-2xl border border-[#C8E6C9] text-center">
                  <span className="text-[10px] text-[#555555] font-bold block uppercase">Total Transactions</span>
                  <span className="text-xl font-black text-[#2E7D32]">{searchData.transactions_count}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#C8E6C9] text-center">
                  <span className="text-[10px] text-[#555555] font-bold block uppercase">Total Quantity Procured</span>
                  <span className="text-xl font-black text-[#1565C0]">{searchData.total_quantity_kg.toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            {/* Selling / Procurement History Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                Full Procurement & Payment History ({searchData.transactions.length} Records)
              </h4>

              {searchData.transactions.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-[#C8E6C9] text-center text-xs text-[#555555]">
                  No historical procurement transactions found for this farmer.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#C8E6C9] bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F1F8E9] border-b border-[#C8E6C9] text-[#1A1A1A] font-black text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">Token #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Center</th>
                        <th className="py-3 px-4">Crop</th>
                        <th className="py-3 px-4">Quantity (kg)</th>
                        <th className="py-3 px-4">Procurement Status</th>
                        <th className="py-3 px-4">Payment Status</th>
                        <th className="py-3 px-4 text-right">Est. Payout (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0] text-[11px] font-medium">
                      {searchData.transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-[#F9FBE7] transition">
                          <td className="py-3 px-4 font-mono font-black text-[#2E7D32]">{t.token_number}</td>
                          <td className="py-3 px-4 font-mono text-[#555555]">{t.booking_date}</td>
                          <td className="py-3 px-4 font-bold text-[#1A1A1A]">{t.center_name}</td>
                          <td className="py-3 px-4 font-bold text-[#1A1A1A]">{t.crop_name}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#1A1A1A]">{t.quantity_kg?.toLocaleString()} kg</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              t.procurement_status === 'Accepted' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' :
                              t.procurement_status === 'Checked-in' ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]' :
                              'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]'
                            }`}>
                              {t.procurement_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              t.payment_status === 'Payment Complete' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' :
                              t.payment_status === 'Payment Initiated' ? 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {t.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-[#2E7D32]">
                            ₹{parseFloat(t.estimated_payout || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
