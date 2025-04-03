import React, { useState } from "react";
import { 
  Card, 
  Typography, 
  Tabs, 
  Collapse,
  Button,
  Tooltip,
  Divider 
} from "antd";
import {
  FormOutlined,
  FileTextOutlined,
  NumberOutlined,
  CheckSquareOutlined,
  DownOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  PlusOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Form element types with their icons
const basicElementTypes = [
  { type: "short_text", label: "Short Text", icon: <FormOutlined /> },
  { type: "paragraph", label: "Paragraph", icon: <FileTextOutlined /> },
  { type: "number", label: "Number", icon: <NumberOutlined /> },
  { type: "multiple_choice", label: "Multiple Choice", icon: <FormOutlined /> },
  { type: "checkboxes", label: "Checkboxes", icon: <CheckSquareOutlined /> },
  { type: "dropdown", label: "Dropdown", icon: <DownOutlined /> },
  { type: "date", label: "Date", icon: <CalendarOutlined /> },
  { type: "time", label: "Time", icon: <ClockCircleOutlined /> },
  { type: "email", label: "Email", icon: <MailOutlined /> },
  { type: "phone", label: "Phone", icon: <PhoneOutlined /> },
  { type: "name", label: "Name", icon: <UserOutlined /> },
  { type: "address", label: "Address", icon: <HomeOutlined /> }
];

// Templates for common field collections
const templateBlocks = [
  {
    id: "personal_info",
    title: "Personal Information",
    icon: <IdcardOutlined />,
    description: "Basic contact and personal details",
    fields: [
      {
        type: "name",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true
      },
      {
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your phone number",
        required: true
      },
      {
        type: "date",
        label: "Date of Birth",
        required: true
      },
      {
        type: "address",
        label: "Home Address",
        placeholder: "Enter your address",
        required: false
      }
    ]
  },
  {
    id: "medical_history",
    title: "Medical History",
    icon: <MedicineBoxOutlined />,
    description: "Patient medical background information",
    fields: [
      {
        type: "multiple_choice",
        label: "Do you have any pre-existing medical conditions?",
        required: true,
        options: [
          { id: "1", value: "Yes" },
          { id: "2", value: "No" }
        ]
      },
      {
        type: "paragraph",
        label: "Please list any pre-existing conditions",
        placeholder: "Enter details about your medical history",
        required: false
      },
      {
        type: "multiple_choice",
        label: "Are you currently taking any medications?",
        required: true,
        options: [
          { id: "1", value: "Yes" },
          { id: "2", value: "No" }
        ]
      },
      {
        type: "paragraph",
        label: "Please list all current medications",
        placeholder: "Include medication name, dosage, and frequency",
        required: false
      }
    ]
  },
  {
    id: "insurance_details",
    title: "Insurance Information",
    icon: <SafetyCertificateOutlined />,
    description: "Health insurance details",
    fields: [
      {
        type: "dropdown",
        label: "Insurance Provider",
        required: true,
        options: [
          { id: "1", value: "Blue Cross Blue Shield" },
          { id: "2", value: "Aetna" },
          { id: "3", value: "Cigna" },
          { id: "4", value: "UnitedHealthcare" },
          { id: "5", value: "Medicare" },
          { id: "6", value: "Medicaid" },
          { id: "7", value: "Other" }
        ]
      },
      {
        type: "short_text",
        label: "Policy Number",
        placeholder: "Enter your insurance policy number",
        required: true
      },
      {
        type: "short_text",
        label: "Group Number",
        placeholder: "Enter your group number if applicable",
        required: false
      },
      {
        type: "short_text",
        label: "Subscriber Name",
        placeholder: "Enter primary subscriber's name",
        required: true
      },
      {
        type: "multiple_choice",
        label: "Relationship to Subscriber",
        required: true,
        options: [
          { id: "1", value: "Self" },
          { id: "2", value: "Spouse" },
          { id: "3", value: "Child" },
          { id: "4", value: "Other" }
        ]
      }
    ]
  },
  {
    id: "payment_plan",
    title: "Payment Information",
    icon: <DollarOutlined />,
    description: "Subscription and payment details",
    fields: [
      {
        type: "dropdown",
        label: "Select Payment Plan",
        required: true,
        options: [
          { id: "1", value: "Monthly Plan - $99/month" },
          { id: "2", value: "Quarterly Plan - $270/quarter (Save 10%)" },
          { id: "3", value: "Annual Plan - $950/year (Save 20%)" }
        ]
      },
      {
        type: "multiple_choice",
        label: "Payment Method",
        required: true,
        options: [
          { id: "1", value: "Credit/Debit Card" },
          { id: "2", value: "ACH Bank Transfer" },
          { id: "3", value: "PayPal" }
        ]
      }
    ]
  }
];

const FormElementSidebar = ({ onAddElement }) => {
  const [activeTab, setActiveTab] = useState("basic");

  // Handle adding a single element
  const handleAddElement = (elementType) => {
    onAddElement(elementType);
  };

  // Handle adding a template of multiple elements
  const handleAddTemplate = (templateFields) => {
    // Add each field in the template one by one
    templateFields.forEach(field => {
      onAddElement(field.type, field);
    });
  };

  return (
    <div className="form-elements-sidebar">
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered className="sidebar-tabs">
        <TabPane tab="Basic Fields" key="basic">
          <div className="sidebar-content">
            <div className="element-types-grid">
              {basicElementTypes.map((element) => (
                <Tooltip key={element.type} title={`Add ${element.label} field`} placement="right">
                  <Card
                    className="element-type-card"
                    hoverable
                    onClick={() => handleAddElement(element.type)}
                  >
                    <div className="element-type-content">
                      {element.icon}
                      <div className="element-label">{element.label}</div>
                    </div>
                  </Card>
                </Tooltip>
              ))}
            </div>
          </div>
        </TabPane>
        
        <TabPane tab="Templates" key="templates">
          <div className="sidebar-content">
            <Collapse 
              bordered={false} 
              className="template-collapse"
              expandIconPosition="right"
            >
              {templateBlocks.map(template => (
                <Panel
                  key={template.id}
                  header={
                    <div className="template-header">
                      {template.icon}
                      <span className="template-title">{template.title}</span>
                    </div>
                  }
                >
                  <div className="template-details">
                    <Text>{template.description}</Text>
                    <div className="template-fields">
                      <Text type="secondary">Includes {template.fields.length} fields:</Text>
                      <ul className="field-list">
                        {template.fields.map((field, idx) => (
                          <li key={idx}>
                            <Text>{field.label}</Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddTemplate(template.fields)}
                      block
                    >
                      Add {template.title} Block
                    </Button>
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        </TabPane>
      </Tabs>

      <style jsx>{`
        .form-elements-sidebar {
          width: 300px;
          background: #f5f5f5;
          height: 100%;
          overflow-y: auto;
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .element-types-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .element-type-card {
          text-align: center;
          cursor: pointer;
        }

        .element-type-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80px;
        }

        .element-label {
          margin-top: 8px;
          font-size: 12px;
        }

        .template-header {
          display: flex;
          align-items: center;
        }

        .template-title {
          margin-left: 8px;
          font-weight: 500;
        }

        .template-details {
          padding: 8px 0;
        }

        .template-fields {
          margin: 12px 0;
        }

        .field-list {
          margin-top: 8px;
          padding-left: 16px;
        }

        .field-list li {
          margin-bottom: 4px;
        }

        :global(.template-collapse .ant-collapse-header) {
          padding: 12px 16px !important;
        }

        :global(.template-collapse .ant-collapse-content-box) {
          padding: 0 16px 16px !important;
        }

        :global(.sidebar-tabs .ant-tabs-nav) {
          margin-bottom: 0;
        }

        :global(.sidebar-tabs .ant-tabs-content) {
          height: 100%;
        }

        :global(.sidebar-tabs .ant-tabs-tabpane) {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
export default FormElementSidebar;
