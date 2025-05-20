import { supabase } from '../lib/supabase';

/**
 * Fetches all medications (products that require prescriptions)
 * @returns {Promise<Array>} Array of medication objects
 */
export const fetchMedications = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('requires_prescription', true);
    
  if (error) throw error;
  
  // Transform products into medication format
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
 * Fetches medications for a specific category
 * @param {string} categoryId - The category ID to filter by
 * @returns {Promise<Array>} Array of medication objects for the category
 */
export const fetchMedicationsByCategory = async (categoryId) => {
  const medications = await fetchMedications();
  return medications.filter(med => med.category === categoryId);
};
