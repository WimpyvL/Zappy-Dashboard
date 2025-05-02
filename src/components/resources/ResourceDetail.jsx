import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  Download, 
  ThumbsUp, 
  ThumbsDown,
  Video,
  FileText,
  BookOpen
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const ResourceDetail = ({ resource, isLoading, error, relatedResources = [] }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  // Handle feedback submission
  const handleFeedback = (isHelpful) => {
    // In a real implementation, this would send feedback to the server
    setFeedbackGiven(true);
    
    // Show a toast or some indication that feedback was received
    alert(`Thank you for your feedback! You found this ${isHelpful ? 'helpful' : 'not helpful'}.`);
  };
  
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
  
  // Get related resource icon
  const getRelatedResourceIcon = (type) => {
    if (!type) return <FileText className="h-6 w-6 text-blue-500" />;
    
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6 text-red-500" />;
      case 'medication_guide':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'usage_guide':
        return <BookOpen className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };
  
  // Calculate reading progress (placeholder)
  const readingProgress = 33; // This would be calculated based on scroll position
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading resource: {error.message}
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md">
        Resource not found.
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      {/* Detail Header */}
      <header className="sticky top-0 z-20 bg-white shadow-sm flex items-center px-4 py-3">
        <Link 
          to="/resources"
          className="mr-2 p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 truncate">
          <h1 className="text-lg font-bold line-clamp-1">{resource.title}</h1>
        </div>
        <button className="p-2 text-gray-600 hover:text-gray-900">
          <Share2 className="h-6 w-6" />
        </button>
      </header>
      
      <div className="p-4">
        {/* Content Meta */}
        <div className="flex flex-wrap items-center text-xs mb-3 gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
            {formatContentType(resource.content_type)}
          </span>
          {resource.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
              {resource.category}
            </span>
          )}
          <span className="text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {resource.reading_time_minutes} min read
          </span>
        </div>
        
        {/* Featured Image */}
        {resource.image_url && (
          <div className="rounded-lg overflow-hidden mb-4">
            <img 
              src={resource.image_url || `https://source.unsplash.com/random/800x450?${resource.category}`}
              alt={resource.title} 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* Reading Progress */}
        <div className="flex items-center mb-6">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${readingProgress}%` }}
            ></div>
          </div>
          <span className="ml-3 text-xs text-gray-500">{readingProgress}%</span>
        </div>
        
        {/* Content Body */}
        <div className="prose max-w-none mb-6">
          {resource.description && (
            <p className="text-gray-700 mb-4">{resource.description}</p>
          )}
          
          {/* Render content - in a real implementation, this would parse HTML or Markdown */}
          <div dangerouslySetInnerHTML={{ __html: resource.content }} />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mb-8 flex-wrap gap-3">
          <button 
            className="flex-1 flex justify-center items-center px-3 py-3 border border-gray-300 rounded-md text-gray-700 bg-white active:bg-gray-100"
          >
            <Download className="h-5 w-5 mr-2" />
            Save
          </button>
          <button 
            className="flex-1 flex justify-center items-center px-3 py-3 border border-gray-300 rounded-md text-gray-700 bg-white active:bg-gray-100"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </button>
        </div>
        
        {/* Related Resources */}
        {relatedResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3">Related Resources</h2>
            <div className="space-y-3">
              {relatedResources.map((related) => (
                <Link 
                  key={related.id}
                  to={`/resources/${related.id}`}
                  className="block bg-gray-50 rounded-lg p-4 active:bg-gray-100"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        {getRelatedResourceIcon(related.content_type)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{related.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatContentType(related.content_type)} • {related.reading_time_minutes} min read
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Feedback */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Was this helpful?</h3>
          <div className="flex space-x-2">
            <button 
              className="flex-1 py-2 border border-gray-300 rounded-md text-sm bg-white active:bg-gray-100 flex items-center justify-center"
              onClick={() => handleFeedback(true)}
              disabled={feedbackGiven}
            >
              <ThumbsUp className="h-5 w-5 mr-1 text-green-500" />
              Yes
            </button>
            <button 
              className="flex-1 py-2 border border-gray-300 rounded-md text-sm bg-white active:bg-gray-100 flex items-center justify-center"
              onClick={() => handleFeedback(false)}
              disabled={feedbackGiven}
            >
              <ThumbsDown className="h-5 w-5 mr-1 text-red-500" />
              No
            </button>
          </div>
          {feedbackGiven && (
            <p className="text-sm text-center text-gray-600 mt-2">
              Thank you for your feedback!
            </p>
          )}
        </div>
        
        {/* Enough spacing for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ResourceDetail;
