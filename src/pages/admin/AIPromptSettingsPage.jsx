import React, { useState, useEffect } from 'react';
import { useAIPrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt } from '../../apis/ai/hooks';
import { 
  useRecommendationRules, 
  useCreateRecommendationRule, 
  useUpdateRecommendationRule, 
  useDeleteRecommendationRule 
} from '../../apis/productRecommendations/hooks';
import { toast } from 'react-toastify';
import { Loader2, Plus, Filter, Search, Sparkles } from 'lucide-react';

const AIPromptSettingsPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('prompts'); // 'prompts' or 'recommendations'
  
  // State for prompts
  const { data: promptsData, isLoading: isLoadingPrompts, error: promptsError, refetch: refetchPrompts } = useAIPrompts();
  const createPromptMutation = useCreatePrompt();
  const updatePromptMutation = useUpdatePrompt();
  const deletePromptMutation = useDeletePrompt();
  
  // State for recommendation rules
  const { data: rulesData = [], isLoading: isLoadingRules, error: rulesError, refetch: refetchRules } = useRecommendationRules();
  const createRuleMutation = useCreateRecommendationRule();
  const updateRuleMutation = useUpdateRecommendationRule();
  const deleteRuleMutation = useDeleteRecommendationRule();
  
  // Form state for prompts
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [formPromptName, setFormPromptName] = useState('');
  const [formPromptContent, setFormPromptContent] = useState('');
  const [formPromptCategory, setFormPromptCategory] = useState('general');
  const [formPromptType, setFormPromptType] = useState('initial');
  const [formPromptSection, setFormPromptSection] = useState('summary');
  
  // Form state for recommendation rules
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formRuleName, setFormRuleName] = useState('');
  const [formRuleDescription, setFormRuleDescription] = useState('');
  const [formRuleConditionType, setFormRuleConditionType] = useState('bmi');
  const [formRuleConditionValue, setFormRuleConditionValue] = useState({});
  const [formRulePriority, setFormRulePriority] = useState(10);
  const [formRuleProductTitle, setFormRuleProductTitle] = useState('');
  const [formRuleProductDescription, setFormRuleProductDescription] = useState('');
  const [formRuleReasonText, setFormRuleReasonText] = useState('');
  
  // Filter state for prompts
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state for recommendation rules
  const [filterRuleConditionType, setFilterRuleConditionType] = useState('all');
  const [searchRuleTerm, setSearchRuleTerm] = useState('');
  const [showRuleFilters, setShowRuleFilters] = useState(false);
  
  // Categories
  const categories = [
    { id: 'general', name: 'General Health' },
    { id: 'weight_management', name: 'Weight Management' },
    { id: 'ed', name: 'ED' },
    { id: 'hair_loss', name: 'Hair Loss' }
  ];
  
  // Prompt types
  const promptTypes = [
    { id: 'initial', name: 'Initial Consultation' },
    { id: 'followup', name: 'Follow-up Consultation' }
  ];
  
  // Prompt sections
  const promptSections = [
    { id: 'summary', name: 'Summary' },
    { id: 'assessment', name: 'Assessment' },
    { id: 'plan', name: 'Plan' },
    { id: 'patient_message', name: 'Patient Message' }
  ];
  
  // Get filtered prompts
  const getFilteredPrompts = () => {
    if (!promptsData) return [];
    
    return promptsData.filter(prompt => {
      // Apply category filter
      if (filterCategory !== 'all' && prompt.category !== filterCategory) {
        return false;
      }
      
      // Apply type filter
      if (filterType !== 'all' && prompt.prompt_type !== filterType) {
        return false;
      }
      
      // Apply section filter
      if (filterSection !== 'all' && prompt.section !== filterSection) {
        return false;
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          prompt.name.toLowerCase().includes(searchLower) ||
          prompt.prompt.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };
  
  // Effect to populate form when editing a prompt
  useEffect(() => {
    if (editingPromptId !== null && promptsData) {
      const promptToEdit = promptsData.find(p => p.id === editingPromptId);
      if (promptToEdit) {
        setFormPromptName(promptToEdit.name);
        setFormPromptContent(promptToEdit.prompt);
        setFormPromptCategory(promptToEdit.category || 'general');
        setFormPromptType(promptToEdit.prompt_type || 'initial');
        setFormPromptSection(promptToEdit.section || 'summary');
      }
    } else {
      setFormPromptName('');
      setFormPromptContent('');
      setFormPromptCategory('general');
      setFormPromptType('initial');
      setFormPromptSection('summary');
    }
  }, [editingPromptId, promptsData]);
  
  // Handle adding a new prompt
  const handleAddPrompt = async () => {
    if (!formPromptName || !formPromptContent) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await createPromptMutation.mutateAsync({
        name: formPromptName,
        prompt: formPromptContent,
        category: formPromptCategory,
        prompt_type: formPromptType,
        section: formPromptSection
      });
      
      toast.success('Prompt added successfully');
      setFormPromptName('');
      setFormPromptContent('');
      setFormPromptCategory('general');
      setFormPromptType('initial');
      setFormPromptSection('summary');
    } catch (error) {
      console.error('Error adding prompt:', error);
      toast.error('Failed to add prompt');
    }
  };
  
  // Handle editing a prompt
  const handleEditClick = (prompt) => {
    setEditingPromptId(prompt.id);
  };
  
  // Handle updating a prompt
  const handleUpdatePrompt = async () => {
    if (!formPromptName || !formPromptContent || editingPromptId === null) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await updatePromptMutation.mutateAsync({
        id: editingPromptId,
        name: formPromptName,
        prompt: formPromptContent,
        category: formPromptCategory,
        prompt_type: formPromptType,
        section: formPromptSection
      });
      
      toast.success('Prompt updated successfully');
      setEditingPromptId(null);
      setFormPromptName('');
      setFormPromptContent('');
      setFormPromptCategory('general');
      setFormPromptType('initial');
      setFormPromptSection('summary');
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt');
    }
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingPromptId(null);
    setFormPromptName('');
    setFormPromptContent('');
    setFormPromptCategory('general');
    setFormPromptType('initial');
    setFormPromptSection('summary');
  };
  
  // Handle deleting a prompt
  const handleDeletePrompt = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePromptMutation.mutateAsync(id);
        toast.success('Prompt deleted successfully');
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error('Failed to delete prompt');
      }
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterCategory('all');
    setFilterType('all');
    setFilterSection('all');
    setSearchTerm('');
  };
  
  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Get type name
  const getTypeName = (typeId) => {
    const type = promptTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };
  
  // Get section name
  const getSectionName = (sectionId) => {
    const section = promptSections.find(s => s.id === sectionId);
    return section ? section.name : sectionId;
  };
  
  // Get filtered prompts
  const filteredPrompts = getFilteredPrompts();
  
  // Condition type options for recommendation rules
  const conditionTypes = [
    { id: 'bmi', name: 'BMI' },
    { id: 'goal', name: 'Goal' },
    { id: 'condition', name: 'Medical Condition' },
    { id: 'age', name: 'Age' },
    { id: 'combination', name: 'Combination' }
  ];
  
  // Get filtered recommendation rules
  const getFilteredRules = () => {
    if (!rulesData) return [];
    
    return rulesData.filter(rule => {
      // Apply condition type filter
      if (filterRuleConditionType !== 'all' && rule.condition_type !== filterRuleConditionType) {
        return false;
      }
      
      // Apply search term
      if (searchRuleTerm) {
        const searchLower = searchRuleTerm.toLowerCase();
        return (
          rule.name.toLowerCase().includes(searchLower) ||
          rule.description?.toLowerCase().includes(searchLower) ||
          rule.product_title.toLowerCase().includes(searchLower) ||
          rule.product_description.toLowerCase().includes(searchLower) ||
          rule.reason_text.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };
  
  // Effect to populate form when editing a rule
  useEffect(() => {
    if (editingRuleId !== null && rulesData) {
      const ruleToEdit = rulesData.find(r => r.id === editingRuleId);
      if (ruleToEdit) {
        setFormRuleName(ruleToEdit.name);
        setFormRuleDescription(ruleToEdit.description || '');
        setFormRuleConditionType(ruleToEdit.condition_type);
        setFormRuleConditionValue(ruleToEdit.condition_value);
        setFormRulePriority(ruleToEdit.priority);
        setFormRuleProductTitle(ruleToEdit.product_title);
        setFormRuleProductDescription(ruleToEdit.product_description);
        setFormRuleReasonText(ruleToEdit.reason_text);
      }
    } else {
      setFormRuleName('');
      setFormRuleDescription('');
      setFormRuleConditionType('bmi');
      setFormRuleConditionValue({});
      setFormRulePriority(10);
      setFormRuleProductTitle('');
      setFormRuleProductDescription('');
      setFormRuleReasonText('');
    }
  }, [editingRuleId, rulesData]);
  
  // Handle adding a new rule
  const handleAddRule = async () => {
    if (!formRuleName || !formRuleProductTitle || !formRuleProductDescription || !formRuleReasonText) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await createRuleMutation.mutateAsync({
        name: formRuleName,
        description: formRuleDescription,
        condition_type: formRuleConditionType,
        condition_value: formRuleConditionValue,
        priority: formRulePriority,
        product_title: formRuleProductTitle,
        product_description: formRuleProductDescription,
        reason_text: formRuleReasonText
      });
      
      toast.success('Recommendation rule added successfully');
      setFormRuleName('');
      setFormRuleDescription('');
      setFormRuleConditionType('bmi');
      setFormRuleConditionValue({});
      setFormRulePriority(10);
      setFormRuleProductTitle('');
      setFormRuleProductDescription('');
      setFormRuleReasonText('');
    } catch (error) {
      console.error('Error adding recommendation rule:', error);
      toast.error('Failed to add recommendation rule');
    }
  };
  
  // Handle editing a rule
  const handleEditRuleClick = (rule) => {
    setEditingRuleId(rule.id);
  };
  
  // Handle updating a rule
  const handleUpdateRule = async () => {
    if (!formRuleName || !formRuleProductTitle || !formRuleProductDescription || !formRuleReasonText || editingRuleId === null) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await updateRuleMutation.mutateAsync({
        id: editingRuleId,
        name: formRuleName,
        description: formRuleDescription,
        condition_type: formRuleConditionType,
        condition_value: formRuleConditionValue,
        priority: formRulePriority,
        product_title: formRuleProductTitle,
        product_description: formRuleProductDescription,
        reason_text: formRuleReasonText
      });
      
      toast.success('Recommendation rule updated successfully');
      setEditingRuleId(null);
      setFormRuleName('');
      setFormRuleDescription('');
      setFormRuleConditionType('bmi');
      setFormRuleConditionValue({});
      setFormRulePriority(10);
      setFormRuleProductTitle('');
      setFormRuleProductDescription('');
      setFormRuleReasonText('');
    } catch (error) {
      console.error('Error updating recommendation rule:', error);
      toast.error('Failed to update recommendation rule');
    }
  };
  
  // Handle canceling edit for rule
  const handleCancelRuleEdit = () => {
    setEditingRuleId(null);
    setFormRuleName('');
    setFormRuleDescription('');
    setFormRuleConditionType('bmi');
    setFormRuleConditionValue({});
    setFormRulePriority(10);
    setFormRuleProductTitle('');
    setFormRuleProductDescription('');
    setFormRuleReasonText('');
  };
  
  // Handle deleting a rule
  const handleDeleteRule = async (id) => {
    if (window.confirm('Are you sure you want to delete this recommendation rule?')) {
      try {
        await deleteRuleMutation.mutateAsync(id);
        toast.success('Recommendation rule deleted successfully');
      } catch (error) {
        console.error('Error deleting recommendation rule:', error);
        toast.error('Failed to delete recommendation rule');
      }
    }
  };
  
  // Reset rule filters
  const resetRuleFilters = () => {
    setFilterRuleConditionType('all');
    setSearchRuleTerm('');
  };
  
  // Get condition type name
  const getConditionTypeName = (conditionTypeId) => {
    const conditionType = conditionTypes.find(c => c.id === conditionTypeId);
    return conditionType ? conditionType.name : conditionTypeId;
  };
  
  // Get filtered rules
  const filteredRules = getFilteredRules();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI & Recommendation Settings</h2>
        <div className="flex space-x-2">
          {activeTab === 'prompts' ? (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
              <button
                onClick={refetchPrompts}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                Refresh
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowRuleFilters(!showRuleFilters)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
              <button
                onClick={refetchRules}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                Refresh
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'prompts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('prompts')}
        >
          AI Prompts
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'recommendations'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('recommendations')}
        >
          <div className="flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            Product Recommendations
          </div>
        </button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {promptTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="all">All Sections</option>
                {promptSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Prompts List */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Existing Prompts</h3>
        
        {isLoadingPrompts ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : promptsError ? (
          <div className="text-red-500 py-4">
            Error loading prompts: {promptsError.message}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <p className="text-gray-500 py-4">
            {promptsData && promptsData.length > 0
              ? 'No prompts match the current filters.'
              : 'No prompts defined yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrompts.map(prompt => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{prompt.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {prompt.prompt.length > 100 
                          ? `${prompt.prompt.substring(0, 100)}...` 
                          : prompt.prompt}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(prompt.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prompt.prompt_type === 'initial' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getTypeName(prompt.prompt_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getSectionName(prompt.section)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(prompt)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add/Edit Prompt Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingPromptId !== null ? 'Edit Prompt' : 'Add New Prompt'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-3">
            <label htmlFor="promptName" className="block text-gray-700 font-semibold mb-2">
              Prompt Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="promptName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
              value={formPromptName}
              onChange={(e) => setFormPromptName(e.target.value)}
              placeholder="e.g., Weight Management Initial Summary"
            />
          </div>
          
          <div>
            <label htmlFor="promptCategory" className="block text-gray-700 font-semibold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="promptCategory"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
              value={formPromptCategory}
              onChange={(e) => setFormPromptCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="promptType" className="block text-gray-700 font-semibold mb-2">
              Consultation Type <span className="text-red-500">*</span>
            </label>
            <select
              id="promptType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
              value={formPromptType}
              onChange={(e) => setFormPromptType(e.target.value)}
            >
              {promptTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="promptSection" className="block text-gray-700 font-semibold mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              id="promptSection"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
              value={formPromptSection}
              onChange={(e) => setFormPromptSection(e.target.value)}
            >
              {promptSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="promptContent" className="block text-gray-700 font-semibold mb-2">
            Prompt Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="promptContent"
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
            value={formPromptContent}
            onChange={(e) => setFormPromptContent(e.target.value)}
            placeholder="Enter the prompt content here..."
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            Use variables like {'{patient_name}'}, {'{medical_history}'}, {'{current_medications}'}, etc. to reference patient data.
          </p>
        </div>
        
        {editingPromptId !== null ? (
          <div className="flex space-x-4">
            <button
              onClick={handleUpdatePrompt}
              disabled={createPromptMutation.isLoading || updatePromptMutation.isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-100 disabled:opacity-50 flex items-center"
            >
              {updatePromptMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddPrompt}
            disabled={createPromptMutation.isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-100 disabled:opacity-50 flex items-center"
          >
            {createPromptMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </button>
        )}
      </div>
    </div>
  );
};

export default AIPromptSettingsPage;
