// src/pages/settings/pages/forms/FormsManagement.jsx - Refactored for Supabase
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal as AntModal, // Alias Ant Design Modal
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
  ChevronLeft, // Added
  ChevronRight // Added
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isAfter, isBefore } from 'date-fns'; // Import date-fns functions

// Import components and hooks
import FormElementSidebar from "./FormElementSidebar";
import FormBuilderElements from "./FormBuilderElements";
import FormPages from "./FormPages";
import FormConditionals from "./FormConditionals";
import {
  useForms,
  // useFormById, // Not used in this list view
  useCreateForm,
  useUpdateForm,
  useDeleteForm,
} from "../../../../apis/forms/hooks"; // Ensure path is correct
// Assuming LoadingSpinner is available, adjust path if needed
import LoadingSpinner from "../../../patients/patientDetails/common/LoadingSpinner";
// Import shared form components (adjust path if necessary)
import { Modal, FormInput, FormSelect, FormTextarea, FormCheckbox } from '../../../products/ProductComponents'; // Added import


const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Generate unique ID helper function
function generateRandomId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format date string (YYYY-MM-DD) for input type="date"
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        // Ensure the date string is treated as UTC to avoid timezone issues
        // Supabase timestamptz is usually returned in ISO 8601 format
        return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (e) {
        console.error("Error formatting date for input:", e);
        return ''; // Handle invalid date string
    }
};

// Helper to format date for display
const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
        console.error("Error formatting date for display:", e);
        return "Invalid Date";
    }
};


// Main Forms Management Component
const FormsManagement = () => {
  const queryClient = useQueryClient();

  // Local state
  const [activeService, setActiveService] = useState("all"); // Keep for client-side tab filtering for now
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formActionType, setFormActionType] = useState("create"); // 'create' or 'edit'
  const [currentForm, setCurrentForm] = useState(null); // Holds transformed form for editing/builder
  const [formBuilderVisible, setFormBuilderVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [formPages, setFormPages] = useState([]);
  const [formConditionals, setFormConditionals] = useState([]);
  const [activeBuilderTab, setActiveBuilderTab] = useState("pages");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // TODO: Replace with actual service fetching hook
  const [services, setServices] = useState([
    { id: 1, name: "Consultation", category: "Medical" },
    { id: 2, name: "Weight Management", category: "Medical" },
    { id: 4, name: "Insurance Verification", category: "Administrative" },
  ]);

  const {
    control: formBasicsControl,
    handleSubmit: handleFormBasicsSubmit,
    reset: resetFormBasics,
    setValue: setFormBasicsValue // Use setValue to update form state programmatically
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      service_id: null,
      form_type: "",
      is_active: true, // Use is_active boolean
    },
  });

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      if (searchTerm) activeFilters.title = searchTerm; // API filter by title
      // Add other API filters here if needed (e.g., form_type)
      return activeFilters;
  }, [searchTerm]);

  const {
      data: formsQueryResult,
      isLoading: formsLoading,
      error: formsError,
      isFetching // Destructure isFetching
  } = useForms(currentPage, filters);

  const forms = formsQueryResult?.data || [];
  const pagination = formsQueryResult?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 };

  // --- Mutations ---
  const createFormMutation = useCreateForm({
    onSuccess: () => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics();
      setFormPages([]);
      setFormConditionals([]);
      message.success("Form created successfully");
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
     onError: (error) => message.error(`Error creating form: ${error.message}`)
  });
  const updateFormMutation = useUpdateForm({
    onSuccess: (data, variables) => {
      setFormBuilderVisible(false);
      setCurrentForm(null);
      resetFormBasics();
      setFormPages([]);
      setFormConditionals([]);
      message.success("Form updated successfully");
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', variables.id] });
    },
     onError: (error) => message.error(`Error updating form: ${error.message}`)
  });
  const deleteFormMutation = useDeleteForm({
      onSuccess: () => {
          message.success("Form deleted successfully.");
          queryClient.invalidateQueries({ queryKey: ['forms'] });
      },
      onError: (error) => message.error(`Error deleting form: ${error.message}`)
  });

  // Transform API response within useMemo
  const transformedForms = useMemo(() => forms.map((form) => {
      let formPagesData = [];
      let formConditionalsData = [];
      let structure = form.structure; // Structure should be JSONB

      // Ensure structure is an object before accessing properties
      if (structure && typeof structure === 'object') {
          if (structure.pages && Array.isArray(structure.pages)) {
              formPagesData = structure.pages;
              formConditionalsData = structure.conditionals || [];
          } else {
               // Handle cases where structure might not have pages/conditionals
               formPagesData = [{ id: generateRandomId(), title: "Page 1", elements: [] }];
          }
      } else {
           formPagesData = [{ id: generateRandomId(), title: "Page 1", elements: [] }];
      }

      const totalElements = formPagesData.reduce((count, page) => count + (page.elements ? page.elements.length : 0), 0);
      const service = services.find(s => s.id === form.service_id);

      return {
          id: form.id,
          title: form.title,
          description: form.description,
          serviceId: form.service_id,
          serviceName: service?.name || '-',
          status: form.is_active ? "active" : "inactive", // Use is_active
          form_type: form.form_type,
          createdAt: new Date(form.created_at).toLocaleDateString(),
          updatedAt: new Date(form.updated_at).toLocaleDateString(),
          pages: formPagesData, // Use parsed data
          conditionals: formConditionalsData, // Use parsed data
          elementCount: totalElements,
          pageCount: formPagesData.length,
          shareLink: form.slug, // Assuming slug exists
          submissions: 0, // Placeholder
      };
  }), [forms, services]); // Add services dependency

  // Initialize form builder state when editing
  useEffect(() => {
    if (currentForm && formActionType === "edit") {
      resetFormBasics({
        title: currentForm.title,
        description: currentForm.description,
        service_id: currentForm.serviceId,
        form_type: currentForm.form_type || "",
        is_active: currentForm.status === "active", // Set based on derived status
      });
      setFormPages(currentForm.pages || [{ id: generateRandomId(), title: "Page 1", elements: [] }]);
      setFormConditionals(currentForm.conditionals || []);
    } else {
       resetFormBasics( { title: "", description: "", service_id: null, form_type: "", is_active: true });
       setFormPages([{ id: generateRandomId(), title: "Page 1", elements: [] }]);
       setFormConditionals([]);
    }
    setCurrentPageIndex(0);
  }, [currentForm, formActionType, resetFormBasics]);

  // Apply client-side filtering for service tabs
  const filteredForms = useMemo(() => transformedForms.filter((form) => {
      return activeService === "all" || form.serviceId === parseInt(activeService);
  }), [transformedForms, activeService]);

  // --- Handlers ---

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle form basics submission (Step 1 of create/edit)
  const onFormBasicsSubmit = (data) => {
    const basicData = {
        title: data.title,
        description: data.description,
        serviceId: data.service_id,
        form_type: data.form_type,
        status: data.is_active ? "active" : "inactive",
        createdAt: formActionType === 'create' ? new Date().toISOString() : currentForm.createdAt,
        updatedAt: new Date().toISOString(),
        shareLink: formActionType === 'create' ? data.title.toLowerCase().replace(/\s+/g, "-") : currentForm.shareLink,
        submissions: formActionType === 'create' ? 0 : currentForm.submissions,
    };

    if (formActionType === "create") {
        setCurrentForm({
            ...basicData,
            id: generateRandomId(), // Temp ID
            pages: [{ id: generateRandomId(), title: "Page 1", elements: [] }],
            conditionals: [],
            elementCount: 0,
            pageCount: 1,
        });
    } else {
        setCurrentForm(prev => ({
            ...prev,
            ...basicData,
        }));
        setFormPages(currentForm.pages || [{ id: generateRandomId(), title: "Page 1", elements: [] }]);
        setFormConditionals(currentForm.conditionals || []);
    }
    setFormModalVisible(false);
    setFormBuilderVisible(true);
  };

  // Handle final form builder submission (Step 2)
  const handleFormBuilderSubmit = () => {
    if (!currentForm) return;
    const apiData = {
      title: currentForm.title,
      description: currentForm.description,
      service_id: currentForm.serviceId,
      form_type: currentForm.form_type,
      structure: { pages: formPages, conditionals: formConditionals },
      is_active: currentForm.status === "active",
      slug: currentForm.shareLink,
    };
    // Remove fields not in DB schema if they exist in apiData (like status, serviceName)
    delete apiData.status;
    delete apiData.serviceName;


    if (formActionType === "create") {
      createFormMutation.mutate(apiData);
    } else {
      updateFormMutation.mutate({ id: currentForm.id, formData: apiData });
    }
  };

  // Builder Handlers (Keep existing logic - simplified for brevity)
  const handleAddPage = () => { const newPage = { id: generateRandomId(), title: `Page ${formPages.length + 1}`, elements: [] }; setFormPages([...formPages, newPage]); setCurrentPageIndex(formPages.length); };
  const handleDeletePage = (pageIndex) => { if (formPages.length <= 1) { message.error("Forms must have at least one page."); return; } const updatedPages = [...formPages]; updatedPages.splice(pageIndex, 1); setFormPages(updatedPages); if (pageIndex <= currentPageIndex) { setCurrentPageIndex(Math.max(0, currentPageIndex - 1)); } const updatedConditionals = formConditionals.filter((condition) => condition.thenGoToPage !== pageIndex).map((condition) => ({ ...condition, thenGoToPage: condition.thenGoToPage > pageIndex ? condition.thenGoToPage - 1 : condition.thenGoToPage, })); setFormConditionals(updatedConditionals); };
  const handleUpdatePageTitle = (pageIndex, newTitle) => { const updatedPages = [...formPages]; updatedPages[pageIndex] = { ...updatedPages[pageIndex], title: newTitle }; setFormPages(updatedPages); };
  const handleAddFormElement = (type) => { const newElement = { id: generateRandomId(), type, label: `New ${type.replace("_", " ")} field`, placeholder: `Enter ${type.replace("_", " ")}`, required: false, }; if (["multiple_choice", "checkboxes", "dropdown"].includes(type)) { newElement.options = [{ id: generateRandomId(), value: "Option 1" }, { id: generateRandomId(), value: "Option 2" }, { id: generateRandomId(), value: "Option 3" }]; } const updatedPages = [...formPages]; updatedPages[currentPageIndex].elements = [...(updatedPages[currentPageIndex].elements || []), newElement]; setFormPages(updatedPages); };
  const handleUpdateFormElement = (elementIndex, updatedElement) => { const updatedPages = [...formPages]; const currentPage = updatedPages[currentPageIndex]; const updatedElements = [...currentPage.elements]; updatedElements[elementIndex] = updatedElement; updatedPages[currentPageIndex] = { ...currentPage, elements: updatedElements }; setFormPages(updatedPages); };
  const handleDeleteFormElement = (elementIndex) => { const updatedPages = [...formPages]; const currentPage = updatedPages[currentPageIndex]; const elementId = currentPage.elements[elementIndex].id; const updatedElements = [...currentPage.elements]; updatedElements.splice(elementIndex, 1); updatedPages[currentPageIndex] = { ...currentPage, elements: updatedElements }; setFormPages(updatedPages); const updatedConditionals = formConditionals.filter((condition) => condition.elementId !== elementId); if (updatedConditionals.length !== formConditionals.length) { setFormConditionals(updatedConditionals); } };
  const handleMoveFormElement = (oldIndex, newIndex) => { const updatedPages = [...formPages]; const currentPage = updatedPages[currentPageIndex]; const updatedElements = [...currentPage.elements]; const [removedElement] = updatedElements.splice(oldIndex, 1); updatedElements.splice(newIndex, 0, removedElement); updatedPages[currentPageIndex] = { ...currentPage, elements: updatedElements }; setFormPages(updatedPages); };
  const handleAddConditional = (newConditional) => { setFormConditionals([...formConditionals, { id: generateRandomId(), ...newConditional }]); };
  const handleUpdateConditional = (conditionalIndex, updatedConditional) => { const updatedConditionals = [...formConditionals]; updatedConditionals[conditionalIndex] = { ...updatedConditionals[conditionalIndex], ...updatedConditional }; setFormConditionals(updatedConditionals); };
  const handleDeleteConditional = (conditionalIndex) => { const updatedConditionals = [...formConditionals]; updatedConditionals.splice(conditionalIndex, 1); setFormConditionals(updatedConditionals); };

  // Form list action handlers
  const handleDeleteForm = (formId) => { if (window.confirm("Are you sure you want to delete this form? This also deletes all submissions.")) { deleteFormMutation.mutate(formId); } };
  const handleDuplicateForm = (form) => { const formData = { title: `${form.title} (Copy)`, description: form.description, service_id: form.serviceId, form_type: form.form_type, structure: { pages: form.pages, conditionals: form.conditionals }, is_active: false, slug: `${form.shareLink}-copy-${generateRandomId()}` }; createFormMutation.mutate(formData); };
  const handleShareForm = (form) => { const baseUrl = window.location.origin; const link = `${baseUrl}/forms/${form.shareLink || form.id}`; setShareLink(link); setShareModalVisible(true); };
  const toggleFormStatus = (formId, currentStatus) => { const newStatus = currentStatus === "active" ? false : true; updateFormMutation.mutate({ id: formId, formData: { is_active: newStatus } }); };
  const copyToClipboard = () => { navigator.clipboard.writeText(shareLink).then(() => message.success("Link copied")).catch(() => message.error("Failed to copy")); };
  const getServiceName = (serviceId) => { const service = services.find((s) => s.id === serviceId); return service ? service.name : "-"; };
  const handlePreviewForm = (form) => { window.open(`/forms/${form.shareLink || form.id}`, "_blank"); };

  // Table columns configuration
  const columns = [
    { title: "Form Name", dataIndex: "title", key: "title", render: (text, record) => ( <div><Text strong>{text}</Text><div><Text type="secondary" style={{ fontSize: "12px" }}>{record.description}</Text></div></div> ) },
    { title: "Service", dataIndex: "serviceName", key: "serviceName" },
    { title: "Type", dataIndex: "form_type", key: "form_type", render: (type) => type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "-" },
    { title: "Status", dataIndex: "status", key: "status", render: (status, record) => ( <Popconfirm title={`Are you sure you want to ${status === "active" ? "deactivate" : "activate"} this form?`} onConfirm={() => toggleFormStatus(record.id, status)} okText="Yes" cancelText="No"><Tag color={status === "active" ? "green" : "red"} style={{ cursor: "pointer" }}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag></Popconfirm> ) },
    { title: "Pages", dataIndex: "pageCount", key: "pageCount", sorter: (a, b) => a.pageCount - b.pageCount },
    { title: "Fields", dataIndex: "elementCount", key: "elementCount", sorter: (a, b) => a.elementCount - b.elementCount },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
    { title: "Last Updated", dataIndex: "updatedAt", key: "updatedAt", sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt) },
    { title: "Actions", key: "actions", render: (_, record) => ( <Space><Tooltip title="Edit Form"><Button icon={<EditOutlined />} onClick={() => { setCurrentForm(record); setFormActionType("edit"); setFormModalVisible(true); }} /></Tooltip><Dropdown overlay={ <Menu><Menu.Item key="duplicate" icon={<CopyOutlined />} onClick={() => handleDuplicateForm(record)}>Duplicate</Menu.Item><Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => handleShareForm(record)}>Share</Menu.Item><Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreviewForm(record)}>Preview</Menu.Item><Menu.Divider /><Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteForm(record.id)}>Delete</Menu.Item></Menu> } trigger={["click"]}><Button icon={<MoreOutlined />} /></Dropdown></Space> ) },
  ];

  return (
    <div className="forms-management-container">
      {/* Service Tabs */}
      <div className="service-tabs">
        <Tabs defaultActiveKey="all" onChange={setActiveService}>
          <TabPane tab="All Forms" key="all" />
          {services.map((service) => (<TabPane tab={service.name} key={service.id.toString()} />))}
        </Tabs>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search placeholder="Search forms by title..." onSearch={(value) => { setSearchTerm(value); setCurrentPage(1); }} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} allowClear prefix={<SearchOutlined />} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrentForm(null); setFormActionType("create"); resetFormBasics(); setFormPages([{ id: generateRandomId(), title: "Page 1", elements: [] }]); setFormConditionals([]); setFormModalVisible(true); }}>Create New Form</Button>
        </Space>
      </div>

      {/* Forms Table */}
      <Table
        columns={columns}
        dataSource={filteredForms} // Use client-side filtered forms for tabs
        rowKey="id"
        pagination={{
            current: currentPage,
            pageSize: pagination.itemsPerPage || 10,
            total: pagination.totalCount,
            onChange: handlePageChange,
            showSizeChanger: false,
        }}
        loading={formsLoading || isFetching}
        locale={{ emptyText: ( <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No forms found. <Button type="link" onClick={() => { setCurrentForm(null); setFormActionType("create"); resetFormBasics(); setFormPages([]); setFormModalVisible(true); }}>Create your first form</Button></span>} /> ) }}
      />

      {/* Form Basics Modal */}
      <AntModal title={formActionType === "create" ? "Create New Form" : "Edit Form"} visible={formModalVisible} onCancel={() => setFormModalVisible(false)} footer={[ <Button key="back" onClick={() => setFormModalVisible(false)}>Cancel</Button>, <Button key="submit" type="primary" onClick={handleFormBasicsSubmit(onFormBasicsSubmit)}>{formActionType === "create" ? "Proceed to Form Builder" : "Save & Edit Form"}</Button> ]} width={600}>
        <Form layout="vertical">
          <Controller name="title" control={formBasicsControl} rules={{ required: "Form title is required" }} render={({ field, fieldState }) => (<Form.Item label="Form Title" validateStatus={fieldState.error ? "error" : ""} help={fieldState.error ? fieldState.error.message : ""}><Input {...field} placeholder="Enter form title" /></Form.Item>)} />
          <Controller name="description" control={formBasicsControl} render={({ field }) => (<Form.Item label="Description"><Input.TextArea {...field} placeholder="Enter form description" rows={4} /></Form.Item>)} />
          <Controller name="service_id" control={formBasicsControl} rules={{ required: "Please select a service" }} render={({ field, fieldState }) => (<Form.Item label="Associated Service" validateStatus={fieldState.error ? "error" : ""} help={fieldState.error ? fieldState.error.message : ""}><Select {...field} placeholder="Select a service">{services.map((service) => (<Option key={service.id} value={service.id}>{service.name}</Option>))}</Select></Form.Item>)} />
          <Controller name="form_type" control={formBasicsControl} render={({ field }) => (<Form.Item label="Form Type"><Select {...field} placeholder="Select form type"><Option value="initial_consultation">Initial Consultation</Option><Option value="follow_up">Follow-up</Option><Option value="insurance_verification">Insurance Verification</Option><Option value="medication_refill">Medication Refill</Option><Option value="feedback">Feedback</Option><Option value="general">General</Option></Select></Form.Item>)} />
          <Controller name="is_active" control={formBasicsControl} render={({ field }) => (<Form.Item label="Status"><Select {...field} value={field.value} onChange={(value) => field.onChange(value)}><Option value={true}>Active</Option><Option value={false}>Inactive</Option></Select></Form.Item>)} />
        </Form>
      </AntModal>

      {/* Form Builder Drawer */}
      <Drawer title={ <div className="form-builder-header"><div><span>Form Builder: </span><Text strong>{currentForm?.title || "New Form"}</Text></div></div> } placement="right" width="90%" onClose={() => { setFormBuilderVisible(false); setCurrentForm(null); }} visible={formBuilderVisible} extra={ <Space><Button onClick={() => setFormBuilderVisible(false)}>Cancel</Button><Button type="primary" onClick={handleFormBuilderSubmit} loading={ createFormMutation.isPending || updateFormMutation.isPending }>{formActionType === "create" ? "Create Form" : "Save Changes"}</Button></Space> } bodyStyle={{ padding: 0 }}>
        <div className="form-builder-container">
          <Tabs activeKey={activeBuilderTab} onChange={setActiveBuilderTab} tabPosition="top" style={{ width: "100%" }}>
            <TabPane tab="Pages & Fields" key="pages">
              <div className="form-builder-content">
                <FormElementSidebar onAddElement={handleAddFormElement} />
                <div className="form-pages-preview">
                  <FormPages pages={formPages} currentPageIndex={currentPageIndex} onChangePage={setCurrentPageIndex} onAddPage={handleAddPage} onDeletePage={handleDeletePage} onUpdatePageTitle={handleUpdatePageTitle} />
                  <div className="form-preview">
                    <div className="form-preview-header"><div><Title level={4}>{formPages[currentPageIndex]?.title || "Page"}</Title>{currentForm?.description && (<Text type="secondary">{currentForm.description}</Text>)}</div></div>
                    <Divider />
                    <FormBuilderElements elements={formPages[currentPageIndex]?.elements || []} onUpdateElement={handleUpdateFormElement} onDeleteElement={handleDeleteFormElement} onMoveElement={handleMoveFormElement} />
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="Conditionals & Logic" key="conditionals">
              <FormConditionals conditionals={formConditionals} pages={formPages} onAddConditional={handleAddConditional} onUpdateConditional={handleUpdateConditional} onDeleteConditional={handleDeleteConditional} />
            </TabPane>
          </Tabs>
        </div>
      </Drawer>

      {/* Share Modal */}
      <AntModal title="Share Form" visible={shareModalVisible} onCancel={() => setShareModalVisible(false)} footer={[ <Button key="back" onClick={() => setShareModalVisible(false)}>Close</Button>, <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyToClipboard}>Copy Link</Button> ]}>
        <div><p>Share this link with anyone who needs to fill out the form:</p><Input value={shareLink} addonAfter={ <CopyOutlined onClick={copyToClipboard} style={{ cursor: "pointer" }} /> } readOnly /></div>
      </AntModal>

      {/* CSS */}
      <style jsx>{`
        .forms-management-container { padding: 0; }
        .service-tabs { margin-bottom: 20px; background: white; border-radius: 4px; }
        .action-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .form-builder-container { display: flex; flex-direction: column; height: calc(100vh - 130px); }
        .form-builder-content { display: flex; flex: 1; height: calc(100vh - 180px); overflow: hidden; }
        .form-pages-preview { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .form-preview { flex: 1; padding: 20px; overflow-y: auto; background: white; }
        .form-preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .form-builder-header { display: flex; align-items: center; }
      `}</style>
    </div>
  );
};

export default FormsManagement;
