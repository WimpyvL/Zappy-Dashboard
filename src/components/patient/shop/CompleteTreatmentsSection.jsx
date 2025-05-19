import React from 'react';
import ProductCard from '../../ui/redesign/ProductCard'; // Assuming ProductCard is in this location
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

// Hardcoded data for now, should be fetched from an API
const completeTreatmentProducts = [
  {
    id: 1,
    name: 'Complete Treatment Bundle 1',
    description: 'Description for bundle 1',
    price: '$199',
    imageUrl: 'https://via.placeholder.com/150',
    isBundle: true,
    productIds: [1, 2, 3], // Example product IDs included in the bundle
  },
  {
    id: 2,
    name: 'Complete Treatment Bundle 2',
    description: 'Description for bundle 2',
    price: '$299',
    imageUrl: 'https://via.placeholder.com/150',
    isBundle: true,
    productIds: [4, 5], // Example product IDs included in the bundle
  },
];

const CompleteTreatmentsSection = ({ handleAddProduct, handleViewBundle }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Complete Your Treatments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {completeTreatmentProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddProduct={() => handleAddProduct(product)}
            onViewDetails={() => handleViewBundle(product)}
          />
        ))}
      </div>
    </section>
  );
};

export default CompleteTreatmentsSection;
