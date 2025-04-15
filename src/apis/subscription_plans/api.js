// src/apis/subscription_plans/api.js - API methods for subscription plans
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

// Get subscription plans
export const getSubscriptionPlans = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('subscription_plans')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters
  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  query = query.order('name', { ascending: true }); // Sort by name

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }

  return {
    data,
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

// Get a specific subscription plan by ID
export const getSubscriptionPlanById = async (id) => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching subscription plan with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new subscription plan
export const createSubscriptionPlan = async (planData) => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .insert(planData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
  return data;
};

// Update an existing subscription plan
export const updateSubscriptionPlan = async (id, planData) => {
  const { id: _, ...updateData } = planData;
  const { data, error } = await supabase
    .from('subscription_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating subscription plan with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a subscription plan
export const deleteSubscriptionPlan = async (id) => {
  // Consider implications: Check if plan is used in active subscriptions first?
  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting subscription plan with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};
