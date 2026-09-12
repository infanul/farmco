import React, { useState } from 'react';
import { Sprout, User, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function FarmerLoginView({ onLogin, onSwitchToAdmin }) {
  const [username, setUsername] = useState('Ramesh Patel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your farmer username or mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.login(username.trim(), null, 'farmer');
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        onLogin(res.user);
      }
    } catch (err) {
      setError(err.message || 'Farmer login failed. Please check your username.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoName = 'Ramesh Patel') => {
    setUsername(demoName);
    setError('');
    setLoading(true);
    try {
      const res = await api.login(demoName, null, 'farmer');
      if (res.user) {
        onLogin(res.user);
      } else {
        setError(res.error || 'Demo login failed');
      }
    } catch (err) {
      setError(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-[#1A1A1A]">
      <div className="bg-white border-2 border-[#C8E6C9] rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] mx-auto flex items-center justify-center shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9] tracking-wider inline-block">
            Farmer Access Portal
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Farmer Portal Login</h1>
          <p className="text-xs text-[#555555]">
            Enter your farmer username or registered mobile number to access your account.
          </p>
        </div>

        {/* Demo Account Helper Box */}
        <div className="p-4 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2E7D32] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Demo Farmer Accounts:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Ramesh Patel', 'Harpreet Singh', 'Sunita Devi'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleDemoLogin(name)}
                className="px-2.5 py-1 bg-white hover:bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] font-bold rounded-lg text-xs transition cursor-pointer"
              >
                ✦ {name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Username-Only Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">Username or Mobile Number</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#2E7D32] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Ramesh Patel or 9876543210"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#C8E6C9] bg-white text-[#1A1A1A] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>{loading ? 'Authenticating Farmer...' : 'Sign In to Farmer Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Portal Switcher Link */}
        <div className="pt-4 border-t border-[#C8E6C9] text-center">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="text-xs text-[#555555] hover:text-[#2E7D32] font-bold underline transition"
          >
            Yard Operations Staff? Sign in via Admin Portal →
          </button>
        </div>

      </div>
    </div>
  );
}
