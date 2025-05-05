import React, { useState } from 'react';
import { Plus, Edit, Trash2, Play } from 'lucide-react';
import { useCreatePrompt, useUpdatePrompt, useDeletePrompt, useTestPrompt } from '../../apis/ai/hooks';
import PromptModal from './PromptModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const PromptManagement = ({ prompts = [], isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [testResult, setTestResult] = useState(null);
  
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();
  const testPrompt = useTestPrompt();
  
  const handleCreatePrompt = () => {
    setCurrentPrompt(null);
    setIsModalOpen(true);
  };
  
  const handleEditPrompt = (prompt) => {
    setCurrentPrompt(prompt);
    setIsModalOpen(true);
  };
  
  const handleDeletePrompt = (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt.mutate(promptId);
    }
  };
  
  const handleTestPrompt = async (promptId) => {
    try {
      const result = await testPrompt.mutateAsync(promptId);
      setTestResult(result);
    } catch (error) {
      console.error('Error testing prompt:', error);
      alert('Failed to test prompt: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleSavePrompt = (promptData) => {
    if (currentPrompt) {
      updatePrompt.mutate({ id: currentPrompt.id, ...promptData });
    } else {
      createPrompt.mutate(promptData);
    }
    setIsModalOpen(false);
  };
  
  // Group prompts by category
  const promptsByCategory = {};
  if (prompts && prompts.length > 0) {
    prompts.forEach(prompt => {
      const category = prompt.category || 'Uncategorized';
      if (!promptsByCategory[category]) {
        promptsByCategory[category] = [];
      }
      promptsByCategory[category].push(prompt);
    });
  }
  
  const promptCategories = Object.keys(promptsByCategory).sort();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">AI Prompts</h2>
        <button
          onClick={handleCreatePrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Prompt
        </button>
      </div>
      
      {testResult && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Test Result</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(testResult, null, 2)}
          </pre>
          <button 
            onClick={() => setTestResult(null)}
            className="mt-2 text-sm text-blue-600"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {promptCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No prompts created yet. Click "New Prompt" to create your first AI prompt.
        </div>
      ) : (
        promptCategories.map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-md font-medium mb-3 text-gray-700">{category}</h3>
            <div className="bg-white rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promptsByCategory[category].map(prompt => (
                    <tr key={prompt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{prompt.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{prompt.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {prompt.updated_at ? new Date(prompt.updated_at).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTestPrompt(prompt.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Test Prompt"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="Edit Prompt"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Prompt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
      
      {isModalOpen && (
        <PromptModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePrompt}
          prompt={currentPrompt}
        />
      )}
    </div>
  );
};

export default PromptManagement;
