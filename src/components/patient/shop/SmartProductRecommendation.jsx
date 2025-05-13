import React from 'react';
import { ArrowRight } from 'lucide-react'; // Assuming ArrowRight is used in the original JSX

const SmartProductRecommendation = ({ handleViewBundle, handleSkip, handleAddProduct }) => {
  // Hardcoded sample recommendations - this should ideally come from an API
  const serviceRecommendations = {
    'weight-management': [
      { id: 1, name: 'Protein Powder', imageUrl: 'https://via.placeholder.com/100', price: 35.00 },
      { id: 2, name: 'Meal Replacement Shakes', imageUrl: 'https://via.placeholder.com/100', price: 40.00 },
      { id: 3, name: 'Resistance Bands', imageUrl: 'https://via.placeholder.com/100', price: 20.00 },
    ],
    'diabetes-management': [
      { id: 4, name: 'Glucose Meter', imageUrl: 'https://via.placeholder.com/100', price: 25.00 },
      { id: 5, name: 'Test Strips (50ct)', imageUrl: 'https://via.placeholder.com/100', price: 15.00 },
    ],
  };

  // Assuming 'weight-management' is the relevant category for this recommendation
  const recommendation = serviceRecommendations['weight-management'] && serviceRecommendations['weight-management'].length > 0
    ? serviceRecommendations['weight-management'][0]
    : null;

  if (!recommendation) {
    return null; // Don't render if no recommendation is available
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Smart Product Recommendation</h2>
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex items-center p-4">
          <img src={recommendation.imageUrl} alt={recommendation.name} className="w-16 h-16 object-cover rounded-lg mr-4"/>
          <div className="flex-1">
            <h3 className="font-bold text-base mb-1">{recommendation.name}</h3>
            <p className="text-sm text-gray-600 mb-2">${recommendation.price.toFixed(2)}</p>
            <div className="flex space-x-2">
              <button
                className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full hover:bg-teal-700"
                onClick={() => handleAddProduct(recommendation.id)}
              >
                Add to Cart
              </button>
              <button
                className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full hover:bg-gray-300"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartProductRecommendation;
