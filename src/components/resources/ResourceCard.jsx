import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

const ResourceCard = ({ resource, featured = false }) => {
  const {
    id,
    title,
    description,
    content_type,
    reading_time_minutes,
    category
  } = resource;

  // Determine card style based on whether it's featured or not
  const cardClasses = featured
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg'
    : 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-md';

  // Determine badge color based on content type
  const getBadgeColor = (type) => {
    switch (type) {
      case 'medication_guide':
        return 'bg-blue-100 text-blue-800';
      case 'usage_guide':
        return 'bg-green-100 text-green-800';
      case 'condition_info':
        return 'bg-purple-100 text-purple-800';
      case 'side_effect':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format content type for display
  const formatContentType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div 
      className={`rounded-lg border p-5 transition-all duration-200 ${cardClasses} ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {/* Category & Type */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase">
          {category}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(content_type)}`}>
          {formatContentType(content_type)}
        </span>
      </div>

      {/* Title */}
      <h3 className={`font-semibold ${featured ? 'text-xl mb-3' : 'text-lg mb-2'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{reading_time_minutes} min read</span>
        </div>

        <Link 
          to={`/resources/${id}`} 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {featured ? (
            <>
              Read more <ArrowRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
