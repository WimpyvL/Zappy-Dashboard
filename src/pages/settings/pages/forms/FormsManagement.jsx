import React, { useState, useEffect } from 'react';
import {
  // Table, // Removed unused import
  Button,
  Space,
  Modal,
  // Form, // Removed unused import
  Input,
  // Select, // Removed unused import
  Divider, // Added back Divider
  Typography,
  // Tooltip, // Removed unused import
  // Tag, // Removed unused import
  // Popconfirm, // Removed unused import
  message,
  Drawer,
  Tabs,
  // Empty, // Removed unused import
  // Menu, // Removed unused import
  // Dropdown, // Removed unused import
} from 'antd';
import {
  PlusOutlined,
  // EditOutlined, // Removed unused import
  // DeleteOutlined, // Removed unused import
  CopyOutlined,
  // ShareAltOutlined, // Removed unused import
  // EyeOutlined, // Removed unused import
  // MoreOutlined, // Removed unused import
  SearchOutlined,
} from '@ant-design/icons';
import { useForm } from 'react-hook-form'; // Removed Controller as it's in FormBasicsModal

// Import components and hooks
import FormElementSidebar from './FormElementSidebar';
import FormBuilderElements from './FormBuilderElements';
import FormPages from './FormPages';
import FormConditionals from './FormConditionals';
import FormTable from './FormTable'; // Import the new table component
import FormBasicsModal from './FormBasicsModal'; // Import the new modal component
import {
  useForms,
  // useFormById, // Removed unused import
  useCreateForm,
  useUpdateForm,
  useDeleteForm,
} from '../../../../apis/forms/hooks';

const { Title, Text } = Typography; // Added back Title
const { TabPane } = Tabs;

// Generate unique ID helper function
function generateRandomId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

// Main Forms Management Component
const FormsManagement = () => {
  // API integration with react-query hooks
  const { data: formsData, isLoading: formsLoading, refetch: refetchForms } = useForms();
  const createFormMutation = useCreateForm({
    onSuccess: () => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics(); // Use reset from react-hook-form
      setFormPages([]);
      setFormConditionals([]);
      message.success('Form created successfully');
      refetchForms(); // Refetch after creation
    },
  });
  const updateFormMutation = useUpdateForm({
    onSuccess: () => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics(); // Use reset from react-hook-form
      setFormPages([]);
      setFormConditionals([]);
      message.success('Form updated successfully');
      refetchForms(); // Refetch after update
    },
  });
  const deleteFormMutation = useDeleteForm({
    onSuccess: () => {
      message.success('Form deleted successfully');
      refetchForms(); // Refetch after deletion
    },
    onError: (error) => {
      message.error(`Error deleting form: ${error.message || 'Unknown error'}`);
    },
  });

  // Local state
  const [activeService, setActiveService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formActionType, setFormActionType] = useState('create'); // 'create' or 'edit'
  const [currentForm, setCurrentForm] = useState(null);
  const [formBuilderVisible, setFormBuilderVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [formPages, setFormPages] = useState([]);
  const [formConditionals, setFormConditionals] = useState([]);
  const [activeBuilderTab, setActiveBuilderTab] = useState('pages');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // Mock services data (can be fetched if needed)
  const [services] = useState([ // Removed unused setServices
    { id: 1, name: 'Consultation', category: 'Medical' },
    { id: 2, name: 'Weight Management', category: 'Medical' },
    { id: 4, name: 'Insurance Verification', category: 'Administrative' },
  ]);

  // Use react-hook-form for the basics modal (though the modal itself handles it now)
  const { reset: resetFormBasics } = useForm();

  // Normalize form data from API to component state
  const forms = formsData?.data || [];

  // Transform API response to match component data structure
  const transformedForms = forms.map((form) => {
    const formData = form;
    let formPagesData = [];
    let formConditionalsData = [];

    try {
      if (formData.structure) {
        const structure = JSON.parse(formData.structure);
        if (structure.pages && Array.isArray(structure.pages)) {
          formPagesData = structure.pages;
          formConditionalsData = structure.conditionals || [];
        } else if (Array.isArray(structure)) {
          formPagesData = [
            {
              id: generateRandomId(),
              title: 'Page 1',
              elements: structure,
            },
          ];
        }
      }
    } catch (e) {
      console.error('Error parsing form structure:', e);
      formPagesData = [
        {
          id: generateRandomId(),
          title: 'Page 1',
          elements: [],
        },
      ];
    }

    const totalElements = formPagesData.reduce(
      (count, page) => count + (page.elements ? page.elements.length : 0),
      0
    );

    return {
      id: form.id.toString(),
      title: formData.title,
      description: formData.description,
      serviceId: formData.service?.id,
      serviceName: formData.service?.name,
      status: formData.status ? 'active' : 'inactive',
      form_type: formData.form_type,
      createdAt: new Date(formData.created_at).toLocaleDateString(),
      updatedAt: new Date(formData.updated_at).toLocaleDateString(),
      pages: formPagesData,
      conditionals: formConditionalsData,
      elementCount: totalElements,
      pageCount: formPagesData.length,
      shareLink: formData.slug,
      submissions: 0, // Placeholder
    };
  });

  // Initialize form pages and conditionals when opening the builder for editing
  useEffect(() => {
    if (currentForm && formBuilderVisible) {
      if (currentForm.pages && currentForm.pages.length > 0) {
        setFormPages(currentForm.pages);
      } else {
        setFormPages([
          {
            id: generateRandomId(),
            title: 'Page 1',
            elements: [],
          },
        ]);
      }
      setFormConditionals(currentForm.conditionals || []);
      setCurrentPageIndex(0); // Start at the first page
    }
  }, [currentForm, formBuilderVisible]);

  // Filter forms based on selected service and search text
  const filteredForms = transformedForms.filter((form) => {
    const matchesService =
      activeService === 'all' || form.serviceId === parseInt(activeService);
    const matchesSearch =
      (form.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  });

  // Handle opening the add/edit modal
  const openFormBasicsModal = (action, form = null) => {
    setFormActionType(action);
    setCurrentForm(form); // Set the form being edited, or null for create
    setFormModalVisible(true);
  };

  // Handle form basics submission (from modal)
  const onFormBasicsSubmit = (data) => {
    const baseFormDetails = {
      title: data.title,
      description: data.description,
      serviceId: data.service_id,
      form_type: data.form_type,
      status: data.status ? 'active' : 'inactive',
      // Keep existing pages/conditionals if editing, initialize if creating
      pages: formActionType === 'edit' && currentForm ? currentForm.pages : [{ id: generateRandomId(), title: 'Page 1', elements: [] }],
      conditionals: formActionType === 'edit' && currentForm ? currentForm.conditionals : [],
      // Add other necessary fields
      id: formActionType === 'edit' ? currentForm.id : generateRandomId(),
      shareLink: data.title.toLowerCase().replace(/\s+/g, '-'), // Simple slug generation
    };

    setCurrentForm(baseFormDetails);
    setFormModalVisible(false);
    setFormBuilderVisible(true); // Open the builder
  };

  // Handle form builder submission
  const handleFormBuilderSubmit = () => {
    if (!currentForm) return;

    const formData = {
      title: currentForm.title,
      description: currentForm.description,
      service_id: currentForm.serviceId,
      form_type: currentForm.form_type,
      structure: JSON.stringify({
        pages: formPages,
        conditionals: formConditionals,
      }),
      status: currentForm.status === 'active',
    };

    if (formActionType === 'create') {
      createFormMutation.mutate(formData);
    } else {
      updateFormMutation.mutate({
        id: currentForm.id,
        formData: formData,
      });
    }
  };

  // --- Page Management Handlers ---
  const handleAddPage = () => {
    const newPage = {
      id: generateRandomId(),
      title: `Page ${formPages.length + 1}`,
      elements: [],
    };
    setFormPages([...formPages, newPage]);
    setCurrentPageIndex(formPages.length);
  };

  const handleDeletePage = (pageIndex) => {
    if (formPages.length <= 1) {
      message.error('Forms must have at least one page.');
      return;
    }
    const updatedPages = formPages.filter((_, index) => index !== pageIndex);
    setFormPages(updatedPages);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    // TODO: Update conditionals referencing deleted/shifted pages
  };

  const handleUpdatePageTitle = (pageIndex, newTitle) => {
    const updatedPages = formPages.map((page, index) =>
      index === pageIndex ? { ...page, title: newTitle } : page
    );
    setFormPages(updatedPages);
  };

  // --- Element Management Handlers ---
  const handleAddFormElement = (type, templateData = {}) => {
    const newElement = {
      id: generateRandomId(),
      type,
      label: templateData.label || `New ${type.replace('_', ' ')} field`,
      placeholder: templateData.placeholder || '',
      required: templateData.required || false,
      options: templateData.options || (['multiple_choice', 'checkboxes', 'dropdown'].includes(type)
        ? [{ id: generateRandomId(), value: 'Option 1' }]
        : undefined),
    };
    const updatedPages = [...formPages];
    updatedPages[currentPageIndex].elements = [
      ...(updatedPages[currentPageIndex].elements || []),
      newElement,
    ];
    setFormPages(updatedPages);
  };

  const handleUpdateFormElement = (elementIndex, updatedElement) => {
    const updatedPages = [...formPages];
    updatedPages[currentPageIndex].elements[elementIndex] = updatedElement;
    setFormPages(updatedPages);
  };

  const handleDeleteFormElement = (elementIndex) => {
    const elementIdToDelete = formPages[currentPageIndex].elements[elementIndex].id;
    const updatedPages = [...formPages];
    updatedPages[currentPageIndex].elements.splice(elementIndex, 1);
    setFormPages(updatedPages);
    // Remove conditionals targeting the deleted element
    setFormConditionals(prev => prev.filter(cond => cond.thenShowElementId !== elementIdToDelete && cond.elementId !== elementIdToDelete));
  };

  const handleMoveFormElement = (oldIndex, newIndex) => {
    const updatedPages = [...formPages];
    const currentPageElements = [...updatedPages[currentPageIndex].elements];
    const [movedElement] = currentPageElements.splice(oldIndex, 1);
    currentPageElements.splice(newIndex, 0, movedElement);
    updatedPages[currentPageIndex].elements = currentPageElements;
    setFormPages(updatedPages);
  };

  // --- Conditional Management Handlers ---
  const handleAddConditional = (newConditional) => {
    setFormConditionals([...formConditionals, { id: generateRandomId(), ...newConditional }]);
  };

  const handleUpdateConditional = (index, updatedConditional) => {
    const updated = [...formConditionals];
    updated[index] = { ...updated[index], ...updatedConditional };
    setFormConditionals(updated);
  };

  const handleDeleteConditional = (index) => {
    setFormConditionals(formConditionals.filter((_, i) => i !== index));
  };

  // --- Other Action Handlers ---
  const handleDeleteForm = (formId) => {
    deleteFormMutation.mutate(formId);
  };

  const handleDuplicateForm = (form) => {
    const formData = {
      title: `${form.title} (Copy)`,
      description: form.description,
      service_id: form.serviceId,
      form_type: form.form_type,
      structure: JSON.stringify({
        pages: form.pages,
        conditionals: form.conditionals,
      }),
      status: form.status === 'active',
    };
    createFormMutation.mutate(formData);
  };

  const handleShareForm = (form) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/forms/${form.shareLink || form.id}`; // Use slug or ID
    setShareLink(link);
    setShareModalVisible(true);
  };

  const toggleFormStatus = (formId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? false : true;
    updateFormMutation.mutate({ id: formId, formData: { status: newStatus } });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => message.success('Link copied to clipboard'))
      .catch(() => message.error('Failed to copy link'));
  };

  const handlePreviewForm = (form) => {
    window.open(`/forms/${form.shareLink || form.id}`, '_blank');
  };

  return (
    <div className="forms-management-container">
      <div className="service-tabs">
        <Tabs defaultActiveKey="all" onChange={setActiveService}>
          <TabPane tab="All Forms" key="all" />
          {services.map((service) => (
            <TabPane tab={service.name} key={service.id.toString()} />
          ))}
        </Tabs>
      </div>

      <div className="action-bar" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search
            placeholder="Search forms"
            onSearch={(value) => setSearchTerm(value)}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openFormBasicsModal('create')}
          >
            Create New Form
          </Button>
        </Space>
      </div>

      <FormTable
        forms={filteredForms}
        loading={formsLoading}
        onEdit={(form) => openFormBasicsModal('edit', form)}
        onDelete={handleDeleteForm}
        onDuplicate={handleDuplicateForm}
        onShare={handleShareForm}
        onPreview={handlePreviewForm}
        onToggleStatus={toggleFormStatus}
        onAdd={() => openFormBasicsModal('create')}
      />

      {/* Form Basics Modal */}
      <FormBasicsModal
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onSubmit={onFormBasicsSubmit}
        initialData={currentForm}
        services={services}
        actionType={formActionType}
      />

      {/* Form Builder Drawer */}
      <Drawer
        title={
          <div className="form-builder-header">
            <div>
              <span>Form Builder: </span>
              <Text strong>{currentForm?.title || 'New Form'}</Text>
            </div>
          </div>
        }
        placement="right"
        width="90%"
        onClose={() => {
          setFormBuilderVisible(false);
          setCurrentForm(null); // Clear current form when closing builder
        }}
        open={formBuilderVisible} // Changed 'visible' to 'open'
        extra={
          <Space>
            <Button onClick={() => setFormBuilderVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleFormBuilderSubmit}
              loading={
                createFormMutation.isLoading || updateFormMutation.isLoading
              }
            >
              {formActionType === 'create' ? 'Create Form' : 'Save Changes'}
            </Button>
          </Space>
        }
        styles={{ body: { padding: 0 } }} // Changed 'bodyStyle' to 'styles.body'
      >
        {currentForm && ( // Only render builder content if currentForm is set
          <div className="form-builder-container">
            <Tabs
              activeKey={activeBuilderTab}
              onChange={setActiveBuilderTab}
              tabPosition="top"
              style={{ width: '100%' }}
            >
              <TabPane tab="Pages & Fields" key="pages">
                <div className="form-builder-content">
                  <FormElementSidebar onAddElement={handleAddFormElement} />
                  <div className="form-pages-preview">
                    <FormPages
                      pages={formPages}
                      currentPageIndex={currentPageIndex}
                      onChangePage={setCurrentPageIndex}
                      onAddPage={handleAddPage}
                      onDeletePage={handleDeletePage}
                      onUpdatePageTitle={handleUpdatePageTitle}
                    />
                    <div className="form-preview">
                      <div className="form-preview-header">
                        <div>
                          <Title level={4}>
                            {formPages[currentPageIndex]?.title || 'Page'}
                          </Title>
                          {currentForm?.description && (
                            <Text type="secondary">
                              {currentForm.description}
                            </Text>
                          )}
                        </div>
                      </div>
                      <Divider />
                      <FormBuilderElements
                        elements={formPages[currentPageIndex]?.elements || []}
                        onUpdateElement={handleUpdateFormElement}
                        onDeleteElement={handleDeleteFormElement}
                        onMoveElement={handleMoveFormElement}
                      />
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Conditionals & Logic" key="conditionals">
                <FormConditionals
                  conditionals={formConditionals}
                  pages={formPages}
                  onAddConditional={handleAddConditional}
                  onUpdateConditional={handleUpdateConditional}
                  onDeleteConditional={handleDeleteConditional}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* Share Modal */}
      <Modal
        title="Share Form"
        visible={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setShareModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={copyToClipboard}
          >
            Copy Link
          </Button>,
        ]}
      >
        <div>
          <p>Share this link with anyone who needs to fill out the form:</p>
          <Input
            value={shareLink}
            addonAfter={
              <CopyOutlined
                onClick={copyToClipboard}
                style={{ cursor: 'pointer' }}
              />
            }
            readOnly
          />
        </div>
      </Modal>

      {/* CSS for the component */}
      <style jsx>{`
        .forms-management-container {
          padding: 0;
        }
        .service-tabs {
          margin-bottom: 20px;
          background: white;
          border-radius: 4px;
        }
        .action-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .form-builder-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 130px); /* Adjust based on Drawer header/footer */
        }
        .form-builder-content {
          display: flex;
          flex: 1;
          height: calc(100% - 48px); /* Adjust based on Tabs height */
          overflow: hidden;
        }
        .form-pages-preview {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .form-preview {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: white;
        }
        .form-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .form-builder-header {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default FormsManagement;
