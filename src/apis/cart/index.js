import { supabase } from '../../lib/supabase';

/**
 * Cart API module for handling cart operations with backend sync
 */
export const cartApi = {
  /**
   * Fetch user's cart from the backend
   */
  async fetchCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching cart:', error);
      return null;
    }

    return data;
  },

  /**
   * Save cart to backend
   * @param {Array} items - Cart items to save
   */
  async saveCart(items) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('carts')
      .upsert({
        user_id: user.id,
        items,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  },

  /**
   * Merge local cart with backend cart
   * @param {Array} localItems - Items from local storage
   */
  async mergeCart(localItems) {
    const backendCart = await this.fetchCart();
    if (!backendCart) {
      // If no backend cart exists, just save the local items
      await this.saveCart(localItems);
      return localItems;
    }

    // Merge backend and local items, preferring local quantities for duplicates
    const mergedItems = [...backendCart.items];
    localItems.forEach(localItem => {
      const existingIndex = mergedItems.findIndex(item => 
        item.productId === localItem.productId && item.doseId === localItem.doseId
      );
      
      if (existingIndex > -1) {
        mergedItems[existingIndex] = localItem;
      } else {
        mergedItems.push(localItem);
      }
    });

    await this.saveCart(mergedItems);
    return mergedItems;
  },

  /**
   * Clear cart from backend
   */
  async clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};