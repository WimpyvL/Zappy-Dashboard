import React from 'react';
import ProviderDashboard from './ProviderDashboard';

// This component simply re-exports ProviderDashboard
// It exists to satisfy imports that might be looking for AdminDashboard.jsx
const AdminDashboard = () => {
  return <ProviderDashboard />;
};

export default AdminDashboard;