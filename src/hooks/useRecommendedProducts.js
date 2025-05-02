import { useMemo } from 'react';
import { useProducts } from '../apis/products/hooks';

/**
 * Hook to get recommended products based on patient treatment type
 * @param {string} patientId - The patient ID
 * @param {string} treatmentType - The type of treatment the patient is on
 * @param {Object} options - Additional options
 * @param {number} options.limit - Maximum number of products to return (default: 4)
 * @param {boolean} options.includePopular - Whether to include popular products (default: true)
 * @returns {Object} Object containing recommended products and loading state
 */
export const useRecommendedProducts = (patientId, treatmentType, options = {}) => {
  const { limit = 4, includePopular = true } = options;
  
  // Fetch all products from the admin-created catalog
  const { data: products, isLoading, error } = useProducts();
  
  // Filter and sort products based on treatment type and other criteria
  const recommendedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    // Start with all products
    let filtered = [...products];
    
    // Filter by treatment type if provided
    if (treatmentType) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === treatmentType.toLowerCase() ||
        product.tags?.includes(treatmentType.toLowerCase())
      );
    }
    
    // If we don't have enough products after filtering by treatment type,
    // and includePopular is true, add some popular products
    if (filtered.length < limit && includePopular) {
      const popularProducts = products.filter(p => p.isPopular && !filtered.includes(p));
      filtered = [...filtered, ...popularProducts].slice(0, limit);
    }
    
    // If we still don't have enough products, add some random ones
    if (filtered.length < limit) {
      const remainingProducts = products.filter(p => !filtered.includes(p));
      const randomProducts = remainingProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, limit - filtered.length);
      
      filtered = [...filtered, ...randomProducts];
    }
    
    // Limit to the requested number of products
    return filtered.slice(0, limit);
  }, [products, treatmentType, limit, includePopular]);
  
  return {
    recommendedProducts,
    isLoading,
    error
  };
};
