import React from 'react';
import { useAppContext } from '../contexts/app/AppContext'; // Import the context hook
import PatientDashboard from './dashboard/PatientDashboard'; // Import the Patient Dashboard
import ProviderDashboard from './dashboard/ProviderDashboard'; // Import the Provider Dashboard

/**
 * Main Dashboard component that renders either PatientDashboard or ProviderDashboard
 * based on the current viewMode from AppContext.
 *
 * Note: This component only uses PatientDashboard and ProviderDashboard components.
 * It does not use or import AdminDashboard.jsx.
 */
const Dashboard = () => {
  const { viewMode } = useAppContext(); // Get the viewMode from context

  // Explicitly handle all possible viewMode values to avoid dynamic imports
  if (viewMode === 'patient') {
    return <PatientDashboard />;
  }
  
  // For 'admin' viewMode or any other value, always use ProviderDashboard
  return <ProviderDashboard />;
};

export default Dashboard;
