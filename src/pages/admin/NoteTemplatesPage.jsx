import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Search, Filter, ChevronDown, Tag, FileText, RefreshCw } from 'lucide-react';

const NoteTemplatesPage = () => {
  // State for templates
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing/creating
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  // State for form fields
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formEncounterType, setFormEncounterType] = useState('');
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [encounterTypeFilter, setEncounterTypeFilter] = useState('all');
  
  // Categories and encounter types
  const categories = [
    { id: 'weight_management', name: 'Weight Management' },
    { id: 'ed', name: 'ED' },
    { id: 'primary_care', name: 'Primary Care' },
    { id: 'mental_health', name: 'Mental Health' },
    { id: 'womens_health', name: 'Women\'s Health' }
  ];
  
  const encounterTypes = [
    { id: 'initial_consultation', name: 'Initial Consultation' },
    { id: 'follow_up', name: 'Follow-up' },
    { id: 'medication_review', name: 'Medication Review' },
    { id: 'urgent_care', name: 'Urgent Care' }
  ];

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Reset form when editing state changes
  useEffect(() => {
    if (isEditing && currentTemplate) {
      setFormName(currentTemplate.name);
      setFormContent(currentTemplate.content);
      setFormCategory(currentTemplate.category);
      setFormEncounterType(currentTemplate.encounter_type);
    } else if (isCreating) {
      setFormName('');
      setFormContent('');
      setFormCategory(categories[0].id);
      setFormEncounterType(encounterTypes[0].id);
    }
  }, [isEditing, isCreating, currentTemplate]);

  // Fetch templates from the database
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your database
      // For now, we'll use mock data
      const { data, error } = await supabase
        .from('note_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setTemplates(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesEncounterType = encounterTypeFilter === 'all' || template.encounter_type === encounterTypeFilter;
    
    return matchesSearch && matchesCategory && matchesEncounterType;
  });

  // Handle creating a new template
  const handleCreateTemplate = async () => {
    if (!formName || !formContent || !formCategory || !formEncounterType) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const newTemplate = {
        name: formName,
        content: formContent,
        category: formCategory,
        encounter_type: formEncounterType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('note_templates')
        .insert(newTemplate)
        .select();
        
      if (error) throw error;
      
      setTemplates([...templates, data[0]]);
      setIsCreating(false);
      toast.success('Template created successfully');
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
    }
  };

  // Handle updating a template
  const handleUpdateTemplate = async () => {
    if (!formName || !formContent || !formCategory || !formEncounterType) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const updatedTemplate = {
        name: formName,
        content: formContent,
        category: formCategory,
        encounter_type: formEncounterType,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('note_templates')
        .update(updatedTemplate)
        .eq('id', currentTemplate.id);
        
      if (error) throw error;
      
      setTemplates(templates.map(template => 
        template.id === currentTemplate.id ? { ...template, ...updatedTemplate } : template
      ));
      setIsEditing(false);
      setCurrentTemplate(null);
      toast.success('Template updated successfully');
    } catch (err) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template');
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTemplates(templates.filter(template => template.id !== id));
      toast.success('Template deleted successfully');
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
    }
  };

  // Get category or encounter type name by ID
  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : id;
  };
  
  const getEncounterTypeName = (id) => {
    const encounterType = encounterTypes.find(e => e.id === id);
    return encounterType ? encounterType.name : id;
  };

  // Generate AI content for a template
  const generateAIContent = async (category, encounterType) => {
    setFormContent('Generating content...');
    
    try {
      // In a real implementation, this would call your AI service
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let content = '';
      
      if (category === 'weight_management') {
        content = `Dear [Patient Name],

Thank you for your recent ${getEncounterTypeName(encounterType).toLowerCase()} with our weight management program. Based on our discussion, I've prescribed the following treatment plan:

[MEDICATIONS_LIST]

Please take these medications as directed. It's important to:
- Follow the dosage instructions carefully
- Report any side effects immediately
- Continue your healthy eating and exercise plan
- Track your weight weekly

We'll follow up in [FOLLOW_UP_PERIOD] to assess your progress and make any necessary adjustments to your treatment plan.

If you have any questions or concerns before then, please don't hesitate to reach out through the patient portal.

Best regards,
[Provider Name]`;
      } else if (category === 'ed') {
        content = `Dear [Patient Name],

Thank you for your recent ${getEncounterTypeName(encounterType).toLowerCase()}. I've prescribed the following medication for your erectile dysfunction:

[MEDICATIONS_LIST]

Important instructions:
- Take this medication as needed, approximately 30-60 minutes before sexual activity
- Do not take more than one dose in 24 hours
- Avoid high-fat meals before taking, as they may delay effectiveness
- Do not use with nitrates or alpha-blockers

We'll follow up in [FOLLOW_UP_PERIOD] to assess how the medication is working for you and address any concerns.

Please contact us immediately if you experience any concerning side effects.

Best regards,
[Provider Name]`;
      } else {
        content = `Dear [Patient Name],

Thank you for your recent ${getEncounterTypeName(encounterType).toLowerCase()}. Based on our discussion, I've prescribed the following treatment plan:

[MEDICATIONS_LIST]

Please follow all medication instructions carefully. We'll follow up in [FOLLOW_UP_PERIOD] to assess your progress.

If you have any questions or concerns before then, please don't hesitate to reach out.

Best regards,
[Provider Name]`;
      }
      
      setFormContent(content);
      toast.success('AI content generated');
    } catch (err) {
      console.error('Error generating AI content:', err);
      toast.error('Failed to generate AI content');
      setFormContent('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Patient Note Templates</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setCurrentTemplate(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Template
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
          
          <div className="relative min-w-[200px]">
            <div className="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FileText size={16} className="mr-2" />
            </div>
            <select
              value={encounterTypeFilter}
              onChange={(e) => setEncounterTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Encounter Types</option>
              {encounterTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={fetchTemplates}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Template Form (Create/Edit) */}
      {(isCreating || isEditing) && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {isCreating ? 'Create New Template' : 'Edit Template'}
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
            
            <div className="grid grid-cols-2 gap-4">
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
              
              <div>
                <label htmlFor="templateEncounterType" className="block text-sm font-medium text-gray-700 mb-1">
                  Encounter Type
                </label>
                <select
                  id="templateEncounterType"
                  value={formEncounterType}
                  onChange={(e) => setFormEncounterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {encounterTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700">
                Template Content
              </label>
              <button
                onClick={() => generateAIContent(formCategory, formEncounterType)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <RefreshCw size={14} className="mr-1" />
                Generate with AI
              </button>
            </div>
            <textarea
              id="templateContent"
              rows="10"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter template content"
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Use placeholders like [MEDICATIONS_LIST], [FOLLOW_UP_PERIOD], [Patient Name], etc.
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isCreating ? 'Create Template' : 'Update Template'}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Templates</h3>
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
              onClick={fetchTemplates}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No templates found.</p>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getEncounterTypeName(template.encounter_type)}
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
                  <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteTemplatesPage;
