import React, { memo } from 'react';
import { ArrowRight } from 'lucide-react';

const MessageCard = memo(({ initials, name, time, message, onClick }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border-l-4 border-teal-500 card-hover">
    <div className="p-4">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-teal-600 font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-gray-800">{name}</h3>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
        </div>
        <button
          className="ml-3 w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 flex items-center justify-center flex-shrink-0"
          onClick={onClick}
        >
          <ArrowRight className="h-4 w-4 text-teal-600" />
        </button>
      </div>
    </div>
  </div>
));

export default MessageCard;
