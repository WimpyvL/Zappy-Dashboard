import React from 'react';
import { 
  Bell, User, Home, Calendar, FileText, ShoppingBag, 
  Camera, Clock, Check, ChevronRight, Plus, MessageSquare,
  ArrowRight, TrendingDown, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/redesign/Button';
import StatusBadge from '../../components/ui/redesign/StatusBadge';

// Custom CSS classes
const styles = {
  horizontalScroll: `
    .horizontal-scroll {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .horizontal-scroll::-webkit-scrollbar {
      display: none;
    }
  `,
  cardShadow: 'shadow-sm',
  referralCard: 'shadow-md',
  upsellCard: 'shadow-md'
};

const PatientHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Handler functions
  const handleTakePhotos = () => {
    toast.success('Taking progress photos');
    navigate('/care');
  };
  
  const handleViewDetails = (treatmentType) => {
    navigate(`/care/${treatmentType}`);
    toast.info(`Viewing details for ${treatmentType} treatment`);
  };
  
  const handleCheckIn = () => {
    navigate('/care/weight/check-in');
    toast.info('Opening weight check-in form');
  };
  
  const handleMessageClick = () => {
    navigate('/messaging');
    toast.info('Opening message thread');
  };
  
  const handleReferral = () => {
    toast.info('Referral link copied to clipboard!');
  };
  
  const handleMarkDone = () => {
    toast.success('Medication marked as taken!');
  };

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      <style>
        {styles.horizontalScroll}
      </style>
      
      {/* Header Section */}
      <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="text-xl font-bold text-white">Hey {user?.first_name || 'Michel'}!</h1>
            <p className="text-teal-100 text-sm">You have 2 items that need attention</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-teal-600"></span>
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Priority Actions Section */}
      <div className="px-4 -mt-2 relative z-10 mb-5">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-base font-bold text-text-dark p-4 pb-2">Priority Actions</h2>
          
          {/* First Priority Card */}
          <div className="p-3 border-l-4 border-yellow-500 mx-3 mb-3 bg-yellow-50 rounded-r-lg flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
              <Camera className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text-dark">Hair Progress Photos</h3>
              <p className="text-xs text-text-medium">Just a few days left - take 2 mins</p>
            </div>
            <Button 
              variant="warning"
              size="small"
              onClick={handleTakePhotos}
            >
              Take Photos
            </Button>
          </div>
          
          {/* Second Priority Card */}
          <div className="p-3 border-l-4 border-teal-500 mx-3 mb-3 bg-teal-50 rounded-r-lg flex items-center">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
              <Clock className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text-dark">Take Semaglutide</h3>
              <p className="text-xs text-text-medium">Due by 8:00 PM today</p>
            </div>
            <Button 
              variant="primary"
              className="bg-teal-500 hover:bg-teal-600 text-white"
              size="small"
              onClick={handleMarkDone}
            >
              Mark Done
            </Button>
          </div>
        </div>
      </div>

      {/* Treatment Section */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-bold text-text-dark mb-3">Your Treatments</h2>
        
        {/* Weight Treatment Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
              <TrendingDown className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-text-dark">Weight Journey</h3>
                <StatusBadge status="active" variant="success" />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-medium">
                  <span className="font-medium">Current:</span> 220 lbs (BMI: 31.5)
                </p>
                <p className="text-sm font-semibold text-green-600">-8 lbs</p>
              </div>
            </div>
            <button 
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => handleViewDetails('weight')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex">
              <div className="flex-1 pr-2">
                <Button 
                  variant="primary"
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                  fullWidth
                  onClick={handleCheckIn}
                >
                  Check-in Weight
                </Button>
              </div>
              <div className="flex-1 pl-2">
                <Button 
                  variant="secondary"
                  fullWidth
                  onClick={() => handleViewDetails('weight')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hair Treatment Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-hair-purple flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="h-5 w-5 text-zappy-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 14a5 5 0 01-5 5 5 5 0 01-5-5M8 9l4-5 4 5M12 3v6"></path>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-text-dark">Hair Regrowth</h3>
                <StatusBadge status="active" variant="success" />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-medium">
                  <span className="font-medium">Progress:</span> Month 3 of treatment
                </p>
                <p className="text-sm text-text-medium">Photos due May 10</p>
              </div>
            </div>
            <button 
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => handleViewDetails('hair')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex">
              <div className="flex-1 pr-2">
                <Button 
                  variant="primary"
                  fullWidth
                  onClick={handleTakePhotos}
                >
                  Take Photos
                </Button>
              </div>
              <div className="flex-1 pl-2">
                <Button 
                  variant="secondary"
                  fullWidth
                  onClick={() => handleViewDetails('hair')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Referral Section */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl overflow-hidden shadow-md mb-4">
          <div className="p-4">
            <div className="flex items-start mb-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 flex-shrink-0">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Share & Earn $30</h3>
                <p className="text-sm text-white opacity-90">One more friend needed for Gold Status!</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3">
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-white">Referral progress</span>
                  <span className="text-sm font-medium text-white">2/3</span>
                </div>
                <div className="w-full h-2 bg-white bg-opacity-20 rounded-full">
                  <div className="w-2/3 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex -space-x-3 mr-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center z-30 text-yellow-600 font-bold text-xs">JD</div>
                  <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center z-20 text-yellow-600 font-bold text-xs">SM</div>
                  <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center z-10">
                    <Plus className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-white">Friends who joined <span className="font-bold">love Zappy!</span></p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs font-medium text-white opacity-90">1 more friend = Gold Status with $30 credit</p>
              </div>
              <Button 
                variant="secondary"
                className="bg-white text-yellow-600 hover:bg-yellow-50"
                onClick={handleReferral}
              >
                Share Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upsell Product Section */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl overflow-hidden shadow-md mb-4">
          <div className="p-4">
            <div className="flex items-start mb-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="h-6 w-6 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15" x2="9" y2="15"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Boost your progress!</h3>
                <p className="text-sm text-white opacity-90">Recommended by Dr. Chen for faster results</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-dark">Premium Protein Formula</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-medium">Boost results by up to 35%</p>
                    <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">$29.99</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <Button 
                variant="secondary"
                className="flex-1 mr-2 bg-white text-teal-600 hover:bg-teal-50"
                onClick={() => navigate('/shop/protein')}
              >
                Learn More
              </Button>
              <Button 
                variant="primary"
                className="flex-1 ml-2 bg-teal-800 hover:bg-teal-900 text-white"
                onClick={() => {
                  toast.success('Premium Protein Formula added to cart');
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages Section */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-text-dark">Messages</h2>
          <a href="#" className="text-sm font-medium text-teal-600" onClick={() => navigate('/messaging')}>View All</a>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-l-4 border-teal-500">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-teal-600 font-bold text-sm">MC</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-bold text-text-dark">Dr. Michael Chen</h3>
                  <span className="text-xs text-text-light">Yesterday</span>
                </div>
                <p className="text-sm text-text-medium line-clamp-2">Your recent blood work looks good. I'm glad to see the improvements in your cholesterol levels. Let's continue...</p>
              </div>
              <button 
                className="ml-3 w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 flex items-center justify-center flex-shrink-0"
                onClick={handleMessageClick}
              >
                <ArrowRight className="h-4 w-4 text-teal-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Learn Section */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-text-dark">Learn & Grow</h2>
          <a href="#" className="text-sm font-medium text-teal-600" onClick={() => navigate('/resources')}>See All</a>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 horizontal-scroll">
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-32 bg-teal-100 relative flex items-center justify-center">
              <svg className="h-16 w-16 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <button className="absolute w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center shadow-lg hover:bg-teal-600">
                <svg className="h-5 w-5 text-white ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-1.5 py-0.5">
                <span className="text-white text-xs font-medium">1:32</span>
              </div>
            </div>
            <div className="p-3">
              <span className="text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full mb-1 inline-block font-medium">Weight</span>
              <h3 className="font-semibold text-sm mb-1 text-text-dark">Maximizing Your Wegovy® Results</h3>
              <p className="text-xs text-text-medium">Simple tips from Dr. Chen</p>
            </div>
          </div>
          
          <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-32 bg-hair-purple relative flex items-center justify-center">
              <svg className="h-16 w-16 text-zappy-blue opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <button className="absolute w-12 h-12 rounded-full bg-zappy-blue flex items-center justify-center shadow-lg hover:bg-zappy-blue">
                <svg className="h-5 w-5 text-white ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-1.5 py-0.5">
                <span className="text-white text-xs font-medium">2:15</span>
              </div>
            </div>
            <div className="p-3">
              <span className="text-xs text-zappy-blue bg-hair-purple px-2 py-0.5 rounded-full mb-1 inline-block font-medium">Hair</span>
              <h3 className="font-semibold text-sm mb-1 text-text-dark">Taking Perfect Progress Photos</h3>
              <p className="text-xs text-text-medium">Get the most accurate tracking</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default PatientHomePage;
