import React from 'react';

const ProgramSummaryCard = ({ programName, currentWeek, duration, progressPercentage }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-2">{programName}</h2>
      <p className="text-lg mb-4">
        Week {currentWeek} of {duration}
      </p>
      <div className="w-full bg-white rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-green-400 h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-sm mt-2 text-right">{progressPercentage}% Complete</p>
    </div>
  );
};

export default ProgramSummaryCard;
