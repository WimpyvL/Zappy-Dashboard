import React from 'react';
import { BarChart2 } from 'lucide-react';

const ProgressTrackingSection = ({ progress }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-[#F85C5C]"/>Progress Tracking
        </h3>
      </div>
      <div className="p-5">
        <div className="text-sm text-gray-700 space-y-2 mb-3">
          {progress.filter(p => p.metric === 'Weight').map(p => (
             <div key={`prog-${p.week}`} className="flex justify-between items-center">
               <span>Week {p.week}</span>
               <span className="font-medium">{p.value} {p.unit}</span>
             </div>
          ))}
        </div>

        {/* Simple chart visualization */}
        <div className="h-24 flex items-end space-x-2 mt-4">
          {progress.filter(p => p.metric === 'Weight').map((p, index, arr) => {
            // Calculate height percentage based on min/max values
            const values = arr.map(item => item.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const heightPercent = range === 0 ? 100 : ((p.value - min) / range) * 100;

            return (
              <div key={`chart-${p.week}`} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#F85C5C]/80 rounded-t"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                <div className="text-xs mt-1">W{p.week}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackingSection;
