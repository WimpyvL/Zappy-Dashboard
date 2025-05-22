import React from 'react';
import { Pill } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ProductCard component displays a product with its details
 * 
 * @param {Object} props - Component props
 * @param {string} props.programClass - CSS class for styling based on program/category
 * @param {boolean} props.requiresPrescription - Whether the product requires a prescription
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.name - Product name
 * @param {string} props.subtitle - Product subtitle or short description
 * @param {string|number} props.price - Product price
 * @param {Function} props.onClick - Click handler for the card
 */
const ProductCard = ({ 
  programClass, 
  requiresPrescription, 
  icon, 
  name, 
  subtitle, 
  price,
  onClick
}) => {
  return (
    <div 
      className={`product-card ${programClass}`}
      onClick={onClick}
    >
      {requiresPrescription && (
        <div className="product-rx-badge">
          <Pill size={12} className="mr-1" />
          <span>Rx</span>
        </div>
      )}
      <div className="product-icon-bg">{icon}</div>
      <h4 className="product-name">{name}</h4>
      <p className="product-subtitle">{subtitle}</p>
      <p className="product-price">{price}</p>
    </div>
  );
};

ProductCard.propTypes = {
  programClass: PropTypes.string.isRequired,
  requiresPrescription: PropTypes.bool,
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func
};

ProductCard.defaultProps = {
  requiresPrescription: false,
  subtitle: '',
  onClick: () => {}
};

export default ProductCard;
