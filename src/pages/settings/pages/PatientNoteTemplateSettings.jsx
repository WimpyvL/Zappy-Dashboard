import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify'; // Import toast

// Mock Data for Templates
const initialTemplates = [
  { id: 'tpl_001', name: 'Standard Follow-Up', content: 'Dear [Patient Name],\n\nWe have reviewed your progress on [Medication Name]. Please continue your current dosage. Maintain diet and exercise. Your next follow-up is scheduled for [Follow-Up Date].\n\nSincerely,\nYour Care Team' },
  { id: 'tpl_002', name: 'Dose Escalation Notice', content: 'Dear [Patient Name],\n\nBased on your recent check-in, we are adjusting your dose of [Medication Name] to [New Dose]. Please follow the updated instructions provided. Contact us if you experience any significant side effects. Your next follow-up is scheduled for [Follow-Up Date].\n\nSincerely,\nYour Care Team' },
  { id: 'tpl_003', name: 'Initial Consult Approval', content: 'Dear [Patient Name],\n\nYour initial consultation has been reviewed and approved. Your prescription for [Medication Name] [Dose] will be sent to the pharmacy shortly. Please allow 24-48 hours for processing. We recommend scheduling a follow-up in [Follow-Up Interval].\n\nSincerely,\nYour Care Team' },
];

// Basic Modal Component (can be replaced with a shared one if available)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={onClose}>
             &times; {/* Simple close icon */}
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};


const PatientNoteTemplateSettings = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ id: null, name: '', content: '' });

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentTemplate({ id: null, name: '', content: '' });
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setIsEditing(true);
    setCurrentTemplate(template);
    setShowModal(true);
  };

  const handleDelete = (templateId) => {
    // TODO: Implement API call using a dedicated useDeleteNoteTemplate mutation hook when available.
    if (window.confirm('Are you sure you want to delete this template?')) {
      // console.log('Deleting template (mock):', templateId); // Removed log
      setTemplates(prev => prev.filter(t => t.id !== templateId)); // Keep local state update for now
      toast.info('Template deleted (mock).'); // Use toast for feedback
    }
  };

  const handleSave = (e) => {
     e.preventDefault();
     // TODO: Implement API calls using dedicated useCreateNoteTemplate/useUpdateNoteTemplate mutation hooks when available.
     if (isEditing) {
       // console.log('Updating template (mock):', currentTemplate); // Removed log
       setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? currentTemplate : t)); // Keep local state update
       toast.info('Template updated (mock).'); // Use toast
     } else {
       const newTemplate = { ...currentTemplate, id: `tpl_${Date.now()}` }; // Generate temporary ID
       // console.log('Adding template (mock):', newTemplate); // Removed log
       setTemplates(prev => [newTemplate, ...prev]); // Keep local state update
       toast.info('Template added (mock).'); // Use toast
     }
     setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTemplate(prev => ({ ...prev, [name]: value }));
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patient Note Templates</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Template
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content Preview
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {template.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {template.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit className="h-4 w-4 inline-block" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                     <Trash2 className="h-4 w-4 inline-block" />
                  </button>
                </td>
              </tr>
            ))}
             {templates.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">No templates found.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>

       {/* Add/Edit Modal */}
       <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Template' : 'Add New Template'}>
         <form onSubmit={handleSave}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">Template Name</label>
                    <input
                        type="text"
                        id="template-name"
                        name="name"
                        value={currentTemplate.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="template-content" className="block text-sm font-medium text-gray-700">Template Content</label>
                    <textarea
                        id="template-content"
                        name="content"
                        rows={10}
                        value={currentTemplate.content}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter the full note template content. Use placeholders like [Patient Name], [Medication Name], etc."
                        required
                    />
                     <p className="mt-1 text-xs text-gray-500">Use placeholders like [Patient Name], [Medication Name], [Dose], [Follow-Up Date] where needed.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                 <button
                   type="button"
                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                   onClick={() => setShowModal(false)}
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                 >
                   {isEditing ? 'Save Changes' : 'Add Template'}
                 </button>
            </div>
         </form>
       </Modal>

    </div>
  );
};

export default PatientNoteTemplateSettings;
