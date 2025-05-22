import React from 'react';
import { useAppContext } from '../context/AppContext'; // Import the context hook for viewMode
import PatientDashboard from './dashboard/PatientDashboard'; // Import the new Patient Dashboard
import ProviderDashboard from './dashboard/ProviderDashboard'; // Import the new Provider Dashboard
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

const Dashboard = () => {
  const { viewMode } = useAppContext(); // Get the viewMode from context

  // Render the appropriate dashboard based on viewMode
  if (viewMode === 'patient') {
    return <PatientDashboard />;
  } else {
    // Default to ProviderDashboard if viewMode is 'admin' or not set/invalid
    return <ProviderDashboard />;
  }
};

export default Dashboard;
