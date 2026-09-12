import React, { useState } from 'react';
import { ShieldCheck, Phone, Lock, ArrowRight, Building2, UserCheck } from 'lucide-react';
import { api } from '../api';

export default function AdminLoginView({ onLogin, onSwitchToFarmer }) {
  const [phone, setPhone] = useState('9123456789');
  const [password, setPassword] = useState('staff123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(phone, password, 'center_staff');
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        onLogin(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setPhone('9123456789');
    setPassword('staff123');
    setError('');
    setLoading(true);
    try {
      const res = await api.login('9123456789', 'staff123', 'center_staff');
      if (res.user) {
        onLogin(res.user);
      } else {
        setError(res.error || 'Demo admin login failed');
      }
    } catch (err) {
      setError(err.message || 'Demo admin login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-[#1A1A1A]">
      <div className="bg-white border-2 border-[#1565C0] rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] border border-[#BBDEFB] text-[#1565C0] mx-auto flex items-center justify-center shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase text-[#1565C0] bg-[#E3F2FD] px-3 py-1 rounded-full border border-[#BBDEFB] tracking-wider inline-block">
            Procurement Operations Control
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Admin Portal Login</h1>
          <p className="text-xs text-[#555555]">
            Authorized procurement center staff & yard operations monitoring hub.
          </p>
        </div>

        {/* Demo Account Helper Box */}
        <div className="p-4 rounded-2xl bg-[#E3F2FD] border border-[#BBDEFB] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1565C0] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Demo Admin Account:
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#BBDEFB] font-mono font-bold text-[#1A1A1A]">
              Vikram Sharma (Staff)
            </span>
          </div>
          <p className="text-[11px] text-[#555555]">
            Phone: <code className="font-mono font-bold text-[#1A1A1A]">9123456789</code> | Pass: <code className="font-mono font-bold text-[#1A1A1A]">staff123</code>
          </p>
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            className="w-full py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
          >
            ✦ Quick Sign-in as Demo Admin
          </button>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">Staff Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#1565C0] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Staff 10-digit mobile number"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#BBDEFB] bg-white text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">Staff Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1565C0] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#BBDEFB] bg-white text-[#1A1A1A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Portal Switcher Link */}
        <div className="pt-4 border-t border-[#BBDEFB] text-center">
          <button
            type="button"
            onClick={onSwitchToFarmer}
            className="text-xs text-[#555555] hover:text-[#1565C0] font-bold underline transition"
          >
            Are you a farmer? Sign in via Farmer Portal →
          </button>
        </div>

      </div>
    </div>
  );
}
