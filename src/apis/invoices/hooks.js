import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify'; // Added for mock feedback
// import { // Commented out API functions
//   getInvoices,
//   getInvoiceById,
//   createInvoice,
//   updateInvoice,
//   deleteInvoice,
//   markInvoiceAsPaid,
//   sendInvoice,
// } from './api';

// --- Mock Data ---
const sampleInvoicesData = [
  {
    id: 'inv001',
    patientId: 'p001',
    patientName: 'John Smith',
    issueDate: '2025-04-01T00:00:00Z',
    dueDate: '2025-04-15T00:00:00Z',
    amount: 199.0,
    status: 'paid',
    items: [{ description: 'Monthly Subscription - April', amount: 199.0 }],
  },
  {
    id: 'inv002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    issueDate: '2025-04-02T00:00:00Z',
    dueDate: '2025-04-16T00:00:00Z',
    amount: 75.0,
    status: 'pending',
    items: [{ description: 'Follow-up Session', amount: 75.0 }],
  },
  {
    id: 'inv003',
    patientId: 'p001',
    patientName: 'John Smith',
    issueDate: '2025-03-01T00:00:00Z',
    dueDate: '2025-03-15T00:00:00Z',
    amount: 199.0,
    status: 'paid',
    items: [{ description: 'Monthly Subscription - March', amount: 199.0 }],
  },
];
// --- End Mock Data ---

// Hook to fetch all invoices (Mocked)
export const useInvoices = (params = {}) => {
  console.log('Using mock invoices data in useInvoices hook');
  return useQuery({
    queryKey: ['invoices', params],
    // queryFn: () => getInvoices(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleInvoicesData, // Return mock data
        // Add meta if your API returns pagination info
      }),
    staleTime: Infinity,
  });
};

// Hook to fetch a specific invoice by ID (Mocked)
export const useInvoiceById = (id, options = {}) => {
  console.log(`Using mock invoice data for ID: ${id} in useInvoiceById hook`);
  return useQuery({
    queryKey: ['invoice', id],
    // queryFn: () => getInvoiceById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleInvoicesData.find((inv) => inv.id === id) || sampleInvoicesData[0]
      ), // Find mock invoice or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Hook to create a new invoice (Mocked)
export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (invoiceData) => createInvoice(invoiceData), // Original API call
    mutationFn: async (invoiceData) => {
      console.log('Mock Creating invoice:', invoiceData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newInvoice = {
        id: `inv${Date.now()}`, // Generate mock ID
        ...invoiceData,
        status: 'pending', // Default status
        issueDate: new Date().toISOString(),
        // Calculate dueDate based on terms or default
      };
      // Note: Doesn't actually add to sampleInvoicesData
      return { data: newInvoice }; // Simulate API response
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to update an existing invoice (Mocked)
export const useUpdateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, invoiceData }) => updateInvoice(id, invoiceData), // Original API call
    mutationFn: async ({ id, invoiceData }) => {
      console.log(`Mock Updating invoice ${id}:`, invoiceData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...invoiceData } }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to delete an invoice (Mocked)
export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => deleteInvoice(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Deleting invoice ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id if needed
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // Also invalidate specific invoice if cached
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] });
      toast.success('Invoice deleted successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to mark invoice as paid (Mocked)
export const useMarkInvoiceAsPaid = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => markInvoiceAsPaid(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Marking invoice ${id} as paid`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id, status: 'paid' }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to send invoice to customer (Mocked)
export const useSendInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => sendInvoice(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Sending invoice ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id, status: 'sent' }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};
