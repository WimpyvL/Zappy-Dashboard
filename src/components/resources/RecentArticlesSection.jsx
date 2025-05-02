import React from 'react';
import { useRecentResources } from '../../apis/educationalResources/hooks';
import ResourceCard from './ResourceCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const RecentArticlesSection = () => {
  const { data: recentResources, isLoading, error } = useRecentResources(4); // Fetch 4 recent resources

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    // Check if the error is related to the database tables not existing yet
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      // Show placeholder content
      return (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Articles</h2>
            <Link 
              to="/resources?sort=recent" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {i % 3 === 0 ? "Medications" : i % 3 === 1 ? "Conditions" : "Wellness"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {i % 4 === 0 ? "Medication Guide" : i % 4 === 1 ? "Usage Guide" : i % 4 === 2 ? "Condition Info" : "Side Effect"}
                  </span>
                </div>
                
                <h3 className="font-medium text-lg mb-2">
                  {i % 4 === 0 ? "Understanding Your Medication" : 
                   i % 4 === 1 ? "Managing Side Effects" : 
                   i % 4 === 2 ? "Healthy Eating Guidelines" :
                   "Exercise Recommendations"}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {i % 3 === 0 
                    ? "Learn about your medications, how they work, and how to take them properly." 
                    : i % 3 === 1 
                      ? "Information about common health conditions and treatment approaches."
                      : "Tips and strategies for maintaining your overall health and wellness."}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    
    // For other types of errors, show error message
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
        Error loading recent resources: {error.message}
      </div>
    );
  }

  if (!recentResources || recentResources.length === 0) {
    return null; // Don't show the section if there are no recent resources
  }

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recent Articles</h2>
        <Link 
          to="/resources?sort=recent" 
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          View all <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentResources.map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource} 
          />
        ))}
      </div>
    </section>
  );
};

export default RecentArticlesSection;
