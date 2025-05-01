/**
 * @deprecated This API is deprecated and will be removed in a future version.
 * Please use the subscription plans API instead (src/apis/subscriptionPlans/hooks.js).
 * See DEPRECATED.md for more information.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Display deprecation warning in console
console.warn(
  'The Treatment Packages API is deprecated and will be removed in a future version. ' +
  'Please use the subscription plans API instead (src/apis/subscriptionPlans/hooks.js).'
);

// Define query keys for treatment packages
const queryKeys = {
  all: ['treatmentPackages'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  durations: () => ['subscriptionDurations'],
};

// Get all subscription durations
export const useSubscriptionDurations = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.durations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_duration')
        .select('*')
        .order('duration_months', { ascending: true });

      if (error) {
        console.error('Error fetching subscription durations:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour as this rarely changes
    ...options,
  });
};

// Get treatment packages with pagination
export const useTreatmentPackages = (params = {}, pageSize = 10, options = {}) => {
  const { page, search, active, condition } = params;
  const currentPage = page || 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      // Calculate pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build query
      let query = supabase
        .from('treatment_package')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, to);

      // Apply filters
      if (active !== undefined) {
        query = query.eq('is_active', active);
      }
      if (condition) {
        query = query.eq('condition', condition);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,condition.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching treatment packages:', error);
        throw new Error(error.message);
      }

      if (!data?.length) {
        return {
          data: [],
          meta: {
            total: 0,
            per_page: pageSize,
            current_page: currentPage,
            last_page: 0,
          }
        };
      }

      // Fetch services associated with each package in a single query
      const packageIds = data.map(pkg => pkg.id);
      const { data: packageServices, error: servicesError } = await supabase
        .from('package_service')
        .select('package_id, service_id')
        .in('package_id', packageIds);
      
      if (servicesError) {
        console.error('Error fetching package services:', servicesError);
      }

      // Group services by package ID
      const servicesByPackageId = {};
      packageIds.forEach(id => {
        servicesByPackageId[id] = [];
      });

      if (packageServices?.length) {
        packageServices.forEach(item => {
          if (servicesByPackageId[item.package_id]) {
            servicesByPackageId[item.package_id].push(item.service_id);
          }
        });
      }

      // Add services to each package
      const packagesWithServices = data.map(pkg => ({
        ...pkg,
        services: servicesByPackageId[pkg.id] || [],
      }));

      return {
        data: packagesWithServices,
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        }
      };
    },
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds cache
    ...options,
  });
};

// Get treatment package by ID with associated services
export const useTreatmentPackageById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      // Fetch package and its services in parallel
      const [packageResponse, servicesResponse] = await Promise.all([
        supabase
          .from('treatment_package')
          .select('*')
          .eq('id', id)
          .single(),
        
        supabase
          .from('package_service')
          .select('service_id')
          .eq('package_id', id)
      ]);

      const { data: packageData, error: packageError } = packageResponse;
      const { data: servicesData, error: servicesError } = servicesResponse;

      if (packageError) {
        console.error(`Error fetching treatment package ${id}:`, packageError);
        if (packageError.code === 'PGRST116') return null;
        throw new Error(packageError.message);
      }

      if (servicesError) {
        console.error(`Error fetching services for package ${id}:`, servicesError);
      }

      if (!packageData) return null;

      // Return package with services
      return {
        ...packageData,
        services: servicesData?.map(item => item.service_id) || [],
      };
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds cache
    ...options,
  });
};

// Create treatment package
export const useCreateTreatmentPackage = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageData) => {
      // Extract data for package table
      const dataToInsert = {
        name: packageData.name,
        description: packageData.description,
        condition: packageData.condition,
        is_active: packageData.is_active ?? true,
        base_price: packageData.base_price || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert package
      const { data, error } = await supabase
        .from('treatment_package')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating treatment package:', error);
        throw new Error(error.message);
      }

      const packageId = data.id;

      // Insert service associations if any
      if (Array.isArray(packageData.services) && packageData.services.length > 0) {
        const servicesToInsert = packageData.services.map(serviceId => ({
          package_id: packageId,
          service_id: serviceId,
        }));

        const { error: servicesError } = await supabase
          .from('package_service')
          .insert(servicesToInsert);

        if (servicesError) {
          console.error(`Error adding services to package ${packageId}:`, servicesError);
          throw new Error(servicesError.message);
        }
      }

      // Return the package with services
      return {
        ...data,
        services: packageData.services || [],
      };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Treatment package created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating treatment package: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update treatment package
export const useUpdateTreatmentPackage = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, packageData }) => {
      if (!id) throw new Error('Package ID is required for update');

      // Extract data for package table
      const dataToUpdate = {
        name: packageData.name,
        description: packageData.description,
        condition: packageData.condition,
        is_active: packageData.is_active,
        base_price: packageData.base_price,
        updated_at: new Date().toISOString(),
      };

      // Update package
      const { data, error } = await supabase
        .from('treatment_package')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating treatment package ${id}:`, error);
        throw new Error(error.message);
      }

      // Handle services - first delete existing relationships
      const { error: deleteServicesError } = await supabase
        .from('package_service')
        .delete()
        .eq('package_id', id);

      if (deleteServicesError) {
        console.error(`Error deleting services for package ${id}:`, deleteServicesError);
        throw new Error(deleteServicesError.message);
      }

      // Insert new service relationships if any
      if (Array.isArray(packageData.services) && packageData.services.length > 0) {
        const servicesToInsert = packageData.services.map(serviceId => ({
          package_id: id,
          service_id: serviceId,
        }));

        const { error: insertServicesError } = await supabase
          .from('package_service')
          .insert(servicesToInsert);

        if (insertServicesError) {
          console.error(`Error inserting services for package ${id}:`, insertServicesError);
          throw new Error(insertServicesError.message);
        }
      }

      // Return the package with services
      return {
        ...data,
        services: packageData.services || [],
      };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Treatment package updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating treatment package: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete treatment package
export const useDeleteTreatmentPackage = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Package ID is required for deletion');

      // Check if package is used in any active subscriptions
      const { data: subscriptions, error: checkError } = await supabase
        .from('patient_subscription')
        .select('id')
        .eq('package_id', id)
        .eq('status', 'active')
        .limit(1);

      if (checkError) {
        console.error(`Error checking subscriptions for package ${id}:`, checkError);
        throw new Error(checkError.message);
      }

      if (subscriptions?.length > 0) {
        throw new Error('Cannot delete package: It is currently used in active subscriptions');
      }

      // Delete the package (will cascade to PackageService)
      const { error } = await supabase
        .from('treatment_package')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting treatment package ${id}:`, error);
        throw new Error(error.message);
      }

      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Treatment package deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting treatment package: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Get patient subscription with package details
export const usePatientSubscription = (patientId, options = {}) => {
  return useQuery({
    queryKey: ['patientSubscription', patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from('patient_subscription')
        .select(`
          *,
          package:treatment_package(*),
          duration:subscription_duration(*)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching subscription for patient ${patientId}:`, error);
        throw new Error(error.message);
      }

      if (!data) return null;

      // Format the subscription data
      return {
        id: data.id,
        status: data.status,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        packageName: data.package?.name || 'Unknown Package',
        packageCondition: data.package?.condition || 'General',
        basePrice: data.package?.base_price || 0,
        durationName: data.duration?.name || 'Monthly',
        durationMonths: data.duration?.duration_months || 1,
        discountPercent: data.duration?.discount_percent || 0
      };
    },
    enabled: !!patientId,
    staleTime: 60000, // 1 minute
    ...options
  });
};

// Subscribe patient to a treatment package
export const useSubscribePatient = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriptionData) => {
      const { patientId, packageId, durationId } = subscriptionData;
      
      if (!patientId || !packageId || !durationId) {
        throw new Error('Patient ID, package ID, and duration ID are required');
      }

      // Get duration information
      const { data: durationData, error: durationError } = await supabase
        .from('subscription_duration')
        .select('*')
        .eq('id', durationId)
        .single();

      if (durationError) {
        console.error('Error fetching duration:', durationError);
        throw new Error(durationError.message);
      }

      // Get package information
      const { data: packageData, error: packageError } = await supabase
        .from('treatment_package')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('Error fetching package:', packageError);
        throw new Error(packageError.message);
      }

      // Call Stripe to create subscription
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-subscription', {
        body: {
          patientId,
          packageId,
          durationId,
          packageName: packageData.name,
          basePrice: packageData.base_price,
          durationMonths: durationData.duration_months,
          discountPercent: durationData.discount_percent
        }
      });

      if (stripeError) {
        console.error('Error creating Stripe subscription:', stripeError);
        throw new Error(stripeError.message || 'Failed to create subscription');
      }

      if (!stripeData?.subscriptionId) {
        throw new Error('No subscription ID returned from Stripe');
      }

      // Calculate dates
      const now = new Date();
      const endDate = new Date(now);
      
      // Use days if available, otherwise use months
      if (durationData.duration_days) {
        endDate.setDate(now.getDate() + durationData.duration_days);
      } else {
        endDate.setMonth(now.getMonth() + durationData.duration_months);
      }

      // Create subscription in database
      const subscriptionToInsert = {
        patient_id: patientId,
        package_id: packageId,
        duration_id: durationId,
        stripe_subscription_id: stripeData.subscriptionId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      const { data: subscription, error: insertError } = await supabase
        .from('patient_subscription')
        .insert(subscriptionToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription record:', insertError);
        throw new Error(insertError.message);
      }

      return {
        ...subscription,
        packageName: packageData.name,
        durationName: durationData.name
      };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Subscription created successfully');
      queryClient.invalidateQueries(['patientSubscription', variables.patientId]);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating subscription: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled
  });
};
