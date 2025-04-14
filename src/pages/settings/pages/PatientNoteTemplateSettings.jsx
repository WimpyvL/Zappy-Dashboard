import React from 'react'; // Removed useState
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2, AlertTriangle
import { useNoteTemplateSettings } from '../../../hooks/useNoteTemplateSettings'; // Import the custom hook
// Removed mock data

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
  const {
    templates,
    isLoadingTemplates,
    errorLoadingTemplates,
    showModal,
    isEditing,
    currentTemplate,
    isSaving,
    // isDeleting, // Not currently used for button state, but available
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleInputChange,
    handleCloseModal,
  } = useNoteTemplateSettings();

  // Loading and Error Handling
  if (isLoadingTemplates) {
    return <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  if (errorLoadingTemplates) {
    return (
      <div className="p-6 text-center text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
        <p>Error loading templates: {errorLoadingTemplates.message}</p>
      </div>
    );
  }

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
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    // disabled={isDeleting} // Optionally disable while deleting
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
       <Modal isOpen={showModal} onClose={handleCloseModal} title={isEditing ? 'Edit Template' : 'Add New Template'}>
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
                        disabled={isSaving} // Disable while saving
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
                        disabled={isSaving} // Disable while saving
                    />
                     <p className="mt-1 text-xs text-gray-500">Use placeholders like [Patient Name], [Medication Name], [Dose], [Follow-Up Date] where needed.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                 <button
                   type="button"
                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                   onClick={handleCloseModal}
                   disabled={isSaving} // Disable while saving
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                   disabled={isSaving} // Disable while saving
                 >
                   {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Template')}
                 </button>
            </div>
         </form>
       </Modal>

    </div>
  );
};

export default PatientNoteTemplateSettings;
