import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('featured');
  const [cartCount, setCartCount] = useState(3);
  
  // Handler functions
  const handleAddProduct = (product) => {
    setCartCount(cartCount + 1);
    toast.success(`${product} added to cart`);
  };
  
  const handleViewDetails = (productId) => {
    navigate(`/shop/${productId}`);
    toast.info(`Viewing details for ${productId}`);
  };
  
  const handleReferral = () => {
    toast.info('Referral link copied to clipboard!');
  };
  
  const handleViewBundle = () => {
    toast.info('Viewing bundle details');
  };
  
  const handleSkip = () => {
    toast.info('Recommendation skipped');
  };
  
  const handleViewAllCategories = () => {
    toast.info('Viewing all categories');
  };
  
  const handleInviteMore = () => {
    toast.info('Invite more friends dialog opened');
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
            <h1 className="text-2xl font-bold text-white">Shop</h1>
            <p className="text-teal-100 text-sm">Find what works for you</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center relative">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-teal-800 w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          </div>
        </div>
        
        {/* Referral Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-md overflow-hidden absolute -bottom-16 left-4 right-4">
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className="flex-1 mr-3">
              <h3 className="text-sm font-bold text-white">Give $30, Get $30</h3>
              <p className="text-xs text-white">Refer friends and you both get rewards!</p>
            </div>
            <button 
              className="bg-white text-yellow-600 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm"
              onClick={handleReferral}
            >
              Invite
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 mt-16">
        <div className="flex px-4">
          <button 
            className={`py-3 px-4 relative ${activeTab === 'featured' ? 'text-teal-600 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('featured')}
          >
            Featured
            {activeTab === 'featured' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600"></div>}
          </button>
          <button 
            className={`py-3 px-4 relative ${activeTab === 'browse' ? 'text-teal-600 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse
            {activeTab === 'browse' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600"></div>}
          </button>
        </div>
      </div>
      
      {/* Smart Product Recommendation */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl overflow-hidden big-shadow">
          <div className="p-4 relative">
            <div className="mb-2 flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FCD34D" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-xl font-bold text-white">Your perfect match</h2>
            </div>
            <p className="text-teal-100 mb-4 max-w-[80%]">Based on your treatments and progress, we've found your ideal combo</p>
            
            <div className="flex items-center mb-4">
              {/* Product images */}
              <div className="relative mr-3">
                <img src="https://via.placeholder.com/240x320" alt="Medication" className="w-24 h-32 object-cover rounded-lg shadow-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <img src="https://via.placeholder.com/180x240" alt="Supplements" className="w-16 h-20 object-cover rounded-lg shadow-lg" />
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                  <svg className="h-3 w-3 text-teal-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xs font-medium bg-white bg-opacity-20 rounded-full px-2 py-1 text-white">
                  +35% Better Results
                </span>
              </div>
            </div>
            
            <div className="flex">
              <button 
                className="bg-yellow-400 text-teal-800 rounded-lg py-2 px-4 font-bold text-sm flex-1 mr-2 shadow-lg"
                onClick={handleViewBundle}
              >
                View Bundle
              </button>
              <button 
                className="bg-white bg-opacity-20 text-white rounded-lg py-2 px-4 font-bold text-sm flex items-center justify-center"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Product */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-[#f0e6d6] to-[#e6ca9a] rounded-xl overflow-hidden big-shadow relative">
          {/* Product image */}
          <img 
            src="https://via.placeholder.com/800x300"
            alt="Weight loss program"
            className="w-full h-56 object-cover mix-blend-overlay opacity-80"
          />
          
          <div className="absolute top-0 left-0 right-0 bottom-0 p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-teal-900">Zappy Weight System</h2>
              <p className="text-teal-800 max-w-[70%] mb-2">Complete treatment plan with proven results</p>
              
              <div className="flex items-center">
                <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 9 L21 15 L3 15 L3 9 C3 5 7 3 12 3 C17 3 21 5 21 9 M6 15 L6 19 C6 20 7 21 8 21 L16 21 C17 21 18 20 18 19 L18 15"></path>
                  </svg>
                  Prescription
                </span>
                <span className="bg-teal-800 text-white text-xs font-bold px-3 py-1 rounded-full ml-2 flex items-center">
                  <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  Most Popular
                </span>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-teal-800 font-medium mb-1">Starter plan</div>
                <div className="text-2xl font-bold text-teal-900">$149<span className="text-sm">/mo</span></div>
              </div>
              <button 
                className="bg-teal-600 text-white py-2 px-5 rounded-lg font-bold shadow-lg flex items-center"
                onClick={() => handleViewDetails('weight-system')}
              >
                Learn More
                <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Discounts Section */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Your referral discounts</h3>
              <p className="text-sm text-gray-500">Savings from friends who signed up</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center bg-yellow-50 rounded-lg p-3">
              {/* Person avatar */}
              <img src="https://via.placeholder.com/32x32" alt="John D." className="w-8 h-8 rounded-full object-cover mr-2 border-2 border-yellow-400" />
              <div className="flex-1 mr-3">
                <h4 className="text-sm font-bold text-gray-800">John D.</h4>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">Joined 2 weeks ago</span>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                $30 Off
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center">
            <div className="flex-1">
              <span className="text-sm font-medium text-teal-600">Total savings: $60</span>
            </div>
            <button 
              className="bg-yellow-400 text-teal-800 py-1.5 px-3 rounded-lg shadow-sm text-xs font-bold flex items-center"
              onClick={handleInviteMore}
            >
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              Invite More
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Shop by category</h2>
          <button 
            className="text-sm font-medium text-teal-600 flex items-center hover:underline"
            onClick={handleViewAllCategories}
          >
            See All
            <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 horizontal-scroll-container">
          {/* Weight Category */}
          <div className="w-60 flex-shrink-0 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl overflow-hidden shadow-md relative">
            <img src="https://via.placeholder.com/240x160" alt="Weight management" className="w-full h-40 object-cover mix-blend-multiply opacity-40" />
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-teal-800 text-lg">Weight</h3>
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-medium text-teal-700">Starting at</span>
                  <div className="font-bold text-teal-900">$39<span className="text-xs">/mo</span></div>
                </div>
                <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center">
                  <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Complete Your Treatments Section */}
      <div className="px-4 py-4 mb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Complete your treatments</h2>
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        
        {/* Weight Management Bundle */}
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-200 mb-4">
          <div className="flex items-center">
            <div className="flex items-center bg-white rounded-xl p-3 shadow-sm mr-4">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img src="https://via.placeholder.com/40x40" alt="Medication" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Wegovy®</h3>
                <p className="text-xs text-gray-500">Your current Rx</p>
              </div>
            </div>
            
            <div className="w-8 flex items-center justify-center">
              <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div className="flex items-center bg-white rounded-xl p-3 shadow-sm flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img src="https://via.placeholder.com/40x40" alt="Supplement" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Protein Power</h3>
                <p className="text-xs text-gray-500">Boost results by 35%</p>
              </div>
              <button 
                className="bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                onClick={() => handleAddProduct('Protein Power')}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default ShopPage;
