import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify'; // Added for mock feedback
// import { // Commented out API functions
//   getPharmacies,
//   getPharmacyById,
//   createPharmacy,
//   updatePharmacy,
//   deletePharmacy,
//   togglePharmacyActive,
// } from './api';

// --- Mock Data ---
const samplePharmaciesData = [
  {
    id: 1,
    name: 'Central Compounding Pharmacy',
    type: 'compounding',
    address: '123 Main St, Anytown, USA',
    phone: '555-111-2222',
    email: 'info@centralcompounding.com',
    active: true,
    supportedStates: ['CA', 'NY', 'TX'],
  },
  {
    id: 2,
    name: 'Downtown Retail Pharmacy',
    type: 'retail',
    address: '456 Oak Ave, Anytown, USA',
    phone: '555-333-4444',
    email: 'contact@downtownpharm.com',
    active: true,
    supportedStates: ['CA', 'FL'],
  },
  {
    id: 3,
    name: 'Inactive Pharmacy',
    type: 'retail',
    address: '789 Pine Ln, Anytown, USA',
    phone: '555-555-6666',
    email: 'old@pharmacy.com',
    active: false,
    supportedStates: ['NY'],
  },
];
// --- End Mock Data ---

// Get pharmacies hook (Mocked)
export const usePharmacies = (filters) => {
  // console.log('Using mock pharmacies data in usePharmacies hook'); // Removed log
  return useQuery({
    queryKey: ['pharmacies', filters],
    // queryFn: () => getPharmacies(filters), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: samplePharmaciesData, // Return mock data
        // Add meta if needed
      }),
    staleTime: Infinity,
  });
};

// Get pharmacy by ID hook (Mocked)
export const usePharmacyById = (id, options = {}) => {
  // console.log(`Using mock pharmacy data for ID: ${id} in usePharmacyById hook`); // Removed log
  return useQuery({
    queryKey: ['pharmacy', id],
    // queryFn: () => getPharmacyById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        samplePharmaciesData.find((p) => p.id === id) || samplePharmaciesData[0]
      ), // Find mock pharmacy or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create pharmacy hook (Mocked)
export const useCreatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (pharmacyData) => createPharmacy(pharmacyData), // Original API call
    mutationFn: async (pharmacyData) => {
      // console.log('Mock Creating pharmacy:', pharmacyData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newPharmacy = {
        id: Date.now(), // Generate mock ID
        ...pharmacyData,
        active: pharmacyData.active !== undefined ? pharmacyData.active : true,
      };
      // Note: Doesn't actually add to samplePharmaciesData
      return { data: newPharmacy }; // Simulate API response
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success('Pharmacy created successfully');
      options.onSuccess && options.onSuccess();
    },
  });
};

// Update pharmacy hook (Mocked)
export const useUpdatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, pharmacyData }) => updatePharmacy(id, pharmacyData), // Original API call
    mutationFn: async ({ id, pharmacyData }) => {
      // console.log(`Mock Updating pharmacy ${id}:`, pharmacyData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...pharmacyData } }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', variables.id] });
      toast.success('Pharmacy updated successfully');
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete pharmacy hook (Mocked)
export const useDeletePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => deletePharmacy(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting pharmacy ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id if needed
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      // Also invalidate specific pharmacy if cached
      queryClient.invalidateQueries({ queryKey: ['pharmacy', variables] });
      toast.success('Pharmacy deleted successfully');
      options.onSuccess && options.onSuccess();
    },
  });
};

// Toggle pharmacy active hook (Mocked)
export const useTogglePharmacyActive = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, active }) => togglePharmacyActive(id, active), // Original API call
    mutationFn: async ({ id, active }) => {
      // console.log(`Mock Toggling pharmacy ${id} active status to: ${active}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id, active }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', variables.id] });
      toast.success(
        `Pharmacy ${variables.active ? 'activated' : 'deactivated'} successfully`
      );
      options.onSuccess && options.onSuccess();
    },
  });
};
