import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys for categories
const queryKeys = {
  all: ['categories'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get categories hook with pagination
export const useCategories = (params = {}, pageSize = 20) => {
  const { page, search, status } = params;
  const currentPage = page || 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      try {
        // Build the query
        let query = supabase
          .from('categories')
          .select('*', { count: 'exact' })
          .order('displayOrder', { ascending: true })
          .order('name', { ascending: true });

        // Apply filters
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }
        
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,categoryId.ilike.%${search}%`);
        }

        // Apply pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        // Execute the query
        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching categories:', error);
          throw new Error(error.message);
        }

        // Get product counts for each category
        const categoryIds = data.map(category => category.categoryId);
        const { data: productCounts, error: productCountError } = await supabase
          .from('products')
          .select('category, count')
          .in('category', categoryIds)
          .group('category');

        if (productCountError) {
          console.error('Error fetching product counts:', productCountError);
        }

        // Map product counts to categories
        const categoriesWithCounts = data.map(category => {
          const countObj = productCounts?.find(pc => pc.category === category.categoryId);
          return {
            ...category,
            productCount: countObj ? parseInt(countObj.count) : 0
          };
        });

        return {
          data: categoriesWithCounts || [],
          meta: {
            total: count || 0,
            per_page: pageSize,
            current_page: currentPage,
            last_page: Math.ceil((count || 0) / pageSize),
          },
        };
      } catch (error) {
        console.error('Unexpected error in useCategories:', error);
        throw error;
      }
    },
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds cache before becoming stale
  });
};

// Get category by ID hook
export const useCategoryById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching category ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      
      // Get product count for this category
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', data.categoryId);

      if (countError) {
        console.error(`Error fetching product count for category ${id}:`, countError);
      }
      
      return {
        ...data,
        productCount: count || 0
      };
    },
    enabled: !!id,
    ...options,
  });
};

// Create category hook
export const useCreateCategory = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData) => {
      // Check if categoryId already exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('categoryId')
        .eq('categoryId', categoryData.categoryId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing category:', checkError);
        throw new Error(checkError.message);
      }

      if (existingCategory) {
        throw new Error(`Category ID "${categoryData.categoryId}" already exists`);
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || '',
          categoryId: categoryData.categoryId,
          status: categoryData.status || 'active',
          displayOrder: categoryData.displayOrder || 0,
          icon: categoryData.icon || '',
          showInMarketplace: categoryData.showInMarketplace !== false,
          showInAdmin: categoryData.showInAdmin !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Category created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating category: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update category hook
export const useUpdateCategory = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, categoryData }) => {
      // Check if categoryId already exists (if it was changed)
      if (categoryData.originalCategoryId !== categoryData.categoryId) {
        const { data: existingCategory, error: checkError } = await supabase
          .from('categories')
          .select('categoryId')
          .eq('categoryId', categoryData.categoryId)
          .neq('id', id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing category:', checkError);
          throw new Error(checkError.message);
        }

        if (existingCategory) {
          throw new Error(`Category ID "${categoryData.categoryId}" already exists`);
        }
      }

      // Remove fields that shouldn't be sent to the database
      const { originalCategoryId, productCount, ...dataToUpdate } = categoryData;

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating category ${id}:`, error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Category updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating category: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Delete category hook
export const useDeleteCategory = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      // Check if category is in use
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', id);

      if (countError) {
        console.error(`Error checking if category ${id} is in use:`, countError);
        throw new Error(countError.message);
      }

      if (count > 0) {
        throw new Error(`Cannot delete category: It is used by ${count} products`);
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw new Error(error.message);
      }
      
      return { id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Category deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting category: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
