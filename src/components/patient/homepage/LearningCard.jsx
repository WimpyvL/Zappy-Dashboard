import React, { memo } from 'react';

const LearningCard = memo(({ category, title, description, duration, bgColor }) => (
  <div className={`w-64 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${category === 'Weight' ? 'border-teal-500' : 'border-purple-500'} card-hover`}>
    <div className={`h-32 ${category === 'Weight' ? 'bg-teal-50' : 'bg-purple-50'} relative flex items-center justify-center`}>
      <svg className={`h-16 w-16 ${category === 'Weight' ? 'text-teal-300' : 'text-purple-300 opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <button className={`absolute w-10 h-10 rounded-full ${category === 'Weight' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-500 hover:bg-purple-600'} flex items-center justify-center shadow-lg`}>
        <svg className="h-4 w-4 text-white ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-1.5 py-0.5">
        <span className="text-white text-xs font-medium">{duration}</span>
      </div>
    </div>
    <div className="p-3">
      <span className={`text-xs ${category === 'Weight' ? 'text-teal-700 bg-teal-100' : 'text-purple-700 bg-purple-100'} px-2 py-0.5 rounded-full mb-1 inline-block font-medium`}>{category}</span>
      <h3 className="font-semibold text-sm mb-1 text-gray-800">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
));

export default LearningCard;
