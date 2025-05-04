import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProductCard component
 * 
 * A card component for displaying product information in the Shop page and cross-sell sections
 * 
 * @param {string} title - The product title
 * @param {string} description - The product description
 * @param {string} imageUrl - URL to the product image
 * @param {number} price - The product price
 * @param {number} originalPrice - The original price (for displaying discounts)
 * @param {string} badge - Optional badge text (e.g., "Works with Wegovy®")
 * @param {string} badgeVariant - The color variant for the badge
 * @param {string} tag - Optional tag text (e.g., "Weight", "Hair")
 * @param {string} tagVariant - The color variant for the tag
 * @param {function} onAddToCart - Function to call when the Add button is clicked
 * @param {function} onViewDetails - Function to call when the product card is clicked for details
 */
const ProductCard = ({
  title,
  description,
  imageUrl,
  price,
  originalPrice,
  badge,
  badgeVariant = 'info',
  tag,
  tagVariant = 'info',
  onAddToCart,
  onViewDetails
}) => {
  // Define badge color variants
  const badgeVariants = {
    info: 'bg-[#dbeafe] text-[#2D7FF9]',
    success: 'bg-[#d1fae5] text-[#10b981]',
    warning: 'bg-[#FFD100] bg-opacity-70 text-gray-900',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600'
  };
  
  // Define tag color variants
  const tagVariants = {
    info: 'bg-blue-100 text-blue-600',
    weight: 'bg-blue-100 text-blue-600',
    hair: 'bg-purple-100 text-purple-600',
    bundle: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600'
  };
  
  // Get the appropriate color classes
  const badgeClasses = badgeVariants[badgeVariant] || badgeVariants.info;
  const tagClasses = tagVariants[tagVariant] || tagVariants.info;
  
  // Format price as currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Calculate discount percentage if original price is provided
  const discountPercentage = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div 
        className="h-32 bg-gray-100 relative"
        onClick={onViewDetails}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {/* Badge (e.g., "Works with Wegovy®") */}
        {badge && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
            {badge}
          </div>
        )}
        
        {/* Tag (e.g., "Weight", "Hair") */}
        {tag && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${tagClasses}`}>
            {tag}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        <h4 
          className="font-medium text-sm cursor-pointer hover:text-[#2D7FF9]"
          onClick={onViewDetails}
        >
          {title}
        </h4>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <span className="text-sm font-medium">{formatPrice(price)}</span>
            
            {/* Original price for discounts */}
            {originalPrice && originalPrice > price && (
              <span className="text-xs line-through text-gray-400 ml-1">
                {formatPrice(originalPrice)}
              </span>
            )}
            
            {/* Discount percentage */}
            {discountPercentage > 0 && (
              <span className="text-xs text-green-600 ml-1">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            className="text-xs text-white px-3 py-1.5 rounded-full bg-[#2D7FF9]"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  badge: PropTypes.string,
  badgeVariant: PropTypes.oneOf(['info', 'success', 'warning', 'purple', 'gray']),
  tag: PropTypes.string,
  tagVariant: PropTypes.oneOf(['info', 'weight', 'hair', 'bundle', 'gray']),
  onAddToCart: PropTypes.func,
  onViewDetails: PropTypes.func
};

export default ProductCard;
