import React, { useState } from 'react';
import { useAISettings, useUpdateAISettings } from '../../apis/ai/hooks';
import { Save, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * AISettings component
 * 
 * Allows administrators to configure AI settings including:
 * - API provider selection
 * - Model selection
 * - Temperature and token settings
 * - Feature toggles
 */
const AISettings = () => {
  const { data: settings, isLoading, error, refetch } = useAISettings();
  const updateSettings = useUpdateAISettings();
  
  const [formData, setFormData] = useState({
    api_provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000,
    enable_consultation_summaries: true,
    enable_product_recommendations: true,
    enable_program_recommendations: true,
    api_key: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        api_provider: settings.api_provider || 'openai',
        model: settings.model || 'gpt-4',
        temperature: settings.temperature || 0.7,
        max_tokens: settings.max_tokens || 1000,
        enable_consultation_summaries: settings.enable_consultation_summaries !== false,
        enable_product_recommendations: settings.enable_product_recommendations !== false,
        enable_program_recommendations: settings.enable_program_recommendations !== false,
        api_key: settings.api_key || ''
      });
    }
  }, [settings]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      await updateSettings.mutateAsync(formData);
      setSaveMessage({ 
        type: 'success', 
        text: 'Settings saved successfully!' 
      });
      refetch(); // Refresh settings data
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: `Error saving settings: ${error.message}` 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <p className="ml-3 text-gray-600">Loading AI settings...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-medium">Error Loading Settings</h3>
        <p>{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">AI Configuration Settings</h2>
        <p className="text-sm text-gray-500">Configure AI behavior and API settings</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* API Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Provider
          </label>
          <select
            name="api_provider"
            value={formData.api_provider}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            name="api_key"
            value={formData.api_key}
            onChange={handleChange}
            placeholder="Enter API key"
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your API key is stored securely and never exposed to clients
          </p>
        </div>
        
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI Model
          </label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            {formData.api_provider === 'anthropic' && (
              <>
                <option value="claude-2">Claude 2</option>
                <option value="claude-instant">Claude Instant</option>
              </>
            )}
          </select>
        </div>
        
        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature: {formData.temperature}
          </label>
          <input
            type="range"
            name="temperature"
            min="0"
            max="1"
            step="0.1"
            value={formData.temperature}
            onChange={handleNumberChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>More Deterministic (0)</span>
            <span>More Creative (1)</span>
          </div>
        </div>
        
        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            name="max_tokens"
            value={formData.max_tokens}
            onChange={handleNumberChange}
            min="100"
            max="8000"
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum number of tokens to generate (100-8000)
          </p>
        </div>
        
        {/* Feature Toggles */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Feature Toggles</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_consultation_summaries"
                name="enable_consultation_summaries"
                checked={formData.enable_consultation_summaries}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="enable_consultation_summaries" className="ml-2 text-sm text-gray-700">
                Enable AI consultation summaries
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_product_recommendations"
                name="enable_product_recommendations"
                checked={formData.enable_product_recommendations}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="enable_product_recommendations" className="ml-2 text-sm text-gray-700">
                Enable AI product recommendations
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_program_recommendations"
                name="enable_program_recommendations"
                checked={formData.enable_program_recommendations}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="enable_program_recommendations" className="ml-2 text-sm text-gray-700">
                Enable AI program recommendations
              </label>
            </div>
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage.text && (
          <div className={`p-3 rounded-md ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AISettings;
