import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Spin, Alert, Tooltip } from 'antd';
import { SaveOutlined, InfoCircleOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { usePrompts, useUpdatePrompt } from '../../../apis/prompts/hooks'; // Corrected import path

const { Title, Paragraph, Text } = Typography;

const PromptSettings = () => {
  const [form] = Form.useForm();
  const [editingPromptId, setEditingPromptId] = useState(null); // Track which prompt is being edited

  // Fetch prompts
  const { data: prompts, isLoading: promptsLoading, error: promptsError } = usePrompts();

  // Update mutation
  const updatePromptMutation = useUpdatePrompt({
    onSuccess: () => {
      setEditingPromptId(null); // Exit editing mode on success
    },
  });

  // Set form values when prompts load or when editing starts/stops
  useEffect(() => {
    if (prompts && !editingPromptId) {
      const initialValues = {};
      prompts.forEach(p => {
        initialValues[p.id] = p.prompt_text;
      });
      form.setFieldsValue(initialValues);
    }
    // If editingPromptId changes, form values are handled by the Form.Item initialValue
  }, [prompts, form, editingPromptId]);

  const handleEditClick = (promptId, currentText) => {
    setEditingPromptId(promptId);
    // Set the specific field value when starting edit to ensure it's current
    form.setFieldsValue({ [promptId]: currentText });
  };

  const handleCancelEdit = () => {
    // Reset the field being edited to its original value from query cache
    const originalPrompt = prompts?.find(p => p.id === editingPromptId);
    if (originalPrompt) {
      form.setFieldsValue({ [editingPromptId]: originalPrompt.prompt_text });
    }
    setEditingPromptId(null);
  };

  const handleSaveEdit = async (promptId) => {
    try {
      const values = await form.validateFields([promptId]);
      updatePromptMutation.mutate({ id: promptId, prompt_text: values[promptId] });
    } catch (errorInfo) {
      console.log('Validation Failed:', errorInfo);
      message.error('Validation failed.');
    }
  };

  if (promptsLoading) {
    return <div className="flex justify-center items-center p-10"><Spin size="large" /></div>;
  }

  if (promptsError) {
    return <Alert message="Error Loading Prompts" description={promptsError.message} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={4}>AI Prompt Management</Title>
      <Paragraph type="secondary">
        Adjust the text of the prompts used for various AI-powered features. Use placeholders like `[VARIABLE_NAME]` where dynamic data should be inserted by the backend.
      </Paragraph>

      <Form form={form} layout="vertical" autoComplete="off">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {prompts?.map((prompt) => (
            <Card
              key={prompt.id}
              title={prompt.task_key || `Prompt ID: ${prompt.id}`} // Use task_key as title if available
              extra={
                editingPromptId === prompt.id ? (
                  <Space>
                    <Button
                      icon={<CheckOutlined />}
                      onClick={() => handleSaveEdit(prompt.id)}
                      loading={updatePromptMutation.isLoading && updatePromptMutation.variables?.id === prompt.id}
                      type="primary"
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancelEdit}
                      size="small"
                      danger
                    >
                      Cancel
                    </Button>
                  </Space>
                ) : (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditClick(prompt.id, prompt.prompt_text)}
                    size="small"
                  >
                    Edit
                  </Button>
                )
              }
            >
              <Form.Item
                name={prompt.id}
                label={
                  <Space>
                    <span>Prompt Text</span>
                    {prompt.description && ( // Show description in tooltip if available
                      <Tooltip title={prompt.description}>
                        <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    )}
                  </Space>
                }
                initialValue={prompt.prompt_text} // Set initial value
                rules={[{ required: true, message: 'Prompt text cannot be empty!' }]}
              >
                <Input.TextArea
                  rows={6} // Adjust rows as needed
                  placeholder="Enter the prompt text..."
                  readOnly={editingPromptId !== prompt.id} // Make read-only unless editing
                  style={editingPromptId !== prompt.id ? { backgroundColor: '#f5f5f5', cursor: 'default' } : {}}
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Last Updated: {new Date(prompt.updated_at).toLocaleString()}
              </Text>
            </Card>
          ))}
        </Space>

        {/* No global save button needed as edits are saved individually */}
        {/* <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Save All Changes (If applicable)
          </Button>
        </Form.Item> */}
      </Form>
    </div>
  );
};

export default PromptSettings;
