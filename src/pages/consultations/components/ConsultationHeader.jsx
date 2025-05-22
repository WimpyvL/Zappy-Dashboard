import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

/**
 * Header component for the consultations page with title and action button
 */
const ConsultationHeader = ({ onNewConsultation }) => {
  return (
    <div className="flex justify-between items-center mb-6 relative z-10">
      <h1 className="text-2xl font-bold text-gray-800">Initial Consultations</h1>
      <button
        className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90 transition-colors duration-200"
        onClick={onNewConsultation}
        aria-label="Create new consultation"
      >
        <Plus className="h-5 w-5 mr-2" /> New Consultation
      </button>
    </div>
  );
};

ConsultationHeader.propTypes = {
  onNewConsultation: PropTypes.func.isRequired,
};

export default memo(ConsultationHeader);