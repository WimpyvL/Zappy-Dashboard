import React from 'react';
import PropTypes from 'prop-types';
import { getProductImage, getWeightManagementImage, getHairTreatmentImage, getWellnessImage, getSexualHealthImage } from '../../../utils/placeholderImages';

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
  // Define badge color variants using our theme colors
  const badgeVariants = {
    info: 'bg-info bg-opacity-15 text-info',
    success: 'bg-success bg-opacity-15 text-success',
    warning: 'bg-warning bg-opacity-30 text-text-dark',
    error: 'bg-error bg-opacity-15 text-error',
    gray: 'bg-text-light bg-opacity-15 text-text-medium'
  };
  
  // Define tag color variants using our theme colors
  const tagVariants = {
    info: 'bg-info bg-opacity-15 text-info',
    weight: 'bg-weight-blue text-zappy-blue',
    hair: 'bg-hair-purple text-purple-600',
    wellness: 'bg-wellness-green text-success',
    sexual: 'bg-sexual-health-pink text-error',
    bundle: 'bg-zappy-yellow bg-opacity-30 text-text-dark',
    gray: 'bg-text-light bg-opacity-15 text-text-medium'
  };
  
  // Get the appropriate color classes
  const badgeClasses = badgeVariants[badgeVariant] || badgeVariants.info;
  const tagClasses = tagVariants[tagVariant] || tagVariants.info;
  
  // Format price as currency
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return '$0.00'; // Or handle the undefined case as needed
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
          // Use category-specific placeholder images based on tag
          <img 
            src={
              tagVariant === 'weight' ? getWeightManagementImage(300, 200) :
              tagVariant === 'hair' ? getHairTreatmentImage(300, 200) :
              tagVariant === 'wellness' ? getWellnessImage(300, 200) :
              tagVariant === 'sexual' ? getSexualHealthImage(300, 200) :
              getProductImage(300, 200, tag || 'Product')
            } 
            alt={title} 
            className="w-full h-full object-cover"
          />
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
          className="font-medium text-sm cursor-pointer hover:text-zappy-blue transition-colors"
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
              <span className="text-xs text-success ml-1">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            className="text-xs text-white px-3 py-1.5 rounded-full bg-zappy-blue hover:bg-opacity-90 transition-colors"
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
  badgeVariant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'gray']),
  tag: PropTypes.string,
  tagVariant: PropTypes.oneOf(['info', 'weight', 'hair', 'wellness', 'sexual', 'bundle', 'gray']),
  onAddToCart: PropTypes.func,
  onViewDetails: PropTypes.func
};

export default ProductCard;
