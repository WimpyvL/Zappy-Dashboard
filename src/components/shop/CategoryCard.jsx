import React from 'react';
import PropTypes from 'prop-types';

/**
 * CategoryCard component displays a category with image and overlay text
 * 
 * @param {Object} props - Component props
 * @param {string} props.image - Image URL
 * @param {string} props.title - Category title
 * @param {string} props.subtitle - Category subtitle (e.g., number of products)
 * @param {Function} props.onClick - Click handler for the card
 */
const CategoryCard = ({ image, title, subtitle, onClick }) => {
  return (
    <div className="category-card" onClick={onClick}>
      <img src={image} alt={title} className="category-image" />
      <div className="card-overlay">
        <h3 className="card-overlay-title">{title}</h3>
        <p className="card-overlay-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

CategoryCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onClick: PropTypes.func
};

CategoryCard.defaultProps = {
  subtitle: '',
  onClick: () => {}
};

export default CategoryCard;
