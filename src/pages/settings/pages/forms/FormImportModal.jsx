import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Alert,
  Tabs,
  Typography,
  Space,
  Divider,
  message,
  Spin,
  Select
} from 'antd';
import {
  ImportOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { validateFormStructure, prepareFormStructure } from '../../../../utils/formValidation';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * Modal for importing forms via JSON
 */
const FormImportModal = ({ 
  visible, 
  onCancel, 
  onImport,
  services = [] 
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('import');
  const [isValidating, setIsValidating] = useState(false);
  const [parsedForm, setParsedForm] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [formType, setFormType] = useState('');

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (visible) {
      setJsonInput('');
      setValidationResult(null);
      setActiveTab('import');
      setParsedForm(null);
      setSelectedService(null);
      setFormType('');
    }
  }, [visible]);

  // Handle JSON input change
  const handleInputChange = (e) => {
    setJsonInput(e.target.value);
    // Clear validation results when input changes
    if (validationResult) {
      setValidationResult(null);
      setParsedForm(null);
    }
  };

  // Validate the JSON input
  const validateJson = () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        success: false,
        error: 'Please enter JSON content'
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const result = validateFormStructure(jsonInput);
      setValidationResult(result);
      
      if (result.success) {
        // Prepare form structure for UI
        const preparedForm = prepareFormStructure(result.formStructure);
        setParsedForm(preparedForm);
        setActiveTab('preview');
        message.success('Form structure is valid!');
      }
    } catch (error) {
      setValidationResult({
        success: false,
        error: `Error validating form: ${error.message}`
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle import button click
  const handleImport = () => {
    if (!parsedForm) {
      message.error('Please validate the form first');
      return;
    }
    
    if (!selectedService) {
      message.error('Please select a service');
      return;
    }
    
    // Prepare form data for saving
    const formData = {
      title: parsedForm.title,
      description: parsedForm.description || '',
      service_id: selectedService,
      form_type: formType || 'general',
      structure: JSON.stringify({
        pages: parsedForm.pages,
        conditionals: parsedForm.conditionals || []
      }),
      status: true // Active by default
    };
    
    onImport(formData);
  };

  // Render form preview
  const renderFormPreview = () => {
    if (!parsedForm) return null;
    
    return (
      <div className="form-preview">
        <div className="form-preview-header">
          <Title level={4}>{parsedForm.title}</Title>
          {parsedForm.description && (
            <Text type="secondary">{parsedForm.description}</Text>
          )}
        </div>
        
        <Divider />
        
        <div className="form-statistics">
          <div className="stat-item">
            <Text strong>Pages:</Text> {parsedForm.pages.length}
          </div>
          <div className="stat-item">
            <Text strong>Elements:</Text> {parsedForm.pages.reduce((acc, page) => acc + page.elements.length, 0)}
          </div>
          {parsedForm.conditionals && (
            <div className="stat-item">
              <Text strong>Conditionals:</Text> {parsedForm.conditionals.length}
            </div>
          )}
        </div>
        
        <Divider />
        
        <div className="form-service-selection">
          <Title level={5}>Form Settings</Title>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Associated Service:</Text>
            <Select
              placeholder="Select a service"
              style={{ width: '100%', marginTop: 8 }}
              value={selectedService}
              onChange={setSelectedService}
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Form Type:</Text>
            <Select
              placeholder="Select form type"
              style={{ width: '100%', marginTop: 8 }}
              value={formType}
              onChange={setFormType}
            >
              <Option value="initial_consultation">Initial Consultation</Option>
              <Option value="follow_up">Follow-up</Option>
              <Option value="insurance_verification">Insurance Verification</Option>
              <Option value="medication_refill">Medication Refill</Option>
              <Option value="feedback">Feedback</Option>
              <Option value="general">General</Option>
            </Select>
          </div>
        </div>
        
        <Divider />
        
        <div className="pages-preview">
          <Title level={5}>Pages</Title>
          {parsedForm.pages.map((page, index) => (
            <div key={page.id || index} className="page-item">
              <Text strong>{page.title}</Text>
              <Text type="secondary"> ({page.elements.length} elements)</Text>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Example form template
  const exampleFormJson = JSON.stringify({
    title: "Example Intake Form",
    description: "This is an example patient intake form",
    pages: [
      {
        id: "_example1",
        title: "Personal Information",
        elements: [
          {
            id: "_element1",
            type: "text",
            label: "Full Name",
            required: true
          },
          {
            id: "_element2",
            type: "email",
            label: "Email Address",
            placeholder: "your@email.com",
            required: true
          }
        ]
      },
      {
        id: "_example2",
        title: "Medical History",
        elements: [
          {
            id: "_element3",
            type: "textarea",
            label: "Please describe any medical conditions",
            required: false
          },
          {
            id: "_element4",
            type: "multiple_choice",
            label: "Are you currently taking any medications?",
            options: [
              { id: "_opt1", value: "Yes" },
              { id: "_opt2", value: "No" }
            ],
            required: true
          }
        ]
      }
    ],
    conditionals: []
  }, null, 2);

  return (
    <Modal
      title={
        <span>
          <ImportOutlined /> Import Form from JSON
        </span>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        activeTab === 'import' ? (
          <Button
            key="validate"
            type="primary"
            onClick={validateJson}
            loading={isValidating}
            disabled={!jsonInput.trim()}
          >
            Validate JSON
          </Button>
        ) : (
          <Button
            key="import"
            type="primary"
            onClick={handleImport}
            disabled={!validationResult?.success || !selectedService}
            icon={<CheckCircleOutlined />}
          >
            Import Form
          </Button>
        ),
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <FileTextOutlined /> Import JSON
            </span>
          }
          key="import"
        >
          <div className="import-tab-content">
            <Paragraph>
              Paste your form JSON below. The JSON structure should include:
            </Paragraph>
            <ul>
              <li>
                <Text code>title</Text> - The form title (required)
              </li>
              <li>
                <Text code>description</Text> - Form description (optional)
              </li>
              <li>
                <Text code>pages</Text> - Array of form pages with elements (required)
              </li>
              <li>
                <Text code>conditionals</Text> - Array of conditional logic (optional)
              </li>
            </ul>

            <TextArea
              placeholder="Paste your form JSON here..."
              rows={12}
              value={jsonInput}
              onChange={handleInputChange}
              className="json-input"
            />

            <div style={{ marginTop: 16 }}>
              <Button 
                type="link" 
                icon={<CodeOutlined />}
                onClick={() => setJsonInput(exampleFormJson)}
              >
                Load Example JSON
              </Button>
            </div>

            {validationResult && (
              <Alert
                message={validationResult.success ? "Valid Form Structure" : "Error"}
                description={validationResult.error || "Form structure is valid and ready to import!"}
                type={validationResult.success ? "success" : "error"}
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
            
            {isValidating && (
              <div className="validation-spinner">
                <Spin tip="Validating..." />
              </div>
            )}
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <EyeOutlined /> Preview Form
            </span>
          }
          key="preview"
          disabled={!validationResult?.success}
        >
          {renderFormPreview()}
        </TabPane>
      </Tabs>

      <style jsx>{`
        .import-tab-content {
          min-height: 300px;
        }
        .json-input {
          margin-top: 16px;
          font-family: monospace;
        }
        .validation-spinner {
          margin-top: 16px;
          text-align: center;
        }
        .form-preview {
          min-height: 300px;
        }
        .form-statistics {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .stat-item {
          flex-basis: 30%;
          padding: 8px 16px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .page-item {
          padding: 8px;
          margin-top: 8px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
        }
      `}</style>
    </Modal>
  );
};

export default FormImportModal;