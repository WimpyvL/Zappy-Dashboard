import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useEducationalResources, 
  useDeleteEducationalResource 
} from '../../apis/educationalResources/hooks';
import { useCategories } from '../../apis/categories/hooks';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ResourceModal from '../../components/admin/ResourceModal';
import { 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const ResourceManagementPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [activeTab, setActiveTab] = useState('product_information');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch resources with filters
  const filters = {
    contentType: activeTab,
    category: activeCategory !== 'all' ? activeCategory : undefined,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    searchTerm: searchTerm || undefined,
  };

  const { 
    data: resources, 
    isLoading, 
    error,
    refetch 
  } = useEducationalResources(filters);

  // Fetch categories for filters
  const { data: categories } = useCategories();

  // Delete resource mutation
  const { mutate: deleteResource } = useDeleteEducationalResource({
    onSuccess: () => {
      toast.success('Resource deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting resource: ${error.message}`);
    }
  });

  // Handle resource edit
  const handleEditResource = (resource) => {
    setCurrentResource(resource);
    setIsEditModalOpen(true);
  };

  // Handle resource deletion
  const handleDeleteResource = (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Format content type for display
  const formatContentType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get tab icon based on content type
  const getTabIcon = (contentType) => {
    switch (contentType) {
      case 'product_information':
        return <FileText className="h-5 w-5 mr-2" />;
      case 'treatment_guide':
        return <BookOpen className="h-5 w-5 mr-2" />;
      case 'side_effect':
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      case 'condition_info':
        return <BookOpen className="h-5 w-5 mr-2" />;
      default:
        return <FileText className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Product & Treatment Education" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Educational Resources</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Content
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Content Library</h2>
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category and Status Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory('all')}
          >
            All Categories
          </button>
          
          {categories?.data?.map((category) => (
            <button 
              key={category.id}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeCategory === category.categoryId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.categoryId)}
            >
              {category.name}
            </button>
          ))}
          
          <div className="flex-1"></div>
          
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveStatus('all')}
          >
            All Status
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeStatus === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveStatus('active')}
          >
            Active
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeStatus === 'draft' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveStatus('draft')}
          >
            Draft
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeStatus === 'review' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveStatus('review')}
          >
            In Review
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              activeStatus === 'archived' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveStatus('archived')}
          >
            Archived
          </button>
        </div>

        {/* Content Type Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button 
            className={`flex items-center whitespace-nowrap px-4 py-3 font-medium text-sm ${
              activeTab === 'product_information' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('product_information')}
          >
            <FileText className="h-5 w-5 mr-2" />
            Product Information
          </button>
          <button 
            className={`flex items-center whitespace-nowrap px-4 py-3 font-medium text-sm ${
              activeTab === 'treatment_guide' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('treatment_guide')}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Treatment Guides
          </button>
          <button 
            className={`flex items-center whitespace-nowrap px-4 py-3 font-medium text-sm ${
              activeTab === 'side_effect' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('side_effect')}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            Side Effect Management
          </button>
          <button 
            className={`flex items-center whitespace-nowrap px-4 py-3 font-medium text-sm ${
              activeTab === 'condition_info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('condition_info')}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Condition Information
          </button>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Error loading resources: {error.message}
            </div>
          ) : resources?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No resources found matching your criteria.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'product_information' ? 'Associated Product' : 
                     activeTab === 'condition_info' ? 'Condition' : 
                     activeTab === 'side_effect' ? 'Related Product' : 'Related Condition'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources?.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{resource.title}</div>
                      <div className="text-xs text-gray-500">{resource.content_id || `ED-${resource.id.substring(0, 6)}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resource.related_product || resource.related_condition || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentTypeBadgeColor(resource.content_type)}`}>
                        {formatContentType(resource.content_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(resource.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.version || "1.0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(resource.status)}`}>
                        {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          onClick={() => handleEditResource(resource)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          onClick={() => navigate(`/resources/${resource.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Resource Modal */}
      {isCreateModalOpen && (
        <ResourceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Edit Resource Modal */}
      {isEditModalOpen && currentResource && (
        <ResourceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentResource(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setCurrentResource(null);
            refetch();
          }}
          resource={currentResource}
        />
      )}
    </div>
  );
};

export default ResourceManagementPage;
