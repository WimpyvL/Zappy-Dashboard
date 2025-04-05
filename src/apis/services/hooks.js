import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
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
      let query = supabase
        .from('services') // ASSUMING table name is 'services'
        .select('*')
        .order('name', { ascending: true }); // Example order

      // Apply filters if any
      if (params.active !== undefined) {
        query = query.eq('active', params.active);
      }
      // Add other filters as needed

      const { data, error } = await query;

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

      const { data, error } = await supabase
        .from('services') // ASSUMING table name is 'services'
        .select('*')
        .eq('id', id)
        .single();

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
      const dataToInsert = {
        ...serviceData,
        created_at: new Date().toISOString(), // Assuming created_at column
        updated_at: new Date().toISOString(), // Assuming updated_at column
        active: serviceData.active ?? true,
        // Ensure complex fields are handled (assuming JSONB for now)
        associated_products: serviceData.associatedProducts || [],
        available_plans: serviceData.availablePlans || [],
      };

      const { data, error } = await supabase
        .from('services') // ASSUMING table name is 'services'
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw new Error(error.message);
      }
      return data;
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
    mutationFn: async ({ id, serviceData }) => {
      if (!id) throw new Error("Service ID is required for update.");
      const dataToUpdate = {
        ...serviceData,
        updated_at: new Date().toISOString(),
        // Ensure complex fields are handled (assuming JSONB for now)
        associated_products: serviceData.associatedProducts,
        available_plans: serviceData.availablePlans,
      };
      // Remove fields that shouldn't be updated directly if necessary
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;

      const { data, error } = await supabase
        .from('services') // ASSUMING table name is 'services'
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating service ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
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

      const { error } = await supabase
        .from('services') // ASSUMING table name is 'services'
        .delete()
        .eq('id', id);

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
