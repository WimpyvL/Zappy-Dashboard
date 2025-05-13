import React from 'react';

const FeaturedProduct = ({ featuredProducts, handleViewDetails, handleAddProduct }) => {
  // Hardcoded featured product - this should ideally come from an API
  const featuredProduct = {
    id: 101,
    name: 'Complete Weight Loss Bundle',
    description: 'Includes protein powder, meal shakes, and resistance bands.',
    price: 89.99,
    imageUrl: 'https://via.placeholder.com/400x300',
  };

  // Assuming featuredProducts is an array and we are displaying the first one
  const productToDisplay = featuredProducts && featuredProducts.length > 0 ? featuredProducts[0] : featuredProduct;


  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Featured Product</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <img src={productToDisplay.imageUrl} alt={productToDisplay.name} className="w-full h-48 object-cover"/>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{productToDisplay.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{productToDisplay.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">${productToDisplay.price.toFixed(2)}</span>
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700"
              onClick={() => handleViewDetails(productToDisplay.id)}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
