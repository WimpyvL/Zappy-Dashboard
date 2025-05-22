import React, { useState } from 'react';
import FormBasicsModalV2 from '@/pages/settings/pages/forms-v2/FormBasicsModalV2';

export default function FormBasicsModalV2Storyboard() {
  const [visible, setVisible] = useState(true);

  // Sample services data
  const sampleServices = [
    { id: 'serv_1', name: 'Hair Loss Consultation' },
    { id: 'serv_2', name: 'Weight Management' },
    { id: 'serv_3', name: 'Skin Care Assessment' },
  ];

  // Sample form data for edit mode
  const sampleFormData = {
    title: 'Hair Loss Assessment',
    description: 'Initial assessment form for hair loss patients',
    serviceId: 'serv_1',
    form_type: 'initial_consultation',
    status: 'active',
  };

  const handleCancel = () => {
    setVisible(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setVisible(true), 1500);
  };

  const handleSubmit = (formData) => {
    console.log('Form submitted with data:', formData);
    handleCancel();
  };

  return (
    <div className="bg-white p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setVisible(true)}
        >
          Open Form Basics Modal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Create Mode</h3>
          <FormBasicsModalV2
            visible={visible}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            initialData={null}
            services={sampleServices}
            actionType="create"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Edit Mode</h3>
          <FormBasicsModalV2
            visible={visible}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            initialData={sampleFormData}
            services={sampleServices}
            actionType="edit"
          />
        </div>
      </div>
    </div>
  );
}
