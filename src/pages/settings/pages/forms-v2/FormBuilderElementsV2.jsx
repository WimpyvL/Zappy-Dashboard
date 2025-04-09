import React from 'react';
import { Empty } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableFormElementV2 from './SortableFormElementV2'; // Updated import

const FormBuilderElementsV2 = ({ // Renamed component
  elements,
  onUpdateElement,
  onDeleteElement,
  onMoveElement,
}) => {
  // Set up DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => ({
        x: 0,
        y: event.index * 50, // Approximation for keyboard navigation
      }),
    })
  );

  // Handle DND end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = elements.findIndex((item) => item.id === active.id);
      const newIndex = elements.findIndex((item) => item.id === over.id);

      onMoveElement(oldIndex, newIndex);
    }
  };

  return (
    <div className="form-elements-container">
      {elements.length === 0 ? (
        <Empty
          description="No form elements added yet. Click on an element type from the left sidebar to add it to your form."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={elements.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {elements.map((element, index) => (
              <SortableFormElementV2 // Updated component name
                key={element.id}
                element={element}
                index={index}
                onUpdate={onUpdateElement}
                onDelete={onDeleteElement}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <style jsx>{`
        .form-elements-container {
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
};

export default FormBuilderElementsV2; // Renamed export
