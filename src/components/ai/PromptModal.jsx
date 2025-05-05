import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const PromptModal = ({ isOpen, onClose, onSave, prompt }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'consultation',
    prompt_text: '',
    parameters: [],
    is_active: true
  });
  
  const [newParam, setNewParam] = useState({ name: '', description: '', required: false });
  
  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name || '',
        description: prompt.description || '',
        category: prompt.category || 'consultation',
        prompt_text: prompt.prompt_text || '',
        parameters: prompt.parameters || [],
        is_active: prompt.is_active !== false
      });
    }
  }, [prompt]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewParam({
      ...newParam,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const addParameter = () => {
    if (newParam.name.trim()) {
      setFormData({
        ...formData,
        parameters: [...formData.parameters, { ...newParam }]
      });
      setNewParam({ name: '', description: '', required: false });
    }
  };
  
  const removeParameter = (index) => {
    const updatedParams = [...formData.parameters];
    updatedParams.splice(index, 1);
    setFormData({
      ...formData,
      parameters: updatedParams
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const categoryOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'recommendation', label: 'Recommendation' },
    { value: 'summary', label: 'Summary' },
    { value: 'educational', label: 'Educational' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prompt ? 'Edit Prompt' : 'Create New Prompt'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Prompt Text</label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            rows={6}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Use {'{parameter}'} syntax to include parameters in your prompt.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Parameters</label>
            <div className="text-xs text-gray-500">
              Define variables that can be inserted into the prompt
            </div>
          </div>
          
          <div className="mt-2 space-y-2">
            {formData.parameters.map((param, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                <div className="flex-grow">
                  <div className="font-medium text-sm">{param.name}</div>
                  <div className="text-xs text-gray-500">{param.description}</div>
                </div>
                <div className="text-xs">
                  {param.required ? 'Required' : 'Optional'}
                </div>
                <button
                  type="button"
                  onClick={() => removeParameter(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-2 border-t pt-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  name="name"
                  value={newParam.name}
                  onChange={handleParamChange}
                  placeholder="Parameter name"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="description"
                  value={newParam.description}
                  onChange={handleParamChange}
                  placeholder="Description"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    checked={newParam.required}
                    onChange={handleParamChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>
                <button
                  type="button"
                  onClick={addParameter}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Save Prompt
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PromptModal;
