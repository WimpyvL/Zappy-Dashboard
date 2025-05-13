import React from 'react';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ServiceResourcesSection - A component for displaying educational resources within a service module
 * 
 * This component displays educational resources relevant to a specific service type,
 * such as medication guides, usage instructions, and condition information.
 */
const ServiceResourcesSection = ({ resources = [], serviceConfig, serviceType }) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  // Format content type for display
  const formatContentType = (type) => {
    if (!type) return '';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get content type badge color
  const getContentTypeBadgeColor = (type) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type) {
      case 'medication_guide':
        return 'bg-blue-100 text-blue-800';
      case 'usage_guide':
        return 'bg-green-100 text-green-800';
      case 'side_effect':
        return 'bg-red-100 text-red-800';
      case 'condition_info':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700">Educational Resources</h4>
        <Link 
          to={`/resources?service=${serviceType}`} 
          className="text-xs font-medium hover:underline flex items-center"
          style={{ color: serviceConfig.colors.primary }}
        >
          View all <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {resources.slice(0, 2).map((resource) => (
          <Link 
            key={resource.id}
            to={`/resources/${resource.id}`}
            className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
            style={{ 
              backgroundColor: serviceConfig.colors.light, 
              borderColor: serviceConfig.colors.border 
            }}
          >
            <div className="flex items-start">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: serviceConfig.colors.lighter }}
              >
                <FileText className="h-4 w-4" style={{ color: serviceConfig.colors.primary }} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center text-xs mb-1 gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                    {formatContentType(resource.content_type)}
                  </span>
                  {resource.reading_time_minutes && (
                    <span className="text-gray-500 flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {resource.reading_time_minutes} min
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-medium">{resource.title}</h5>
                {resource.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{resource.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceResourcesSection;
