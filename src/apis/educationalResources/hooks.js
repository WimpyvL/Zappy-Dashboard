import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEducationalResources,
  getEducationalResourceById,
  getEducationalResourceByContentId,
  getResourcesByProductId,
  getResourcesByConditionId,
  getRelatedResources,
  createEducationalResource,
  updateEducationalResource,
  deleteEducationalResource,
  associateResourceWithProduct,
  associateResourceWithCondition,
  addRelatedResource,
  getFeaturedResources,
  getRecentResources,
  getResourcesByCategory,
  getResourcesByServiceType
} from './api';

// Define query keys
const queryKeys = {
  all: ['educational-resources'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { ...filters }],
  detail: (id) => [...queryKeys.all, 'detail', id],
  detailByContentId: (contentId) => [...queryKeys.all, 'detail', { contentId }],
  productResources: (productId) => [...queryKeys.all, 'product', productId],
  conditionResources: (conditionId) => [...queryKeys.all, 'condition', conditionId],
  relatedResources: (resourceId) => [...queryKeys.all, 'related', resourceId],
  featured: (limit) => [...queryKeys.all, 'featured', { limit }],
  recent: (limit) => [...queryKeys.all, 'recent', { limit }],
  byCategory: (category, limit) => [...queryKeys.all, 'category', category, { limit }],
  byServiceType: (serviceType, limit) => [...queryKeys.all, 'service', serviceType, { limit }],
};

// Hook to fetch all educational resources with optional filtering
export const useEducationalResources = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: () => getEducationalResources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Hook to fetch a single educational resource by ID
export const useEducationalResource = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => getEducationalResourceById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options
  });
};

// Hook to fetch a single educational resource by content_id
export const useEducationalResourceByContentId = (contentId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.detailByContentId(contentId),
    queryFn: () => getEducationalResourceByContentId(contentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!contentId,
    ...options
  });
};

// Hook to fetch resources for a specific product
export const useProductResources = (productId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.productResources(productId),
    queryFn: () => getResourcesByProductId(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!productId,
    ...options
  });
};

// Hook to fetch resources for a specific condition
export const useConditionResources = (conditionId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.conditionResources(conditionId),
    queryFn: () => getResourcesByConditionId(conditionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!conditionId,
    ...options
  });
};

// Hook to fetch related resources
export const useRelatedResources = (resourceId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.relatedResources(resourceId),
    queryFn: () => getRelatedResources(resourceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!resourceId,
    ...options
  });
};

// Hook to fetch featured resources
export const useFeaturedResources = (limit = 6, options = {}) => {
  return useQuery({
    queryKey: queryKeys.featured(limit),
    queryFn: () => getFeaturedResources(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Hook to fetch recent resources
export const useRecentResources = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: queryKeys.recent(limit),
    queryFn: () => getRecentResources(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Hook to fetch resources by category
export const useResourcesByCategory = (category, limit = 20, options = {}) => {
  return useQuery({
    queryKey: queryKeys.byCategory(category, limit),
    queryFn: () => getResourcesByCategory(category, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!category,
    ...options
  });
};

// Hook to fetch resources by service type
export const useResourcesByServiceType = (serviceType, limit = 2, options = {}) => {
  return useQuery({
    queryKey: queryKeys.byServiceType(serviceType, limit),
    queryFn: () => getResourcesByServiceType(serviceType, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!serviceType,
    ...options
  });
};

// Hook to create a new educational resource
export const useCreateEducationalResource = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (resourceData) => createEducationalResource(resourceData),
    onSuccess: () => {
      // Invalidate the resources list query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
    ...options
  });
};

// Hook to update an educational resource
export const useUpdateEducationalResource = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, resourceData }) => updateEducationalResource(id, resourceData),
    onSuccess: (data) => {
      // Invalidate the specific resource query and the resources list
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
    ...options
  });
};

// Hook to delete an educational resource
export const useDeleteEducationalResource = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => deleteEducationalResource(id),
    onSuccess: (_, id) => {
      // Invalidate the specific resource query and the resources list
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
    ...options
  });
};

// Hook to associate a resource with a product
export const useAssociateResourceWithProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, resourceId, isPrimary, displayOrder }) => 
      associateResourceWithProduct(productId, resourceId, isPrimary, displayOrder),
    onSuccess: (_, { productId }) => {
      // Invalidate the product resources query
      queryClient.invalidateQueries({ queryKey: queryKeys.productResources(productId) });
    },
    ...options
  });
};

// Hook to associate a resource with a condition
export const useAssociateResourceWithCondition = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conditionId, resourceId, isPrimary, displayOrder }) => 
      associateResourceWithCondition(conditionId, resourceId, isPrimary, displayOrder),
    onSuccess: (_, { conditionId }) => {
      // Invalidate the condition resources query
      queryClient.invalidateQueries({ queryKey: queryKeys.conditionResources(conditionId) });
    },
    ...options
  });
};

// Hook to add a related resource
export const useAddRelatedResource = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ resourceId, relatedResourceId, relationshipType, displayOrder }) => 
      addRelatedResource(resourceId, relatedResourceId, relationshipType, displayOrder),
    onSuccess: (_, { resourceId }) => {
      // Invalidate the related resources query
      queryClient.invalidateQueries({ queryKey: queryKeys.relatedResources(resourceId) });
    },
    ...options
  });
};
