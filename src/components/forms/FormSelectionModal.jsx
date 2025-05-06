import React, { useState, useEffect } from 'react';
import { Search, FileText, Clock, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { useForms } from '../../apis/forms/hooks';
import LoadingSpinner from '../ui/LoadingSpinner';

const FormSelectionModal = ({ isOpen, onClose, patientId, onFormSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormId, setSelectedFormId] = useState(null);
  
  // Fetch available forms
  const { data: formsData, isLoading, error } = useForms();
  const forms = formsData?.data || [];
  
  // Filter forms based on search term
  const filteredForms = forms.filter(form => 
    form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFormId(null);
      setSearchTerm('');
    }
  }, [isOpen]);
  
  // Handle form selection
  const handleFormSelect = (formId) => {
    setSelectedFormId(formId);
  };
  
  // Handle submit (send form to patient)
  const handleSubmit = () => {
    if (selectedFormId && patientId) {
      onFormSelect(selectedFormId);
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Select Form to Send" 
      onSubmit={handleSubmit}
      submitText="Send Form"
      isSubmitting={false}
      size="md"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Forms list */}
        <div className="border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading forms. Please try again.
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No forms match your search.' : 'No forms available.'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {filteredForms.map((form) => (
                  <li 
                    key={form.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedFormId === form.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleFormSelect(form.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{form.name || 'Untitled Form'}</p>
                          <div className="flex items-center">
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {form.estimated_time || '5-10 min'}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {form.description || 'No description available.'}
                        </p>
                        {selectedFormId === form.id && (
                          <div className="mt-2 flex items-center text-xs text-blue-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="text-xs text-gray-500 mt-2">
          <p>Select a form to send to the patient. They will receive an email notification with a link to complete the form.</p>
        </div>
      </div>
    </Modal>
  );
};

export default FormSelectionModal;
