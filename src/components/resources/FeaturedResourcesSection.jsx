import React from 'react';
import { useFeaturedResources } from '../../apis/educationalResources/hooks';
import ResourceCard from './ResourceCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { BookOpen, Clock } from 'lucide-react';

const FeaturedResourcesSection = () => {
  const { data: featuredResources, isLoading, error } = useFeaturedResources();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if the error is related to the database tables not existing yet
  if (error) {
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      // Show placeholder content
      return (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main featured placeholder */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Medications
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Medication Guide
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Understanding Your Medication</h3>
              
              <p className="text-gray-600 mb-4">
                Learn about your medications, how they work, and how to take them properly for the best results.
              </p>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 min read</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Secondary featured placeholders */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Conditions
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    Condition Info
                  </span>
                </div>
                
                <h3 className="font-medium text-lg mb-2">Managing Chronic Conditions</h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  Tips and strategies for effectively managing chronic health conditions.
                </p>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>7 min read</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Wellness
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Usage Guide
                  </span>
                </div>
                
                <h3 className="font-medium text-lg mb-2">Healthy Eating Guidelines</h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  Nutritional advice to support your overall health and treatment plan.
                </p>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>6 min read</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional featured placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {i === 1 ? "Wellness" : i === 2 ? "Medications" : "Conditions"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {i === 1 ? "Usage Guide" : i === 2 ? "Side Effect" : "Condition Info"}
                  </span>
                </div>
                
                <h3 className="font-medium text-lg mb-2">
                  {i === 1 ? "Exercise Recommendations" : i === 2 ? "Managing Side Effects" : "Understanding Your Diagnosis"}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {i === 1 
                    ? "Physical activity guidelines tailored to your health needs." 
                    : i === 2 
                      ? "How to recognize and manage common medication side effects."
                      : "Information to help you understand your health condition."}
                </p>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{i + 3} min read</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    
    // For other types of errors, show error message
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
        Error loading featured resources: {error.message}
      </div>
    );
  }

  if (!featuredResources || featuredResources.length === 0) {
    return null; // Don't show the section if there are no featured resources
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredResources.slice(0, 1).map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource} 
            featured={true} 
          />
        ))}
        
        <div className="grid grid-cols-1 gap-4">
          {featuredResources.slice(1, 3).map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
            />
          ))}
        </div>
      </div>
      
      {featuredResources.length > 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {featuredResources.slice(3, 6).map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedResourcesSection;
