import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { useForm, Controller } from 'react-hook-form';

const { Option } = Select;

const FormBasicsModalV2 = ({ // Renamed component
  visible,
  onCancel,
  onSubmit,
  initialData,
  services,
  actionType, // 'create' or 'edit'
}) => {
  const {
    control,
    handleSubmit,
    reset,
    // formState: { errors }, // Removed unused errors
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      service_id: null,
      form_type: '',
      status: true,
      ...initialData, // Spread initialData to pre-fill form for editing
    },
  });

  // Reset form when initialData changes (e.g., opening modal for edit)
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        service_id: initialData.serviceId || null,
        form_type: initialData.form_type || '',
        status: initialData.status === 'active',
      });
    } else {
      reset({
        title: '',
        description: '',
        service_id: null,
        form_type: '',
        status: true,
      });
    }
  }, [initialData, reset]);

  const modalTitle = actionType === 'create' ? 'Create New Form' : 'Edit Form';
  const okText =
    actionType === 'create' ? 'Proceed to Form Builder' : 'Save Changes & Edit Form';

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      okText={okText}
      width={600}
    >
      <Form layout="vertical">
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Form title is required' }}
          render={({ field, fieldState }) => ( // fieldState might still be needed for validation status
            <Form.Item
              label="Form Title"
              validateStatus={fieldState?.error ? 'error' : ''} // Use optional chaining
              help={fieldState?.error?.message} // Use optional chaining
            >
              <Input {...field} placeholder="Enter form title" />
            </Form.Item>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Form.Item label="Description">
              <Input.TextArea
                {...field}
                placeholder="Enter form description"
                rows={4}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="service_id"
          control={control}
          rules={{ required: 'Please select a service' }}
          render={({ field, fieldState }) => ( // fieldState might still be needed for validation status
            <Form.Item
              label="Associated Service"
              validateStatus={fieldState?.error ? 'error' : ''} // Use optional chaining
              help={fieldState?.error?.message} // Use optional chaining
            >
              <Select {...field} placeholder="Select a service">
                {services.map((service) => (
                  <Option key={service.id} value={service.id}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />

        <Controller
          name="form_type"
          control={control}
          render={({ field }) => (
            <Form.Item label="Form Type">
              <Select {...field} placeholder="Select form type">
                <Option value="initial_consultation">
                  Initial Consultation
                </Option>
                <Option value="follow_up">Follow-up</Option>
                <Option value="insurance_verification">
                  Insurance Verification
                </Option>
                <Option value="medication_refill">Medication Refill</Option>
                <Option value="feedback">Feedback</Option>
                <Option value="general">General</Option>
              </Select>
            </Form.Item>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Form.Item label="Status" valuePropName="checked">
              <Switch {...field} checked={field.value} />
            </Form.Item>
          )}
        />
      </Form>
    </Modal>
  );
};

export default FormBasicsModalV2; // Renamed export
