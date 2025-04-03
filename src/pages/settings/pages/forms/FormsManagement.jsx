import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Typography,
  Tooltip,
  Tag,
  Popconfirm,
  message,
  Drawer,
  Tabs,
  Empty,
  Menu,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';

// Import components and hooks
import FormElementSidebar from './FormElementSidebar';
import FormBuilderElements from './FormBuilderElements';
import FormPages from './FormPages';
import FormConditionals from './FormConditionals';
import {
  useForms,
  useFormById,
  useCreateForm,
  useUpdateForm,
  useDeleteForm,
} from '../../../../apis/forms/hooks';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Generate unique ID helper function
function generateRandomId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

// Main Forms Management Component
const FormsManagement = () => {
  // API integration with react-query hooks
  const { data: formsData, isLoading: formsLoading } = useForms();
  const createFormMutation = useCreateForm({
    onSuccess: () => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics();
      setFormPages([]);
      setFormConditionals([]);
      message.success('Form created successfully');
    },
  });
  const updateFormMutation = useUpdateForm({
    onSuccess: () => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics();
      setFormPages([]);
      setFormConditionals([]);
      message.success('Form updated successfully');
    },
  });
  const deleteFormMutation = useDeleteForm();

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
  const [services, setServices] = useState([
    { id: 1, name: 'Consultation', category: 'Medical' },
    { id: 2, name: 'Weight Management', category: 'Medical' },
    { id: 4, name: 'Insurance Verification', category: 'Administrative' },
  ]);

  const {
    control: formBasicsControl,
    handleSubmit: handleFormBasicsSubmit,
    reset: resetFormBasics,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      service_id: null,
      form_type: '',
      status: true,
    },
  });

  // Normalize form data from API to component state
  const forms = formsData?.data || [];

  // Transform API response to match component data structure
  const transformedForms = forms.map((form) => {
    const formData = form;
    let formPages = [];
    let formConditionals = [];

    try {
      if (formData.structure) {
        const structure = JSON.parse(formData.structure);
        // Check if it's new multi-page format or legacy single-page format
        if (structure.pages && Array.isArray(structure.pages)) {
          formPages = structure.pages;
          formConditionals = structure.conditionals || [];
        } else if (Array.isArray(structure)) {
          // Legacy format - convert to multi-page
          formPages = [
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
      formPages = [
        {
          id: generateRandomId(),
          title: 'Page 1',
          elements: [],
        },
      ];
    }

    const totalElements = formPages.reduce(
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
      pages: formPages,
      conditionals: formConditionals,
      elementCount: totalElements,
      pageCount: formPages.length,
      shareLink: formData.slug,
      submissions: 0, // Placeholder, would come from API in real app
    };
  });

  // Initialize form pages and conditionals when form is loaded
  useEffect(() => {
    if (currentForm && formActionType === 'edit') {
      resetFormBasics({
        title: currentForm.title,
        description: currentForm.description,
        service_id: currentForm.serviceId,
        form_type: currentForm.form_type || '',
        status: currentForm.status === 'active',
      });

      // Load the form pages if they exist
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

      // Load conditionals
      if (currentForm.conditionals && currentForm.conditionals.length > 0) {
        setFormConditionals(currentForm.conditionals);
      } else {
        setFormConditionals([]);
      }
    } else {
      // Initialize with one empty page for new forms
      setFormPages([
        {
          id: generateRandomId(),
          title: 'Page 1',
          elements: [],
        },
      ]);
      setFormConditionals([]);
    }

    // Always start with the first page
    setCurrentPageIndex(0);
  }, [currentForm, formActionType, resetFormBasics]);

  // Filter forms based on selected service and search text
  const filteredForms = transformedForms.filter((form) => {
    const matchesService =
      activeService === 'all' || form.serviceId === parseInt(activeService);
    const matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  });

  // Handle form basics submission (first step of form creation/editing)
  const onFormBasicsSubmit = (data) => {
    if (formActionType === 'create') {
      // Create a new form object
      const newForm = {
        id: generateRandomId(),
        title: data.title,
        description: data.description,
        serviceId: data.service_id,
        form_type: data.form_type,
        status: data.status ? 'active' : 'inactive',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        pages: [
          {
            id: generateRandomId(),
            title: 'Page 1',
            elements: [],
          },
        ],
        conditionals: [],
        shareLink: data.title.toLowerCase().replace(/\s+/g, '-'),
        submissions: 0,
        elementCount: 0,
        pageCount: 1,
      };
      setCurrentForm(newForm);
    } else {
      // Update the existing form with new data
      const updatedForm = {
        ...currentForm,
        title: data.title,
        description: data.description,
        serviceId: data.service_id,
        form_type: data.form_type,
        status: data.status ? 'active' : 'inactive',
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setCurrentForm(updatedForm);
    }

    // Move to form builder step
    setFormModalVisible(false);
    setFormBuilderVisible(true);
  };

  // Handle form builder submission (second step of form creation/editing)
  const handleFormBuilderSubmit = () => {
    // Prepare form data for API
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
      // Call API to create new form
      createFormMutation.mutate(formData);
    } else {
      // Call API to update existing form
      updateFormMutation.mutate({
        id: currentForm.id,
        formData: formData,
      });
    }
  };

  // Create a new page
  const handleAddPage = () => {
    const newPage = {
      id: generateRandomId(),
      title: `Page ${formPages.length + 1}`,
      elements: [],
    };

    setFormPages([...formPages, newPage]);
    // Switch to the new page
    setCurrentPageIndex(formPages.length);
  };

  // Delete a page
  const handleDeletePage = (pageIndex) => {
    if (formPages.length <= 1) {
      message.error(
        'Cannot delete the only page. Forms must have at least one page.'
      );
      return;
    }

    const updatedPages = [...formPages];
    updatedPages.splice(pageIndex, 1);
    setFormPages(updatedPages);

    // If we deleted the current page, switch to the previous page
    if (pageIndex <= currentPageIndex) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    }

    // Also update conditionals that might reference the deleted page
    const updatedConditionals = formConditionals
      .filter((condition) => condition.thenGoToPage !== pageIndex)
      .map((condition) => ({
        ...condition,
        // Adjust page references that are after the deleted page
        thenGoToPage:
          condition.thenGoToPage > pageIndex
            ? condition.thenGoToPage - 1
            : condition.thenGoToPage,
      }));

    setFormConditionals(updatedConditionals);
  };

  // Update page title
  const handleUpdatePageTitle = (pageIndex, newTitle) => {
    const updatedPages = [...formPages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      title: newTitle,
    };
    setFormPages(updatedPages);
  };

  // Handle adding a form element type to the current page
  const handleAddFormElement = (type) => {
    // Create new element based on type
    const newElement = {
      id: generateRandomId(),
      type,
      label: `New ${type.replace('_', ' ')} field`,
      placeholder: `Enter ${type.replace('_', ' ')}`,
      required: false,
    };

    // Add options if the element type needs them
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(type)) {
      newElement.options = [
        { id: generateRandomId(), value: 'Option 1' },
        { id: generateRandomId(), value: 'Option 2' },
        { id: generateRandomId(), value: 'Option 3' },
      ];
    }

    // Add element to current page
    const updatedPages = [...formPages];
    updatedPages[currentPageIndex].elements = [
      ...(updatedPages[currentPageIndex].elements || []),
      newElement,
    ];

    setFormPages(updatedPages);
  };

  // Handle updating a form element
  const handleUpdateFormElement = (elementIndex, updatedElement) => {
    const updatedPages = [...formPages];
    const currentPage = updatedPages[currentPageIndex];

    const updatedElements = [...currentPage.elements];
    updatedElements[elementIndex] = updatedElement;

    updatedPages[currentPageIndex] = {
      ...currentPage,
      elements: updatedElements,
    };

    setFormPages(updatedPages);
  };

  // Handle deleting a form element
  const handleDeleteFormElement = (elementIndex) => {
    const updatedPages = [...formPages];
    const currentPage = updatedPages[currentPageIndex];

    const updatedElements = [...currentPage.elements];
    updatedElements.splice(elementIndex, 1);

    updatedPages[currentPageIndex] = {
      ...currentPage,
      elements: updatedElements,
    };

    setFormPages(updatedPages);

    // Update conditionals that reference this element
    const elementId = currentPage.elements[elementIndex].id;
    const updatedConditionals = formConditionals.filter(
      (condition) => condition.elementId !== elementId
    );

    if (updatedConditionals.length !== formConditionals.length) {
      setFormConditionals(updatedConditionals);
    }
  };

  // Handle moving a form element (after drag and drop)
  const handleMoveFormElement = (oldIndex, newIndex) => {
    const updatedPages = [...formPages];
    const currentPage = updatedPages[currentPageIndex];

    const updatedElements = [...currentPage.elements];
    const [removedElement] = updatedElements.splice(oldIndex, 1);
    updatedElements.splice(newIndex, 0, removedElement);

    updatedPages[currentPageIndex] = {
      ...currentPage,
      elements: updatedElements,
    };

    setFormPages(updatedPages);
  };

  // Add a conditional logic rule
  const handleAddConditional = (newConditional) => {
    setFormConditionals([
      ...formConditionals,
      {
        id: generateRandomId(),
        ...newConditional,
      },
    ]);
  };

  // Update a conditional logic rule
  const handleUpdateConditional = (conditionalIndex, updatedConditional) => {
    const updatedConditionals = [...formConditionals];
    updatedConditionals[conditionalIndex] = {
      ...updatedConditionals[conditionalIndex],
      ...updatedConditional,
    };
    setFormConditionals(updatedConditionals);
  };

  // Delete a conditional logic rule
  const handleDeleteConditional = (conditionalIndex) => {
    const updatedConditionals = [...formConditionals];
    updatedConditionals.splice(conditionalIndex, 1);
    setFormConditionals(updatedConditionals);
  };

  // Handle form deletion
  const handleDeleteForm = (formId) => {
    debugger;
    // Call API to delete form
    deleteFormMutation.mutate(formId);
  };

  // Handle form duplication
  const handleDuplicateForm = (form) => {
    // Create a copy of the form
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

    // Call API to create a new form with the duplicated data
    createFormMutation.mutate(formData);
    message.success('Form duplicated successfully');
  };

  // Handle form sharing
  const handleShareForm = (form) => {
    // Generate a shareable link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/forms/${form.shareLink}`;
    setShareLink(link);
    setShareModalVisible(true);
  };

  // Toggle form status (active/inactive)
  const toggleFormStatus = (formId, currentStatus) => {
    const form = transformedForms.find((f) => f.id === formId);
    if (!form) return;

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Call API to update form status
    updateFormMutation.mutate({
      id: formId,
      formData: {
        status: newStatus === 'active',
      },
    });

    message.success(
      `Form ${
        newStatus === 'active' ? 'activated' : 'deactivated'
      } successfully`
    );
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        message.success('Link copied to clipboard');
      })
      .catch(() => {
        message.error('Failed to copy link');
      });
  };

  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : '-';
  };

  // Handle preview form
  const handlePreviewForm = (form) => {
    // Open the form in a new tab
    window.open(`/forms/${form.shareLink}`, '_blank');
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Form Name',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Type',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type) =>
        type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
        '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Popconfirm
          title={`Are you sure you want to ${
            status === 'active' ? 'deactivate' : 'activate'
          } this form?`}
          onConfirm={() => toggleFormStatus(record.id, status)}
          okText="Yes"
          cancelText="No"
        >
          <Tag
            color={status === 'active' ? 'green' : 'red'}
            style={{ cursor: 'pointer' }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        </Popconfirm>
      ),
    },
    {
      title: 'Pages',
      dataIndex: 'pageCount',
      key: 'pageCount',
      sorter: (a, b) => a.pageCount - b.pageCount,
    },
    {
      title: 'Fields',
      dataIndex: 'elementCount',
      key: 'elementCount',
      sorter: (a, b) => a.elementCount - b.elementCount,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Form">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentForm(record);
                setFormActionType('edit');
                setFormModalVisible(true);
              }}
            />
          </Tooltip>

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="duplicate"
                  icon={<CopyOutlined />}
                  onClick={() => handleDuplicateForm(record)}
                >
                  Duplicate
                </Menu.Item>
                <Menu.Item
                  key="share"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShareForm(record)}
                >
                  Share
                </Menu.Item>
                <Menu.Item
                  key="preview"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreviewForm(record)}
                >
                  Preview
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDeleteForm(record.id)}
                >
                  Delete
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

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
            onClick={() => {
              setCurrentForm(null);
              setFormActionType('create');
              resetFormBasics();
              setFormPages([]);
              setFormConditionals([]);
              setFormModalVisible(true);
            }}
          >
            Create New Form
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredForms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={formsLoading}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  No forms found.{' '}
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentForm(null);
                      setFormActionType('create');
                      resetFormBasics();
                      setFormPages([]);
                      setFormModalVisible(true);
                    }}
                  >
                    Create your first form
                  </Button>
                </span>
              }
            />
          ),
        }}
      />

      {/* Form Basics Modal */}
      <Modal
        title={formActionType === 'create' ? 'Create New Form' : 'Edit Form'}
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setFormModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleFormBasicsSubmit(onFormBasicsSubmit)}
          >
            {formActionType === 'create'
              ? 'Proceed to Form Builder'
              : 'Save Changes & Edit Form'}
          </Button>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Controller
            name="title"
            control={formBasicsControl}
            rules={{ required: 'Form title is required' }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Form Title"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error ? fieldState.error.message : ''}
              >
                <Input {...field} placeholder="Enter form title" />
              </Form.Item>
            )}
          />

          <Controller
            name="description"
            control={formBasicsControl}
            render={({ field }) => (
              <Form.Item label="Description">
                <Input.TextArea
                  {...field}
                  placeholder="Enter form description"
                  rows={4}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="service_id"
            control={formBasicsControl}
            rules={{ required: 'Please select a service' }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Associated Service"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error ? fieldState.error.message : ''}
              >
                <Select {...field} placeholder="Select a service">
                  {services.map((service) => (
                    <Option key={service.id} value={service.id}>
                      {service.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          />

          <Controller
            name="form_type"
            control={formBasicsControl}
            render={({ field }) => (
              <Form.Item label="Form Type">
                <Select {...field} placeholder="Select form type">
                  <Option value="initial_consultation">
                    Initial Consultation
                  </Option>
                  <Option value="follow_up">Follow-up</Option>
                  <Option value="insurance_verification">
                    Insurance Verification
                  </Option>
                  <Option value="medication_refill">Medication Refill</Option>
                  <Option value="feedback">Feedback</Option>
                  <Option value="general">General</Option>
                </Select>
              </Form.Item>
            )}
          />

          <Controller
            name="status"
            control={formBasicsControl}
            render={({ field }) => (
              <Form.Item label="Status">
                <Select
                  {...field}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                >
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>
            )}
          />
        </Form>
      </Modal>

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
          setCurrentForm(null);
        }}
        visible={formBuilderVisible}
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
        bodyStyle={{ padding: 0 }}
      >
        <div className="form-builder-container">
          {/* Builder Tabs */}
          <Tabs
            activeKey={activeBuilderTab}
            onChange={setActiveBuilderTab}
            tabPosition="top"
            style={{ width: '100%' }}
          >
            <TabPane tab="Pages & Fields" key="pages">
              <div className="form-builder-content">
                {/* Form Elements Sidebar */}
                <FormElementSidebar onAddElement={handleAddFormElement} />

                {/* Form Pages and Preview */}
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

                    {/* Form Elements Container */}
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
          height: calc(100vh - 130px);
        }

        .form-builder-content {
          display: flex;
          flex: 1;
          height: calc(100vh - 180px);
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
