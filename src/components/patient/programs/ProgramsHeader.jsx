import React from 'react';
import { Search, Settings } from 'lucide-react';
import { toast } from 'react-toastify'; // Assuming toast is used for actions

const ProgramsHeader = () => {
  // Placeholder handlers for now
  const handleSearchClick = () => {
    toast.info('Search functionality not yet implemented');
  };

  const handleSettingsClick = () => {
    toast.info('Settings functionality not yet implemented');
  };

  return (
    <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Programs</h1>
          <p className="text-teal-100 text-sm">Learn to boost your success</p>
        </div>
        <div className="flex items-center">
          <button
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3"
            onClick={handleSearchClick}
          >
            <Search className="h-5 w-5 text-white" />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramsHeader;
