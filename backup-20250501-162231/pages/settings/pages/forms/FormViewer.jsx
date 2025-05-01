import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Select,
  DatePicker,
  TimePicker,
  Card,
  Typography,
  Divider,
  Spin,
  Result,
  // Steps, // Removed unused import
  message,
  Progress,
  Space,
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  SendOutlined,
  LeftOutlined,
  RightOutlined,
  // SaveOutlined, // Removed unused import
  // FormOutlined, // Removed unused import
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useFormById } from '../../../../apis/forms/hooks';
// import { getDynamicData } from "../../apis/forms/api";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
// const { Step } = Steps; // Removed unused variable

const FormViewer = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dynamicDataLoading, setDynamicDataLoading] = useState(false);
  const [dynamicDataValues, setDynamicDataValues] = useState({});
  const [hiddenFields, setHiddenFields] = useState([]);

  // Use the hook to fetch form data
  const { data: formResponse, isLoading, error } = useFormById(formId);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    // setValue, // Removed unused variable
    trigger,
  } = useForm();

  // Extract form data from the API response
  const form = formResponse;

  // Extract pages and conditionals
  const [formPages, formConditionals] = React.useMemo(() => {
    if (!form?.structure) return [[], []];

    try {
      // Handle different structure formats
      if (typeof form.structure === 'string') {
        const parsed = JSON.parse(form.structure);

        // Check if it has pages property (new format) or is array (old format)
        if (parsed.pages) {
          return [parsed.pages, parsed.conditionals || []];
        } else if (Array.isArray(parsed)) {
          // Legacy format - convert to single page
          return [[{ id: 'page1', title: 'Page 1', elements: parsed }], []];
        }
      } else if (form.structure.pages) {
        // Already parsed object
        return [form.structure.pages, form.structure.conditionals || []];
      }
    } catch (e) {
      console.error('Error parsing form structure:', e);
    }

    // Default fallback
    return [[], []];
  }, [form]);

  // Track form values for conditional logic
  const formValues = watch();

  // Function to handle loading dynamic data for fields
  const loadDynamicData = async (elementId, source, path) => {
    try {
      setDynamicDataLoading(true);
      // In a real app, you'd make API calls based on source and path
      // const data = await getDynamicData(source, path);
      const data = null;
      setDynamicDataValues((prev) => ({
        ...prev,
        [elementId]: data,
      }));
    } catch (error) {
      console.error('Error loading dynamic data:', error);
      message.error('Failed to load dynamic data for form field');
    } finally {
      setDynamicDataLoading(false);
    }
  };

  // Load dynamic data when form is loaded
  useEffect(() => {
    if (!formPages.length) return;

    // Find all elements with dynamic data enabled across all pages
    const dynamicElements = formPages.flatMap((page) =>
      page.elements.filter((element) => element.dynamicData?.enabled)
    );

    // Load dynamic data for each element
    dynamicElements.forEach((element) => {
      if (element.dynamicData?.enabled) {
        loadDynamicData(
          element.id,
          element.dynamicData.source,
          element.dynamicData.path
        );
      }
    });
  }, [formPages]);

  // Apply conditional logic based on current form values
  useEffect(() => {
    if (!formConditionals.length || !formValues) return;

    // Track which fields should be hidden
    const fieldsToHide = new Set(hiddenFields);

    // Process each conditional rule
    formConditionals.forEach((conditional) => {
      const {
        elementId,
        operator,
        value,
        thenShowElementId,
        showElement,
        thenGoToPage,
      } = conditional;

      // Check if the condition's source field has a value
      if (formValues[elementId] !== undefined) {
        let conditionMet = false;

        // Evaluate the condition
        switch (operator) {
          case 'equals':
            conditionMet = formValues[elementId] === value;
            break;
          case 'not_equals':
            conditionMet = formValues[elementId] !== value;
            break;
          case 'contains':
            conditionMet = String(formValues[elementId]).includes(value);
            break;
          case 'greater_than':
            conditionMet = Number(formValues[elementId]) > Number(value);
            break;
          case 'less_than':
            conditionMet = Number(formValues[elementId]) < Number(value);
            break;
          default:
            break;
        }

        // Apply the action if condition is met
        if (conditionMet) {
          // Handle page navigation condition
          if (thenGoToPage !== undefined) {
            // This will be handled when the user navigates to the next page
          }

          // Handle show/hide field condition
          if (thenShowElementId) {
            if (showElement) {
              // Show element
              fieldsToHide.delete(thenShowElementId);
            } else {
              // Hide element
              fieldsToHide.add(thenShowElementId);
            }
          }
        }
      }
    });

    // Update the hidden fields state
    setHiddenFields(Array.from(fieldsToHide));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, formConditionals, hiddenFields]); // Added hiddenFields dependency

  // Function to check if a field should be hidden
  const isFieldHidden = (elementId) => {
    return hiddenFields.includes(elementId);
  };

  // Function to get the next page based on conditional rules
  const getNextPageIndex = () => {
    // Default next page
    let nextPage = currentPage + 1;

    // Check for conditional page jumps
    formConditionals.forEach((conditional) => {
      if (conditional.thenGoToPage !== undefined) {
        const { elementId, operator, value, thenGoToPage } = conditional;

        // Only process if the field has a value
        if (formValues[elementId] !== undefined) {
          // Check if condition is met
          let conditionMet = false;

          switch (operator) {
            case 'equals':
              conditionMet = formValues[elementId] === value;
              break;
            case 'not_equals':
              conditionMet = formValues[elementId] !== value;
              break;
            case 'contains':
              conditionMet = String(formValues[elementId]).includes(value);
              break;
            case 'greater_than':
              conditionMet = Number(formValues[elementId]) > Number(value);
              break;
            case 'less_than':
              conditionMet = Number(formValues[elementId]) < Number(value);
              break;
            default:
              break;
          }

          // If condition is met, jump to specified page
          if (conditionMet) {
            nextPage = thenGoToPage;
          }
        }
      }
    });

    return nextPage;
  };

  // Function to handle form submission
  const onSubmit = (data) => {
    // In a real app, you would submit this data to your backend
    console.log('Form submitted with data:', data);

    // Show success message
    setSubmitted(true);
  };

  // Handle next page navigation
  const handleNextPage = async () => {
    // Validate current page fields before proceeding
    const currentPageFields = formPages[currentPage].elements.map((e) => e.id);
    const isValid = await trigger(currentPageFields);

    if (isValid) {
      const nextPage = getNextPageIndex();

      // Check if we're at the last page
      if (nextPage >= formPages.length) {
        // Submit the form if we're on the last page
        handleSubmit(onSubmit)();
      } else {
        // Move to the next page
        setCurrentPage(nextPage);
        // Scroll to top
        window.scrollTo(0, 0);
      }
    }
  };

  // Handle previous page navigation
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  // Function to render the appropriate form field based on element type
  const renderFormField = (element) => {
    const {
      id,
      type,
      label,
      placeholder,
      required,
      options,
      helperText,
      dynamicData,
    } = element;

    // Skip rendering if field is hidden by conditional logic
    if (isFieldHidden(id)) {
      return null;
    }

    // Ensure name is a string
    const fieldName = String(id);

    // Get field width class
    const widthClass =
      element.width === 'half'
        ? 'field-half-width'
        : element.width === 'third'
          ? 'field-third-width'
          : 'field-full-width';

    // Determine if we should use dynamic data for this field
    const useDynamicData = dynamicData?.enabled && dynamicDataValues[id];
    const dynamicOptions = useDynamicData ? dynamicDataValues[id] : null;

    switch (type) {
      case 'short_text':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    placeholder={placeholder || `Enter ${label}`}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'paragraph':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input.TextArea
                    {...field}
                    placeholder={placeholder || `Enter ${label}`}
                    rows={4}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'number':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: required ? `${label} is required` : false,
                pattern: {
                  value: /^[0-9]*$/,
                  message: 'Please enter a valid number',
                },
              }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder={placeholder || `Enter ${label}`}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Radio.Group
                    {...field}
                    size={element.size}
                    className={element.cssClass}
                  >
                    {useDynamicData
                      ? dynamicOptions.map((option, index) => (
                          <Radio key={index} value={option.value || option}>
                            {option.label || option}
                          </Radio>
                        ))
                      : options?.map((option) => (
                          <Radio key={option.id} value={option.value}>
                            {option.value}
                          </Radio>
                        ))}
                  </Radio.Group>
                </Form.Item>
              )}
            />
          </div>
        );

      case 'checkboxes':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Checkbox.Group {...field} className={element.cssClass}>
                    <Space direction="vertical">
                      {useDynamicData
                        ? dynamicOptions.map((option, index) => (
                            <Checkbox
                              key={index}
                              value={option.value || option}
                            >
                              {option.label || option}
                            </Checkbox>
                          ))
                        : options?.map((option) => (
                            <Checkbox key={option.id} value={option.value}>
                              {option.value}
                            </Checkbox>
                          ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              )}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Select
                    {...field}
                    placeholder={`Select ${label}`}
                    size={element.size}
                    className={element.cssClass}
                    loading={useDynamicData && dynamicDataLoading}
                  >
                    {useDynamicData
                      ? dynamicOptions.map((option, index) => (
                          <Option key={index} value={option.value || option}>
                            {option.label || option}
                          </Option>
                        ))
                      : options?.map((option) => (
                          <Option key={option.id} value={option.value}>
                            {option.value}
                          </Option>
                        ))}
                  </Select>
                </Form.Item>
              )}
            />
          </div>
        );

      case 'date':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <DatePicker
                    {...field}
                    style={{ width: '100%' }}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'time':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <TimePicker
                    {...field}
                    format="HH:mm"
                    style={{ width: '100%' }}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'email':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: required ? `${label} is required` : false,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    prefix={<MailOutlined />}
                    placeholder={placeholder || 'Enter email address'}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'phone':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: required ? `${label} is required` : false,
                pattern: {
                  value: /^[0-9+-\s()]*$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    prefix={<PhoneOutlined />}
                    placeholder={placeholder || 'Enter phone number'}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'name':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    prefix={<UserOutlined />}
                    placeholder={placeholder || 'Enter name'}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      case 'address':
        return (
          <div className={`form-field ${widthClass}`}>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field }) => (
                <Form.Item
                  label={label}
                  validateStatus={errors[fieldName] ? 'error' : ''}
                  help={errors[fieldName]?.message || helperText}
                >
                  <Input
                    {...field}
                    prefix={<HomeOutlined />}
                    placeholder={placeholder || 'Enter address'}
                    size={element.size}
                    className={element.cssClass}
                  />
                </Form.Item>
              )}
            />
          </div>
        );

      default:
        return (
          <div className={`form-field ${widthClass}`}>
            <Form.Item label={label}>
              <Input placeholder={`Unknown field type: ${type}`} disabled />
            </Form.Item>
          </div>
        );
    }
  };

  // Show loading spinner while form is being fetched
  if (isLoading) {
    return (
      <div className="form-viewer-container-loading">
        <Spin size="large" />
        <p>Loading form...</p>
      </div>
    );
  }

  // Show error message if form could not be loaded
  if (error || !form) {
    return (
      <div className="form-viewer-container-error">
        <Result
          status="404"
          title="Form Not Found"
          subTitle={error?.message || 'The requested form could not be found.'}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          }
        />
      </div>
    );
  }

  // Show success message after form submission
  if (submitted) {
    return (
      <div className="form-viewer-container">
        <Result
          status="success"
          title="Form Submitted Successfully!"
          subTitle="Thank you for your submission. We will process your information shortly."
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/')}>
              Back to Home
            </Button>,
            <Button
              key="new"
              onClick={() => {
                setSubmitted(false);
                setCurrentPage(0);
              }}
            >
              Submit Another Response
            </Button>,
          ]}
        />
      </div>
    );
  }

  // Get the current page
  const currentPageData = formPages[currentPage] || { elements: [] };
  const totalPages = formPages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  // Render the multi-page form
  return (
    <div className="form-viewer-container">
      <Card className="form-viewer-card">
        <Title level={2}>{form.title}</Title>
        {form.description && <Paragraph>{form.description}</Paragraph>}
        <div>
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
              {form.form_type}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
              {form.service?.name || 'N/A'} {/* Safely access service name */}
            </span>
          </div>
        </div>
        {/* Progress indicator */}
        <div className="form-progress">
          <Progress
            percent={Math.round(((currentPage + 1) / totalPages) * 100)}
            status="active"
          />
          <div className="step-indicator">
            <Text>
              Page {currentPage + 1} of {totalPages}
            </Text>
          </div>
        </div>
        <Divider />
        {/* Form fields for current page */}
        <Form layout="vertical" className="form-viewer-form">
          <div className="form-fields-container">
            {currentPageData.elements?.map((element) => (
              <React.Fragment key={element.id}>
                {renderFormField(element)}
              </React.Fragment>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="form-navigation">
            <Space>
              {!isFirstPage && (
                <Button onClick={handlePrevPage} icon={<LeftOutlined />}>
                  Previous
                </Button>
              )}
              {!isLastPage ? (
                <Button type="primary" onClick={handleNextPage}>
                  Next <RightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit(onSubmit)}
                  icon={<SendOutlined />}
                >
                  Submit
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>

      <style jsx>{`
        .form-viewer-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .form-viewer-container-loading,
        .form-viewer-container-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }

        .form-viewer-card {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .form-progress {
          margin: 24px 0;
        }

        .step-indicator {
          margin-top: 8px;
          text-align: center;
        }

        .form-fields-container {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -12px;
        }

        .form-field {
          padding: 0 12px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        .field-full-width {
          width: 100%;
        }

        .field-half-width {
          width: 50%;
        }

        .field-third-width {
          width: 33.33%;
        }

        @media (max-width: 768px) {
          .field-half-width,
          .field-third-width {
            width: 100%;
          }
        }

        .form-navigation {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};

export default FormViewer;
