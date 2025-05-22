import React, { useState } from 'react';
import FormBuilderElementsV2 from '@/pages/settings/pages/forms-v2/FormBuilderElementsV2';

export default function FormBuilderElementsV2Storyboard() {
  // Sample elements data
  const [elements, setElements] = useState([
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
      label: 'Have you experienced hair loss before?',
      required: true,
      options: [
        { id: 'opt_1', value: 'Yes' },
        { id: 'opt_2', value: 'No' },
      ],
    },
    {
      id: 'elem_4',
      type: 'paragraph',
      label: 'Please describe your hair loss pattern',
      placeholder: 'Provide details about your hair loss experience',
      required: false,
    },
  ]);

  const handleUpdateElement = (id, updatedElement) => {
    setElements(
      elements.map((elem) =>
        elem.id === id ? { ...elem, ...updatedElement } : elem
      )
    );
  };

  const handleDeleteElement = (id) => {
    setElements(elements.filter((elem) => elem.id !== id));
  };

  const handleMoveElement = (oldIndex, newIndex) => {
    const newElements = [...elements];
    const [movedElement] = newElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, movedElement);
    setElements(newElements);
  };

  return (
    <div className="bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Form Builder Elements</h2>

      <FormBuilderElementsV2
        elements={elements}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onMoveElement={handleMoveElement}
      />

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md"
          onClick={() => setElements([])}
        >
          Clear All Elements
        </button>
      </div>
    </div>
  );
}
