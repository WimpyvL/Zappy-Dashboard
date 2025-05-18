import React from 'react';
import FormElementSidebarV2 from '../../../../pages/settings/pages/forms-v2/FormElementSidebarV2';

export default function FormElementSidebarV2Storyboard() {
  // Mock function to handle adding elements
  const handleAddElement = (elementType, fieldData) => {
    console.log('Element added:', elementType, fieldData);
  };

  return (
    <div className="bg-white" style={{ height: '100vh' }}>
      <FormElementSidebarV2 onAddElement={handleAddElement} />
    </div>
  );
}
