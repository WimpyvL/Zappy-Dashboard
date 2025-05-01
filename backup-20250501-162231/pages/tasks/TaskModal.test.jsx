import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from './TaskModal';
import { renderWithProviders } from '../../utils/test-utils';

// Mock data for testing
const mockTask = {
  id: '123',
  title: 'Test Task',
  status: 'pending',
  priority: 'high',
  due_date: '2025-05-01T10:00:00',
  reminder_date: '2025-04-30T09:00:00',
  message: 'This is a test task',
  duration: 45,
  notify_assignee: true,
  assignable: {
    type: 'user',
    user: { id: 'user-123', full_name: 'Test User' }
  },
  taskable: {
    type: 'patient',
    patient: { id: 'patient-123', first_name: 'John', last_name: 'Doe' }
  }
};

const mockAssignees = [
  { id: 'user-123', full_name: 'Test User', email: 'test@example.com' },
  { id: 'user-456', full_name: 'Another User', email: 'another@example.com' }
];

const mockPatients = [
  { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
  { id: 'patient-456', first_name: 'Jane', last_name: 'Smith' }
];

const mockStatusOptions = ['pending', 'in_progress', 'completed', 'canceled'];
const mockPriorityOptions = ['low', 'medium', 'high'];

describe('TaskModal Component', () => {
  // Test for rendering when creating a new task
  test('renders correctly for creating a new task', () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Patient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
  });
  
  // Test for rendering when editing an existing task
  test('renders correctly for editing an existing task', () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        task={mockTask}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Task/i })).toBeInTheDocument();
  });
  
  // Test for handling form inputs
  test('updates form values correctly when inputs change', async () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    const user = userEvent.setup();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    // Enter a task title
    const titleInput = screen.getByLabelText(/Task Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'New Test Task');
    
    // Select a patient
    const patientSelect = screen.getByLabelText(/Patient/i);
    await user.selectOptions(patientSelect, ['patient-456']);
    
    // Select a priority
    const prioritySelect = screen.getByLabelText(/Priority/i);
    await user.selectOptions(prioritySelect, ['high']);
    
    // Toggle notify assignee
    const notifyCheckbox = screen.getByLabelText(/Notify Assignee/i);
    await user.click(notifyCheckbox);
    
    // Add a message
    const messageInput = screen.getByLabelText(/Notes\/Message/i);
    await user.type(messageInput, 'This is a test message');
    
    // Expect the values to be updated
    expect(titleInput).toHaveValue('New Test Task');
    expect(patientSelect).toHaveValue('patient-456');
    expect(prioritySelect).toHaveValue('high');
    expect(notifyCheckbox).toBeChecked();
    expect(messageInput).toHaveValue('This is a test message');
  });
  
  // Test for form submission
  test('calls onSave with form data when submitted', async () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    const user = userEvent.setup();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Task Title/i), 'Test Submission');
    await user.selectOptions(screen.getByLabelText(/Patient/i), ['patient-123']);
    await user.selectOptions(screen.getByLabelText(/Assign To/i), ['user-123']);
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create Task/i }));
    
    // Check if onSave was called with the expected data
    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock.mock.calls[0][0]).toMatchObject({
      title: 'Test Submission',
      taskable_id: 'patient-123',
      assignable_id: 'user-123',
    });
  });
  
  // Test for closing the modal
  test('calls onClose when the cancel button is clicked', async () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    const user = userEvent.setup();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    // Click the cancel button
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check if onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
  
  // Test for loading dates correctly when editing a task
  test('formats dates correctly when editing a task', () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    
    renderWithProviders(
      <TaskModal
        isOpen={true}
        task={mockTask}
        onClose={onCloseMock}
        onSave={onSaveMock}
        assignees={mockAssignees}
        patients={mockPatients}
        statusOptions={mockStatusOptions}
        priorityOptions={mockPriorityOptions}
      />
    );
    
    // Check if the date inputs have the expected formatted values
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const reminderDateInput = screen.getByLabelText(/Reminder Date/i);
    
    expect(dueDateInput).toHaveValue('2025-05-01T10:00:00');
    expect(reminderDateInput).toHaveValue('2025-04-30T09:00:00');
  });
});