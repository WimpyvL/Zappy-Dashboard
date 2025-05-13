import React from 'react';

const PatientServicesTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-4 mb-4">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 border-b-2 ${activeTab === 'treatments' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500'} font-medium flex items-center`}
          onClick={() => setActiveTab('treatments')}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 9 L21 15 L3 15 L3 9 C3 5 7 3 12 3 C17 3 21 5 21 9 M6 15 L6 19 C6 20 7 21 8 21 L16 21 C17 21 18 20 18 19 L18 15"></path>
          </svg>
          Treatments
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'messages' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'} font-medium flex items-center`}
          onClick={() => setActiveTab('messages')}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Messages
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'insights' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'} font-medium flex items-center`}
          onClick={() => setActiveTab('insights')}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          Insights
        </button>
      </div>
    </div>
  );
};

export default PatientServicesTabs;
