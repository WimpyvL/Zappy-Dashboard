import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategories } from '../../apis/categories/hooks';
import { 
  useEducationalResources, 
  useFeaturedResources,
  useRecentResources 
} from '../../apis/educationalResources/hooks';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ResourceCard from '../../components/resources/ResourceCard';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  FileText, 
  BookOpen, 
  AlertTriangle,
  Zap,
  User,
  Activity
} from 'lucide-react';

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [contentTypeFilter, setContentTypeFilter] = useState(searchParams.get('type') || 'all');

  // Get categories
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  // Get resources with filters
  const filters = {
    category: activeCategory !== 'all' ? activeCategory : undefined,
    contentType: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
    searchTerm: searchTerm || undefined,
  };

  const { 
    data: resources, 
    isLoading: isLoadingResources, 
    error 
  } = useEducationalResources(filters);

  // Get featured resources
  const { data: featuredResources, isLoading: isLoadingFeatured } = useFeaturedResources(2);
  
  // Get recent resources
  const { data: recentResources, isLoading: isLoadingRecent } = useRecentResources(4);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (contentTypeFilter !== 'all') {
      params.set('type', contentTypeFilter);
    }
    
    setSearchParams(params, { replace: true });
  }, [activeCategory, searchTerm, contentTypeFilter, setSearchParams]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Reset content type filter when changing category
    setContentTypeFilter('all');
  };

  // Format content type for display
  const formatContentType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get content type badge color
  const getContentTypeBadgeColor = (type) => {
    switch (type) {
      case 'medication_guide':
        return 'bg-blue-100 text-blue-800';
      case 'usage_guide':
        return 'bg-green-100 text-green-800';
      case 'side_effect':
        return 'bg-red-100 text-red-800';
      case 'condition_info':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get quick guide icon
  const getQuickGuideIcon = (index) => {
    switch (index % 3) {
      case 0:
        return <Zap className="h-6 w-6" />;
      case 1:
        return <User className="h-6 w-6" />;
      case 2:
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  // Get quick guide color
  const getQuickGuideColor = (index) => {
    switch (index % 4) {
      case 0:
        return 'bg-blue-100 text-blue-600';
      case 1:
        return 'bg-green-100 text-green-600';
      case 2:
        return 'bg-red-100 text-red-600';
      case 3:
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Placeholder data for quick guides
  const quickGuides = [
    {
      title: 'Getting Started with Your Treatment',
      description: 'What to expect in your first weeks'
    },
    {
      title: 'Working with Your Care Team',
      description: 'How to get the most from your provider'
    },
    {
      title: 'Managing Side Effects',
      description: 'Common side effects and strategies'
    }
  ];

  // Render placeholder content if database tables don't exist yet
  if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
    return (
      <div className="bg-gray-50 text-gray-900 pb-20">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <h1 className="text-lg font-bold ml-1">Treatment Resources</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2">
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-6">
          {/* Subscription Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Subscribe for Personalized Resources</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Get content tailored to your treatment plan.</p>
                </div>
                <div className="mt-3">
                  <Link 
                    to="/subscription" 
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-800"
                  >
                    View plans
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Category Scrollable Tabs */}
          <div className="mb-6">
            <div className="flex overflow-x-auto py-2 space-x-4 no-scrollbar">
              <button className="whitespace-nowrap flex items-center px-3 py-2 font-medium text-sm text-red-600 border-b-2 border-red-600">
                <FileText className="h-5 w-5 mr-2" />
                Weight Management
              </button>
              <button className="whitespace-nowrap flex items-center px-3 py-2 font-medium text-sm text-gray-500">
                <BookOpen className="h-5 w-5 mr-2 text-gray-400" />
                Medication Guides
              </button>
              <button className="whitespace-nowrap flex items-center px-3 py-2 font-medium text-sm text-gray-500">
                <FileText className="h-5 w-5 mr-2 text-gray-400" />
                Health Articles
              </button>
            </div>
          </div>
          
          {/* Featured Content */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Featured Resources</h2>
            
            <div className="space-y-4">
              {/* Resource Card 1 */}
              <div className="block bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1498837167922-ddd27525d352" 
                    alt="Healthy Meal Planning" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                      Guide
                    </span>
                    <span className="text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      5 min read
                    </span>
                  </div>
                  <h3 className="font-medium text-base mb-1">Healthy Meal Planning for Weight Management</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">Learn how to create balanced, satisfying meals that support your weight loss goals without sacrificing taste.</p>
                </div>
              </div>
              
              {/* Resource Card 2 */}
              <div className="block bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1594737625785-a6cbdabd333c" 
                    alt="Understanding Medications" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                      Video
                    </span>
                    <span className="text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      3 min
                    </span>
                  </div>
                  <h3 className="font-medium text-base mb-1">Understanding Weight Loss Medications</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">Our medical director explains how weight loss medications work and what to expect during treatment.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Recent Articles */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Recent Articles</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200">
                <li>
                  <div className="block p-4">
                    <div className="flex items-center mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Weight Management
                      </span>
                      <span className="ml-2 text-xs text-gray-500">Apr 28</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">The Science Behind Sustainable Weight Loss</p>
                    <p className="text-xs text-gray-500 line-clamp-2">Learn about the physiological and psychological factors that impact long-term weight management success.</p>
                  </div>
                </li>
                <li>
                  <div className="block p-4">
                    <div className="flex items-center mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Medication Information
                      </span>
                      <span className="ml-2 text-xs text-gray-500">Apr 25</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Common Questions About GLP-1 Medications</p>
                    <p className="text-xs text-gray-500 line-clamp-2">Our medical team answers frequently asked questions about GLP-1 receptor agonists for weight management.</p>
                  </div>
                </li>
              </ul>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
                <Link to="/resources?sort=recent" className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-block py-1">
                  View all articles
                  <ArrowRight className="inline-block ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
          
          {/* Quick Guides */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Quick Guides</h2>
            <div className="grid grid-cols-1 gap-4">
              {quickGuides.map((guide, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200 flex items-center">
                  <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${getQuickGuideColor(index)} mr-4`}>
                    {getQuickGuideIcon(index)}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{guide.title}</h3>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Health Resources" />
      
      <div className="mb-8">
        <p className="text-gray-600 mb-6">
          Explore our library of educational resources to learn more about your health, medications, and treatment options.
        </p>
        
        {/* Search bar */}
        <form 
          onSubmit={handleSearchSubmit}
          className="relative flex-grow mb-6"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </form>
        
        {/* Category tabs */}
        <div className="flex overflow-x-auto py-2 space-x-4 no-scrollbar mb-6">
          <button 
            className={`whitespace-nowrap flex items-center px-3 py-2 font-medium text-sm ${
              activeCategory === 'all' 
                ? 'text-red-600 border-b-2 border-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleCategoryChange('all')}
          >
            <FileText className={`h-5 w-5 mr-2 ${activeCategory === 'all' ? 'text-red-600' : 'text-gray-400'}`} />
            All Categories
          </button>
          
          {categories?.data?.map((category) => (
            <button 
              key={category.id}
              className={`whitespace-nowrap flex items-center px-3 py-2 font-medium text-sm ${
                activeCategory === category.categoryId 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleCategoryChange(category.categoryId)}
            >
              <FileText className={`h-5 w-5 mr-2 ${activeCategory === category.categoryId ? 'text-red-600' : 'text-gray-400'}`} />
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Content type filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              contentTypeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setContentTypeFilter('all')}
          >
            All Types
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              contentTypeFilter === 'medication_guide' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setContentTypeFilter('medication_guide')}
          >
            Medication Guides
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              contentTypeFilter === 'usage_guide' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setContentTypeFilter('usage_guide')}
          >
            Usage Guides
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              contentTypeFilter === 'side_effect' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setContentTypeFilter('side_effect')}
          >
            Side Effect Management
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              contentTypeFilter === 'condition_info' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setContentTypeFilter('condition_info')}
          >
            Condition Information
          </button>
        </div>
      </div>
      
      {/* Show featured and recent sections only when no filters are applied */}
      {!searchTerm && activeCategory === 'all' && contentTypeFilter === 'all' && (
        <>
          {/* Featured Resources */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Featured Resources</h2>
            
            {isLoadingFeatured ? (
              <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
              </div>
            ) : featuredResources?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredResources.map((resource) => (
                  <Link 
                    key={resource.id} 
                    to={`/resources/${resource.id}`}
                    className="block bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img 
                        src={resource.image_url || `https://source.unsplash.com/random/800x450?${resource.category}`} 
                        alt={resource.title} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                          {formatContentType(resource.content_type)}
                        </span>
                        <span className="text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {resource.reading_time_minutes} min read
                        </span>
                      </div>
                      <h3 className="font-medium text-base mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-600">No featured resources available.</p>
              </div>
            )}
          </section>
          
          {/* Recent Articles */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Articles</h2>
              <Link 
                to="/resources?sort=recent" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isLoadingRecent ? (
              <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
              </div>
            ) : recentResources?.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {recentResources.slice(0, 4).map((resource) => (
                    <li key={resource.id}>
                      <Link 
                        to={`/resources/${resource.id}`}
                        className="block p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                            {resource.category}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(resource.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{resource.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-600">No recent articles available.</p>
              </div>
            )}
          </section>
          
          {/* Quick Guides */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Quick Guides</h2>
            <div className="grid grid-cols-1 gap-4">
              {quickGuides.map((guide, index) => (
                <Link 
                  key={index}
                  to={`/resources?type=quick_guide`}
                  className="bg-white rounded-lg shadow p-4 border border-gray-200 flex items-center hover:shadow-md transition-shadow"
                >
                  <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${getQuickGuideColor(index)} mr-4`}>
                    {getQuickGuideIcon(index)}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{guide.title}</h3>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      
      {/* Resources grid */}
      <div className="mb-10">
        {searchTerm || activeCategory !== 'all' || contentTypeFilter !== 'all' ? (
          <h2 className="text-xl font-bold mb-6">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Filtered Resources'}
          </h2>
        ) : (
          <h2 className="text-xl font-bold mb-6">All Resources</h2>
        )}
        
        {isLoadingResources ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Error loading resources: {error.message}
          </div>
        ) : resources?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Link 
                key={resource.id} 
                to={`/resources/${resource.id}`}
                className="block bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-center text-xs mb-2 gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800">
                      {resource.category}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                      {formatContentType(resource.content_type)}
                    </span>
                  </div>
                  <h3 className="font-medium text-base mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{resource.reading_time_minutes} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No resources match your search for "${searchTerm}".` 
                : 'No resources match the selected filters.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setContentTypeFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
