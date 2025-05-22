import React, { useState } from 'react';
import FormConditionalsV2 from '@/pages/settings/pages/forms-v2/FormConditionalsV2';

export default function FormConditionalsV2Storyboard() {
  // Sample pages data with elements
  const [pages, setPages] = useState([
    {
      title: 'Basic Information',
      elements: [
        {
          id: 'elem_1',
          type: 'short_text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
        },
        {
          id: 'elem_2',
          type: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email address',
          required: true,
        },
        {
          id: 'elem_3',
          type: 'multiple_choice',
          label: 'Are you currently experiencing hair loss?',
          required: true,
          options: [
            { id: 'opt_1', value: 'Yes' },
            { id: 'opt_2', value: 'No' },
          ],
        },
      ],
    },
    {
      title: 'Hair Loss Details',
      elements: [
        {
          id: 'elem_4',
          type: 'multiple_choice',
          label: 'How long have you been experiencing hair loss?',
          required: true,
          options: [
            { id: 'opt_3', value: 'Less than 6 months' },
            { id: 'opt_4', value: '6-12 months' },
            { id: 'opt_5', value: '1-2 years' },
            { id: 'opt_6', value: 'More than 2 years' },
          ],
        },
        {
          id: 'elem_5',
          type: 'paragraph',
          label: 'Please describe your hair loss pattern',
          placeholder: 'Provide details about your hair loss experience',
          required: false,
        },
      ],
    },
    {
      title: 'Medical History',
      elements: [
        {
          id: 'elem_6',
          type: 'multiple_choice',
          label: 'Do you have any pre-existing medical conditions?',
          required: true,
          options: [
            { id: 'opt_7', value: 'Yes' },
            { id: 'opt_8', value: 'No' },
          ],
        },
        {
          id: 'elem_7',
          type: 'paragraph',
          label: 'Please list any medical conditions',
          placeholder: 'Enter your medical conditions',
          required: false,
        },
      ],
    },
  ]);

  // Sample conditionals
  const [conditionals, setConditionals] = useState([
    {
      id: 'cond_1',
      elementId: 'elem_3',
      operator: 'equals',
      value: 'No',
      thenGoToPage: 2, // Skip to Medical History
    },
    {
      id: 'cond_2',
      elementId: 'elem_6',
      operator: 'equals',
      value: 'No',
      thenShowElementId: 'elem_7',
      showElement: false, // Hide the medical conditions field
    },
  ]);

  const handleAddConditional = (newConditional) => {
    setConditionals([
      ...conditionals,
      { id: `cond_${conditionals.length + 1}`, ...newConditional },
    ]);
  };

  const handleUpdateConditional = (index, updatedConditional) => {
    const newConditionals = [...conditionals];
    newConditionals[index] = {
      ...newConditionals[index],
      ...updatedConditional,
    };
    setConditionals(newConditionals);
  };

  const handleDeleteConditional = (index) => {
    const newConditionals = [...conditionals];
    newConditionals.splice(index, 1);
    setConditionals(newConditionals);
  };

  return (
    <div className="bg-white">
      <FormConditionalsV2
        conditionals={conditionals}
        pages={pages}
        onAddConditional={handleAddConditional}
        onUpdateConditional={handleUpdateConditional}
        onDeleteConditional={handleDeleteConditional}
      />
    </div>
  );
}
