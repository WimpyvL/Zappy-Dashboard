import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
// import { // Commented out API functions
//   createForm,
//   getFormById,
//   getForms,
//   updateForm,
//   deleteForm,
// } from './api';

// --- Mock Data ---
const sampleFormsData = [
  {
    id: 1,
    title: 'Initial Consultation Form',
    description: 'Form for new patient consultations.',
    service: { id: 1, name: 'Consultation' },
    status: true,
    form_type: 'initial_consultation',
    created_at: '2025-03-10T10:00:00Z',
    updated_at: '2025-03-15T11:30:00Z',
    slug: 'initial-consultation-v1',
    structure: JSON.stringify({
      pages: [
        {
          id: 'page1',
          title: 'Personal Information',
          elements: [
            { id: 'el1', type: 'name', label: 'Full Name', required: true },
            { id: 'el2', type: 'email', label: 'Email', required: true },
          ],
        },
        {
          id: 'page2',
          title: 'Medical History',
          elements: [
            {
              id: 'el3',
              type: 'paragraph',
              label: 'Describe your medical history',
              required: false,
            },
          ],
        },
      ],
      conditionals: [],
    }),
  },
  {
    id: 2,
    title: 'Insurance Verification',
    description: 'Collect insurance details.',
    service: { id: 4, name: 'Insurance Verification' },
    status: true,
    form_type: 'insurance_verification',
    created_at: '2025-03-12T14:00:00Z',
    updated_at: '2025-03-12T14:00:00Z',
    slug: 'insurance-verification-form',
    structure: JSON.stringify({
      pages: [
        {
          id: 'page1_ins',
          title: 'Insurance Details',
          elements: [
            {
              id: 'ins1',
              type: 'short_text',
              label: 'Insurance Provider',
              required: true,
            },
            {
              id: 'ins2',
              type: 'short_text',
              label: 'Policy Number',
              required: true,
            },
          ],
        },
      ],
      conditionals: [],
    }),
  },
];
// --- End Mock Data ---

// Hook to fetch all forms (Mocked)
export const useForms = (params = {}) => {
  // console.log('Using mock forms data in useForms hook'); // Removed log
  return useQuery({
    queryKey: ['forms', params],
    // queryFn: () => getForms(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleFormsData, // Return mock data
        // Add meta if your API returns pagination info
      }),
    select: (data) => data,
    staleTime: Infinity,
  });
};

// Hook to fetch a specific form by ID (Mocked)
export const useFormById = (id, options = {}) => {
  // console.log(`Using mock form data for ID: ${id} in useFormById hook`); // Removed log
  return useQuery({
    queryKey: ['form', id],
    // queryFn: () => getFormById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleFormsData.find((f) => f.id === parseInt(id)) ||
          sampleFormsData[0]
      ), // Find mock form or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Hook to create a new form (Mocked)
export const useCreateForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (formData) => createForm(formData), // Original API call
    mutationFn: async (formData) => {
      // console.log('Mock Creating form:', formData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newForm = {
        id: Date.now(), // Generate mock ID
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        service: {
          id: formData.service_id,
          name: 'Mock Service', // Get actual name if possible
        },
      };
      // Note: Doesn't actually add to sampleFormsData
      return { data: newForm }; // Simulate API response structure if needed
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form created successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while creating the form.'
      );
      options.onError && options.onError(error);
    },
  });
};

// Hook to update an existing form (Mocked)
export const useUpdateForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, formData }) => updateForm(id, formData), // Original API call
    mutationFn: async ({ id, formData }) => {
      // console.log(`Mock Updating form ${id}:`, formData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...formData } }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', variables.id] });
      toast.success('Form updated successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while updating the form.'
      );
      options.onError && options.onError(error);
    },
  });
};

// Hook to delete a form (Mocked)
export const useDeleteForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => deleteForm(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting form ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id if needed
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      // Also invalidate specific form if cached
      queryClient.invalidateQueries({ queryKey: ['form', variables] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};
