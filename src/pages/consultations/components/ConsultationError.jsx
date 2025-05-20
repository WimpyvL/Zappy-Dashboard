import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

/**
 * Error display component for consultation-related errors
 */
const ConsultationError = ({ error, onRetry }) => {
  return (
    <div className="text-center py-10 bg-white rounded-lg shadow">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
      <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {error?.message || 'An unexpected error occurred while loading consultation data.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-200"
          aria-label="Retry loading data"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

ConsultationError.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  onRetry: PropTypes.func,
};

export default ConsultationError;