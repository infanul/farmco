import React from 'react';
import FarmerDashboard from './FarmerDashboard';

export default function HomeView({ currentUser, onBookingCreated, onNavigate }) {
  return (
    <div className="space-y-6">
      <FarmerDashboard 
        currentUser={currentUser} 
        onBookingCreated={onBookingCreated} 
      />
    </div>
  );
}
