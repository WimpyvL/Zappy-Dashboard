import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useEducationalResource, 
  useRelatedResources 
} from '../../apis/educationalResources/hooks';
import ResourceDetail from '../../components/resources/ResourceDetail';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch resource data
  const { 
    data: resource, 
    isLoading, 
    error 
  } = useEducationalResource(id);
  
  // Fetch related resources
  const { 
    data: relatedResources, 
    isLoading: isLoadingRelated 
  } = useRelatedResources(id, 3); // Fetch 3 related resources
  
  // Redirect to resources page if resource not found
  useEffect(() => {
    if (!isLoading && !resource && !error) {
      navigate('/resources');
    }
  }, [resource, isLoading, error, navigate]);
  
  // Handle database table not existing yet
  if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
    return (
      <div className="bg-white min-h-screen">
        {/* Detail Header */}
        <header className="sticky top-0 z-20 bg-white shadow-sm flex items-center px-4 py-3">
          <button 
            onClick={() => navigate('/resources')}
            className="mr-2 p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex-1 truncate">
            <h1 className="text-lg font-bold line-clamp-1">Healthy Meal Planning</h1>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </header>
        
        <div className="p-4">
          {/* Content Meta */}
          <div className="flex flex-wrap items-center text-xs mb-3 gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
              Guide
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
              Weight Management
            </span>
            <span className="text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              5 min read
            </span>
          </div>
          
          {/* Featured Image */}
          <div className="rounded-lg overflow-hidden mb-4">
            <img 
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352" 
              alt="Healthy meal planning" 
              className="w-full h-48 object-cover"
            />
          </div>
          
          {/* Reading Progress */}
          <div className="flex items-center mb-6">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full w-1/3"></div>
            </div>
            <span className="ml-3 text-xs text-gray-500">33%</span>
          </div>
          
          {/* Content Body */}
          <div className="prose max-w-none mb-6">
            <h2>Understanding Meal Planning for Weight Management</h2>
            <p>Effective meal planning is a cornerstone of successful weight management. By planning your meals in advance, you can maintain better control over portions, nutritional balance, and caloric intake—all essential factors in achieving healthy weight loss.</p>
            
            <p>Research has consistently shown that individuals who plan their meals are more likely to maintain a balanced diet and achieve their weight management goals. Planning helps eliminate the "what's for dinner?" dilemma that often leads to impulsive, less healthy food choices.</p>
            
            <h2>Key Components of Effective Meal Planning</h2>
            <h3>1. Calorie Awareness Without Obsession</h3>
            <p>While counting calories isn't necessary for everyone, being generally aware of your caloric needs and the approximate calorie content of your meals is helpful. Focus on creating a moderate calorie deficit through a combination of portion control and nutrient-dense food choices.</p>
            
            <h3>2. Protein Prioritization</h3>
            <p>Including adequate protein in each meal helps maintain muscle mass during weight loss and increases satiety, helping you feel fuller for longer. Aim for lean protein sources such as:</p>
            <ul>
              <li>Chicken breast</li>
              <li>Fish and seafood</li>
              <li>Tofu and tempeh</li>
              <li>Legumes (beans, lentils)</li>
              <li>Low-fat dairy products</li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mb-8 flex-wrap gap-3">
            <button className="flex-1 flex justify-center items-center px-3 py-3 border border-gray-300 rounded-md text-gray-700 bg-white active:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save
            </button>
            <button className="flex-1 flex justify-center items-center px-3 py-3 border border-gray-300 rounded-md text-gray-700 bg-white active:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
          
          {/* Related Resources */}
          <div>
            <h2 className="text-lg font-bold mb-3">Related Resources</h2>
            <div className="space-y-3">
              <div className="block bg-gray-50 rounded-lg p-4 active:bg-gray-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 bg-red-100 rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Understanding GLP-1 Medications</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Video • 3 min</p>
                  </div>
                </div>
              </div>
              <div className="block bg-gray-50 rounded-lg p-4 active:bg-gray-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Exercise Basics for Weight Loss</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Guide • 4 min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Was this helpful?</h3>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 border border-gray-300 rounded-md text-sm bg-white active:bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Yes
              </button>
              <button className="flex-1 py-2 border border-gray-300 rounded-md text-sm bg-white active:bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2" />
                </svg>
                No
              </button>
            </div>
          </div>
          
          {/* Enough spacing for bottom nav */}
          <div className="h-20"></div>
        </div>
      </div>
    );
  }
  
  return (
    <ResourceDetail 
      resource={resource}
      isLoading={isLoading}
      error={error}
      relatedResources={relatedResources || []}
    />
  );
};

export default ResourceDetailPage;
