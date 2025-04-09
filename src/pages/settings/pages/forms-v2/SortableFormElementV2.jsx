import React, { useState } from 'react';
import {
  Card,
  Input,
  Switch,
  Button,
  Space,
  Radio,
  Checkbox,
  Select,
  DatePicker,
  TimePicker,
  Tooltip,
  Collapse,
  Tabs,
  Tag,
  // Popover, // Removed unused import
} from 'antd';
import {
  DeleteOutlined,
  MenuOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SettingOutlined,
  EyeOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;

// Function to generate a unique ID
const generateRandomId = () => `_${Math.random().toString(36).substr(2, 9)}`;

const SortableFormElementV2 = ({ element, index, onUpdate, onDelete }) => { // Renamed component
  const [expanded, setExpanded] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('basic');

  // Use dnd-kit's useSortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: { index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 16,
  };

  // Handle element updates
  const handleElementUpdate = (field, value) => {
    const updatedElement = { ...element, [field]: value };
    onUpdate(index, updatedElement);
  };

  // Handle option add/update/remove for multiple choice, checkboxes, and dropdown
  const handleOptionChange = (optionIndex, value) => {
    const updatedOptions = [...element.options];
    updatedOptions[optionIndex].value = value;
    handleElementUpdate('options', updatedOptions);
  };

  const handleAddOption = () => {
    const newOption = {
      id: generateRandomId(),
      value: `Option ${(element.options?.length || 0) + 1}`,
    };
    handleElementUpdate('options', [...(element.options || []), newOption]);
  };

  const handleRemoveOption = (optionIndex) => {
    const updatedOptions = [...element.options];
    updatedOptions.splice(optionIndex, 1);
    handleElementUpdate('options', updatedOptions);
  };

  // Handle dynamic value setup
  const handleDynamicValueChange = (field, value) => {
    const dynamicData = element.dynamicData || {};
    const updatedDynamicData = { ...dynamicData, [field]: value };
    handleElementUpdate('dynamicData', updatedDynamicData);
  };

  // Handle enabling/disabling dynamic values
  const handleToggleDynamicValues = (enabled) => {
    if (enabled) {
      handleElementUpdate(
        'dynamicData',
        element.dynamicData || {
          source: 'service',
          path: '',
          enabled: true,
        }
      );
    } else {
      // We keep the configuration but disable it
      handleElementUpdate('dynamicData', {
        ...element.dynamicData,
        enabled: false,
      });
    }
  };

  // Render a preview of the element based on its type
  const renderElementPreview = () => {
    switch (element.type) {
      case 'short_text':
        return (
          <Input placeholder={element.placeholder || 'Short text'} disabled />
        );

      case 'paragraph':
        return (
          <Input.TextArea
            rows={3}
            placeholder={element.placeholder || 'Paragraph text'}
            disabled
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={element.placeholder || 'Number'}
            disabled
          />
        );

      case 'multiple_choice':
        return (
          <Radio.Group disabled>
            {element.options?.map((option) => (
              <Radio key={option.id} value={option.value}>
                {option.value}
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'checkboxes':
        return (
          <Checkbox.Group disabled>
            <Space direction="vertical">
              {element.options?.map((option) => (
                <Checkbox key={option.id} value={option.value}>
                  {option.value}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );

      case 'dropdown':
        return (
          <Select
            placeholder="Select option"
            style={{ width: '100%' }}
            disabled
          >
            {element.options?.map((option) => (
              <Select.Option key={option.id} value={option.value}>
                {option.value}
              </Select.Option>
            ))}
          </Select>
        );

      case 'date':
        return <DatePicker style={{ width: '100%' }} disabled />;

      case 'time':
        return <TimePicker style={{ width: '100%' }} disabled />;

      case 'email':
        return <Input placeholder="Email address" disabled />;

      case 'phone':
        return <Input placeholder="Phone number" disabled />;

      case 'name':
        return <Input placeholder="Name" disabled />;

      case 'address':
        return <Input placeholder="Address" disabled />;

      default:
        return (
          <Input
            disabled
            placeholder={`Unknown element type: ${element.type}`}
          />
        );
    }
  };

  const elementTypeNames = {
    short_text: 'Short Text',
    paragraph: 'Paragraph',
    number: 'Number',
    multiple_choice: 'Multiple Choice',
    checkboxes: 'Checkboxes',
    dropdown: 'Dropdown',
    date: 'Date',
    time: 'Time',
    email: 'Email',
    phone: 'Phone',
    name: 'Name',
    address: 'Address',
  };

  // Dynamic source options for populating field values
  const dynamicSourceOptions = [
    { value: 'service', label: 'Service Data' },
    { value: 'user', label: 'User Profile' },
    { value: 'custom', label: 'Custom API' },
  ];

  // Sample dynamic path options based on source
  const getDynamicPathOptions = (source) => {
    if (source === 'service') {
      return [
        { value: 'plans', label: 'Available Plans' },
        { value: 'medications', label: 'Medications' },
        { value: 'providers', label: 'Healthcare Providers' },
      ];
    } else if (source === 'user') {
      return [
        { value: 'profile.name', label: 'Full Name' },
        { value: 'profile.email', label: 'Email Address' },
        { value: 'profile.phone', label: 'Phone Number' },
        { value: 'profile.address', label: 'Address' },
      ];
    } else {
      return [];
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-form-element">
      <Card
        className={`form-element-card ${isDragging ? 'dragging' : ''}`}
        size="small"
        title={
          <div className="element-header">
            <div className="drag-handle" {...attributes} {...listeners}>
              <MenuOutlined />
            </div>
            <span>{elementTypeNames[element.type] || element.type}</span>
            {element.dynamicData?.enabled && (
              <Tag color="blue" className="dynamic-tag">
                <LinkOutlined /> Dynamic
              </Tag>
            )}
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Delete Element">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => onDelete(index)}
              />
            </Tooltip>
          </Space>
        }
      >
        <Collapse
          activeKey={expanded ? ['1'] : []}
          onChange={() => setExpanded(!expanded)}
          ghost
        >
          <Panel
            header={
              <div className="element-preview-header">
                <div className="element-label">
                  {element.label}
                  {element.required && <span className="required-mark">*</span>}
                </div>
              </div>
            }
            key="1"
          >
            <div className="element-settings">
              <Tabs
                activeKey={activeSettingsTab}
                onChange={setActiveSettingsTab}
                size="small"
                tabPosition="top"
                className="settings-tabs"
              >
                <TabPane
                  tab={
                    <span>
                      <SettingOutlined /> Basic
                    </span>
                  }
                  key="basic"
                >
                  <div className="setting-row">
                    <label>Field Label:</label>
                    <Input
                      value={element.label}
                      onChange={(e) =>
                        handleElementUpdate('label', e.target.value)
                      }
                      placeholder="Enter field label"
                    />
                  </div>

                  <div className="setting-row">
                    <label>Placeholder Text:</label>
                    <Input
                      value={element.placeholder}
                      onChange={(e) =>
                        handleElementUpdate('placeholder', e.target.value)
                      }
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div className="setting-row">
                    <label>Required:</label>
                    <Switch
                      checked={element.required}
                      onChange={(checked) =>
                        handleElementUpdate('required', checked)
                      }
                    />
                  </div>

                  <div className="setting-row">
                    <label>Helper Text:</label>
                    <Input
                      value={element.helperText}
                      onChange={(e) =>
                        handleElementUpdate('helperText', e.target.value)
                      }
                      placeholder="Additional instructions for this field"
                    />
                  </div>

                  {/* Options settings for multiple choice, checkboxes, and dropdown */}
                  {['multiple_choice', 'checkboxes', 'dropdown'].includes(
                    element.type
                  ) && (
                    <div className="setting-row options-row">
                      <label>Options:</label>
                      <div className="options-list">
                        {element.options?.map((option, optionIndex) => (
                          <div key={option.id} className="option-item">
                            <Input
                              value={option.value}
                              onChange={(e) =>
                                handleOptionChange(optionIndex, e.target.value)
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              type="text"
                              icon={<MinusCircleOutlined />}
                              onClick={() => handleRemoveOption(optionIndex)}
                              disabled={element.options.length <= 1}
                            />
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          onClick={handleAddOption}
                          icon={<PlusOutlined />}
                          className="add-option-btn"
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <ApiOutlined /> Dynamic Data
                    </span>
                  }
                  key="dynamic"
                >
                  <div className="setting-row">
                    <div className="dynamic-header">
                      <label>Dynamic Values:</label>
                      <Tooltip title="When enabled, this field's values will be populated from a data source">
                        <InfoCircleOutlined className="info-icon" />
                      </Tooltip>
                      <Switch
                        checked={element.dynamicData?.enabled || false}
                        onChange={handleToggleDynamicValues}
                      />
                    </div>
                  </div>

                  {element.dynamicData?.enabled && (
                    <>
                      <div className="setting-row">
                        <label>Data Source:</label>
                        <Select
                          value={element.dynamicData?.source || 'service'}
                          onChange={(value) =>
                            handleDynamicValueChange('source', value)
                          }
                          style={{ width: '100%' }}
                        >
                          {dynamicSourceOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div className="setting-row">
                        <label>Data Path:</label>
                        <Select
                          value={element.dynamicData?.path}
                          onChange={(value) =>
                            handleDynamicValueChange('path', value)
                          }
                          style={{ width: '100%' }}
                          placeholder="Select data to display"
                        >
                          {getDynamicPathOptions(
                            element.dynamicData?.source || 'service'
                          ).map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      {element.dynamicData?.source === 'custom' && (
                        <div className="setting-row">
                          <label>API Endpoint:</label>
                          <Input
                            value={element.dynamicData?.endpoint}
                            onChange={(e) =>
                              handleDynamicValueChange(
                                'endpoint',
                                e.target.value
                              )
                            }
                            placeholder="https://api.example.com/data"
                          />
                        </div>
                      )}

                      <div className="setting-row">
                        <label>Display Method:</label>
                        <Select
                          value={
                            element.dynamicData?.displayMethod || 'dropdown'
                          }
                          onChange={(value) =>
                            handleDynamicValueChange('displayMethod', value)
                          }
                          style={{ width: '100%' }}
                        >
                          <Option value="dropdown">Dropdown Selection</Option>
                          <Option value="radio">Radio Buttons</Option>
                          <Option value="autocomplete">Autocomplete</Option>
                        </Select>
                      </div>
                    </>
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <EyeOutlined /> Appearance
                    </span>
                  }
                  key="appearance"
                >
                  <div className="setting-row">
                    <label>Field Width:</label>
                    <Select
                      value={element.width || 'full'}
                      onChange={(value) => handleElementUpdate('width', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="full">Full Width</Option>
                      <Option value="half">Half Width</Option>
                      <Option value="third">One Third</Option>
                    </Select>
                  </div>

                  <div className="setting-row">
                    <label>Field Size:</label>
                    <Select
                      value={element.size || 'default'}
                      onChange={(value) => handleElementUpdate('size', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="small">Small</Option>
                      <Option value="default">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </div>

                  <div className="setting-row">
                    <label>Custom CSS Class:</label>
                    <Input
                      value={element.cssClass}
                      onChange={(e) =>
                        handleElementUpdate('cssClass', e.target.value)
                      }
                      placeholder="Enter custom CSS class"
                    />
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </Panel>
        </Collapse>

        {!expanded && (
          <div className="element-preview">{renderElementPreview()}</div>
        )}
      </Card>

      <style jsx>{`
        .sortable-form-element {
          margin-bottom: 16px;
        }

        .form-element-card {
          margin-bottom: 16px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s;
        }

        .form-element-card:hover {
          border-color: #40a9ff;
        }

        .form-element-card.dragging {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .element-header {
          display: flex;
          align-items: center;
        }

        .drag-handle {
          cursor: move;
          margin-right: 8px;
          color: #999;
        }

        .dynamic-tag {
          margin-left: 8px;
        }

        .element-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .element-label {
          font-weight: 500;
        }

        .required-mark {
          color: #ff4d4f;
          margin-left: 4px;
        }

        .element-preview {
          padding: 8px 0;
        }

        .element-settings {
          padding: 8px 0;
        }

        .setting-row {
          margin-bottom: 12px;
        }

        .setting-row label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .dynamic-header {
          display: flex;
          align-items: center;
        }

        .info-icon {
          margin-left: 8px;
          margin-right: auto;
          color: #1890ff;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-option-btn {
          width: 100%;
          margin-top: 8px;
        }

        :global(.settings-tabs .ant-tabs-nav) {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default SortableFormElementV2; // Renamed export
