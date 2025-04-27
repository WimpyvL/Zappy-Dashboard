import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys for services
const queryKeys = {
  all: ['services'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get services hook with pagination using Supabase and custom PostgreSQL function
export const useServices = (params = {}, pageSize = 10) => {
  const { page, search, active } = params;
  const currentPage = page || 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      try {
        // Use the custom PostgreSQL function for optimized fetching
        const { data: result, error } = await supabase.rpc(
          'list_services_with_relationships',
          {
            page_number: currentPage,
            page_size: pageSize,
            search_term: search || null,
            is_active: typeof active === 'boolean' ? active : null
          }
        );

        if (error) {
          console.error('Error fetching services:', error);
          throw new Error(error.message);
        }

        return result || { data: [], meta: { total: 0, per_page: pageSize, current_page: currentPage, last_page: 0 } };
      } catch (error) {
        console.error('Unexpected error in useServices:', error);
        // Fallback to the batch fetching approach if the RPC function fails
        return fallbackFetchServices(params, pageSize);
      }
    },
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds cache before becoming stale
  });
};

// Fallback function to use if the RPC function is not available
async function fallbackFetchServices(params = {}, pageSize = 10) {
  const { page, search, active } = params;
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  // First, get the filtered services with pagination
  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(rangeFrom, rangeTo);

  if (active !== undefined) {
    query = query.eq('is_active', active);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: servicesData, error: servicesError, count } = await query;

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
    throw new Error(servicesError.message);
  }

  if (!servicesData?.length) {
    return {
      data: [],
      meta: {
        total: 0,
        per_page: pageSize,
        current_page: currentPage,
        last_page: 0,
      },
    };
  }

  // Extract all service IDs for efficient batch queries
  const serviceIds = servicesData.map(service => service.id);

  // Batch fetch all related products in a single query
  const { data: productsData, error: productsError } = await supabase
    .from('service_products')
    .select('service_id, product_id')
    .in('service_id', serviceIds);

  if (productsError) {
    console.error('Error fetching associated products:', productsError);
  }

  // Batch fetch all related plans in a single query
  const { data: plansData, error: plansError } = await supabase
    .from('service_plans')
    .select('service_id, plan_id, duration, requires_subscription')
    .in('service_id', serviceIds);

  if (plansError) {
    console.error('Error fetching available plans:', plansError);
  }

  // Group the results by service_id for efficient lookup
  const productsByServiceId = {};
  const plansByServiceId = {};
  
  // Initialize with empty arrays for all services
  serviceIds.forEach(id => {
    productsByServiceId[id] = [];
    plansByServiceId[id] = [];
  });

  // Populate product relationships
  if (productsData?.length) {
    productsData.forEach(item => {
      if (productsByServiceId[item.service_id]) {
        productsByServiceId[item.service_id].push(item.product_id);
      }
    });
  }

  // Populate plan relationships
  if (plansData?.length) {
    plansData.forEach(item => {
      if (plansByServiceId[item.service_id]) {
        plansByServiceId[item.service_id].push({
          planId: item.plan_id,
          duration: item.duration,
          requiresSubscription: item.requires_subscription,
        });
      }
    });
  }

  // Map the services with their relationships
  const servicesWithRelations = servicesData.map(service => ({
    ...service,
    associatedProducts: productsByServiceId[service.id] || [],
    availablePlans: plansByServiceId[service.id] || [],
  }));

  return {
    data: servicesWithRelations,
    meta: {
      total: count || 0,
      per_page: pageSize,
      current_page: currentPage,
      last_page: Math.ceil((count || 0) / pageSize),
    },
  };
}

// Get service by ID hook using Supabase custom PostgreSQL function
export const useServiceById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      try {
        // Use the optimized PostgreSQL function 
        const { data: service, error } = await supabase.rpc(
          'get_service_with_relationships',
          { service_id: id }
        );

        if (error) {
          console.error(`Error fetching service ${id} using RPC:`, error);
          // If the RPC call fails, fall back to the parallel fetching method
          return fallbackFetchServiceById(id);
        }

        return service;
      } catch (error) {
        console.error(`Unexpected error in useServiceById for ${id}:`, error);
        // Fall back to the parallel fetching method
        return fallbackFetchServiceById(id);
      }
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds cache before becoming stale
    ...options,
  });
};

// Fallback function to fetch service by ID if RPC is unavailable
async function fallbackFetchServiceById(id) {
  // Get both the service and its relationships in parallel for better performance
  const [serviceResponse, productsResponse, plansResponse] = await Promise.all([
    // Get the base service data
    supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single(),
    
    // Get associated products
    supabase
      .from('service_products')
      .select('product_id')
      .eq('service_id', id),
    
    // Get available plans
    supabase
      .from('service_plans')
      .select('plan_id, duration, requires_subscription')
      .eq('service_id', id)
  ]);

  const { data: service, error: serviceError } = serviceResponse;
  const { data: productsData, error: productsError } = productsResponse;
  const { data: plansData, error: plansError } = plansResponse;

  if (serviceError) {
    console.error(`Error fetching service ${id}:`, serviceError);
    if (serviceError.code === 'PGRST116') return null;
    throw new Error(serviceError.message);
  }

  if (productsError) {
    console.error(`Error fetching associated products for service ${id}:`, productsError);
  }

  if (plansError) {
    console.error(`Error fetching available plans for service ${id}:`, plansError);
  }

  if (!service) return null;

  // Return the service with its relationships
  return {
    ...service,
    associatedProducts: productsData?.map(item => item.product_id) || [],
    availablePlans: plansData || [],
  };
}

// Update service hook using Supabase
export const useUpdateService = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, serviceData }) => {
      if (!id) throw new Error('Service ID is required for update.');

      // Extract data for service table
      const dataToUpdate = {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration_minutes: serviceData.duration_minutes,
        category: serviceData.category,
        is_active: serviceData.active,
        requires_consultation: serviceData.requiresConsultation,
        updated_at: new Date().toISOString(),
      };

      // Start a Supabase transaction
      const { data, error } = await supabase
        .from('services')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating service ${id}:`, error);
        throw new Error(error.message);
      }

      // Handle associated products - delete existing relationships first
      const { error: deleteProductsError } = await supabase
        .from('service_products')
        .delete()
        .eq('service_id', id);

      if (deleteProductsError) {
        console.error(`Error deleting service_products for service ${id}:`, deleteProductsError);
        throw new Error(deleteProductsError.message);
      }

      // Insert new product relationships if any
      if (Array.isArray(serviceData.associatedProducts) && serviceData.associatedProducts.length > 0) {
        const productsToInsert = serviceData.associatedProducts.map(productId => ({
          service_id: id,
          product_id: productId,
        }));

        const { error: insertProductsError } = await supabase
          .from('service_products')
          .insert(productsToInsert);

        if (insertProductsError) {
          console.error(`Error inserting service_products for service ${id}:`, insertProductsError);
          throw new Error(insertProductsError.message);
        }
      }

      // Handle available plans - delete existing relationships first
      const { error: deletePlansError } = await supabase
        .from('service_plans')
        .delete()
        .eq('service_id', id);

      if (deletePlansError) {
        console.error(`Error deleting service_plans for service ${id}:`, deletePlansError);
        throw new Error(deletePlansError.message);
      }

      // Insert new plan relationships if any
      if (Array.isArray(serviceData.availablePlans) && serviceData.availablePlans.length > 0) {
        const plansToInsert = serviceData.availablePlans.map(planConfig => ({
          service_id: id,
          plan_id: planConfig.planId,
          duration: planConfig.duration || '1 month',
          requires_subscription: planConfig.requiresSubscription ?? true,
        }));

        const { error: insertPlansError } = await supabase
          .from('service_plans')
          .insert(plansToInsert);

        if (insertPlansError) {
          console.error(`Error inserting service_plans for service ${id}:`, insertPlansError);
          throw new Error(insertPlansError.message);
        }
      }

      // Return the service with its relationships
      return {
        ...data,
        associatedProducts: serviceData.associatedProducts || [],
        availablePlans: serviceData.availablePlans || [],
      };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update service ${variables.id} mutation error:`, error);
      toast.error(`Error updating service: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Create service hook using Supabase
export const useCreateService = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      // Extract data for service table
      const dataToInsert = {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price || 0,
        duration_minutes: serviceData.duration_minutes || 30,
        category: serviceData.category,
        is_active: serviceData.active ?? true,
        requires_consultation: serviceData.requiresConsultation ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // First insert the service
      const { data, error } = await supabase
        .from('services')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw new Error(error.message);
      }

      const serviceId = data.id;

      // Insert product relationships if any
      if (Array.isArray(serviceData.associatedProducts) && serviceData.associatedProducts.length > 0) {
        const productsToInsert = serviceData.associatedProducts.map(productId => ({
          service_id: serviceId,
          product_id: productId,
        }));

        const { error: productsError } = await supabase
          .from('service_products')
          .insert(productsToInsert);

        if (productsError) {
          console.error(`Error inserting service_products for new service ${serviceId}:`, productsError);
          throw new Error(productsError.message);
        }
      }

      // Insert plan relationships if any
      if (Array.isArray(serviceData.availablePlans) && serviceData.availablePlans.length > 0) {
        const plansToInsert = serviceData.availablePlans.map(planConfig => ({
          service_id: serviceId,
          plan_id: planConfig.planId,
          duration: planConfig.duration || '1 month',
          requires_subscription: planConfig.requiresSubscription ?? true,
        }));

        const { error: plansError } = await supabase
          .from('service_plans')
          .insert(plansToInsert);

        if (plansError) {
          console.error(`Error inserting service_plans for new service ${serviceId}:`, plansError);
          throw new Error(plansError.message);
        }
      }

      // Return the service with its relationships
      return {
        ...data,
        associatedProducts: serviceData.associatedProducts || [],
        availablePlans: serviceData.availablePlans || [],
      };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Create service mutation error:', error);
      toast.error(`Error creating service: ${error.message}`);
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
      if (!id) throw new Error('Service ID is required for deletion.');

      // Due to ON DELETE CASCADE in our schema, we don't need to manually delete 
      // from the junction tables, but it's good practice to verify everything is cleaned up

      // Delete the service (cascade will clean up related records)
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting service ${id}:`, error);
        if (error.code === '23503') {
          throw new Error('Cannot delete service: It is still linked to active sessions or orders');
        }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Delete service ${variables} mutation error:`, error);
      toast.error(`Error deleting service: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
