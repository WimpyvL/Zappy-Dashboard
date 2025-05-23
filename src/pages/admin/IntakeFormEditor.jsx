import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Search, Filter, ChevronDown, Tag, FileText, RefreshCw, Save } from 'lucide-react';

const IntakeFormEditor = () => {
  // State for form templates
  const [formTemplates, setFormTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing/creating
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  // State for form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSteps, setFormSteps] = useState([]);
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Categories
  const categories = [
    { id: 'weight_management', name: 'Weight Management' },
    { id: 'ed', name: 'ED' },
    { id: 'hair_loss', name: 'Hair Loss' },
    { id: 'primary_care', name: 'Primary Care' },
    { id: 'mental_health', name: 'Mental Health' },
    { id: 'womens_health', name: 'Women\'s Health' }
  ];
  
  // Form steps
  const defaultSteps = [
    'introduction',
    'basic_info',
    'id_verification',
    'health_history',
    'treatment_preferences',
    'review',
    'shipping_address',
    'checkout',
    'confirmation'
  ];

  // Fetch templates on mount
  useEffect(() => {
    fetchFormTemplates();
  }, []);
  
  // Reset form when editing state changes
  useEffect(() => {
    if (isEditing && currentTemplate) {
      setFormName(currentTemplate.name);
      setFormCategory(currentTemplate.category);
      setFormSteps(currentTemplate.steps || defaultSteps);
    } else if (isCreating) {
      setFormName('');
      setFormCategory(categories[0].id);
      setFormSteps(defaultSteps);
    }
  }, [isEditing, isCreating, currentTemplate, defaultSteps]);

  // Fetch form templates from the database
  const fetchFormTemplates = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your database
      const { data, error } = await supabase
        .from('intake_form_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setFormTemplates(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching form templates:', err);
      setError('Failed to load form templates');
      toast.error('Failed to load form templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = formTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle creating a new template
  const handleCreateTemplate = async () => {
    if (!formName || !formCategory) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const newTemplate = {
        name: formName,
        category: formCategory,
        steps: formSteps,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('intake_form_templates')
        .insert(newTemplate)
        .select();
        
      if (error) throw error;
      
      setFormTemplates([...formTemplates, data[0]]);
      setIsCreating(false);
      toast.success('Form template created successfully');
    } catch (err) {
      console.error('Error creating form template:', err);
      toast.error('Failed to create form template');
    }
  };

  // Handle updating a template
  const handleUpdateTemplate = async () => {
    if (!formName || !formCategory) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const updatedTemplate = {
        name: formName,
        category: formCategory,
        steps: formSteps,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('intake_form_templates')
        .update(updatedTemplate)
        .eq('id', currentTemplate.id);
        
      if (error) throw error;
      
      setFormTemplates(formTemplates.map(template => 
        template.id === currentTemplate.id ? { ...template, ...updatedTemplate } : template
      ));
      setIsEditing(false);
      setCurrentTemplate(null);
      toast.success('Form template updated successfully');
    } catch (err) {
      console.error('Error updating form template:', err);
      toast.error('Failed to update form template');
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form template?')) return;
    
    try {
      const { error } = await supabase
        .from('intake_form_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFormTemplates(formTemplates.filter(template => template.id !== id));
      toast.success('Form template deleted successfully');
    } catch (err) {
      console.error('Error deleting form template:', err);
      toast.error('Failed to delete form template');
    }
  };

  // Get category name by ID
  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : id;
  };

  // Handle step reordering
  const moveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formSteps.length - 1)
    ) {
      return;
    }
    
    const newSteps = [...formSteps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setFormSteps(newSteps);
  };

  // Handle adding a new step
  const addStep = () => {
    const newStepName = prompt('Enter the name of the new step:');
    if (newStepName && newStepName.trim()) {
      setFormSteps([...formSteps, newStepName.trim().toLowerCase().replace(/\s+/g, '_')]);
    }
  };

  // Handle removing a step
  const removeStep = (index) => {
    if (window.confirm(`Are you sure you want to remove the "${formSteps[index]}" step?`)) {
      const newSteps = [...formSteps];
      newSteps.splice(index, 1);
      setFormSteps(newSteps);
    }
  };

  // Handle editing a step
  const editStep = (index) => {
    const newStepName = prompt('Enter the new name for this step:', formSteps[index]);
    if (newStepName && newStepName.trim()) {
      const newSteps = [...formSteps];
      newSteps[index] = newStepName.trim().toLowerCase().replace(/\s+/g, '_');
      setFormSteps(newSteps);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Intake Form Editor</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setCurrentTemplate(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Form Template
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="relative min-w-[200px]">
            <div className="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Tag size={16} className="mr-2" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={fetchFormTemplates}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Form Template Editor */}
      {(isCreating || isEditing) && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {isCreating ? 'Create New Form Template' : 'Edit Form Template'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                id="templateName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter template name"
              />
            </div>
            
            <div>
              <label htmlFor="templateCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="templateCategory"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Form Steps
              </label>
              <button
                onClick={addStep}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <Plus size={14} className="mr-1" />
                Add Step
              </button>
            </div>
            <div className="border border-gray-300 rounded-md p-4">
              {formSteps.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No steps defined. Click "Add Step" to add a step.</p>
              ) : (
                <ul className="space-y-2">
                  {formSteps.map((step, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="font-medium">{index + 1}. {step.replace(/_/g, ' ')}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded-md ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === formSteps.length - 1}
                          className={`p-1 rounded-md ${index === formSteps.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => editStep(index)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop steps to reorder them. Each step corresponds to a component in the intake form.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setCurrentTemplate(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={isCreating ? handleCreateTemplate : handleUpdateTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save size={16} className="mr-2" />
              {isCreating ? 'Create Template' : 'Update Template'}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Form Templates</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchFormTemplates}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No form templates found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map(template => (
              <div key={template.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryName(template.category)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {template.steps?.length || 0} steps
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentTemplate(template);
                        setIsEditing(true);
                        setIsCreating(false);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {template.steps?.join(' → ').replace(/_/g, ' ') || 'No steps defined'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold text-blue-800 mb-2">How to Use the Intake Form Editor</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>Create form templates for different categories (Weight Management, ED, etc.)</li>
          <li>Define the steps that will appear in each form</li>
          <li>The step names should match the component names in the intake form</li>
          <li>To edit the questions within each step, you'll need to modify the corresponding component files</li>
          <li>Changes to form templates will affect new intake forms, not existing ones</li>
        </ul>
      </div>
    </div>
  );
};

export default IntakeFormEditor;
