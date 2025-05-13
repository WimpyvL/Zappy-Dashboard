import React from 'react';

const PriorityActionCard = ({ handleMarkDone }) => {
  return (
    <div className="px-4 mt-3 mb-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 border-l-4 border-yellow-500">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17L4 12"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">Take your meds today</h3>
            <p className="text-sm text-gray-600">Semaglutide - due by 8:00 PM</p>
          </div>
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm ml-2"
            onClick={handleMarkDone}
          >
            Mark Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriorityActionCard;
