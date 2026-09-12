import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Sun, Moon, User, ShieldCheck, Menu, X, ChevronDown, 
  Home, Wheat, TrendingUp, Calendar, Clock, Search, UserCheck, 
  Monitor, LogOut, PhoneCall
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  demoUsers = [],
  onOpenFarmerAuth,
  onOpenAdminAuth,
  onLogout
}) {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [farmerDropdownOpen, setFarmerDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const farmerRef = useRef(null);
  const adminRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (farmerRef.current && !farmerRef.current.contains(e.target)) {
        setFarmerDropdownOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFarmerRole = currentUser?.role === 'farmer';
  const isAdminRole = currentUser?.role === 'center_staff' || currentUser?.role === 'admin';

  // Detect current portal view
  const isAdminView = activeTab === 'staff' || activeTab === 'admin-user-search' || activeTab === 'admin-totals-breakdown' || activeTab === 'login-admin';

  // Farmer Navbar Items (Vertical Sidebar Block Columns)
  const farmerNavItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'crops', label: 'Crops', icon: Wheat },
    { key: 'market-prices', label: 'Market Prices', icon: TrendingUp },
    { key: 'book-slot', label: 'Book Slot', icon: Calendar },
    { key: 'calendar', label: 'Booking Calendar', icon: Clock },
    { key: 'track-booking', label: 'Track Booking', icon: Search },
    { key: 'assistance', label: 'Assistance Desk', icon: UserCheck },
    { key: 'ivr', label: 'Voice / IVR', icon: PhoneCall }
  ];

  // Admin Navbar Items (Horizontal Top Block Columns)
  const adminNavItems = [
    { key: 'staff', label: 'Central Overview', icon: Sprout },
    { key: 'admin-user-search', label: 'User Information', icon: UserCheck },
    { key: 'admin-totals-breakdown', label: 'Total Breakdown', icon: TrendingUp }
  ];

  return (
    <>
      {/* =========================================================
          1. FARMER PORTAL DESKTOP SIDEBAR — FRAMELESS BLOCK CARDS
         ========================================================= */}
      {!isAdminView && (
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-50 justify-between py-6 px-5 bg-transparent pointer-events-auto transition-all duration-300">
          
          {/* Top: Logo & Wordmark Card */}
          <div className="space-y-6">
            <div 
              className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#F1F8E9]/95 dark:bg-slate-800/95 border border-[#C8E6C9] dark:border-slate-700 shadow-xs cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32] dark:bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-[#1B5E20] dark:group-hover:bg-emerald-700 transition-colors shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="truncate">
                <span className="text-lg font-black tracking-tight text-[#1A1A1A] dark:text-white block leading-tight">Farmco</span>
                <span className="text-[9px] text-[#2E7D32] dark:text-emerald-400 font-bold block tracking-widest uppercase">
                  Farmer Portal
                </span>
              </div>
            </div>

            {/* Frameless Set of Distinct Block Cards */}
            <nav className="space-y-2 text-xs font-bold pt-1">
              {farmerNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                      isActive 
                        ? 'bg-[#2E7D32] dark:bg-emerald-600 text-white font-black shadow-md border-transparent translate-x-1' 
                        : 'bg-[#F1F8E9]/90 dark:bg-slate-800/90 text-[#1A1A1A] dark:text-slate-200 border border-[#C8E6C9]/80 dark:border-slate-700/80 hover:bg-[#E8F5E9] dark:hover:bg-emerald-950/80 hover:text-[#2E7D32] dark:hover:text-emerald-400 hover:border-[#2E7D32] hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#2E7D32] dark:text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Footer Controls (Individual Block Cards) */}
          <div className="space-y-2 pt-4 border-t border-[#E8F5E9]/60 dark:border-slate-800/60">
            
            <div className="flex items-center justify-between gap-2">
              {/* Farmer Auth Button */}
              <div className="relative flex-1" ref={farmerRef}>
                <button
                  onClick={() => {
                    if (isFarmerRole) {
                      setFarmerDropdownOpen(!farmerDropdownOpen);
                      setAdminDropdownOpen(false);
                    } else {
                      onOpenFarmerAuth();
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center justify-between cursor-pointer border hover:scale-[1.02] active:scale-95 ${
                    isFarmerRole
                      ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2E7D32] dark:text-emerald-400 border-[#C8E6C9] dark:border-emerald-800 shadow-xs'
                      : 'bg-white/90 dark:bg-slate-800/90 text-[#1A1A1A] dark:text-slate-200 border-[#C8E6C9] dark:border-slate-700 hover:border-[#2E7D32]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-[#2E7D32] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{isFarmerRole ? currentUser.name.split(' ')[0] : 'Farmer'}</span>
                  </div>
                  {isFarmerRole && <ChevronDown className="w-3 h-3 ml-1 shrink-0" />}
                </button>

                {/* Farmer Dropdown Menu */}
                {isFarmerRole && farmerDropdownOpen && (
                  <div className="absolute left-0 bottom-12 w-48 bg-white dark:bg-slate-800 border border-[#C8E6C9] dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium text-[#1A1A1A] dark:text-slate-100">
                    <div className="px-4 py-2 border-b border-[#C8E6C9] dark:border-slate-700">
                      <span className="font-bold block text-sm">{currentUser.name}</span>
                      <span className="text-[10px] text-[#555555] dark:text-slate-400 font-mono">Role: Farmer</span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('track-booking'); setFarmerDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F8E9] dark:hover:bg-slate-700 transition"
                    >
                      My Bookings
                    </button>
                    <button
                      onClick={() => { setActiveTab('calendar'); setFarmerDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F8E9] dark:hover:bg-slate-700 transition"
                    >
                      Booking Calendar
                    </button>
                    <div className="border-t border-[#C8E6C9] dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => { onLogout(); setFarmerDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Portal Switch Button */}
              <div className="relative" ref={adminRef}>
                <button
                  onClick={() => {
                    if (isAdminRole) {
                      setAdminDropdownOpen(!adminDropdownOpen);
                      setFarmerDropdownOpen(false);
                    } else {
                      onOpenAdminAuth();
                    }
                  }}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center space-x-1 cursor-pointer border hover:scale-[1.02] active:scale-95 ${
                    isAdminRole
                      ? 'bg-[#E3F2FD] dark:bg-blue-950/80 text-[#1565C0] dark:text-blue-300 border-[#BBDEFB] dark:border-blue-800 shadow-xs'
                      : 'bg-white/90 dark:bg-slate-800/90 text-[#1A1A1A] dark:text-slate-200 border-[#BBDEFB] dark:border-slate-700 hover:border-[#1565C0]'
                  }`}
                  title="Switch to Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0] dark:text-blue-400 shrink-0" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                className="w-9 h-9 rounded-2xl bg-[#F1F8E9] dark:bg-slate-800 border border-[#C8E6C9] dark:border-slate-700 text-[#2E7D32] dark:text-amber-400 flex items-center justify-center transition hover:scale-[1.05] active:scale-95 cursor-pointer shadow-xs shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* =========================================================
          2. ADMIN PORTAL DESKTOP TOP BAR — DISTINCT BLUE THEME
         ========================================================= */}
      {isAdminView && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-transparent py-4 px-6 pointer-events-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Admin Portal Branding Card */}
            <div 
              className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#E3F2FD]/95 dark:bg-slate-800/95 border border-[#BBDEFB] dark:border-slate-700 shadow-xs cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
              onClick={() => setActiveTab('staff')}
            >
              <div className="w-9 h-9 rounded-xl bg-[#1565C0] dark:bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-[#0D47A1] transition-colors shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#1A1A1A] dark:text-white block leading-tight">Farmco</span>
                <span className="text-[9px] text-[#1565C0] dark:text-blue-400 font-bold block tracking-widest uppercase">
                  Admin & Yard Management
                </span>
              </div>
            </div>

            {/* Frameless Set of Distinct Admin Block Cards */}
            <nav className="hidden lg:flex items-center space-x-3 text-xs font-bold bg-transparent">
              {adminNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center space-x-2.5 ${
                      isActive 
                        ? 'bg-[#1565C0] dark:bg-blue-600 text-white font-black shadow-md border-transparent scale-[1.02]' 
                        : 'bg-[#E3F2FD]/90 dark:bg-slate-800/90 text-[#1A1A1A] dark:text-slate-200 border border-[#BBDEFB]/80 dark:border-slate-700/80 hover:bg-[#BBDEFB]/60 dark:hover:bg-blue-950/80 hover:text-[#1565C0] dark:hover:text-blue-300 hover:border-[#1565C0] hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#1565C0] dark:text-blue-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Admin Top Right Controls */}
            <div className="flex items-center space-x-2.5">
              
              <button
                onClick={() => setActiveTab('home')}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-black bg-white/90 dark:bg-slate-800/90 text-[#2E7D32] dark:text-emerald-400 border border-[#C8E6C9] dark:border-slate-700 hover:scale-[1.03] hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Switch to Farmer Portal</span>
              </button>

              <button
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                className="w-9 h-9 rounded-2xl bg-[#E3F2FD] dark:bg-slate-800 border border-[#BBDEFB] dark:border-slate-700 text-[#1565C0] dark:text-amber-400 flex items-center justify-center transition hover:scale-[1.05] active:scale-95 cursor-pointer shadow-xs shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </header>
      )}

      {/* =========================================================
          3. MOBILE TOP BAR (FARMER & ADMIN MOBILE VIEW)
         ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 bg-transparent p-3">
        <div className={`backdrop-blur-md rounded-2xl border shadow-xs py-2.5 px-4 flex items-center justify-between transition-colors ${
          isAdminView
            ? 'bg-[#E3F2FD]/95 dark:bg-slate-900/95 border-[#BBDEFB] dark:border-slate-800'
            : 'bg-[#F1F8E9]/95 dark:bg-slate-900/95 border-[#C8E6C9] dark:border-slate-800'
        }`}>
          
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setActiveTab(isAdminView ? 'staff' : 'home')}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
              isAdminView ? 'bg-[#1565C0] dark:bg-blue-600' : 'bg-[#2E7D32] dark:bg-emerald-600'
            }`}>
              {isAdminView ? <ShieldCheck className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-base font-black text-[#1A1A1A] dark:text-white block leading-tight">Farmco</span>
              <span className={`text-[8px] font-bold uppercase tracking-wider block ${
                isAdminView ? 'text-[#1565C0] dark:text-blue-400' : 'text-[#2E7D32] dark:text-emerald-400'
              }`}>
                {isAdminView ? 'Admin Portal' : 'Farmer Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isAdminView 
                  ? 'bg-white dark:bg-slate-800 border-[#BBDEFB] text-[#1565C0] dark:text-amber-400'
                  : 'bg-white dark:bg-slate-800 border-[#C8E6C9] text-[#2E7D32] dark:text-amber-400'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl text-[#1A1A1A] dark:text-white border ${
                isAdminView 
                  ? 'bg-white dark:bg-slate-800 border-[#BBDEFB]'
                  : 'bg-white dark:bg-slate-800 border-[#C8E6C9]'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className={`mt-2 p-4 backdrop-blur-md rounded-2xl border space-y-1.5 shadow-xl text-xs font-bold ${
            isAdminView
              ? 'bg-white/95 dark:bg-slate-900/95 border-[#BBDEFB]'
              : 'bg-white/95 dark:bg-slate-900/95 border-[#C8E6C9]'
          }`}>
            {isAdminView ? (
              adminNavItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === item.key
                      ? 'bg-[#1565C0] text-white font-black'
                      : 'text-[#1A1A1A] dark:text-slate-200 hover:bg-[#E3F2FD] dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))
            ) : (
              farmerNavItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === item.key
                      ? 'bg-[#2E7D32] text-white font-black'
                      : 'text-[#1A1A1A] dark:text-slate-200 hover:bg-[#F1F8E9] dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))
            )}

            {/* Portal Switcher in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setActiveTab(isAdminView ? 'home' : 'staff');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
              >
                Switch to {isAdminView ? 'Farmer Portal' : 'Admin Portal'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
