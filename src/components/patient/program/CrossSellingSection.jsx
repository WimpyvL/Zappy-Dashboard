import React from 'react';
import ProductCard from '../../ui/redesign/ProductCard'; // Assuming ProductCard is in this location
import { Target } from 'lucide-react'; // Assuming Target icon is used

const CrossSellingSection = ({ recommendedProducts, isLoadingProducts, handleAddProduct }) => {
  if (isLoadingProducts || recommendedProducts.length === 0) {
    return null; // Don't render the section if loading or no products
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-3 px-1">Recommended for You</h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex space-x-4 pb-4">
          {recommendedProducts.map(product => (
            <div key={product.id} className="w-40 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Target className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                {product.isPopular && (
                  <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-1">
                    Popular
                  </div>
                )}
                <h4 className="font-medium text-sm">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">${product.price?.toFixed(2) || '0.00'}</span>
                  <button
                    className="text-xs bg-[#F85C5C] text-white px-2 py-1 rounded-full"
                    onClick={() => handleAddProduct(product)}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossSellingSection;
