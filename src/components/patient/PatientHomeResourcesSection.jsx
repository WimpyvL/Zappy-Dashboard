import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedResources } from '../../apis/educationalResources/hooks';
import { ArrowRight, Clock, FileText, BookOpen, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const PatientHomeResourcesSection = () => {
  // Fetch featured resources (limit to 2)
  const { data: resources, isLoading, error } = useFeaturedResources(2);
  
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
  
  // Handle database table not existing yet
  if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Health Resources</h2>
            <Link 
              to="/resources" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {/* Placeholder Resource Card 1 */}
            <div className="block bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352" 
                  alt="Healthy Meal Planning" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                    Guide
                  </span>
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    5 min read
                  </span>
                </div>
                <h3 className="font-medium text-base mb-1">Healthy Meal Planning for Weight Management</h3>
                <p className="text-sm text-gray-600 line-clamp-2">Learn how to create balanced, satisfying meals that support your weight loss goals without sacrificing taste.</p>
              </div>
            </div>
            
            {/* Placeholder Resource Card 2 */}
            <div className="block bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1594737625785-a6cbdabd333c" 
                  alt="Understanding Medications" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                    Video
                  </span>
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    3 min
                  </span>
                </div>
                <h3 className="font-medium text-base mb-1">Understanding Weight Loss Medications</h3>
                <p className="text-sm text-gray-600 line-clamp-2">Our medical director explains how weight loss medications work and what to expect during treatment.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              to="/resources" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse All Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Health Resources</h2>
            <Link 
              to="/resources" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Health Resources</h2>
        </div>
        
        <div className="p-4">
          <p className="text-red-500">Error loading resources.</p>
        </div>
      </div>
    );
  }
  
  // Show empty state
  if (!resources || resources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Health Resources</h2>
            <Link 
              to="/resources" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="p-4 text-center">
          <p className="text-gray-500 mb-4">No featured resources available.</p>
          <Link 
            to="/resources" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse All Resources
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Health Resources</h2>
          <Link 
            to="/resources" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {resources.map((resource) => (
            <Link 
              key={resource.id}
              to={`/resources/${resource.id}`}
              className="block bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src={resource.image_url || `https://source.unsplash.com/random/800x450?${resource.category}`}
                  alt={resource.title} 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                    {formatContentType(resource.content_type)}
                  </span>
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {resource.reading_time_minutes} min read
                  </span>
                </div>
                <h3 className="font-medium text-base mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            to="/resources" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse All Resources
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientHomeResourcesSection;
