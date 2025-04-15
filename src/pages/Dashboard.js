import React from 'react';
import { useAppContext } from '../context/AppContext'; // Import the context hook
import PatientDashboard from './dashboard/PatientDashboard'; // Import the new Patient Dashboard
import ProviderDashboard from './dashboard/ProviderDashboard'; // Import the new Provider Dashboard
// import { Loader2 } from 'lucide-react'; // Removed unused Loader2

const Dashboard = () => {
  const { viewMode } = useAppContext(); // Get the viewMode from context

  // Optional: Add a loading state while context is initializing if needed
  // if (isLoadingContext) { // Assuming context provides a loading state
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Loader2 className="h-16 w-16 animate-spin text-[#F85C5C]" />
  //     </div>
  //   );
  // }

  // Render the appropriate dashboard based on viewMode
  if (viewMode === 'patient') {
    return <PatientDashboard />;
  } else {
    // Default to ProviderDashboard if viewMode is 'admin' or not set/invalid
    return <ProviderDashboard />;
  }
};

export default Dashboard;
