import React, { useState, useEffect } from 'react';

const AIPromptSettingsPage = () => {
  // Placeholder state for prompts
  const [prompts, setPrompts] = useState([
    { id: 1, name: 'Weight Management Summary', prompt: 'Summarize key weight management info from intake form...' },
    { id: 2, name: 'ED Treatment Recommendation', prompt: 'Generate ED treatment recommendation based on symptoms...' },
    { id: 3, name: 'Alert Center Issues', prompt: 'Identify potential drug interactions and monitoring needs from patient data...' }, // Placeholder for Alert Center prompt
  ]);
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [formPromptName, setFormPromptName] = useState('');
  const [formPromptContent, setFormPromptContent] = useState('');

  // Effect to populate form when editing a prompt
  useEffect(() => {
    if (editingPromptId !== null) {
      const promptToEdit = prompts.find(p => p.id === editingPromptId);
      if (promptToEdit) {
        setFormPromptName(promptToEdit.name);
        setFormPromptContent(promptToEdit.prompt);
      }
    } else {
      setFormPromptName('');
      setFormPromptContent('');
    }
  }, [editingPromptId, prompts]);

  const handleAddPrompt = () => {
    if (!formPromptName || !formPromptContent) return;

    // Placeholder for adding a new prompt (frontend state only)
    const newPrompt = {
      id: prompts.length + 1, // Simple ID generation
      name: formPromptName,
      prompt: formPromptContent,
    };
    setPrompts([...prompts, newPrompt]);
    console.log('Added new prompt:', newPrompt);
    setFormPromptName('');
    setFormPromptContent('');
  };

  const handleEditClick = (prompt) => {
    setEditingPromptId(prompt.id);
  };

  const handleUpdatePrompt = () => {
    if (!formPromptName || !formPromptContent || editingPromptId === null) return;

    // Placeholder for updating a prompt (frontend state only)
    setPrompts(prompts.map(prompt =>
      prompt.id === editingPromptId ? { ...prompt, name: formPromptName, prompt: formPromptContent } : prompt
    ));
    console.log('Updated prompt with id:', editingPromptId, { name: formPromptName, prompt: formPromptContent });
    setEditingPromptId(null);
    setFormPromptName('');
    setFormPromptContent('');
  };

  const handleCancelEdit = () => {
    setEditingPromptId(null);
    setFormPromptName('');
    setFormPromptContent('');
  };

  const handleDeletePrompt = (id) => {
    // Placeholder for deleting a prompt (frontend state only)
    setPrompts(prompts.filter(prompt => prompt.id !== id));
    console.log('Deleted prompt with id:', id);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">AI Prompt Settings</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Existing Prompts</h3>
        {prompts.length === 0 ? (
          <p>No prompts defined yet.</p>
        ) : (
          <ul>
            {prompts.map(prompt => (
              <li key={prompt.id} className="border-b border-gray-200 py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{prompt.name}</p>
                  <p className="text-gray-600 text-sm">{prompt.prompt}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleEditClick(prompt)}
                    className="text-blue-600 hover:text-blue-800 text-sm mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{editingPromptId !== null ? 'Edit Prompt' : 'Add New Prompt'}</h3>
        <div className="mb-4">
          <label htmlFor="promptName" className="block text-gray-700 font-semibold mb-2">Prompt Name</label>
          <input
            type="text"
            id="promptName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
            value={formPromptName}
            onChange={(e) => setFormPromptName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="promptContent" className="block text-gray-700 font-semibold mb-2">Prompt Content</label>
          <textarea
            id="promptContent"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
            value={formPromptContent}
            onChange={(e) => setFormPromptContent(e.target.value)}
          ></textarea>
        </div>
        {editingPromptId !== null ? (
          <div className="flex space-x-4">
            <button
              onClick={handleUpdatePrompt}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-100"
            >
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-100"
          >
            Add Prompt
          </button>
        )}
      </div>
    </div>
  );
};

export default AIPromptSettingsPage;
