import React from 'react';
import { X } from 'lucide-react';

const tagColors = {
  gray: "bg-gray-100 text-gray-800 border-gray-300",
  red: "bg-red-100 text-red-800 border-red-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  green: "bg-green-100 text-green-800 border-green-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  pink: "bg-pink-100 text-pink-800 border-pink-300"
};

const Tag = ({ 
  id, 
  name, 
  color = 'gray', 
  onRemove, 
  onClick, 
  className = '', 
  removable = false 
}) => {
  const colorClasses = tagColors[color] || tagColors.gray;
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      {name}
      {removable && onRemove && (
        <button 
          type="button"
          className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <span className="sr-only">Remove tag</span>
          <X className="h-2 w-2" />
        </button>
      )}
    </span>
  );
};

export default Tag;