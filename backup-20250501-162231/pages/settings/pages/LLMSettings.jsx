import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Tooltip } from 'antd';
import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// List of common LLM providers
const llmProviders = [
  { key: 'openai', name: 'OpenAI (ChatGPT)', envVar: 'OPENAI_API_KEY' },
  { key: 'anthropic', name: 'Anthropic (Claude)', envVar: 'ANTHROPIC_API_KEY' },
  { key: 'google', name: 'Google (Gemini)', envVar: 'GOOGLE_API_KEY' },
  { key: 'deepseek', name: 'DeepSeek', envVar: 'DEEPSEEK_API_KEY' },
  // Add more providers as needed
];

const LLMSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Placeholder for fetching existing keys (if stored securely)
  // useEffect(() => {
  //   // Fetch existing keys from a secure backend/config service
  //   // For now, we'll just initialize with empty values
  //   const initialValues = {};
  //   llmProviders.forEach(p => initialValues[p.key] = ''); // Or fetched value
  //   form.setFieldsValue(initialValues);
  // }, [form]);

  const onFinish = (values) => {
    setLoading(true);
    console.log('Saving LLM API Keys (Simulation):', values);
    // --- SECURITY WARNING ---
    // In a real application, NEVER handle API keys directly in the frontend like this.
    // This data should be sent to a secure backend endpoint that stores the keys
    // appropriately (e.g., encrypted in a database, using a secrets manager).
    // The frontend should ideally only receive confirmation of success/failure.
    // ------------------------

    // Simulate saving
    setTimeout(() => {
      setLoading(false);
      message.success('API Key settings saved (Simulation)');
      // Optionally clear fields after simulated save for security,
      // or refetch masked values if the backend supports it.
      // form.resetFields();
    }, 1000);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form for errors.');
  };

  return (
    <div>
      <Title level={4}>AI / LLM API Key Management</Title>
      <Paragraph type="secondary">
        Configure the API keys for the Large Language Models used by the platform features like AI form generation.
      </Paragraph>
      <Paragraph type="danger">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        <Text strong>Security Warning:</Text> API keys are sensitive credentials. Ensure they are handled securely. This interface is for configuration purposes; keys should be stored securely on the backend.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {llmProviders.map((provider) => (
            <Card key={provider.key} title={provider.name}>
              <Form.Item
                name={provider.key}
                label={
                  <Space>
                    <span>API Key</span>
                    <Tooltip title={`This key will be used for features powered by ${provider.name}. It should correspond to the backend environment variable: ${provider.envVar}`}>
                      <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    </Tooltip>
                  </Space>
                }
                // Add validation rules if needed, e.g., required
                // rules={[{ required: true, message: `Please input the API key for ${provider.name}!` }]}
              >
                <Input.Password placeholder={`Enter ${provider.name} API Key`} />
              </Form.Item>
            </Card>
          ))}
        </Space>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            Save API Keys (Simulation)
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LLMSettings;
