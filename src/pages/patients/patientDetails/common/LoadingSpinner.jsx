// components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    tiny: "h-4 w-4",
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-indigo-500 mx-auto`}></div>
        {message && size !== 'tiny' && (
          <p className="mt-2 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;


// components/common/

// components/common/


// components/common/
