import React from 'react';
import FormElementSidebarV2 from '@/pages/settings/pages/forms-v2/FormElementSidebarV2';

export default function FormElementSidebarV2Storyboard() {
  const handleAddElement = (elementType, elementData) => {
    console.log('Add element:', elementType, elementData);
  };

  return (
    <div className="bg-white h-full">
      <FormElementSidebarV2 onAddElement={handleAddElement} />
    </div>
  );
}
