import React, { useState } from 'react';
import TaskModal from '@/pages/tasks/TaskModal';

export default function TaskModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample task for edit mode
  const sampleTask = {
    id: 'task_123',
    title: 'Follow up with patient regarding medication side effects',
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    assignable_id: 'user_1',
    user_id: 'user_1',
  };

  // Sample assignees
  const sampleAssignees = [
    {
      id: 'user_1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    },
    {
      id: 'user_2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
    },
    {
      id: 'user_3',
      first_name: 'Robert',
      last_name: 'Johnson',
      email: 'robert.johnson@example.com',
    },
  ];

  // Sample status options
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1500);
  };

  const handleSave = (taskData) => {
    console.log('Task saved with data:', taskData);
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
    }, 1000);
  };

  return (
    <div className="bg-white p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Open Task Modal
        </button>
      </div>

      <TaskModal
        isOpen={isOpen}
        onClose={handleClose}
        task={sampleTask} // Comment this line to see create mode
        onSave={handleSave}
        assignees={sampleAssignees}
        statusOptions={statusOptions}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
