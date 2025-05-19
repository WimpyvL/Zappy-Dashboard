import React from 'react';
import { ChevronRight, Check, Clock, TrendingDown } from 'lucide-react'; // Assuming these icons are used

// Hardcoded data for now, should be fetched from an API
const weightManagementPrograms = [
  {
    id: 4,
    category: 'Nutrition',
    title: 'Meal Planning Basics',
    description: 'Simple steps to plan healthy meals for weight loss.',
    videoLength: '12 min',
    imageUrl: 'https://via.placeholder.com/300x200',
    providerAvatarUrl: 'https://via.placeholder.com/50x50',
    status: 'In Progress',
  },
  {
    id: 5,
    category: 'Exercise',
    title: 'Beginner Home Workout',
    description: 'An easy-to-follow workout routine you can do anywhere.',
    videoLength: '20 min',
    imageUrl: 'https://via.placeholder.com/300x200',
    providerAvatarUrl: 'https://via.placeholder.com/50x50',
    status: null,
  },
  {
    id: 6,
    category: 'Mindset',
    title: 'Overcoming Emotional Eating',
    description: 'Strategies to manage emotional triggers for eating.',
    videoLength: '18 min',
    imageUrl: 'https://via.placeholder.com/300x200',
    providerAvatarUrl: 'https://via.placeholder.com/50x50',
    status: null,
  },
];

const WeightManagementSection = ({ handleProgramClick, handleWatchVideo }) => {
  return (
    <div className="px-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Weight Management</h2>
          <p className="text-sm text-gray-500">Achieve your weight goals</p>
        </div>
        <button
          className="text-sm font-medium text-teal-600 flex items-center hover:underline"
          onClick={() => handleProgramClick('weight-management')}
        >
          All 18 programs
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-3 horizontal-scroll-container">
        {weightManagementPrograms.map(program => (
          <div key={program.id} className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-blue-100 relative"> {/* Changed background color */}
              {/* Video Thumbnail */}
              <img
                src={program.imageUrl}
                alt={program.title}
                className="w-full h-full object-cover"
              />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>

              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">{program.videoLength}</span>
              </div>

              {/* Provider Badge */}
              {program.providerAvatarUrl && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-100 border-2 border-white">
                  <img src={program.providerAvatarUrl} alt="Provider avatar" className="w-full h-full rounded-full object-cover" />
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{program.category}</span>
                {program.status === 'Done' && (
                  <div className="flex items-center bg-green-50 rounded-full px-2 py-0.5">
                    <Check className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Done</span>
                  </div>
                )}
                {program.status === 'In Progress' && (
                  <div className="flex items-center bg-yellow-50 rounded-full px-2 py-0.5">
                    <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                    <span className="text-xs text-yellow-600">In Progress</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-base mb-1">{program.title}</h3>
              <p className="text-xs text-gray-500">{program.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightManagementSection;
