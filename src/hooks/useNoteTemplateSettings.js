import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  useNoteTemplates,
  useCreateNoteTemplate,
  useUpdateNoteTemplate,
  useDeleteNoteTemplate,
} from '../apis/noteTemplates/hooks';

export const useNoteTemplateSettings = () => {
  // --- Data Fetching ---
  const { data: templates = [], isLoading: isLoadingTemplates, error: errorLoadingTemplates, refetch } = useNoteTemplates();

  // --- Mutations ---
  const createMutation = useCreateNoteTemplate({
    onSuccess: () => {
      refetch(); // Refetch list after creation
      setShowModal(false); // Close modal on success
    },
  });
  const updateMutation = useUpdateNoteTemplate({
    onSuccess: () => {
      refetch(); // Refetch list after update
      setShowModal(false); // Close modal on success
    },
  });
  const deleteMutation = useDeleteNoteTemplate({
    onSuccess: () => {
      refetch(); // Refetch list after deletion
      // No modal to close here
    },
  });

  // --- Component State ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ id: null, name: '', content: '' });

  // --- Handlers ---
  const handleAdd = useCallback(() => {
    setIsEditing(false);
    setCurrentTemplate({ id: null, name: '', content: '' });
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((template) => {
    setIsEditing(true);
    setCurrentTemplate(template);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(templateId);
    }
  }, [deleteMutation]);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: currentTemplate.id, templateData: currentTemplate });
    } else {
      // Remove temporary/null ID before creation
      const { id, ...newTemplateData } = currentTemplate;
      createMutation.mutate(newTemplateData);
    }
    // Modal closing is handled by mutation onSuccess
  }, [isEditing, currentTemplate, createMutation, updateMutation]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentTemplate(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // --- Return Values ---
  return {
    templates,
    isLoadingTemplates,
    errorLoadingTemplates,
    showModal,
    isEditing,
    currentTemplate,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleInputChange,
    handleCloseModal,
  };
};
