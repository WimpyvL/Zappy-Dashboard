import { supabase } from '../../lib/supabase';

/**
 * Products API client for fetching product data from the backend
 */
const productsApi = {
  /**
   * Fetch all products
   * @returns {Promise<Array>} Array of products
   */
  async getAllProducts() {
    try {
      // Since the products table might not exist, we'll return a hardcoded list
      // In a real implementation, this would fetch from the database
      const products = [
        { 
          id: 'hard-mints', 
          name: 'Hard Mints', 
          description: 'Quick Dissolve', 
          price: 1.63, 
          category: 'sexual-health',
          requiresPrescription: true
        },
        { 
          id: 'ed-treatment', 
          name: 'ED Treatment', 
          description: 'Fast Acting', 
          price: 39, 
          category: 'sexual-health',
          requiresPrescription: true
        },
        { 
          id: 'testosterone', 
          name: 'Testosterone', 
          description: 'Hormone Support', 
          price: 89, 
          category: 'sexual-health',
          requiresPrescription: true
        },
        { 
          id: 'minoxidil-supplements', 
          name: 'Minoxidil + Supplements', 
          description: 'Hair Growth', 
          price: 39, 
          category: 'hair-care',
          requiresPrescription: true
        },
        { 
          id: 'hair-loss-kit', 
          name: 'Hair Loss Kit', 
          description: 'Complete Treatment', 
          price: 37, 
          category: 'hair-care',
          requiresPrescription: true
        },
        { 
          id: 'thickening-shampoo', 
          name: 'Thickening Shampoo', 
          description: 'Volume Boost', 
          price: 25, 
          category: 'hair-care',
          requiresPrescription: false
        },
        { 
          id: 'retinol-serum', 
          name: 'Retinol Serum', 
          description: 'Anti-Aging Formula', 
          price: 45, 
          category: 'skin-care',
          requiresPrescription: true
        },
        { 
          id: 'daily-moisturizer', 
          name: 'Daily Moisturizer', 
          description: 'Hydration', 
          price: 25, 
          category: 'skin-care',
          requiresPrescription: false
        },
        { 
          id: 'vitamin-c-serum', 
          name: 'Vitamin C Serum', 
          description: 'Brightening', 
          price: 30, 
          category: 'skin-care',
          requiresPrescription: false
        },
        { 
          id: 'birth-control', 
          name: 'Birth Control', 
          description: 'Monthly Supply', 
          price: 30, 
          category: 'womens-health',
          requiresPrescription: true
        },
        { 
          id: 'hormone-support', 
          name: 'Hormone Support', 
          description: 'Balance & Wellness', 
          price: 69, 
          category: 'womens-health',
          requiresPrescription: true
        },
        { 
          id: 'fertility-support', 
          name: 'Fertility Support', 
          description: 'Conception Help', 
          price: 49, 
          category: 'womens-health',
          requiresPrescription: false
        },
        { 
          id: 'anxiety-treatment', 
          name: 'Anxiety Treatment', 
          description: 'Effective Relief', 
          price: 49, 
          category: 'mental-health',
          requiresPrescription: true
        },
        { 
          id: 'depression-support', 
          name: 'Depression Support', 
          description: 'Mental Wellness', 
          price: 59, 
          category: 'mental-health',
          requiresPrescription: true
        },
        { 
          id: 'sleep-support', 
          name: 'Sleep Support', 
          description: 'Better Rest', 
          price: 29, 
          category: 'mental-health',
          requiresPrescription: false
        },
        { 
          id: 'glp1', 
          name: 'GLP-1', 
          description: 'Weight Management', 
          price: 299, 
          category: 'weight-loss',
          requiresPrescription: true
        },
        { 
          id: 'tirzepatide', 
          name: 'Tirzepatide', 
          description: 'Weight Management', 
          price: 399, 
          category: 'weight-loss',
          requiresPrescription: true
        },
        { 
          id: 'nutrition-plan', 
          name: 'Nutrition Plan', 
          description: 'Personalized Coaching', 
          price: 99, 
          category: 'weight-loss',
          requiresPrescription: false
        }
      ];
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetch products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of products in the category
   */
  async getProductsByCategory(categoryId) {
    try {
      // Get all products and filter by category
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => product.category === categoryId);
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch all product categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    try {
      // Since the categories table doesn't exist, we'll return a hardcoded list
      // In a real implementation, this would fetch from the database
      const categories = [
        { id: 'weight-loss', name: 'Weight Loss', description: 'Weight management products' },
        { id: 'sexual-health', name: 'Sexual Health', description: 'Sexual health products' },
        { id: 'hair-care', name: 'Hair Care', description: 'Hair care products' },
        { id: 'skin-care', name: 'Skin Care', description: 'Skin care products' },
        { id: 'womens-health', name: 'Women\'s Health', description: 'Women\'s health products' },
        { id: 'mental-health', name: 'Mental Health', description: 'Mental health products' }
      ];
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      
      if (error) throw error;
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   * @param {Object} productData - Product data with id
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productData) {
    try {
      const { id, ...updateData } = productData;
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data?.[0] || null;
    } catch (error) {
      console.error(`Error updating product ${productData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProduct(productId) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  }
};

export default productsApi;
