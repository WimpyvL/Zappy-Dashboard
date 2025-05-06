import React, { useState } from 'react';
import { 
  Search, ChevronRight, Check, Clock,
  ArrowRight, Settings, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ProgramsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('for-you');
  
  // Handler functions
  const handleProgramClick = (programId) => {
    navigate(`/programs/${programId}`);
    toast.info(`Opening program details for ${programId}`);
  };
  
  const handleWatchVideo = () => {
    toast.success('Opening video player');
  };
  
  const handleStartProgram = () => {
    toast.success('Starting premium program');
  };

  // Custom CSS
  const customStyles = `
    .card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .big-shadow {
      box-shadow: 0 10px 25px -5px rgba(20, 184, 166, 0.1), 0 8px 10px -6px rgba(20, 184, 166, 0.05);
    }
    .horizontal-scroll-container::-webkit-scrollbar {
      display: none;
    }
    .horizontal-scroll-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      <style>{customStyles}</style>
      
      {/* Header */}
      <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Programs</h1>
            <p className="text-teal-100 text-sm">Learn to boost your success</p>
          </div>
          <div className="flex items-center">
            <button className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
              <Search className="h-5 w-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 mt-2">
          <button 
            className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'for-you' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
            onClick={() => setActiveCategory('for-you')}
          >
            For You
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'weight' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
            onClick={() => setActiveCategory('weight')}
          >
            Weight
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'hair' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
            onClick={() => setActiveCategory('hair')}
          >
            Hair
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'sex' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
            onClick={() => setActiveCategory('sex')}
          >
            Sexual Health
          </button>
        </div>
      </div>
      
      {/* Next Up For You Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Next up for you</h2>
          <div className="flex items-center bg-green-100 rounded-full px-3 py-1">
            <svg className="h-3 w-3 text-green-600 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span className="text-xs font-medium text-green-600">2 completed</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-4 border-l-4 border-teal-500">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-sm font-bold text-gray-800 mr-2">Wegovy® Getting Started</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Required</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-3 w-3 text-gray-400 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="text-xs text-gray-500">3 min video</span>
                </div>
              </div>
              <button 
                className="bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
                onClick={handleWatchVideo}
              >
                Watch
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Program Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 relative">
            <div className="flex items-start">
              <div className="mr-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg className="h-6 w-6 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Premium Health Insights</h3>
                <p className="text-sm text-white mb-3">Exclusive content to maximize your results</p>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">"Weight Loss Accelerator"</h4>
                      <p className="text-xs text-teal-100">4-week advanced program with Dr. Chen</p>
                    </div>
                    <span className="bg-yellow-400 text-teal-800 text-xs font-bold px-2 py-0.5 rounded">
                      NEW
                    </span>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-white text-teal-600 text-sm font-bold py-2 rounded-lg shadow-sm flex items-center justify-center"
                  onClick={handleStartProgram}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Start Program
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Better Sex Section */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Better Sex</h2>
            <p className="text-sm text-gray-500">Long-lasting satisfaction</p>
          </div>
          <button 
            className="text-sm font-medium text-teal-600 flex items-center hover:underline"
            onClick={() => handleProgramClick('sex')}
          >
            All 26 programs
            <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-3 horizontal-scroll-container">
          {/* Video Card 1 */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-red-100 relative">
              {/* Video Thumbnail */}
              <img 
                src="https://via.placeholder.com/300x200"
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">1 min</span>
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Sex Tips</span>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-white border border-teal-400">
                    <img src="https://via.placeholder.com/50x50" alt="Provider avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1">Boosting Arousal</h3>
              <p className="text-xs text-gray-500">7 tips to get in the mood</p>
            </div>
          </div>
          
          {/* Video Card 2 */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-red-100 relative">
              {/* Video Thumbnail */}
              <img 
                src="https://via.placeholder.com/300x200"
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">1 min</span>
              </div>
              
              {/* Provider Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-100 border-2 border-white">
                <img src="https://via.placeholder.com/50x50" alt="Provider avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Sex Ed</span>
                <div className="flex items-center bg-green-50 rounded-full px-2 py-0.5">
                  <svg className="h-3 w-3 text-green-600 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="text-xs text-green-600">Done</span>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1">ED Pills For Men</h3>
              <p className="text-xs text-gray-500">A urologist explains</p>
            </div>
          </div>
          
          {/* Video Card 3 */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-red-100 relative">
              {/* Video Thumbnail */}
              <img 
                src="https://via.placeholder.com/300x200"
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">3 min</span>
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Relationships</span>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-white border border-teal-400">
                    <img src="https://via.placeholder.com/50x50" alt="Provider avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1">Communication Tips</h3>
              <p className="text-xs text-gray-500">Improve intimacy with your partner</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weight Management Section */}
      <div className="px-4 mb-20">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Weight Management</h2>
            <p className="text-sm text-gray-500">Expert tips for your journey</p>
          </div>
          <button 
            className="text-sm font-medium text-teal-600 flex items-center hover:underline"
            onClick={() => handleProgramClick('weight')}
          >
            All 18 programs
            <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-3 horizontal-scroll-container">
          {/* Video Card 1 */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-teal-100 relative">
              {/* Video Thumbnail */}
              <img 
                src="https://via.placeholder.com/300x200"
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">5 min</span>
              </div>
              
              {/* Label */}
              <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-yellow-800">
                NEW
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Nutrition</span>
              </div>
              <h3 className="font-bold text-base mb-1">GLP-1 Friendly Meals</h3>
              <p className="text-xs text-gray-500">What to eat with Wegovy®</p>
            </div>
          </div>
          
          {/* Video Card 2 */}
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-36 bg-teal-100 relative">
              {/* Video Thumbnail */}
              <img 
                src="https://via.placeholder.com/300x200"
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                  onClick={handleWatchVideo}
                >
                  <svg className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Video Length */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                <span className="text-white text-xs">2 min</span>
              </div>
              
              {/* Doctor Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-100 border-2 border-white">
                <img src="https://via.placeholder.com/50x50" alt="Provider avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Side Effects</span>
                <div className="flex items-center bg-green-50 rounded-full px-2 py-0.5">
                  <svg className="h-3 w-3 text-green-600 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="text-xs text-green-600">Done</span>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1">Managing Nausea</h3>
              <p className="text-xs text-gray-500">Dr. Chen's practical tips</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default ProgramsPage;
