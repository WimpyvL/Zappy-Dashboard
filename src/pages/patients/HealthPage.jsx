import React, { useState, useEffect } from 'react';
import './health/HealthPage.css'; // Import the new CSS file
import { MessageSquare, Share2, HelpCircle, ChevronRight } from 'lucide-react'; // Import icons

const HealthPage = () => {
  // State for mobile optimization
  const [activeCategory, setActiveCategory] = useState('weight');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll events for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Placeholder handlers for interactions
  const handleMessageCardClick = () => {
    console.log('Open message/conversation');
  };

  const handleProgramCardClick = () => {
    console.log('Open program details');
  };

  const handleViewAllMessages = () => {
    console.log('Navigate to full messages view');
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Find the category element and scroll to it
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="header-gradient pt-6 pb-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Health</h1>
            <p className="text-white/80 text-sm mt-1">The support you need, when you need it.</p>
          </div>
          <button className="w-9 h-9 bg-white/10 rounded-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=80&h=80&fit=crop&q=80" alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>
      
      <main className="px-6 pt-4 pb-32">
        {/* Recent Messages - Compact Version */}
        <div className="care-card mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Recent Messages</h3>
              <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" aria-label="Compose message">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="message-card p-3 bg-blue-50 border-l-3 border-blue-500 relative" onClick={handleMessageCardClick}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">Dr. Sarah Chen</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">2h</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  </div>
                </div>
                <p className="text-gray-700 text-xs mt-1 ml-8">Great progress! Let's adjust your...</p>
              </div>
              
              <div className="message-card p-3 bg-purple-50 border-l-3 border-purple-500 relative" onClick={handleMessageCardClick}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">Dr. Michael Torres</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">1d</span>
                    <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                  </div>
                </div>
                <p className="text-gray-700 text-xs mt-1 ml-8">Your photos show excellent progress...</p>
              </div>
            </div>
            
            <button className="w-full text-center text-blue-600 text-sm font-medium mt-3 py-2 hover:bg-blue-50 rounded-lg transition-colors" onClick={handleViewAllMessages}>
              View all messages →
            </button>
          </div>
        </div>
        
        {/* Explore Treatments Section */}
        <div className="mb-6">
          <h2 className="section-title">Explore treatments</h2>
          <p className="section-subtitle">Our most popular programs</p>
          
          {/* Categories */}
          <div className="categories-section">
            {/* Weight Loss */}
            <h3 className="category-title">Weight Loss</h3>
            <div className="program-grid overflow-x-auto">
              {/* Program cards would go here */}
              <div className="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="tag-new absolute top-3 right-3">New</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                  <svg className="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <h4>Find your custom medication kit</h4>
                <p>Personalized approach</p>
              </div>
              
              <div className="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                  <svg className="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h4>Nutrition Coaching</h4>
                <p>Personal guidance</p>
              </div>
            </div>
            
            {/* Anti-Aging */}
            <h3 className="category-title">Anti-Aging</h3>
            <div className="program-grid overflow-x-auto">
              <div className="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <h4>Skincare Kit</h4>
                <p>Complete routine</p>
              </div>
              
              <div className="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <h4>Sunscreen</h4>
                <p>SPF 50+ protection</p>
              </div>
            </div>
            
            {/* Sexual Health */}
            <h3 className="category-title">Sexual Health</h3>
            <div className="program-grid overflow-x-auto">
              <div className="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                  <svg className="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <h4>Erectile Dysfunction</h4>
                <p>Effective treatment</p>
              </div>
              
              <div className="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                  <svg className="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4>Premature Ejaculation</h4>
                <p>Lasting solutions</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthPage;
