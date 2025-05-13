import React from 'react';
import { Target } from 'lucide-react'; // Assuming Target icon is needed

const ProgramGoalCard = ({ goal }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-[#F85C5C]">
      <div className="p-5">
        <div className="inline-block px-2 py-1 bg-[#FF8080] text-white text-xs font-medium rounded mb-2">
          Goal
        </div>
        <h3 className="text-lg font-semibold mb-2">Program Goal</h3>
        <p className="text-gray-700">{goal}</p>
      </div>
    </div>
  );
};

export default ProgramGoalCard;
