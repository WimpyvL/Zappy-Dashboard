import { supabase } from '../lib/supabase';

/**
 * Fetches all prescription products
 * @returns {Promise<Array>} Array of prescription product objects
 */
export const fetchMedications = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('requires_prescription', true)
    .neq('type', 'program'); // Exclude program type products
    
  if (error) throw error;
  
  // Transform products into a consistent format
  return data.map(product => ({
    id: product.id,
    name: product.name,
    brandName: product.brand_name,
    category: product.category_id,
    frequency: product.default_frequency || 'daily',
    dosageOptions: product.dosages || [
      { value: 'default', label: 'Standard' }
    ],
    instructions: product.instructions || [],
    approach: product.default_approach || 'Maintenance',
    supportedApproaches: product.supported_approaches || ['Maint.', 'Escalation', 'PRN']
  }));
};

/**
 * Fetches prescription products for a specific category
 * @param {string} categoryId - The category ID to filter by
 * @returns {Promise<Array>} Array of prescription product objects for the category
 */
export const fetchMedicationsByCategory = async (categoryId) => {
  const prescriptionProducts = await fetchMedications();
  return prescriptionProducts.filter(product => product.category === categoryId);
};
