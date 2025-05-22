import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading state component for consultation data
 */
const ConsultationLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-gray-600 text-lg">Loading consultation data...</p>
    </div>
  );
};

export default ConsultationLoading;