import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select, Button, List, Typography, Input, Tabs, Spin, Empty } from 'antd';
import { FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMessageTemplates, useCreateMessageTemplate, useUpdateMessageTemplate, useDeleteMessageTemplate } from '../../../apis/messaging/hooks';
import { toast } from 'react-toastify';

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

/**
 * MessageTemplateModal component
 * 
 * Modal for selecting, creating, and managing message templates
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {Function} onSelect - Function to call when a template is selected
 */
const MessageTemplateModal = ({ visible, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState('select');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');
  const [isGlobal, setIsGlobal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Fetch templates
  const { 
    data: templates = [], 
    isLoading: isLoadingTemplates 
  } = useMessageTemplates({
    category: selectedCategory
  });
  
  // Mutations
  const createTemplate = useCreateMessageTemplate();
  const updateTemplate = useUpdateMessageTemplate();
  const deleteTemplate = useDeleteMessageTemplate();
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setActiveTab('select');
      setSelectedCategory(null);
      resetForm();
    }
  }, [visible]);
  
  const resetForm = () => {
    setTemplateTitle('');
    setTemplateContent('');
    setTemplateCategory('general');
    setIsGlobal(false);
    setEditingTemplate(null);
  };
  
  const handleSelectTemplate = (template) => {
    onSelect(template.content);
  };
  
  const handleCreateTemplate = () => {
    if (!templateTitle.trim()) {
      toast.error('Please enter a template title');
      return;
    }
    
    if (!templateContent.trim()) {
      toast.error('Please enter template content');
      return;
    }
    
    createTemplate.mutate({
      title: templateTitle.trim(),
      content: templateContent.trim(),
      category: templateCategory,
      isGlobal
    }, {
      onSuccess: () => {
        toast.success('Template created successfully');
        resetForm();
        setActiveTab('select');
      }
    });
  };
  
  const handleUpdateTemplate = () => {
    if (!templateTitle.trim()) {
      toast.error('Please enter a template title');
      return;
    }
    
    if (!templateContent.trim()) {
      toast.error('Please enter template content');
      return;
    }
    
    updateTemplate.mutate({
      id: editingTemplate.id,
      title: templateTitle.trim(),
      content: templateContent.trim(),
      category: templateCategory,
      isGlobal
    }, {
      onSuccess: () => {
        toast.success('Template updated successfully');
        resetForm();
        setActiveTab('select');
      }
    });
  };
  
  const handleDeleteTemplate = (template) => {
    if (window.confirm(`Are you sure you want to delete the template "${template.title}"?`)) {
      deleteTemplate.mutate(template.id, {
        onSuccess: () => {
          toast.success('Template deleted successfully');
        }
      });
    }
  };
  
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title);
    setTemplateContent(template.content);
    setTemplateCategory(template.category || 'general');
    setIsGlobal(template.is_global || false);
    setActiveTab('create');
  };
  
  const renderSelectTab = () => (
    <div>
      <div className="mb-4">
        <Select
          style={{ width: '100%' }}
          placeholder="Filter by category"
          allowClear
          onChange={setSelectedCategory}
          value={selectedCategory}
        >
          <Select.Option value="clinical">Clinical</Select.Option>
          <Select.Option value="billing">Billing</Select.Option>
          <Select.Option value="general">General</Select.Option>
          <Select.Option value="support">Support</Select.Option>
        </Select>
      </div>
      
      {isLoadingTemplates ? (
        <div className="flex justify-center my-8">
          <Spin />
        </div>
      ) : templates.length === 0 ? (
        <Empty 
          description="No templates found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <List
          dataSource={templates}
          renderItem={(template) => (
            <List.Item
              actions={[
                <Button 
                  key="edit" 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTemplate(template);
                  }}
                />,
                <Button 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template);
                  }}
                />
              ]}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelectTemplate(template)}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined className="text-indigo-500 text-xl" />}
                title={
                  <div className="flex items-center">
                    <span>{template.title}</span>
                    {template.is_global && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Global
                      </span>
                    )}
                  </div>
                }
                description={
                  <div>
                    <Text className="text-gray-500 block mb-1" ellipsis={{ rows: 2 }}>
                      {template.content}
                    </Text>
                    {template.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        template.category === 'clinical' ? 'bg-blue-100 text-blue-800' :
                        template.category === 'billing' ? 'bg-yellow-100 text-yellow-800' :
                        template.category === 'support' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {template.category}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
  
  const renderCreateTab = () => (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Title
        </label>
        <Input
          placeholder="Enter template title"
          value={templateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Content
        </label>
        <TextArea
          rows={6}
          placeholder="Enter template content"
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select
          style={{ width: '100%' }}
          value={templateCategory}
          onChange={setTemplateCategory}
        >
          <Select.Option value="clinical">Clinical</Select.Option>
          <Select.Option value="billing">Billing</Select.Option>
          <Select.Option value="general">General</Select.Option>
          <Select.Option value="support">Support</Select.Option>
        </Select>
      </div>
      
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isGlobal"
          checked={isGlobal}
          onChange={(e) => setIsGlobal(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isGlobal" className="text-sm text-gray-700">
          Make this template available to all users
        </label>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={resetForm} 
          className="mr-2"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          loading={createTemplate.isLoading || updateTemplate.isLoading}
        >
          {editingTemplate ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title="Message Templates"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Select Template" key="select">
          {renderSelectTab()}
        </TabPane>
        <TabPane tab={editingTemplate ? "Edit Template" : "Create Template"} key="create">
          {renderCreateTab()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

MessageTemplateModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default MessageTemplateModal;
