import React from 'react';
import { Package, CheckCircle, PlusCircle } from 'lucide-react';

/**
 * CrossSellSection component for displaying recommended products
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.products - Array of product objects to display
 * @param {Function} props.onAddProduct - Function to call when a product is added
 * @param {string} [props.className] - Additional CSS classes
 */
const CrossSellSection = ({ title, products = [], onAddProduct, className = '' }) => {
  // If no products, don't render anything
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden border-t-4 border-gray-300 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium flex items-center">
          <Package className="h-5 w-5 mr-2 text-gray-600" />
          {title || 'Complete Your Treatment'}
        </h2>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex space-x-4 pb-2">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddProduct={onAddProduct} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ProductCard component for displaying a product in the cross-sell section
 */
const ProductCard = ({ product, onAddProduct }) => {
  const [isAdded, setIsAdded] = React.useState(false);

  const handleAddClick = () => {
    setIsAdded(true);
    if (onAddProduct) {
      onAddProduct(product);
    }
    // Reset after 1.5 seconds
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="w-36 flex-shrink-0 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3">
        {product.isPopular && (
          <div className="flex items-center mb-1">
            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">Popular</span>
          </div>
        )}
        <h4 className="font-medium text-sm">{product.name}</h4>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
        <span className="text-xs font-medium">${product.price?.toFixed(2) || '0.00'}{product.recurring && '/month'}</span>
        <button 
          className={`mt-2 w-full py-1 rounded text-xs font-medium flex items-center justify-center ${
            isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-accent3 text-white hover:bg-accent3/90'
          }`}
          onClick={handleAddClick}
        >
          {isAdded ? (
            <>
              <CheckCircle size={14} className="mr-1" /> Added
            </>
          ) : (
            <>
              <PlusCircle size={14} className="mr-1" /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CrossSellSection;
