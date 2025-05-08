import React, { useState, useEffect } from 'react';
import PatientServicesEmptyState from './PatientServicesEmptyState';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('treatments');
  const [greeting, setGreeting] = useState('Good morning');
  const [hasActiveTreatments, setHasActiveTreatments] = useState(true);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);
  
  // Handler functions
  const handleAddProduct = (product) => toast.success(`${product} added to cart`);
  const handleCheckIn = () => toast.success('Check-in initiated for weight treatment');
  const handleMessageProvider = () => {
    navigate('/messaging');
    toast.info('Messaging provider');
  };
  const handleReferral = () => toast.info('Referral link copied to clipboard!');
  const handleMarkDone = () => toast.success('Medication marked as taken!');
  const handleTakePhotos = () => {
    navigate('/patients/progress-photos');
    toast.info('Taking progress photos');
  };
  
  // Toggle between empty state and active treatments view (for demo purposes)
  const toggleView = () => {
    setHasActiveTreatments(!hasActiveTreatments);
  };

  // Custom CSS
  const customStyles = `
    .status-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      text-transform: capitalize;
    }
    .status-active { 
      background-color: #DCFCE7; 
      color: #166534; 
    }
    .card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .scroll-snap-x {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .scroll-snap-x > div {
      scroll-snap-align: start;
    }
    .tabs-wrapper::-webkit-scrollbar {
      display: none;
    }
  `;

  // If user has no active treatments, show the empty state
  if (!hasActiveTreatments) {
    return <PatientServicesEmptyState />;
  }

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      {/* Demo toggle button - remove in production */}
      <button 
        onClick={toggleView}
        className="fixed bottom-24 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs"
      >
        Show Empty State
      </button>
      <style>{customStyles}</style>
      
      {/* Header Section */}
      <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">{greeting}, {user?.first_name || 'James'}</h1>
            <p className="text-teal-100 text-sm">The support you need, when you need it.</p>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
            onClick={() => navigate('/profile')}
          >
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Priority Action Card */}
      <div className="px-4 mt-3 mb-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17L4 12"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-800">Take your meds today</h3>
              <p className="text-sm text-gray-600">Semaglutide - due by 8:00 PM</p>
            </div>
            <button 
              className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm ml-2"
              onClick={handleMarkDone}
            >
              Mark Done
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="px-4 mb-4">
        <div className="flex border-b border-gray-200">
          <button 
            className="px-4 py-2 border-b-2 border-teal-500 text-teal-600 font-medium flex items-center"
            onClick={() => setActiveTab('treatments')}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 9 L21 15 L3 15 L3 9 C3 5 7 3 12 3 C17 3 21 5 21 9 M6 15 L6 19 C6 20 7 21 8 21 L16 21 C17 21 18 20 18 19 L18 15"></path>
            </svg>
            Treatments
          </button>
          <button 
            className="px-4 py-2 text-gray-500 font-medium flex items-center"
            onClick={() => setActiveTab('messages')}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Messages
          </button>
          <button 
            className="px-4 py-2 text-gray-500 font-medium flex items-center"
            onClick={() => setActiveTab('insights')}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            Insights
          </button>
        </div>
      </div>

      {/* Treatments Tab Content */}
      {activeTab === 'treatments' && (
        <div className="px-4 py-2">
          {/* Weight Management Section */}
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-4 text-teal-600">Weight Management</h2>
            
            {/* Weight Treatment Card - Full Width */}
            <div className="bg-white rounded-xl card-shadow overflow-hidden mb-4 w-full">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 9 L21 15 L3 15 L3 9 C3 5 7 3 12 3 C17 3 21 5 21 9 M6 15 L6 19 C6 20 7 21 8 21 L16 21 C17 21 18 20 18 19 L18 15"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-800">Semaglutide 0.5mg</h3>
                      <span className="status-badge status-active">Active</span>
                    </div>
                    <p className="text-sm text-gray-600">Weekly injection for weight management</p>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-teal-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Next dose: Today by 8:00 PM</p>
                      <p className="text-xs text-gray-600">Take your medication on time for best results</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Visualization */}
                <div className="flex justify-center items-center mb-4">
                  <div className="relative w-36 h-36">
                    {/* Circular Progress Background */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#0D9488" strokeWidth="10" 
                              strokeDasharray="282.7" strokeDashoffset="198" />
                    </svg>
                    {/* Progress Info in Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-teal-700">-8</div>
                      <div className="text-sm text-gray-600">pounds</div>
                      <div className="mt-1 text-xs text-teal-600 font-medium">28% to goal</div>
                    </div>
                  </div>
                </div>
                
                {/* Treatment Details */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Dosage</span>
                    <span className="text-sm font-medium text-gray-800">0.5mg weekly injection</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Storage</span>
                    <span className="text-sm font-medium text-gray-800">Refrigerate (36-46°F)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-gray-800">-8 lbs in 5 weeks</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button 
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm"
                    onClick={handleCheckIn}
                  >
                    Check-in
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg"
                    onClick={handleMessageProvider}
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
            
            {/* Provider Recommendations */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-teal-600 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Provider Recommended
              </h3>
              
              <div className="overflow-x-auto pb-4 scroll-snap-x">
                <div className="flex space-x-4 pb-2">
                  {/* Product 1 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img src="https://via.placeholder.com/160x128" alt="Nutritional Supplement" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Nutritional Supplement</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Daily vitamin supplement to support your weight management journey</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$29.99</span>
                        <button 
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-full"
                          onClick={() => handleAddProduct('Nutritional Supplement')}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 2 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img src="https://via.placeholder.com/160x128" alt="Fiber Supplement" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Fiber Supplement</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Improves fullness & digestive health</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$19.99</span>
                        <button 
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-full"
                          onClick={() => handleAddProduct('Fiber Supplement')}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Friend Referral Discount - Connected to Products */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">Friend Referral Bonus</h3>
                    <p className="text-xs text-gray-600">When a friend joins using your code, you both get $30 off any product!</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hair Loss Treatment Section */}
            <h2 className="text-lg font-bold mb-4 text-teal-600">Hair Loss Treatment</h2>
            
            {/* Hair Treatment Card - Full Width */}
            <div className="bg-white rounded-xl card-shadow overflow-hidden mb-4 w-full">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 14a5 5 0 01-5 5 5 5 0 01-5-5M8 9l4-5 4 5M12 3v6"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-800">Finasteride 1mg</h3>
                      <span className="status-badge status-active">Active</span>
                    </div>
                    <p className="text-sm text-gray-600">Daily tablet for hair loss treatment</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Next task: Take progress photos by May 10</p>
                      <p className="text-xs text-gray-600">Document your progress for better results tracking</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm"
                    onClick={handleTakePhotos}
                  >
                    Take Photos
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg"
                    onClick={handleMessageProvider}
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
            
            {/* Referral Banner - Full Width */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl overflow-hidden shadow-md mb-6 w-full">
              <div className="p-4 flex items-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Share with a buddy, get $20 credit</h3>
                  <p className="text-white text-sm opacity-90">Invite friends to join Zappy Health.</p>
                  
                  <div className="mt-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-yellow-500 flex items-center justify-center z-30 text-yellow-600 font-bold text-xs">J</div>
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-yellow-500 flex items-center justify-center z-20 text-yellow-600 font-bold text-xs">S</div>
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-yellow-500 flex items-center justify-center z-10 text-yellow-600 font-bold text-xs">M</div>
                      </div>
                      <span className="text-xs text-white">You've already referred 3 friends!</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="bg-white text-yellow-500 hover:bg-yellow-50 text-sm font-bold px-4 py-2 rounded-lg shadow-sm"
                  onClick={handleReferral}
                >
                  Invite
                </button>
              </div>
            </div>
            
            {/* Medication Guide Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4 text-teal-600">Medication Guide</h2>
              <div className="bg-white rounded-xl card-shadow overflow-hidden mb-4 w-full">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.4 6.9-5.5 8.5L12 22l-3.5-2.5C5.4 17.9 3 14.6 3 11a9 9 0 0 1 9-9z"></path>
                        <circle cx="12" cy="11" r="3"></circle>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800">Semaglutide Injection Guide</h3>
                      <p className="text-sm text-gray-600">Step-by-step instructions for your weekly injection</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                        1
                      </div>
                      <p className="text-sm text-gray-700">Remove pen from refrigerator 30 minutes before injection</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                        2
                      </div>
                      <p className="text-sm text-gray-700">Clean injection site with alcohol swab</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                        3
                      </div>
                      <p className="text-sm text-gray-700">Inject into abdomen, thigh, or upper arm</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                        4
                      </div>
                      <p className="text-sm text-gray-700">Hold for 5 seconds, then dispose of needle safely</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm"
                      onClick={() => navigate('/medication-guide')}
                    >
                      View Full Guide
                    </button>
                    <button 
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg"
                      onClick={() => navigate('/video-tutorial')}
                    >
                      Watch Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subscription Details Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4 text-teal-600">Subscription Details</h2>
              <div className="bg-white rounded-xl card-shadow overflow-hidden mb-4 w-full">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800">Weight Management Plan</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Premium</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Next billing date</span>
                      <span className="text-sm font-medium text-gray-800">May 15, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Monthly cost</span>
                      <span className="text-sm font-medium text-gray-800">$99.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Includes</span>
                      <span className="text-sm font-medium text-gray-800">Medication, Provider Support</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <p className="text-sm text-gray-800">Your next refill will ship automatically on May 12</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm"
                      onClick={() => navigate('/subscription-details')}
                    >
                      Manage Plan
                    </button>
                    <button 
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg"
                      onClick={() => navigate('/billing-history')}
                    >
                      Billing History
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Popular Treatments Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-green-600 flex items-center">
                  Popular Treatments
                  <svg className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </h2>
              </div>
              
              <div className="overflow-x-auto pb-4 scroll-snap-x">
                <div className="flex space-x-4 pb-2">
                  {/* Product 1 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                      <img src="https://via.placeholder.com/160x128" alt="Tirzepatide" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-green-100 px-2 py-0.5 rounded-full">
                        <span className="text-xs font-medium text-green-800">New</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="bg-teal-100 rounded-full px-2 py-0.5 inline-block mb-1">
                        <span className="text-xs text-teal-700">Weight</span>
                      </div>
                      <h4 className="font-medium text-sm">Tirzepatide</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">New weight management medication with dual hormone action</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-medium">$199.99</span>
                          <span className="text-xs line-through text-gray-400 ml-1">$249.99</span>
                        </div>
                        <button 
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-full"
                          onClick={() => handleAddProduct('Tirzepatide')}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 2 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                      <img src="https://via.placeholder.com/160x128" alt="Dutasteride" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-yellow-100 px-2 py-0.5 rounded-full">
                        <span className="text-xs font-medium text-yellow-800">Popular</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="bg-blue-100 rounded-full px-2 py-0.5 inline-block mb-1">
                        <span className="text-xs text-blue-700">Hair</span>
                      </div>
                      <h4 className="font-medium text-sm">Dutasteride</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Advanced hair loss treatment targeting both types of DHT</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$89.99</span>
                        <button 
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-full"
                          onClick={() => handleAddProduct('Dutasteride')}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {/* Messages Tab Content */}
      {activeTab === 'messages' && (
        <div className="px-4 py-2">
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Your messages will appear here</p>
          </div>
        </div>
      )}
      
      {/* Insights Tab Content */}
      {activeTab === 'insights' && (
        <div className="px-4 py-2">
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <p>Your insights will appear here</p>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default PatientServicesPage;
