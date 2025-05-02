import React, { useState, useEffect } from 'react';
import { 
  useCreateEducationalResource, 
  useUpdateEducationalResource 
} from '../../apis/educationalResources/hooks';
import { useCategories } from '../../apis/categories/hooks';
import { useProducts } from '../../apis/products/hooks';
import Modal from '../ui/Modal';
import { 
  X, 
  FileText, 
  Clock, 
  Calendar, 
  Tag, 
  CheckCircle, 
  User, 
  Globe 
} from 'lucide-react';
import { toast } from 'react-toastify';

const ResourceModal = ({ isOpen, onClose, onSuccess, resource }) => {
  const isEditing = !!resource;
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    title: '',
    content_id: '',
    category: '',
    content_type: 'medication_guide',
    related_product: '',
    related_condition: '',
    description: '',
    content: '',
    keywords: [],
    reading_time_minutes: 5,
    status: 'draft',
    version: '1.0',
    target_audience: 'all_patients',
    requires_medical_review: true,
    requires_legal_review: true,
    requires_marketing_review: false,
    requires_regulatory_review: false,
    references: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [workflowStep, setWorkflowStep] = useState('draft');

  // Fetch categories for dropdown
  const { data: categories } = useCategories();
  
  // Fetch products for dropdown
  const { data: products } = useProducts();

  // Create resource mutation
  const { mutate: createResource, isLoading: isCreating } = useCreateEducationalResource({
    onSuccess: (data) => {
      toast.success('Resource created successfully');
      onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error creating resource: ${error.message}`);
    }
  });

  // Update resource mutation
  const { mutate: updateResource, isLoading: isUpdating } = useUpdateEducationalResource({
    onSuccess: (data) => {
      toast.success('Resource updated successfully');
      onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error updating resource: ${error.message}`);
    }
  });

  // Initialize form data if editing
  useEffect(() => {
    if (isEditing && resource) {
      setFormData({
        ...resource,
        keywords: resource.keywords || [],
        references: resource.references || []
      });
      
      // Set workflow step based on status
      if (resource.status === 'active') {
        setWorkflowStep('published');
      } else if (resource.status === 'review') {
        setWorkflowStep('review');
      } else {
        setWorkflowStep('draft');
      }
    }
  }, [isEditing, resource]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle content type change
  const handleContentTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      content_type: type
    }));
  };

  // Handle adding a keyword
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  // Handle removing a keyword
  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.content) {
      toast.error('Content is required');
      return;
    }
    
    // Prepare data for submission
    const resourceData = {
      ...formData,
      updated_at: new Date().toISOString()
    };
    
    if (isEditing) {
      updateResource({ id: resource.id, resourceData });
    } else {
      createResource(resourceData);
    }
  };

  // Get content type label
  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'medication_guide':
        return 'Medication Guide';
      case 'usage_guide':
        return 'Usage Guide';
      case 'side_effect':
        return 'Side Effect Management';
      case 'condition_info':
        return 'Condition Information';
      default:
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit: ${resource.title}` : 'Create New Educational Content'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            type="button"
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'content' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          {isEditing && (
            <>
              <button 
                type="button"
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'versions' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('versions')}
              >
                Version History
              </button>
              <button 
                type="button"
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'assignments' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('assignments')}
              >
                Assignments
              </button>
            </>
          )}
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter content title"
              />
            </div>

            {/* Content Type */}
            <div>
              <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                id="content_type"
                name="content_type"
                value={formData.content_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="medication_guide">Medication Guide</option>
                <option value="usage_guide">Usage Guide</option>
                <option value="side_effect">Side Effect Management</option>
                <option value="condition_info">Condition Information</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories?.data?.map((category) => (
                  <option key={category.id} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this content"
              ></textarea>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your content here..."
              ></textarea>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50 mb-1">
                {formData.keywords.map((keyword, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                    <button 
                      type="button" 
                      className="ml-1 text-gray-600 hover:text-red-600"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add keyword..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-600 text-white rounded-r-md text-sm hover:bg-blue-700"
                    onClick={handleAddKeyword}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Reading Time */}
            <div>
              <label htmlFor="reading_time_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                Reading Time (minutes)
              </label>
              <input
                type="number"
                id="reading_time_minutes"
                name="reading_time_minutes"
                value={formData.reading_time_minutes}
                onChange={handleInputChange}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Version History Tab */}
        {activeTab === 'versions' && (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              Version history will be available after saving changes.
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              Assignment features will be available after saving changes.
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResourceModal;
