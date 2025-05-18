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
            <h1 class="text-xl font-bold text-white">Health</h1>
            <p class="text-white/80 text-sm mt-1">The support you need, when you need it.</p>
          </div>
          <button class="w-9 h-9 bg-white/10 rounded-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=80&h=80&fit=crop&q=80" alt="Profile" class="w-full h-full object-cover" />
          </button>
        </div>
      </header>
      
      <main class="px-6 pt-4 pb-32">
        {/* Recent Messages - Compact Version */}
        <div class="care-card mb-6">
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-base font-semibold text-gray-900">Recent Messages</h3>
              <button class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" aria-label="Compose message">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-3">
              <div class="message-card p-3 bg-blue-50 border-l-3 border-blue-500 relative" onClick={handleMessageCardClick}>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                    </div>
                    <span class="font-medium text-gray-900 text-xs">Dr. Sarah Chen</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-xs text-gray-500">2h</span>
                    <div class="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  </div>
                </div>
                <p class="text-gray-700 text-xs mt-1 ml-8">Great progress! Let's adjust your...</p>
              </div>
              
              <div class="message-card p-3 bg-purple-50 border-l-3 border-purple-500 relative" onClick={handleMessageCardClick}>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                    </div>
                    <span class="font-medium text-gray-900 text-xs">Dr. Michael Torres</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-xs text-gray-500">1d</span>
                    <div class="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                  </div>
                </div>
                <p class="text-gray-700 text-xs mt-1 ml-8">Your photos show excellent progress...</p>
              </div>
            </div>
            
            <button class="w-full text-center text-blue-600 text-sm font-medium mt-3 py-2 hover:bg-blue-50 rounded-lg transition-colors" onClick={handleViewAllMessages}>
              View all messages →
            </button>
          </div>
        </div>
        
        {/* Explore Treatments Section */}
        <div class="mb-6">
          <h2 class="section-title">Explore treatments</h2>
          <p class="section-subtitle">Our most popular programs</p>
          
          {/* Weight Loss */}
          <h3 class="category-title">Weight Loss</h3>
          <div class="program-grid overflow-x-auto">
            <div class="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="tag-new absolute top-3 right-3">New</div>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                <svg class="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h4>Find your custom medication kit</h4>
              <p>Personalized approach</p>
            </div>
            <div class="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="tag-new absolute top-3 right-3">New</div>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                <svg class="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <h4>Identify your eating pattern</h4>
              <p>Behavioral insights</p>
            </div>
            <div class="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                <svg class="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121L15.5 15.5l-2.5-2.5c-.779-.779-2.049-.779-2.828 0L8.5 14.5l-1.304-1.379A3 3 0 002 15v2h5.5v-1"></path>
                </svg>
              </div>
              <h4>GLP-1 Semaglutide</h4>
              <p>Weekly injection</p>
            </div>
            <div class="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                <svg class="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4>Tirzepatide</h4>
              <p>Dual-action therapy</p>
            </div>
            <div class="program-card-small program-weight" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#ecfeff' }}>
                <svg class="w-4 h-4" style={{ color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h4>Nutrition Coaching</h4>
              <p>Personal guidance</p>
            </div>
          </div>
          
          {/* Anti-Aging */}
          <h3 class="category-title">Anti-Aging</h3>
          <div class="program-grid overflow-x-auto">
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <h4>Skincare Kit</h4>
              <p>Complete routine</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h4>Retinol Serum</h4>
              <p>Night treatment</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h4>Vitamin C</h4>
              <p>Brightening serum</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4>Moisturizer</h4>
              <p>Daily hydration</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h4>Sunscreen</h4>
              <p>SPF 50+ protection</p>
            </div>
          </div>
          
          {/* Hair & Skin */}
          <h3 class="category-title">Hair & Skin</h3>
          <div class="program-grid overflow-x-auto">
            <div class="program-card-small program-hair" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m6 1h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z"></path>
                </svg>
              </div>
              <h4>Hair Loss</h4>
              <p>Clinically proven</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <h4>Skincare</h4>
              <p>Anti-aging formula</p>
            </div>
            <div class="program-card-small program-hair" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m6 1h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z"></path>
                </svg>
              </div>
              <h4>Minoxidil</h4>
              <p>Hair regrowth</p>
            </div>
            <div class="program-card-small program-hair" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m6 1h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z"></path>
                </svg>
              </div>
              <h4>Hair Supplements</h4>
              <p>Daily vitamins</p>
            </div>
            <div class="program-card-small program-aging" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg)' }}>
                <svg class="w-4 h-4" style={{ color: 'var(--color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <h4>Acne Treatment</h4>
              <p>Clear skin formula</p>
            </div>
          </div>
          
          {/* Women's Health */}
          <h3 class="category-title">Women's Health</h3>
          <div class="program-grid overflow-x-auto">
            <div class="program-card-small program-women" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="tag-popular absolute top-3 right-3">Popular</div>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fdf2f8' }}>
                <svg class="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h4>Birth Control</h4>
              <p>Monthly supply</p>
            </div>
            <div class="program-card-small program-women" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fdf2f8' }}>
                <svg class="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h4>Hormone Support</h4>
              <p>Balance & wellness</p>
            </div>
            <div class="program-card-small program-women" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fdf2f8' }}>
                <svg class="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h4>Fertility Support</h4>
              <p>Conception help</p>
            </div>
            <div class="program-card-small program-women" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fdf2f8' }}>
                <svg class="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h4>Menopause Support</h4>
              <p>Symptom relief</p>
            </div>
            <div class="program-card-small program-women" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fdf2f8' }}>
                <svg class="w-4 h-4" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4>UTI Prevention</h4>
              <p>Daily protection</p>
            </div>
          </div>
          
          {/* Sexual Health */}
          <h3 class="category-title">Sexual Health</h3>
          <div class="program-grid overflow-x-auto">
            <div class="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                <svg class="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h4>Erectile Dysfunction</h4>
              <p>Effective treatment</p>
            </div>
            <div class="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                <svg class="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4>Genital Herpes</h4>
              <p>Treatment & suppression</p>
            </div>
            <div class="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                <svg class="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4>Testosterone</h4>
              <p>Hormone optimization</p>
            </div>
            <div class="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                <svg class="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4>Premature Ejaculation</h4>
              <p>Lasting solutions</p>
            </div>
            <div class="program-card-small program-ed" style={{ minWidth: '160px', flexShrink: 0 }} onClick={handleProgramCardClick}>
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2' }}>
                <svg class="w-4 h-4" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h4>Low Libido</h4>
              <p>Desire enhancement</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthPage;

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/pages/patients/HealthPage.jsx
- [ts Error] Line 379: Declaration or statement expected.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Type assertion expressions can only be used in TypeScript files.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Identifier expected.
- [ts Error] Line 381: Argument expression expected.
- [ts Error] Line 381: '(' expected.
- [ts Error] Line 381: ')' expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Declaration or statement expected.
- [ts Error] Line 381: Declaration or statement expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: ';' expected.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Unexpected keyword or identifier.
- [ts Error] Line 381: Identifier expected.
- [ts Error] Line 385: Unknown keyword or identifier. Did you mean 'new'?
- [ts Error] Line 385: Unexpected keyword or identifier.
- [ts Error] Line 385: Unexpected keyword or identifier.
- [ts Error] Line 385: Unexpected keyword or identifier.
- [ts Error] Line 385: Unexpected keyword or identifier.
- [ts Error] Line 385: Unexpected keyword or identifier.
- [ts Error] Line 387: ',' expected.
- [ts Error] Line 387: ';' expected.
- [ts Error] Line 387: ';' expected.
- [ts Error] Line 387: Unexpected keyword or identifier.
- [ts Error] Line 387: Unexpected keyword or identifier.
- [ts Error] Line 387: Unexpected keyword or identifier.
- [ts Error] Line 388: Identifier expected.
- [ts Error] Line 388: ',' expected.
- [ts Error] Line 388: ';' expected.
- [ts Error] Line 388: ';' expected.
- [ts Error] Line 388: ';' expected.
- [ts Error] Line 389: Identifier expected.
- [ts Error] Line 389: ',' expected.
- [ts Error] Line 389: ';' expected.
- [ts Error] Line 389: ';' expected.
- [ts Error] Line 389: Unexpected keyword or identifier.
- [ts Error] Line 389: Unexpected keyword or identifier.
- [ts Error] Line 389: Unexpected keyword or identifier.
- [ts Error] Line 390: Identifier expected.
- [ts Error] Line 390: ',' expected.
- [ts Error] Line 390: ';' expected.
- [ts Error] Line 390: ';' expected.
- [ts Error] Line 390: Unexpected keyword or identifier.
- [ts Error] Line 390: Unexpected keyword or identifier.
- [ts Error] Line 390: Unexpected keyword or identifier.
- [ts Error] Line 391: Identifier expected.
- [ts Error] Line 391: ',' expected.
- [ts Error] Line 391: ';' expected.
- [ts Error] Line 391: ';' expected.
- [ts Error] Line 391: Unexpected keyword or identifier.
- [ts Error] Line 391: Unexpected keyword or identifier.
- [ts Error] Line 391: Unexpected keyword or identifier.
- [ts Error] Line 392: Identifier expected.
- [ts Error] Line 392: ',' expected.
- [ts Error] Line 392: ';' expected.
- [ts Error] Line 392: ';' expected.
- [ts Error] Line 392: Unexpected keyword or identifier.
- [ts Error] Line 392: Unexpected keyword or identifier.
- [ts Error] Line 392: Unexpected keyword or identifier.
- [ts Error] Line 393: Identifier expected.
- [ts Error] Line 393: ',' expected.
- [ts Error] Line 393: ';' expected.
- [ts Error] Line 393: ';' expected.
- [ts Error] Line 393: Unexpected keyword or identifier.
- [ts Error] Line 393: Unexpected keyword or identifier.
- [ts Error] Line 393: Unexpected keyword or identifier.
- [ts Error] Line 394: Identifier expected.
- [ts Error] Line 394: ',' expected.
- [ts Error] Line 394: ';' expected.
- [ts Error] Line 394: ';' expected.
- [ts Error] Line 394: Unexpected keyword or identifier.
- [ts Error] Line 394: Unexpected keyword or identifier.
- [ts Error] Line 394: Unexpected keyword or identifier.
- [ts Error] Line 395: Identifier expected.
- [ts Error] Line 395: ',' expected.
- [ts Error] Line 395: ';' expected.
- [ts Error] Line 395: ';' expected.
- [ts Error] Line 395: Unexpected keyword or identifier.
- [ts Error] Line 395: Unexpected keyword or identifier.
- [ts Error] Line 395: Unexpected keyword or identifier.
- [ts Error] Line 396: Identifier expected.
- [ts Error] Line 396: ',' expected.
- [ts Error] Line 396: ';' expected.
- [ts Error] Line 396: ';' expected.
- [ts Error] Line 396: Unexpected keyword or identifier.
- [ts Error] Line 397: Identifier expected.
- [ts Error] Line 397: ',' expected.
- [ts Error] Line 397: ';' expected.
- [ts Error] Line 397: ';' expected.
- [ts Error] Line 397: ';' expected.
- [ts Error] Line 398: Identifier expected.
- [ts Error] Line 398: ',' expected.
- [ts Error] Line 398: ';' expected.
- [ts Error] Line 398: ';' expected.
- [ts Error] Line 398: ';' expected.
- [ts Error] Line 399: Identifier expected.
- [ts Error] Line 399: ',' expected.
- [ts Error] Line 399: ';' expected.
- [ts Error] Line 399: ';' expected.
- [ts Error] Line 399: ';' expected.
- [ts Error] Line 400: Identifier expected.
- [ts Error] Line 400: ',' expected.
- [ts Error] Line 400: ';' expected.
- [ts Error] Line 400: ';' expected.
- [ts Error] Line 400: ';' expected.
- [ts Error] Line 401: Identifier expected.
- [ts Error] Line 401: ',' expected.
- [ts Error] Line 401: ';' expected.
- [ts Error] Line 401: ';' expected.
- [ts Error] Line 401: ';' expected.
- [ts Error] Line 402: Identifier expected.
- [ts Error] Line 402: ',' expected.
- [ts Error] Line 402: ';' expected.
- [ts Error] Line 402: ';' expected.
- [ts Error] Line 402: Unexpected keyword or identifier.
- [ts Error] Line 403: Identifier expected.
- [ts Error] Line 403: ',' expected.
- [ts Error] Line 403: ';' expected.
- [ts Error] Line 403: ';' expected.
- [ts Error] Line 403: ';' expected.
- [ts Error] Line 404: Identifier expected.
- [ts Error] Line 404: ',' expected.
- [ts Error] Line 404: ';' expected.
- [ts Error] Line 404: ';' expected.
- [ts Error] Line 404: Unexpected keyword or identifier.
- [ts Error] Line 405: Identifier expected.
- [ts Error] Line 405: ',' expected.
- [ts Error] Line 405: ';' expected.
- [ts Error] Line 405: ';' expected.
- [ts Error] Line 405: ';' expected.
- [ts Error] Line 406: Identifier expected.
- [ts Error] Line 406: ',' expected.
- [ts Error] Line 406: ';' expected.
- [ts Error] Line 406: ';' expected.
- [ts Error] Line 406: Unexpected keyword or identifier.
- [ts Error] Line 407: Identifier expected.
- [ts Error] Line 407: ',' expected.
- [ts Error] Line 407: ';' expected.
- [ts Error] Line 407: ';' expected.
- [ts Error] Line 407: ';' expected.
- [ts Error] Line 408: Identifier expected.
- [ts Error] Line 408: ',' expected.
- [ts Error] Line 408: ';' expected.
- [ts Error] Line 408: ';' expected.
- [ts Error] Line 408: Unexpected keyword or identifier.
- [ts Error] Line 409: Identifier expected.
- [ts Error] Line 409: ',' expected.
- [ts Error] Line 409: ';' expected.
- [ts Error] Line 409: ';' expected.
- [ts Error] Line 409: ';' expected.
- [ts Error] Line 410: Identifier expected.
- [ts Error] Line 410: ',' expected.
- [ts Error] Line 410: ';' expected.
- [ts Error] Line 410: ';' expected.
- [ts Error] Line 410: ';' expected.
- [ts Error] Line 411: Identifier expected.
- [ts Error] Line 411: ',' expected.
- [ts Error] Line 411: ';' expected.
- [ts Error] Line 411: ';' expected.
- [ts Error] Line 411: Unexpected keyword or identifier.
- [ts Error] Line 412: Identifier expected.
- [ts Error] Line 412: ',' expected.
- [ts Error] Line 412: ';' expected.
- [ts Error] Line 412: ';' expected.
- [ts Error] Line 412: Unexpected keyword or identifier.
- [ts Error] Line 412: Unexpected keyword or identifier.
- [ts Error] Line 412: Unexpected keyword or identifier.
- [ts Error] Line 413: Identifier expected.
- [ts Error] Line 413: ',' expected.
- [ts Error] Line 413: ';' expected.
- [ts Error] Line 413: ';' expected.
- [ts Error] Line 413: ';' expected.
- [ts Error] Line 413: Unexpected keyword or identifier.
- [ts Error] Line 413: Unexpected keyword or identifier.
- [ts Error] Line 413: ';' expected.
- [ts Error] Line 414: Identifier expected.
- [ts Error] Line 414: ',' expected.
- [ts Error] Line 414: ';' expected.
- [ts Error] Line 414: ';' expected.
- [ts Error] Line 414: ';' expected.
- [ts Error] Line 414: Unexpected keyword or identifier.
- [ts Error] Line 414: Unexpected keyword or identifier.
- [ts Error] Line 414: ';' expected.
- [ts Error] Line 415: Identifier expected.
- [ts Error] Line 415: ',' expected.
- [ts Error] Line 415: ';' expected.
- [ts Error] Line 415: ';' expected.
- [ts Error] Line 415: ';' expected.
- [ts Error] Line 415: Unexpected keyword or identifier.
- [ts Error] Line 415: Unexpected keyword or identifier.
- [ts Error] Line 415: ';' expected.
- [ts Error] Line 415: Identifier expected.
- [ts Error] Line 416: Invalid character.
- [ts Error] Line 416: ';' expected.
- [ts Error] Line 416: Unexpected keyword or identifier.
- [ts Error] Line 419: Invalid character.
- [ts Error] Line 419: ';' expected.
- [ts Error] Line 419: Unexpected keyword or identifier.
- [ts Error] Line 425: Numeric separators are not allowed here.
- [ts Error] Line 425: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 433: Numeric separators are not allowed here.
- [ts Error] Line 433: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 478: Numeric separators are not allowed here.
- [ts Error] Line 478: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 481: Numeric separators are not allowed here.
- [ts Error] Line 481: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 503: Numeric separators are not allowed here.
- [ts Error] Line 503: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 507: Numeric separators are not allowed here.
- [ts Error] Line 507: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 513: Numeric separators are not allowed here.
- [ts Error] Line 513: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 519: Numeric separators are not allowed here.
- [ts Error] Line 519: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 528: Numeric separators are not allowed here.
- [ts Error] Line 528: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 546: Numeric separators are not allowed here.
- [ts Error] Line 546: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 553: Numeric separators are not allowed here.
- [ts Error] Line 553: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 668: Numeric separators are not allowed here.
- [ts Error] Line 668: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 689: Numeric separators are not allowed here.
- [ts Error] Line 689: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 692: Numeric separators are not allowed here.
- [ts Error] Line 692: An identifier or keyword cannot immediately follow a numeric literal.
- [ts Error] Line 696: Invalid character.
- [ts Error] Line 696: ';' expected.
- [ts Error] Line 697: ';' expected.
- [ts Error] Line 697: ';' expected.
- [ts Error] Line 697: ';' expected.
- [ts Error] Line 697: ',' expected.
- [ts Error] Line 697: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 699: Invalid character.
- [ts Error] Line 699: ';' expected.
- [ts Error] Line 699: Unexpected keyword or identifier.
- [ts Error] Line 700: Decimals with leading zeros are not allowed.
- [ts Error] Line 700: ';' expected.
- [ts Error] Line 700: Unexpected keyword or identifier.
- [ts Error] Line 700: Expression expected.
- [ts Error] Line 702: Invalid character.
- [ts Error] Line 702: ';' expected.
- [ts Error] Line 703: Unexpected keyword or identifier.
- [ts Error] Line 704: Declaration or statement expected.
- [ts Error] Line 704: Expression expected.<environment_details>
# VSCode Visible Files
src/pages/patients/HealthPage.jsx

# VSCode Open Tabs
src/components/ui/StatusBadge.jsx
src/components/ui/SearchBar.jsx
src/components/ui/PageHeader.jsx
src/components/ui/LoadingSpinner.jsx
src/pages/patients/HomePageV2.jsx
supabase/migrations/20240506000000_create_patient_service_enrollments.sql
src/components/ui/Modal.jsx
src/components/patient/ModularServiceInterface.css
src/pages/cart/CartPage.jsx
src/components/patient/MedicationInstructionsModal.jsx
src/components/patient/WeightConfirmationModal.jsx
src/apis/subscriptionPlans/hooks.js
src/apis/patientServices/api.js
supabase/migrations/20240507000000_create_ai_tables.sql
src/apis/ai/api.js
src/apis/ai/hooks.js
src/components/ai/PromptManagement.jsx
src/components/ai/PromptModal.jsx
src/components/ui/DecorativeElement.jsx
src/components/ai/AISettings.jsx
src/components/ai/AILogs.jsx
src/pages/admin/AIDashboardPage.jsx
medication-adherence-tracker.html
symptom-monitoring-interface.html
treatment-timeline-visualization.html
pre-consultation-preparation.html
simplified-patient-homepage.html
balanced-patient-homepage.html
sharing-instructions.md
share-app.sh
src/components/notes/NoteViewModal.jsx
src/components/notifications/NotificationsCenter.jsx
src/components/orders/OrderDetailModal.jsx
src/pages/billing/PatientBillingPage.jsx
src/pages/forms/PatientFormsPage.jsx
src/pages/notifications/NotificationsPage.jsx
src/pages/orders/PatientOrderHistoryPage.jsx
src/pages/payment/PaymentMethodsPage.jsx
src/pages/products/ProductManagement.jsx
src/pages/profile/PatientProfilePage.jsx
src/pages/records/PatientRecordsPage.jsx
src/components/ai/AIMetrics.jsx
vite.config.js
src/hooks/usePatientTreatmentProgram.js
src/components/patient/CrossSellSection.jsx
src/hooks/useRecommendedProducts.js
src/apis/products/hooks.js
src/apis/services/hooks.js
src/utils/auditLogService.js
src/apis/patients/api.js
src/components/subscriptions/ConsolidatedSubscriptions.jsx
src/apis/consultations/hooks.js
src/pages/consultations/InitialConsultationNotes.jsx
src/pages/consultations/InitialConsultations.js
src/components/forms/FormSelectionModal.jsx
src/apis/forms/hooks.js
src/pages/consultations/components/ConsultationListTable.jsx
src/pages/sessions/Sessions.js
supabase/migrations/20250507000000_add_missing_columns_to_orders.sql
Updated/ORDERS_SCHEMA_UPDATE.md
apply-orders-migration.sh
supabase/migrations/20250507000100_add_subscription_plan_id_to_discounts.sql
apply-discounts-migration.sh
Updated/DISCOUNTS_SUBSCRIPTION_INTEGRATION.md
src/pages/discounts/DiscountManagement.jsx
src/apis/discounts/hooks.js
src/components/ui/ChildishDrawingElement.jsx
src/theme.js
src/components/ui/redesign/Button.jsx
src/components/ui/redesign/StatusBadge.jsx
Updated/INVOICE_FEATURES_IMPLEMENTATION.md
src/components/ui/redesign/AccessibleModal.jsx
src/components/invoices/CreateInvoiceModal.jsx
src/components/invoices/EditInvoiceModal.jsx
src/pages/invoices/InvoicePage.jsx
src/apis/invoices/api.js
src/apis/invoices/hooks.js
src/pages/invoices/InvoiceDetailPage.jsx
apply-tasks-migration.sh
src/apis/tasks/hooks.js
src/pages/tasks/TaskModal.jsx
src/pages/tasks/TaskManagement.js
Updated/TASK_MANAGEMENT_IMPROVEMENTS.md
supabase/migrations/20250509000000_add_created_by_to_tasks.sql
prisma/schema.prisma
src/apis/providers/hooks.js
apply-provider-migration.sh
supabase/migrations/20250510000000_update_providers_table.sql
Updated/PROVIDER_ENHANCEMENTS.md
src/apis/pharmacies/hooks.js
src/components/insurance/CreatePatientForm.jsx
src/pages/insurance/components/ViewInsuranceRecordModal.jsx
src/apis/insurances/hooks.js
supabase/migrations/20250511000000_add_prior_auth_fields_to_insurance.sql
apply-insurance-migration.sh
Updated/INSURANCE_ENHANCEMENTS.md
src/context/AuthContext.jsx
src/lib/supabase.js
add-test-patient.js
supabase/migrations/20250512000000_create_patients_table.sql
apply-patients-migration.sh
create-patients-table.js
src/pages/insurance/components/AddInsuranceRecordModal.jsx
src/pages/tags/TagManagement.jsx
src/pages/patients/Patients.jsx
src/pages/common/TagField.jsx
src/apis/patients/hooks.js
src/apis/tags/hooks.js
supabase/migrations/20250513000000_create_messaging_tables.sql
apply-messaging-migration.sh
src/utils/encryption.js
src/pages/messaging/components/MessageAttachmentModal.jsx
update-dependencies.sh
src/pages/messaging/components/NewConversationModal.jsx
src/pages/messaging/components/MessageTemplateModal.jsx
src/apis/messaging/api.js
Updated/MESSAGING_SYSTEM_IMPLEMENTATION.md
Updated/MESSAGING_SYSTEM_IMPROVEMENTS.md
src/apis/messaging/hooks.js
apply-subscription-duration-migration.sh
add-duration-days-column.js
src/apis/subscriptionDurations/hooks.js
src/pages/messaging/components/ConversationList.jsx
src/pages/messaging/components/MessageView.jsx
src/pages/messaging/MessagingPage.jsx
src/apis/bundles/hooks.js
supabase/migrations/20250515000000_create_bundles_table.sql
cleanup-deprecated-components.sh
src/components/subscriptions/SubscriptionPlanSelection.jsx
Updated/PRODUCTS_SUBSCRIPTIONS_SYSTEM.md
src/utils/errorHandling.js
apply-bundles-migration.sh
apply-categories-migration.sh
supabase/migrations/20240501000000_create_categories_table.sql
src/apis/categories/hooks.js
.env
docs/sample_program_content.md
src/constants/SidebarItems.js
src/constants/AppRoutes.jsx
src/pages/patients/PatientHomePage.jsx
src/hooks/usePatientServicesData.js
create-categories-table.js
create-test-category.js
src/constants/serviceTypes.js
src/services/measurementService.js
src/hooks/useMeasurements.js
src/components/patient/GenericMeasurementModal.jsx
src/components/patient/MeasurementEntryFactory.jsx
src/components/patient/MeasurementProgress.jsx
src/components/patient/MeasurementChart.jsx
src/components/patient/PatientMeasurementSection.jsx
src/pages/patients/PatientMeasurementsPage.jsx
docs/PATIENT_MEASUREMENT_TRACKING.md
src/apis/educationalResources/hooks.js
src/apis/educationalResources/mockData.js
src/apis/educationalResources/api.js
Updated/EDUCATIONAL_RESOURCES_INTEGRATION.md
apply-educational-resources-migration.sh
Updated/EDUCATIONAL_RESOURCES_COMPARISON.md
src/components/patient/ServiceResourcesSection.jsx
src/components/patient/ModularServiceInterface.jsx
src/hooks/useBundleForm.js
src/components/admin/BundleModal.jsx
src/hooks/useCategoryForm.js
src/components/admin/CategoryModal.jsx
src/hooks/useProductForm.js
src/components/admin/ProductModal.jsx
src/hooks/useResourceForm.js
src/components/admin/ResourceModal.jsx
src/components/admin/ServiceModal.jsx
src/hooks/useSubscriptionPlanForm.js
src/components/admin/SubscriptionPlanModal.jsx
src/utils/filterUtils.js
src/pages/admin/ProductSubscriptionManagement.jsx
src/hooks/useResourceFilters.js
src/hooks/useSubscriptionDurationForm.js
src/pages/admin/SubscriptionDurationsPage.jsx
src/components/ui/Toast.jsx
src/hooks/useProviderFilters.js
src/components/patient/homepage/PriorityActionCard.jsx
src/components/patient/homepage/TreatmentCard.jsx
src/components/ui/redesign/ProductCard.jsx
src/components/patient/homepage/MessageCard.jsx
src/components/patient/homepage/LearningCard.jsx
src/components/patient/program/ProgramGoalCard.jsx
src/components/patient/program/WeeklyTasksSection.jsx
src/components/patient/program/ProgressTrackingSection.jsx
src/components/patient/program/ResourcesSection.jsx
src/components/patient/program/ContactCoachCard.jsx
src/components/patient/services/ServicesHeader.jsx
src/components/patient/services/ServicesSection.jsx
src/components/patient/services/WeightLoggingModal.jsx
src/components/patient/services/SubscriptionPlanModal.jsx
src/components/patient/services/PatientServicesHeader.jsx
src/components/patient/services/PriorityActionCard.jsx
src/components/patient/services/PatientServicesTabs.jsx
src/components/patient/services/TreatmentsTabContent.jsx
src/hooks/usePatientFormActions.js
src/pages/patients/patientDetails/PatientForms.jsx
src/hooks/usePatientFollowUpNotes.js
src/pages/patients/patientDetails/PatientFollowUpNotesModal.jsx
src/utils/formatDate.js
src/components/patient/programs/ProgramsHeader.jsx
src/components/patient/programs/ProgramCategoryTabs.jsx
src/hooks/usePatientServiceModals.js
src/components/patient/shop/ShopHeader.jsx
src/components/patient/shop/ReferralBanner.jsx
src/components/patient/shop/ShopNavigationTabs.jsx
src/components/patient/shop/SmartProductRecommendation.jsx
src/layouts/MainLayout.jsx
src/components/ui/redesign/TopNavigation.jsx
src/components/ui/redesign/BottomNavigation.jsx
src/pages/patients/home/PatientHomePage.css
src/pages/patients/health/HealthPage.css
src/pages/patients/HealthPage.jsx
src/components/patient/shop/FeaturedProduct.jsx
src/components/patient/shop/ReferralDiscountsSection.jsx
src/components/patient/shop/CategoriesSection.jsx
src/components/patient/shop/CompleteTreatmentsSection.jsx
src/pages/patients/shop/ShopPage.css
src/components/patient/programs/NextUpSection.jsx
src/pages/patients/programs/FeaturedProgramBanner.jsx
src/pages/patients/programs/BetterSexSection.jsx
src/pages/patients/programs/WeightManagementSection.jsx
src/pages/patients/programs/ProgramsPage.css
src/pages/patients/ProgramsPage.jsx
src/components/patient/program/CrossSellingSection.jsx
src/pages/patients/PatientProgramContent.jsx
src/pages/patients/services/PatientServicesPage.css
src/pages/patients/PatientServicesPage.jsx
src/components/patient/services/MessagesTabContent.jsx
src/components/patient/services/InsightsTabContent.jsx
src/pages/patients/ShopPage.jsx
src/hooks/useProviderForm.js
src/hooks/useServiceForm.js
src/components/patient/program/ProgramSummaryCard.jsx
src/components/ui/Pagination.jsx
src/pages/admin/ResourceManagementPage.jsx
src/pages/providers/ProviderManagement.jsx
src/components/patient/sessions/SessionTypeTag.jsx
src/components/patient/sessions/SessionStatusBadge.jsx
src/pages/patients/patientDetails/PatientSessions.jsx
src/pages/patients/ModularPatientServicesPage.jsx
src/pages/dashboard/ProviderDashboard.jsx
src/pages/marketplace/MarketplacePage.jsx
src/pages/dashboard/PatientDashboard.jsx
src/pages/shop/ShopPage.jsx
src/pages/insurance/InsuranceDocumentation.jsx
supabase/migrations/20250508000000_add_invoice_features.sql
apply-invoice-features-migration.sh
src/pages/consultations/components/PatientInfoSection.jsx
src/utils/placeholderImages.js
src/pages/auth/Signup.jsx
src/pages/patients/patientDetails/PatientFollowUpNotes
src/pages/patients/patientDetails/PatientHeader.jsx
src/pages/patients/patientDetails/PatientInfo.jsx
src/components/orders/CreateOrderModal.jsx
src/pages/patients/patientDetails/PatientOrders.jsx
src/pages/orders/Orders.js
src/pages/patients/PatientServicesPageV3.jsx
src/pages/patients/PatientServicesEmptyState.jsx
src/pages/patients/PatientDashboardPage.jsx
src/pages/patients/TestPage.jsx
src/pages/patients/DirectPatientHomePage.jsx
src/pages/program/PatientProgramPage.jsx
src/context/AppContext.jsx
src/pages/patients/PatientSubscriptionContent.jsx
src/pages/patients/PatientSubscriptionPage.jsx
src/components/subscriptions/PatientSubscriptionDetails.jsx
supabase/migrations/20240505000000_create_educational_resources.sql
src/components/resources/ResourceCard.jsx
src/components/resources/ResourceCategoryTabs.jsx
supabase/migrations/20250515111250_create_program_content_tables.sql
src/utils/ContentRecommendationEngine.js
src/hooks/useProgramContent.js

# Current Time
5/17/2025, 9:33:12 PM (America/Los_Angeles, UTC-7:00)

# Context Window Usage
800,734 / 1,048.576K tokens used (76%)

# Current Mode
ACT MODE
</environment_details>
