import { useMemo, useCallback } from 'react';
import { useProducts } from '../apis/products/hooks';

/**
 * Hook to get recommended products based on patient treatment type
 * 
 * NOTE: This hook uses the Products API which is marked as deprecated in the UI layer,
 * but the API itself is still functional. According to the migration documentation,
 * the Products functionality has been consolidated into a unified Products & Subscriptions
 * management system, but the API endpoints remain the same for backward compatibility.
 * 
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
  
  // Filter products by treatment type
  const filterByTreatmentType = useCallback((products, treatmentType) => {
    if (!treatmentType) return products;
    
    return products.filter(product =>
      product?.category?.toLowerCase() === treatmentType.toLowerCase() ||
      product?.tags?.includes(treatmentType.toLowerCase())
    );
  }, []);
  
  // Get popular products that aren't already in the filtered list
  const getPopularProducts = useCallback((allProducts, filteredProducts, count) => {
    return allProducts
      .filter(p => p.isPopular && !filteredProducts.includes(p))
      .slice(0, count);
  }, []);
  
  // Get random products to fill remaining slots
  const getRandomProducts = useCallback((allProducts, filteredProducts, count) => {
    const remainingProducts = allProducts.filter(p => !filteredProducts.includes(p));
    
    return remainingProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }, []);
  
  // Filter and sort products based on treatment type and other criteria
  const recommendedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    // Start with all products
    let filtered = filterByTreatmentType([...products], treatmentType);
    
    // If we don't have enough products after filtering by treatment type,
    // and includePopular is true, add some popular products
    if (filtered.length < limit && includePopular) {
      const popularProducts = getPopularProducts(products, filtered, limit - filtered.length);
      filtered = [...filtered, ...popularProducts];
    }
    
    // If we still don't have enough products, add some random ones
    if (filtered.length < limit) {
      const randomProducts = getRandomProducts(products, filtered, limit - filtered.length);
      filtered = [...filtered, ...randomProducts];
    }
    
    // Limit to the requested number of products
    return filtered.slice(0, limit);
  }, [products, treatmentType, limit, includePopular, filterByTreatmentType, getPopularProducts, getRandomProducts]);
  
  return {
    recommendedProducts,
    isLoading,
    error
  };
};
