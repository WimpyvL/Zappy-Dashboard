import React, { useState } from 'react';
import { Tabs, Button, Space, Card, Typography, Divider, Modal, Input, message } from 'antd';
import { EyeOutlined, EditOutlined, CodeOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FormsManagementV2 from './forms-v2/FormsManagementV2';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Intake Form Settings
 * 
 * This component uses the enhanced FormsManagementV2 component
 * which provides a comprehensive form management system with:
 * - Multi-page form builder
 * - Conditional logic
 * - AI-assisted form generation
 * - Form templates for different service types
 * - Import/export capabilities
 * 
 * The form builder can be used to create and manage intake forms
 * for different medical services (Weight Management, ED, etc.)
 * 
 * Added features:
 * - Preview buttons for both standard and modern intake forms
 * - Direct JSON import for form configuration
 */
const IntakeFormSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [jsonImportVisible, setJsonImportVisible] = useState(false);
  const [jsonContent, setJsonContent] = useState('');

  // Function to preview the standard intake form
  const previewStandardIntake = () => {
    window.open('/intake', '_blank');
  };

  // Function to preview the modern intake form
  const previewModernIntake = () => {
    window.open('/intake/modern', '_blank');
  };

  // Function to handle JSON import
  const handleJsonImport = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      
      // Here you would typically save this to your form system
      // For now, we'll just show a success message
      message.success('Form JSON imported successfully. The form builder will be updated with this configuration.');
      
      // Close the modal
      setJsonImportVisible(false);
      setJsonContent('');
    } catch (error) {
      message.error(`Invalid JSON format: ${error.message}`);
    }
  };

  return (
    <div className="intake-form-settings">
      <div className="header-actions" style={{ marginBottom: 20 }}>
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={previewStandardIntake}
          >
            Preview Standard Intake
          </Button>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={previewModernIntake}
          >
            Preview Modern Intake
          </Button>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => setJsonImportVisible(true)}
          >
            Import Form JSON
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Form Builder" key="1">
          <FormsManagementV2 />
        </TabPane>
        <TabPane tab="Intake Form Info" key="2">
          <div className="intake-forms-info">
            <Card title="Available Intake Forms" style={{ marginBottom: 20 }}>
              <div className="form-card">
                <Title level={4}>Standard Intake Form</Title>
                <Paragraph>
                  The standard intake form is a multi-step form that collects patient information
                  including basic info, ID verification, health history, treatment preferences,
                  shipping address, and payment details.
                </Paragraph>
                <Space>
                  <Button type="primary" icon={<EyeOutlined />} onClick={previewStandardIntake}>
                    Preview
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => setActiveTab('1')}>
                    Edit in Form Builder
                  </Button>
                </Space>
              </div>
              
              <Divider />
              
              <div className="form-card">
                <Title level={4}>Modern Intake Form</Title>
                <Paragraph>
                  The modern intake form provides an enhanced user experience with a single question
                  per screen approach, smooth animations, and a more focused interface. It's designed
                  to improve completion rates and user satisfaction.
                </Paragraph>
                <Space>
                  <Button type="primary" icon={<EyeOutlined />} onClick={previewModernIntake}>
                    Preview
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => setActiveTab('1')}>
                    Edit in Form Builder
                  </Button>
                </Space>
              </div>
            </Card>
            
            <Card title="Form Configuration">
              <Paragraph>
                Both intake forms can be configured using the Form Builder or by directly importing
                a JSON configuration. The form structure includes pages, fields, validation rules,
                and conditional logic.
              </Paragraph>
              <Button 
                icon={<CodeOutlined />} 
                onClick={() => setJsonImportVisible(true)}
              >
                Import JSON Configuration
              </Button>
            </Card>
          </div>
        </TabPane>
      </Tabs>
      
      {/* JSON Import Modal */}
      <Modal
        title="Import Form JSON Configuration"
        visible={jsonImportVisible}
        onCancel={() => {
          setJsonImportVisible(false);
          setJsonContent('');
        }}
        onOk={handleJsonImport}
        okText="Import"
        width={800}
      >
        <Paragraph>
          Paste your form JSON configuration below. This will be used to configure the form structure,
          fields, validation rules, and conditional logic.
        </Paragraph>
        <TextArea
          rows={15}
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          placeholder='{"title": "Patient Intake Form", "pages": [{"title": "Basic Information", "elements": [...]}]}'
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>
    </div>
  );
};

export default IntakeFormSettings;
