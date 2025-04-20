import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['services'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get services hook using Supabase
export const useServices = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      const fetchOptions = {
        select: '*',
        order: { column: 'name', ascending: true },
        filters: [],
      };

      // Apply filters if any
      if (params.active !== undefined) {
        fetchOptions.filters.push({ column: 'active', operator: 'eq', value: params.active });
      }
      // Add other filters as needed

      const { data, error } = await supabaseHelper.fetch('services', fetchOptions);

      if (error) {
        console.error('Error fetching services:', error);
        throw new Error(error.message);
      }
      return data || []; // Return data array
    },
  });
};

// Get service by ID hook using Supabase
export const useServiceById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const fetchOptions = {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
        single: true,
      };
      const { data, error } = await supabaseHelper.fetch('services', fetchOptions);

      if (error) {
        console.error(`Error fetching service ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create service hook using Supabase
// Renamed from useAddService to useCreateService for consistency
export const useCreateService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData) => {
      // Add timestamps, default values etc. based on your actual 'services' table schema
      // Map frontend fields to DB columns
      const dataToInsert = {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration_minutes: serviceData.duration_minutes,
        category: serviceData.category,
        is_active: serviceData.active ?? true, // Corrected column name
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // TODO: Handle associated_products and available_plans if they are separate tables/relations
      };

      const { data, error } = await supabaseHelper.insert('services', dataToInsert, { returning: 'representation' });

      if (error) {
        console.error('Error creating service:', error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.insert returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating service: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update service hook using Supabase
export const useUpdateService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // The argument received from mutate is the object { id: ..., name: ..., description: ... }
    mutationFn: async (updatePayload) => {
      const { id, ...serviceDataFromForm } = updatePayload; // Extract id, the rest is the form data
      if (!id) throw new Error("Service ID is required for update.");

      // Construct dataToUpdate using properties directly from the form data payload
      const dataToUpdate = {
        name: serviceDataFromForm.name,
        description: serviceDataFromForm.description,
        price: serviceDataFromForm.price,
        duration_minutes: serviceDataFromForm.duration_minutes,
        category: serviceDataFromForm.category,
        is_active: serviceDataFromForm.active, // Use the 'active' field from formData directly
        updated_at: new Date().toISOString(),
        // TODO: Handle associated_products and available_plans if they are separate tables/relations
      };
      // Remove fields that shouldn't be updated directly (like id, created_at if they exist in serviceDataFromForm)
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;

      const { data, error } = await supabaseHelper.update('services', id, dataToUpdate);

      if (error) {
        console.error(`Error updating service ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.update returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating service: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete service hook using Supabase
export const useDeleteService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Service ID is required for deletion.");

      const { data, error } = await supabaseHelper.delete('services', id);

      if (error) {
        console.error(`Error deleting service ${id}:`, error);
        // Handle foreign key constraint errors if services are linked elsewhere
        if (error.code === '23503') { // Foreign key violation
           throw new Error(`Cannot delete service: It is still linked to other records.`);
        }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting service: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
