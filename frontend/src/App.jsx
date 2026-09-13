import React, { useState, useEffect } from 'react';
import { api } from './api';
import { ThemeProvider } from './context/ThemeContext';

import LiveFieldBackground from './components/LiveFieldBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SystemLiveStatusBar from './components/SystemLiveStatusBar';
import AIFloatingAssistantDrawer from './components/AIFloatingAssistantDrawer';

import HomeView from './views/HomeView';
import CropsView from './views/CropsView';
import MarketPricesView from './views/MarketPricesView';
import BookingCalendarView from './views/BookingCalendarView';
import BookingTrackerView from './views/BookingTrackerView';
import FarmerDashboard from './views/FarmerDashboard';
import StaffDashboard from './views/StaffDashboard';
import FarmerLoginView from './views/FarmerLoginView';
import AdminLoginView from './views/AdminLoginView';
import AssistanceDeskView from './views/AssistanceDeskView';
import IVRPhoneSimulator from './views/IVRPhoneSimulator';
import SmartKioskView from './views/SmartKioskView';
import AIAnalyzeView from './views/AIAnalyzeView';
import AdminUserSearch from './components/AdminUserSearch';
import AdminTotalsDashboard from './components/AdminTotalsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'crops' | 'market-prices' | 'book-slot' | 'calendar' | 'track-booking' | 'farmer-dashboard' | 'staff' | 'login-farmer' | 'login-admin'
  const [demoUsers, setDemoUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDemoUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserBookings();
    }
  }, [currentUser, refreshKey]);

  const loadDemoUsers = async () => {
    try {
      const res = await api.getDemoUsers();
      const users = res.users || [];
      setDemoUsers(users);
    } catch (err) {
      console.error('Failed to load demo users:', err);
    }
  };

  const loadUserBookings = async () => {
    try {
      const res = await api.getBookings({ farmer_phone: currentUser?.phone });
      const bookings = res.bookings || [];
      setUserBookings(bookings);
      if (bookings.length > 0 && !activeBooking) {
        setActiveBooking(bookings[0]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    }
  };

  const handleRefreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'center_staff' || user.role === 'admin') {
      setActiveTab('staff');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('login-farmer');
  };

  const handleSearchToken = async (tokenOrPhone) => {
    try {
      const res = await api.getBookings({ farmer_phone: tokenOrPhone });
      if (res.bookings && res.bookings.length > 0) {
        setActiveBooking(res.bookings[0]);
        return;
      }
      const tokenRes = await api.getBookings({ token_number: tokenOrPhone });
      if (tokenRes.bookings && tokenRes.bookings.length > 0) {
        setActiveBooking(tokenRes.bookings[0]);
      }
    } catch (err) {
      console.error('Failed to search token:', err);
    }
  };

  // Route & Role Guards
  const isFarmerRole = currentUser?.role === 'farmer';
  const isAdminRole = currentUser?.role === 'center_staff' || currentUser?.role === 'admin';
  const isAdminView = activeTab === 'staff' || activeTab === 'admin-user-search' || activeTab === 'admin-totals-breakdown' || activeTab === 'login-admin';
  const isLoginPage = activeTab === 'login-farmer' || activeTab === 'login-admin' || !currentUser;

  return (
    <ThemeProvider>
      <div className="min-h-screen relative flex flex-col justify-between font-sans bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-100 selection:bg-[#2E7D32] selection:text-white transition-colors duration-300">
        
        {/* Ambient Field Background Accent */}
        <LiveFieldBackground />

        {/* Top Navbar — Hidden on Login Pages or when not logged in */}
        {!isLoginPage && (
          <Navbar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            demoUsers={demoUsers}
            onOpenFarmerAuth={() => setActiveTab('login-farmer')}
            onOpenAdminAuth={() => setActiveTab('login-admin')}
            onLogout={handleLogout}
          />
        )}

        {/* System Live Status Ticker — Hidden on Login Pages or when not logged in */}
        {!isLoginPage && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 ${
            isAdminView ? 'pt-24 lg:pt-24 lg:pl-0' : 'pt-20 lg:pt-8 lg:pl-64'
          }`}>
            <SystemLiveStatusBar />
          </div>
        )}

        {/* Main View Container */}
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex-1 w-full relative z-10 ${
          isLoginPage || isAdminView ? 'lg:pl-0' : 'lg:pl-64'
        }`}>
          {!currentUser ? (
            activeTab === 'login-admin' || activeTab === 'staff' || activeTab === 'admin-user-search' || activeTab === 'admin-totals-breakdown' ? (
              <AdminLoginView 
                onLogin={handleLoginSuccess}
                onSwitchToFarmer={() => setActiveTab('login-farmer')}
              />
            ) : (
              <FarmerLoginView 
                onLogin={handleLoginSuccess}
                onSwitchToAdmin={() => setActiveTab('login-admin')}
              />
            )
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeView 
                  currentUser={currentUser}
                  onBookingCreated={handleRefreshData}
                  onNavigate={(tab) => setActiveTab(tab)} 
                />
              )}

              {activeTab === 'crops' && (
                <CropsView onBookSlotClick={() => setActiveTab('book-slot')} />
              )}

              {activeTab === 'market-prices' && (
                <MarketPricesView onBookSlotClick={() => setActiveTab('book-slot')} />
              )}

              {activeTab === 'calendar' && (
                <BookingCalendarView
                  currentUser={currentUser}
                  userBookings={userBookings}
                  onSelectSlot={() => setActiveTab('book-slot')}
                />
              )}

              {activeTab === 'track-booking' && (
                <BookingTrackerView
                  activeBooking={activeBooking}
                  userBookings={userBookings}
                  onSearchToken={handleSearchToken}
                />
              )}

              {(activeTab === 'book-slot' || activeTab === 'farmer-dashboard') && (
                <FarmerDashboard
                  key={refreshKey}
                  currentUser={currentUser}
                  onBookingCreated={handleRefreshData}
                />
              )}

              {activeTab === 'assistance' && (
                <AssistanceDeskView
                  onNavigate={(tab) => setActiveTab(tab)}
                  onBookingCreated={handleRefreshData}
                />
              )}

              {activeTab === 'ivr' && (
                <IVRPhoneSimulator
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'ai-analyze' && (
                <AIAnalyzeView
                  currentUser={currentUser}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'admin-user-search' && (
                isAdminRole ? (
                  <AdminUserSearch />
                ) : (
                  <AdminLoginView 
                    onLogin={handleLoginSuccess}
                    onSwitchToFarmer={() => setActiveTab('login-farmer')}
                  />
                )
              )}

              {activeTab === 'staff' && (
                isAdminRole ? (
                  <StaffDashboard
                    key={refreshKey}
                    currentUser={currentUser}
                    onDataChanged={handleRefreshData}
                  />
                ) : (
                  <AdminLoginView 
                    onLogin={handleLoginSuccess}
                    onSwitchToFarmer={() => setActiveTab('login-farmer')}
                  />
                )
              )}

              {activeTab === 'admin-totals-breakdown' && (
                isAdminRole ? (
                  <AdminTotalsDashboard centerId={currentUser?.center_id || 1} />
                ) : (
                  <AdminLoginView 
                    onLogin={handleLoginSuccess}
                    onSwitchToFarmer={() => setActiveTab('login-farmer')}
                  />
                )
              )}

              {activeTab === 'login-farmer' && (
                <FarmerLoginView 
                  onLogin={handleLoginSuccess}
                  onSwitchToAdmin={() => setActiveTab('login-admin')}
                />
              )}

              {activeTab === 'login-admin' && (
                <AdminLoginView 
                  onLogin={handleLoginSuccess}
                  onSwitchToFarmer={() => setActiveTab('login-farmer')}
                />
              )}
            </>
          )}
        </main>

        {/* Floating AI Queue Forecast Drawer (Farmer Portal) */}
        {!isAdminView && !isLoginPage && (
          <AIFloatingAssistantDrawer selectedCenterId={currentUser?.center_id || 1} />
        )}

        {/* Global Footer */}
        <Footer setActiveTab={setActiveTab} />

      </div>
    </ThemeProvider>
  );
}
