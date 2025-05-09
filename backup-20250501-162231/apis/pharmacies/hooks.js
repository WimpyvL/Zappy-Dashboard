import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['pharmacies'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get pharmacies hook using Supabase
export const usePharmacies = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      let query = supabase
        .from('pharmacies') // ASSUMING table name is 'pharmacies'
        .select('*')
        .order('name', { ascending: true });

      // Apply filters if any
      if (typeof filters.active === 'boolean') {
        query = query.eq('is_active', filters.active); // Use correct column name 'is_active'
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.search) {
         query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pharmacies:', error);
        throw new Error(error.message);
      }
      return data || []; // Return data array
    },
  });
};

// Get pharmacy by ID hook using Supabase
export const usePharmacyById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('pharmacies') // ASSUMING table name is 'pharmacies'
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching pharmacy ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create pharmacy hook using Supabase
export const useCreatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pharmacyData) => {
      // Explicitly construct object with ONLY fields managed by the form + timestamps
      const dataToInsert = {
        name: pharmacyData.name,
        pharmacy_type: pharmacyData.pharmacy_type,
        contact_name: pharmacyData.contact_name,
        email: pharmacyData.email, // Assumes form sends 'email' for the main email
        contact_email: pharmacyData.contact_email, // Assumes form might send this separately
        contact_phone: pharmacyData.contact_phone,
        notes: pharmacyData.notes,
        is_active: !!(pharmacyData.active ?? true), // Map 'active' from form
        supported_states: pharmacyData.supportedStates || [], // Map 'supportedStates' from form
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
       // Clean up undefined/null values
       Object.keys(dataToInsert).forEach(key => (dataToInsert[key] === undefined || dataToInsert[key] === null) && delete dataToInsert[key]);

      console.log('[useCreatePharmacy] Final dataToInsert:', JSON.stringify(dataToInsert, null, 2)); // Log the final object

      const { data, error } = await supabase
        .from('pharmacies') // ASSUMING table name is 'pharmacies'
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating pharmacy:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Pharmacy created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating pharmacy: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update pharmacy hook using Supabase
export const useUpdatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pharmacyData }) => {
      if (!id) throw new Error("Pharmacy ID is required for update.");
      // Explicitly construct object with ONLY fields managed by the form + timestamps
      const dataToUpdate = {
        name: pharmacyData.name,
        pharmacy_type: pharmacyData.pharmacy_type,
        contact_name: pharmacyData.contact_name,
        email: pharmacyData.email,
        contact_email: pharmacyData.contact_email,
        contact_phone: pharmacyData.contact_phone,
        notes: pharmacyData.notes,
        is_active: !!pharmacyData.active, // Map 'active' from form
        supported_states: pharmacyData.supportedStates || [], // Map 'supportedStates'
        updated_at: new Date().toISOString(),
      };
      // Clean up undefined/null values
      Object.keys(dataToUpdate).forEach(key => (dataToUpdate[key] === undefined || dataToUpdate[key] === null) && delete dataToUpdate[key]);

      console.log('[useUpdatePharmacy] Final dataToUpdate:', JSON.stringify(dataToUpdate, null, 2)); // Log the final object

      const { data, error } = await supabase
        .from('pharmacies') // ASSUMING table name is 'pharmacies'
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating pharmacy ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Pharmacy updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating pharmacy: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete pharmacy hook using Supabase
export const useDeletePharmacy = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Pharmacy ID is required for deletion.");

      const { error } = await supabase
        .from('pharmacies') // ASSUMING table name is 'pharmacies'
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting pharmacy ${id}:`, error);
         // Handle foreign key constraint errors if needed
         if (error.code === '23503') {
           throw new Error(`Cannot delete pharmacy: It might be linked to other records.`);
         }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Pharmacy deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting pharmacy: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Toggle pharmacy active hook using Supabase
export const useTogglePharmacyActive = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }) => {
       if (!id) throw new Error("Pharmacy ID is required.");

       const { data, error } = await supabase
         .from('pharmacies') // ASSUMING table name is 'pharmacies'
         .update({ is_active: active, updated_at: new Date().toISOString() }) // Use correct column name 'is_active'
         .eq('id', id)
         .select()
         .single();

       if (error) {
         console.error(`Error toggling pharmacy ${id} status:`, error);
         throw new Error(error.message);
       }
       return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success(`Pharmacy ${variables.active ? 'activated' : 'deactivated'} successfully`);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating pharmacy status: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
