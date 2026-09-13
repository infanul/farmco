import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, 
  X, CheckCheck, Zap
} from 'lucide-react';

export default function FarmerNotificationBell({ currentUser, isDark, isMobile = false }) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('farmer_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const prevIdsRef = useRef(new Set());
  const dropdownRef = useRef(null);

  const farmerPhone = currentUser?.phone || '9876543210';
  const centerId = currentUser?.center_id || 1;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [farmerPhone, centerId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getFarmerNotifications(farmerPhone, centerId);
      const fetched = res.notifications || [];

      // Detect newly arrived notifications for active Toast Popup
      if (prevIdsRef.current.size > 0) {
        const newlyArrived = fetched.find(n => !prevIdsRef.current.has(n.id));
        if (newlyArrived) {
          setActiveToast(newlyArrived);
          // Auto-hide toast after 6 seconds
          setTimeout(() => {
            setActiveToast((curr) => (curr?.id === newlyArrived.id ? null : curr));
          }, 6000);
        }
      }

      // Update known IDs reference set
      const currentIds = new Set(fetched.map(n => n.id));
      prevIdsRef.current = currentIds;

      setNotifications(fetched);
    } catch (err) {
      console.error('Failed to fetch farmer notifications:', err);
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('farmer_read_notifications', JSON.stringify(allIds));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('farmer_read_notifications', JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }
    }
  };

  const handleSimulateDelay = async () => {
    setSimulating(true);
    try {
      await api.updateCenterStatus(centerId, 'delayed', 'Heavy morning arrivals & unloading slowdown', 35, true);
      await fetchNotifications();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateFault = async () => {
    setSimulating(true);
    try {
      // Fetch latest active booking for this farmer or center
      const bRes = await api.getBookings({ farmer_phone: farmerPhone });
      const activeB = (bRes.bookings || [])[0];
      if (activeB) {
        await api.updateProcurementStatus(activeB.id, 'Rejected', 'B', 'Moisture level variance detected during verification');
      } else {
        await api.updateCenterStatus(centerId, 'delayed', 'Technical moisture verification issue detected', 20, true);
      }
      await fetchNotifications();
    } catch (err) {
      console.error('Fault simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const formatMessageCopy = (item) => {
    const msg = item.message || '';
    if (msg.includes('delay') || msg.includes('delayed') || msg.includes('IMPORTANT UPDATE')) {
      return {
        title: 'Procurement Center Delay',
        copy: 'There is a delay at your procurement center. Your process may take longer than expected.',
        type: 'delay',
        detail: msg
      };
    }
    if (msg.includes('issue') || msg.includes('Rejected') || msg.includes('Failed')) {
      return {
        title: 'Procurement Process Alert',
        copy: 'We noticed an issue during your procurement process. It may be delayed — please check your status for updates.',
        type: 'fault',
        detail: msg
      };
    }
    return {
      title: 'Status Update',
      copy: msg,
      type: 'info',
      detail: msg
    };
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMins = Math.floor((new Date() - new Date(isoString)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* 1. BELL BUTTON IN NAVBAR */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications & Delay Alerts"
        className={`relative p-2 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center border hover:scale-105 active:scale-95 ${
          isMobile 
            ? 'w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border-[#C8E6C9] dark:border-slate-700 text-[#2E7D32] dark:text-emerald-400' 
            : 'w-9 h-9 bg-[#F1F8E9] dark:bg-slate-800 border-[#C8E6C9] dark:border-slate-700 text-[#2E7D32] dark:text-emerald-400 shadow-xs'
        }`}
      >
        <Bell className={isMobile ? "w-4 h-4" : "w-4 h-4"} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 2. CENTERED NOTIFICATION MODAL DIALOG */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 border-4 border-[#2E7D32] dark:border-emerald-500 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden text-xs text-[#1A1A1A] dark:text-slate-100 space-y-0 transform transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Panel Header */}
            <div className="p-4 sm:p-5 bg-[#F1F8E9] dark:bg-slate-900 border-b border-[#C8E6C9] dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1A1A1A] dark:text-white leading-tight">
                    Procurement Alerts & Notifications
                  </h3>
                  <span className="text-[11px] text-[#555555] dark:text-slate-400 font-bold">
                    Real-Time Delay & Status Updates
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-[#C8E6C9] dark:border-slate-700"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-[#555555] dark:text-slate-300 hover:text-[#1A1A1A] flex items-center justify-center border border-[#C8E6C9] dark:border-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alert List Container */}
            <div className="max-h-96 overflow-y-auto divide-y divide-[#E8F5E9] dark:divide-slate-700/60 p-2 sm:p-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-[#555555] dark:text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-[#2E7D32] dark:text-emerald-400 opacity-60" />
                  <p className="font-bold text-sm text-[#1A1A1A] dark:text-white">No alerts at this time</p>
                  <span className="text-xs block">Procurement operations are flowing normally.</span>
                </div>
              ) : (
                notifications.map((item) => {
                  const isRead = readIds.includes(item.id);
                  const formatted = formatMessageCopy(item);

                  return (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`p-4 transition-all cursor-pointer rounded-2xl my-1.5 ${
                        isRead 
                          ? 'bg-white dark:bg-slate-800 opacity-80 hover:bg-[#F1F8E9]/60 dark:hover:bg-slate-700/50' 
                          : 'bg-[#F1F8E9] dark:bg-slate-900 font-semibold border-l-4 border-[#2E7D32] dark:border-emerald-500 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        
                        {/* Alert Type Icon */}
                        <div className="mt-0.5 shrink-0">
                          {formatted.type === 'delay' ? (
                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-300">
                              <AlertTriangle className="w-4.5 h-4.5" />
                            </div>
                          ) : formatted.type === 'fault' ? (
                            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-300">
                              <AlertCircle className="w-4.5 h-4.5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center border border-[#C8E6C9]">
                              <Info className="w-4.5 h-4.5" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-[#1A1A1A] dark:text-white truncate">
                              {formatted.title}
                            </span>
                            <span className="text-[10px] text-[#555555] dark:text-slate-400 font-mono shrink-0">
                              {formatRelativeTime(item.created_at)}
                            </span>
                          </div>

                          {/* Calm Clear Copy */}
                          <p className="text-xs text-[#1A1A1A] dark:text-slate-200 mt-1 leading-relaxed font-medium">
                            {formatted.copy}
                          </p>

                          {!isRead && (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2E7D32] dark:bg-emerald-400 mt-2" />
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Simulation Trigger Actions Footer */}
            <div className="p-3.5 bg-[#F9FBE7] dark:bg-slate-900 border-t border-[#C8E6C9] dark:border-slate-700 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-bold text-[#555555] dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#2E7D32] dark:text-emerald-400" />
                Simulate Alerts:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSimulateDelay}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black border border-amber-300 hover:scale-105 transition cursor-pointer"
                >
                  + Delay Alert
                </button>
                <button
                  onClick={handleSimulateFault}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black border border-rose-300 hover:scale-105 transition cursor-pointer"
                >
                  + Fault Alert
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. ACTIVE LIVE TOAST POPUP BANNER (Shows when a new alert fires on-screen) */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full bg-white dark:bg-slate-800 border-2 border-[#2E7D32] dark:border-emerald-500 rounded-3xl p-4 shadow-2xl text-xs space-y-2 animate-bounce-short text-[#1A1A1A] dark:text-slate-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 text-[#2E7D32] dark:text-emerald-400 font-black uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>✦ NEW PROCUREMENT ALERT</span>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-[#555555] hover:text-[#1A1A1A] dark:text-slate-400 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-bold text-[#1A1A1A] dark:text-white leading-relaxed">
            {formatMessageCopy(activeToast).copy}
          </p>

          <div className="flex justify-between items-center pt-1 border-t border-[#C8E6C9] dark:border-slate-700 text-[10px]">
            <span className="text-[#555555] dark:text-slate-400 font-mono">
              {formatRelativeTime(activeToast.created_at)}
            </span>
            <button
              onClick={() => { setIsOpen(true); setActiveToast(null); }}
              className="font-extrabold text-[#2E7D32] dark:text-emerald-400 hover:underline"
            >
              View in Alerts Panel →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
