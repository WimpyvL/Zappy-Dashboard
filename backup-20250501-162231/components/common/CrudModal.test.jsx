import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import CrudModal from './CrudModal';
import { useApi } from '../../hooks/useApi';
import errorHandling from '../../utils/errorHandling';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('../../utils/errorHandling', () => ({
  getErrorMessage: jest.fn(error => error?.message || 'Unknown error'),
  getFormErrors: jest.fn(() => ({})),
  logError: jest.fn(),
}));

// Mock mutation hooks
const mockMutateAsync = jest.fn();
const mockCreateHook = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));

const mockUpdateHook = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));

// Mock fetch function
const mockFetchById = jest.fn();

// Sample form fields for testing
const testFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: 'Name is required',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: 'Email is required',
    validation: { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } },
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'Standard User' },
    ],
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    gridCols: 2,
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
  },
];

describe('CrudModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useApi
    useApi.mockImplementation((func, context) => ({
      execute: jest.fn(async (...args) => {
        if (func) {
          try {
            const result = await func(...args);
            return { success: true, data: result };
          } catch (error) {
            return { success: false, error, formErrors: {} };
          }
        }
        return { success: true, data: {} };
      }),
      loading: false,
      error: null,
      reset: jest.fn(),
    }));
  });

  test('renders create modal correctly', () => {
    render(
      <CrudModal
        isOpen={true}
        onClose={jest.fn()}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
      />
    );
    
    // Check title and button text
    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    
    // Check that all form fields are rendered
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
  });

  test('renders edit modal correctly and loads data', async () => {
    // Setup mock fetch response
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      notes: 'Test notes',
      startDate: '2025-01-15',
    };
    
    mockFetchById.mockResolvedValue(mockUser);
    
    // Mock the execute function to return success with data
    const mockExecute = jest.fn().mockResolvedValue({ 
      success: true, 
      data: mockUser,
    });
    
    useApi.mockImplementation(() => ({
      execute: mockExecute,
      loading: false,
      error: null,
      reset: jest.fn(),
    }));
    
    render(
      <CrudModal
        isOpen={true}
        onClose={jest.fn()}
        entityId="123"
        resourceName="User"
        fetchById={mockFetchById}
        useUpdateHook={mockUpdateHook}
        formFields={testFormFields}
      />
    );
    
    // Check that the title is for editing
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
    });
    
    // Verify form fields are populated with user data
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  test('handles form submission in create mode', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockOnClose = jest.fn();
    
    mockMutateAsync.mockResolvedValue({ id: 'new-1', name: 'New User' });
    
    render(
      <CrudModal
        isOpen={true}
        onClose={mockOnClose}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
        onSuccess={mockOnSuccess}
      />
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.selectOptions(screen.getByLabelText(/Role/i), ['user']);
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Add User' }));
    
    // Check that the mutation was called with the correct data
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        notes: '', // Empty string is default for unfilled fields
        startDate: '',
      });
    });
    
    // Check that success callbacks are called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('User created successfully!');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles form submission in edit mode', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockOnClose = jest.fn();
    
    // Setup existing user data
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };
    
    mockFetchById.mockResolvedValue(mockUser);
    
    // Mock successful fetch
    useApi.mockImplementationOnce(() => ({
      execute: jest.fn().mockResolvedValue({ success: true, data: mockUser }),
      loading: false,
      error: null,
      reset: jest.fn(),
    })).mockImplementationOnce(() => ({
      execute: jest.fn().mockImplementation(async (func) => {
        const result = await func();
        return { success: true, data: result };
      }),
      loading: false,
      error: null,
      reset: jest.fn(),
    }));
    
    mockMutateAsync.mockResolvedValue({ id: '123', name: 'Updated User', email: 'john@example.com' });
    
    render(
      <CrudModal
        isOpen={true}
        onClose={mockOnClose}
        entityId="123"
        resourceName="User"
        fetchById={mockFetchById}
        useUpdateHook={mockUpdateHook}
        formFields={testFormFields}
        onSuccess={mockOnSuccess}
      />
    );
    
    // Wait for form to be populated with existing data
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    
    // Update the name field
    const nameInput = screen.getByDisplayValue('John Doe');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated User');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    
    // Check that the update mutation was called correctly
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: '123',
        data: expect.objectContaining({
          name: 'Updated User',
        }),
      });
    });
    
    // Check success callbacks
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('User updated successfully!');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles form validation errors', async () => {
    const user = userEvent.setup();
    
    render(
      <CrudModal
        isOpen={true}
        onClose={jest.fn()}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
      />
    );
    
    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: 'Add User' }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Fill with invalid email
    await user.type(screen.getByLabelText(/Name/i), 'Test User');
    await user.type(screen.getByLabelText(/Email/i), 'invalid-email');
    
    // Submit again
    await user.click(screen.getByRole('button', { name: 'Add User' }));
    
    // Check that email validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
    
    // Verify mutation was not called
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  test('handles API submission error', async () => {
    const user = userEvent.setup();
    const mockError = new Error('API submission failed');
    
    mockMutateAsync.mockRejectedValue(mockError);
    
    // Mock the execute function to return the error
    useApi.mockImplementation(() => ({
      execute: jest.fn().mockImplementation(async (func) => {
        try {
          await func();
          return { success: true, data: {} };
        } catch (error) {
          return { success: false, error, formErrors: {} };
        }
      }),
      loading: false,
      error: null,
      reset: jest.fn(),
    }));
    
    render(
      <CrudModal
        isOpen={true}
        onClose={jest.fn()}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
      />
    );
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/Name/i), 'Test User');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Add User' }));
    
    // Check that the error message is displayed
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed: API submission failed');
    });
    
    // Form should remain open
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
  });

  test('closes the modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
    render(
      <CrudModal
        isOpen={true}
        onClose={mockOnClose}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
      />
    );
    
    // Click the cancel button
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('renders loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock pending state
    mockCreateHook.mockReturnValue({
      mutateAsync: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: 'new-1', name: 'New User' };
      }),
      isPending: true,
    });
    
    render(
      <CrudModal
        isOpen={true}
        onClose={jest.fn()}
        resourceName="User"
        useCreateHook={mockCreateHook}
        formFields={testFormFields}
      />
    );
    
    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'Test User');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Add User' }));
    
    // Check for loading indicator
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Buttons should be disabled during submission
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});