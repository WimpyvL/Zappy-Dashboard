import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Select,
  Input,
  Typography,
  Divider,
  Empty,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Switch,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BranchesOutlined,
  ArrowRightOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const FormConditionals = ({
  conditionals,
  pages,
  onAddConditional,
  onUpdateConditional,
  onDeleteConditional,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form] = Form.useForm();

  // Prepare a flat list of all form elements across all pages
  const allElements = pages.reduce((elements, page, pageIndex) => {
    const pageElements = page.elements.map((element) => ({
      ...element,
      pageIndex,
      pageName: page.title,
    }));
    return [...elements, ...pageElements];
  }, []);

  // Filter to just elements that can be used in conditionals (those with options/values)
  const conditionalSourceElements = allElements.filter((element) =>
    [
      'multiple_choice',
      'checkboxes',
      'dropdown',
      'short_text',
      'number',
    ].includes(element.type)
  );

  // Get element details by ID
  const getElementById = (elementId) => {
    return allElements.find((el) => el.id === elementId);
  };

  // Show add/edit modal
  const showModal = (conditionalIndex = null) => {
    if (conditionalIndex !== null) {
      // Editing existing conditional
      const conditional = conditionals[conditionalIndex];
      setEditingIndex(conditionalIndex);
      form.setFieldsValue({
        elementId: conditional.elementId,
        operator: conditional.operator,
        value: conditional.value,
        thenGoToPage:
          conditional.thenGoToPage !== undefined
            ? conditional.thenGoToPage
            : null,
        showElement: conditional.showElement,
        thenShowElementId: conditional.thenShowElementId,
      });
    } else {
      // Adding new conditional
      setEditingIndex(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingIndex !== null) {
          onUpdateConditional(editingIndex, values);
        } else {
          onAddConditional(values);
        }
        setModalVisible(false);
      })
      .catch((errorInfo) => {
        console.log('Validate Failed:', errorInfo);
      });
  };

  // Get display text for a condition
  const getConditionText = (conditional) => {
    const element = getElementById(conditional.elementId);
    if (!element) return 'Unknown element';

    const operator =
      conditional.operator === 'equals'
        ? 'equals'
        : conditional.operator === 'not_equals'
          ? 'does not equal'
          : conditional.operator === 'contains'
            ? 'contains'
            : conditional.operator === 'greater_than'
              ? 'is greater than'
              : conditional.operator === 'less_than'
                ? 'is less than'
                : conditional.operator;

    return `If "${element.label}" ${operator} "${conditional.value}"`;
  };

  // Get display text for an action
  const getActionText = (conditional) => {
    if (conditional.thenGoToPage !== undefined) {
      const targetPage = pages[conditional.thenGoToPage];
      return `Go to page: ${targetPage ? targetPage.title : 'Unknown page'}`;
    }

    if (conditional.thenShowElementId) {
      const element = getElementById(conditional.thenShowElementId);
      return `${conditional.showElement ? 'Show' : 'Hide'} field: ${
        element ? element.label : 'Unknown field'
      }`;
    }

    return 'No action specified';
  };

  // Table columns
  const columns = [
    {
      title: 'Condition',
      dataIndex: 'elementId',
      key: 'condition',
      render: (_, record) => getConditionText(record),
    },
    {
      title: 'Then',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => getActionText(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record, index) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(index)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this rule?"
              onConfirm={() => onDeleteConditional(index)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render select options for elements
  const renderElementOptions = () => {
    return conditionalSourceElements.map((element) => (
      <Option key={element.id} value={element.id}>
        {element.label} <Text type="secondary">(Page: {element.pageName})</Text>
      </Option>
    ));
  };

  // Render options based on selected element
  const renderValueOptions = () => {
    const elementId = form.getFieldValue('elementId');
    if (!elementId) return null;

    const element = getElementById(elementId);
    if (!element) return null;

    // For elements with predefined options
    if (
      ['multiple_choice', 'checkboxes', 'dropdown'].includes(element.type) &&
      element.options
    ) {
      return (
        <Select>
          {element.options.map((option) => (
            <Option key={option.id} value={option.value}>
              {option.value}
            </Option>
          ))}
        </Select>
      );
    }

    // For text and number inputs
    return <Input placeholder={`Value to compare with ${element.label}`} />;
  };

  // Render operator options based on selected element
  const renderOperatorOptions = () => {
    const elementId = form.getFieldValue('elementId');
    if (!elementId) return null;

    const element = getElementById(elementId);
    if (!element) return null;

    // Different operators based on element type
    if (element.type === 'number') {
      return (
        <>
          <Option value="equals">Equals</Option>
          <Option value="not_equals">Does not equal</Option>
          <Option value="greater_than">Is greater than</Option>
          <Option value="less_than">Is less than</Option>
        </>
      );
    } else if (element.type === 'short_text') {
      return (
        <>
          <Option value="equals">Equals</Option>
          <Option value="not_equals">Does not equal</Option>
          <Option value="contains">Contains</Option>
        </>
      );
    } else {
      return (
        <>
          <Option value="equals">Equals</Option>
          <Option value="not_equals">Does not equal</Option>
        </>
      );
    }
  };

  // Handle element selection change - reset dependent fields
  const handleElementChange = () => {
    form.setFieldsValue({
      operator: undefined,
      value: undefined,
    });
  };

  // Handle action type change
  const handleActionTypeChange = (value) => {
    // Reset action-specific fields
    if (value === 'go_to_page') {
      form.setFieldsValue({
        thenShowElementId: undefined,
        showElement: undefined,
      });
    } else if (value === 'show_hide') {
      form.setFieldsValue({
        thenGoToPage: undefined,
      });
    }
  };

  return (
    <div className="form-conditionals-container">
      <div className="conditionals-header">
        <div>
          <Title level={4}>
            <BranchesOutlined /> Conditional Logic
          </Title>
          <Text type="secondary">
            Add rules to create dynamic forms that respond to user input
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Conditional Rule
        </Button>
      </div>

      <Divider />

      <div className="conditionals-content">
        {conditionals.length > 0 ? (
          <Table
            columns={columns}
            dataSource={conditionals}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p>No conditional logic rules defined</p>
                <p>
                  <Text type="secondary">
                    Create rules to make your form interactive
                  </Text>
                </p>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add Your First Rule
            </Button>
          </Empty>
        )}
      </div>

      {/* Add/Edit Conditional Modal */}
      <Modal
        title={
          <div className="modal-title">
            <BranchesOutlined />{' '}
            {editingIndex === null
              ? 'Add Conditional Rule'
              : 'Edit Conditional Rule'}
          </div>
        }
        visible={modalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingIndex === null ? 'Add Rule' : 'Save Changes'}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Card title="Define Condition" className="condition-card">
            <Form.Item
              name="elementId"
              label="When this field"
              rules={[{ required: true, message: 'Please select a field' }]}
            >
              <Select
                placeholder="Select a field"
                onChange={handleElementChange}
                showSearch
                optionFilterProp="children"
              >
                {renderElementOptions()}
              </Select>
            </Form.Item>

            <Form.Item
              name="operator"
              label="Operator"
              rules={[{ required: true, message: 'Please select an operator' }]}
            >
              <Select placeholder="Select operator">
                {renderOperatorOptions()}
              </Select>
            </Form.Item>

            <Form.Item
              name="value"
              label="Value"
              rules={[{ required: true, message: 'Please enter a value' }]}
            >
              {renderValueOptions()}
            </Form.Item>
          </Card>

          <Divider>
            <ArrowRightOutlined /> Then
          </Divider>

          <Card title="Define Action" className="action-card">
            <Form.Item label="Action Type" name="actionType">
              <Select
                placeholder="What should happen?"
                onChange={handleActionTypeChange}
                defaultValue="go_to_page"
              >
                <Option value="go_to_page">Go to specific page</Option>
                <Option value="show_hide">Show or hide a field</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.actionType !== currentValues.actionType
              }
            >
              {({ getFieldValue }) => {
                const actionType = getFieldValue('actionType') || 'go_to_page';

                return actionType === 'go_to_page' ? (
                  <Form.Item
                    name="thenGoToPage"
                    label="Go to Page"
                    rules={[
                      { required: true, message: 'Please select a page' },
                    ]}
                  >
                    <Select placeholder="Select destination page">
                      {pages.map((page, index) => (
                        <Option key={index} value={index}>
                          {page.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      name="thenShowElementId"
                      label="Target Field"
                      rules={[
                        { required: true, message: 'Please select a field' },
                      ]}
                    >
                      <Select placeholder="Select field to show/hide">
                        {allElements.map((element) => (
                          <Option key={element.id} value={element.id}>
                            {element.label}{' '}
                            <Text type="secondary">
                              (Page: {element.pageName})
                            </Text>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="showElement"
                      label="Action"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Show field"
                        unCheckedChildren="Hide field"
                        defaultChecked
                      />
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      <style jsx>{`
        .form-conditionals-container {
          padding: 20px;
          height: calc(100vh - 180px);
          overflow-y: auto;
        }

        .conditionals-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .conditionals-content {
          margin-top: 20px;
        }

        :global(.condition-card),
        :global(.action-card) {
          margin-bottom: 20px;
        }

        :global(.ant-form-item-label) {
          font-weight: 500;
        }

        :global(.modal-title) {
          display: flex;
          align-items: center;
        }

        :global(.modal-title svg) {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default FormConditionals;
