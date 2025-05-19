import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../apis/products/hooks';
import { useCategories } from '../../apis/categories/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/ui/redesign/ProductCard'; // Use redesigned ProductCard
import PageHeader from '../../components/ui/redesign/PageHeader'; // Use redesigned PageHeader
import Container from '../../components/ui/redesign/Container'; // Use redesigned Container
import Grid from '../../components/ui/redesign/Grid'; // Use redesigned Grid
import { useCart } from '../../context/CartContext'; // Import useCart hook

const MarketplacePage = () => {
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts();
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();
  const { data: subscriptionPlans, isLoading: isLoadingSubscriptionPlans, error: subscriptionPlansError } = useSubscriptionPlans();
  const { addItemToCart } = useCart(); // Use addItemToCart from CartContext

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (products) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                              product.description.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product) => {
    addItemToCart(product);
  };

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingSubscriptionPlans;
  const error = productsError || categoriesError || subscriptionPlansError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading marketplace data: {error.message}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Marketplace" />

      {/* Decorative elements */}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <Grid>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </Grid>
      ) : (
        <div className="text-center py-10">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </Container>
  );
};

export default MarketplacePage;
