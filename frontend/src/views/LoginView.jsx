import React, { useState } from 'react';
import { api } from '../api';
import { Sprout, Lock, Phone, ArrowRight } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [role, setRole] = useState('farmer');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(phone, password, role);
      if (res.user && onLogin) {
        onLogin(res.user);
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-white text-[#1A1A1A]">
      
      {/* Split-Screen Login Card */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-[#C8E6C9] bg-[#F1F8E9] shadow-sm relative z-10">
        
        {/* Left Side: Farm Imagery & Branding */}
        <div className="p-8 sm:p-12 bg-[#2E7D32] text-white flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">Farmco</span>
              <span className="text-xs text-[#E8F5E9] block font-semibold">Government Mandi Coordination Layer</span>
            </div>
          </div>

          <div className="space-y-4 py-8">
            <h2 className="text-2xl font-black leading-tight text-white">
              Know Your Time. <br />
              Skip the Wait.
            </h2>
            <p className="text-xs text-[#E8F5E9] leading-relaxed font-medium">
              Predictive harvest slot scheduling, digital token passes, and transparent payout tracking for farmers and procurement centers.
            </p>
          </div>

          <div className="text-[10px] text-[#E8F5E9] font-mono">
            ● Authorized Agriculture Mandi Network
          </div>
        </div>

        {/* Right Side: Role Selection & Login Form */}
        <div className="p-8 sm:p-12 bg-white space-y-6 flex flex-col justify-between">
          
          <div>
            <h3 className="text-xl font-black text-[#1A1A1A]">Portal Sign In</h3>
            <p className="text-xs text-[#555555] mt-1">Select user role to access harvest scheduling tools.</p>
          </div>

          {error && (
            <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] p-3 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-[#1A1A1A] font-bold mb-1.5">User Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setRole('farmer'); setPhone('9876543210'); }}
                  className={`py-2 rounded-xl font-black transition-all border ${
                    role === 'farmer' 
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm' 
                      : 'bg-[#F1F8E9] text-[#1A1A1A] border-[#C8E6C9] hover:bg-white'
                  }`}
                >
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('center_staff'); setPhone('9123456789'); }}
                  className={`py-2 rounded-xl font-black transition-all border ${
                    role === 'center_staff' 
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm' 
                      : 'bg-[#F1F8E9] text-[#1A1A1A] border-[#C8E6C9] hover:bg-white'
                  }`}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('admin'); setPhone('9000000000'); }}
                  className={`py-2 rounded-xl font-black transition-all border ${
                    role === 'admin' 
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm' 
                      : 'bg-[#F1F8E9] text-[#1A1A1A] border-[#C8E6C9] hover:bg-white'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#1A1A1A] font-bold mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#555555] absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F1F8E9] border border-[#C8E6C9] rounded-2xl pl-9 pr-4 py-2.5 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1A1A1A] font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#555555] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F1F8E9] border border-[#C8E6C9] rounded-2xl pl-9 pr-4 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[10px] text-[#555555] text-center">
            Demo Credentials Pre-filled • Assisted Access System
          </div>
        </div>

      </div>
    </div>
  );
}
