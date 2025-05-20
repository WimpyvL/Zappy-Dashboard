import React from 'react';
import { 
  ChevronLeft, Plus, User, Home, FileText, ShoppingBag, 
  TrendingDown, Heart, Edit, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import Button from '../../components/ui/redesign/Button';

const PatientServicesEmptyState = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Custom CSS
  const customStyles = `
    .scroll-snap-x {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .scroll-snap-x > div {
      scroll-snap-align: start;
    }
    .avatar-placeholder {
      width: 3rem; /* 48px */
      height: 3rem; /* 48px */
      background-color: #e5e7eb; /* gray-200 */
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280; /* gray-500 */
      font-size: 0.75rem;
    }
    .avatar-placeholder.small {
      width: 1.5rem; 
      height: 1.5rem; 
      font-size: 0.6rem;
    }
    /* Style for inactive tabs */
    .tab-inactive {
      opacity: 0.6;
      cursor: default; /* Indicate non-interactive */
    }
    /* Highlight the Add button */
    .tab-add {
      background-color: white;
      color: #0d9488; /* teal-600 */
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
    .tab-add:hover {
      background-color: #f0fdfa; /* teal-50 */
    }
  `;

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      <style>{customStyles}</style>
      
      {/* Status Bar */}
      <div className="h-8 bg-gray-800"></div>
      
      {/* Header Section */}
      <div className="bg-teal-600 px-4 py-4">
        <div className="flex items-center mb-3">
          <button 
            className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">My Treatments</h1>
            <p className="text-teal-100 text-sm">Start your personalized journey</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="relative">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button className="tab-inactive flex-shrink-0 px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              Weight
            </button>
            <button className="tab-inactive flex-shrink-0 px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4Z" fill="white"/>
                <path d="M14.5 8.80273C13.7097 8.33056 12.8136 8 12 8C11.1864 8 10.2903 8.33056 9.5 8.80273V12H14.5V8.80273Z" fill="white"/>
                <path d="M8 17.5C8 18.3284 8.67157 19 9.5 19H14.5C15.3284 19 16 18.3284 16 17.5V12H8V17.5Z" fill="white"/>
              </svg>
              Hair
            </button>
            <button className="tab-inactive flex-shrink-0 px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-1 text-white" />
              Sexual Health
            </button>
            <button 
              className="tab-add flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center"
              onClick={() => navigate('/treatments/add')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Treatment
            </button>
          </div>
        </div>
      </div>

      {/* Provider Support Card */}
      <div className="px-4 pt-6 pb-2">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl shadow-md overflow-hidden p-4 flex items-center space-x-4">
          <div className="flex-shrink-0 relative">
            <div className="avatar-placeholder">Dr.</div>
            <div className="avatar-placeholder small absolute -bottom-1 -right-1 border-2 border-teal-50">Sup</div>
            <div className="avatar-placeholder small absolute -top-1 -right-1 border-2 border-teal-50">Rx</div>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Support When You Need It</h2>
            <p className="text-sm text-gray-600">Our licensed providers and support team are here to guide you.</p>
            <a href="#" className="text-teal-600 hover:underline text-sm font-medium mt-1 inline-block">Meet the Team</a>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="px-4 pt-2 pb-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
          <h3 className="text-base font-bold text-gray-800 mb-2">Getting Started</h3>
          <p className="text-sm text-gray-600 mb-3">Start your health journey with these simple steps:</p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                1
              </div>
              <p className="text-sm text-gray-700">Explore treatment options below and select what interests you</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                2
              </div>
              <p className="text-sm text-gray-700">Complete a short health assessment for personalized care</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 text-teal-600 font-bold text-xs">
                3
              </div>
              <p className="text-sm text-gray-700">Connect with a provider to discuss your treatment plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exploration Section */}
      <div className="px-4 pt-2 pb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Explore Treatment Options</h2>

        {/* Weight Loss Section */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Weight Loss</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <TrendingDown className="h-6 w-6 text-teal-400 mb-1" />
              <p className="text-sm font-medium text-gray-800">Medication Kits</p>
              <p className="text-xs text-gray-500">Find your custom Rx</p>
            </a>
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <FileText className="h-6 w-6 text-teal-400 mb-1" />
              <p className="text-sm font-medium text-gray-800">Identify Eating Patterns</p>
              <p className="text-xs text-gray-500">Understand habits</p>
            </a>
          </div>
        </div>

        {/* Hair & Skin Section */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Hair & Skin</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <svg className="h-6 w-6 text-teal-400 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4Z" fill="#0d9488"/>
                <path d="M14.5 8.80273C13.7097 8.33056 12.8136 8 12 8C11.1864 8 10.2903 8.33056 9.5 8.80273V12H14.5V8.80273Z" fill="#0d9488"/>
                <path d="M8 17.5C8 18.3284 8.67157 19 9.5 19H14.5C15.3284 19 16 18.3284 16 17.5V12H8V17.5Z" fill="#0d9488"/>
              </svg>
              <p className="text-sm font-medium text-gray-800">Hair Loss Solutions</p>
              <p className="text-xs text-gray-500">Explore Rx options</p>
            </a>
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <Sparkles className="h-6 w-6 text-teal-400 mb-1" />
              <p className="text-sm font-medium text-gray-800">Skincare Programs</p>
              <p className="text-xs text-gray-500">Address concerns</p>
            </a>
          </div>
        </div>

        {/* Sexual Health Section */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Sexual Health</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <Heart className="h-6 w-6 text-teal-400 mb-1" />
              <p className="text-sm font-medium text-gray-800">Explore Programs</p>
              <p className="text-xs text-gray-500">View options</p>
            </a>
            <a href="#" className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <Edit className="h-6 w-6 text-teal-400 mb-1" />
              <p className="text-sm font-medium text-gray-800">Consult a Specialist</p>
              <p className="text-xs text-gray-500">Get expert advice</p>
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation is now handled by MainLayout.jsx */}
      
      {/* Referral Banner */}
      <div className="px-4 py-2 mb-16">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0">
              <User className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Invite friends & save</h3>
              <p className="text-white text-sm opacity-90">Get $30 credit when friends join Zappy.</p>
            </div>
            <Button 
              variant="secondary"
              className="bg-white text-yellow-500 hover:bg-yellow-50"
              onClick={() => {}}
            >
              Invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientServicesEmptyState;
