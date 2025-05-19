import React, { useState } from 'react';

const TreatmentPreferencesStep = ({ 
  formData, 
  updateFormData, 
  prescriptionItems,
  productCategory,
  onNext,
  onPrevious
}) => {
  const { treatmentPreferences } = formData;
  
  // Local state for form validation
  const [errors, setErrors] = useState({});
  
  // Filter products by category
  const filteredProducts = prescriptionItems.filter(item => {
    if (productCategory === 'weight_management') {
      return item.category === 'weight_management' || 
             item.name.toLowerCase().includes('weight') ||
             item.name.toLowerCase().includes('semaglutide') ||
             item.name.toLowerCase().includes('wegovy') ||
             item.name.toLowerCase().includes('metformin');
    } else if (productCategory === 'ed') {
      return item.category === 'ed' || 
             item.name.toLowerCase().includes('viagra') ||
             item.name.toLowerCase().includes('cialis') ||
             item.name.toLowerCase().includes('sildenafil') ||
             item.name.toLowerCase().includes('tadalafil');
    } else if (productCategory === 'hair_loss') {
      return item.category === 'hair_loss' || 
             item.name.toLowerCase().includes('finasteride') ||
             item.name.toLowerCase().includes('propecia') ||
             item.name.toLowerCase().includes('minoxidil') ||
             item.name.toLowerCase().includes('rogaine');
    }
    return true;
  });
  
  // If no products match the category, use all prescription items
  const products = filteredProducts.length > 0 ? filteredProducts : prescriptionItems;
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!treatmentPreferences.selectedProductId && products.length > 0) {
      // Only validate if there are products to select from
      newErrors.selectedProductId = 'Please select a treatment option';
    }
    
    // If no products are available, don't block progression
    if (Object.keys(newErrors).length > 0 && products.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If no products are available, set a default selection
    if (!treatmentPreferences.selectedProductId && products.length > 0) {
      updateFormData('treatmentPreferences', { selectedProductId: products[0].id });
    }
    
    // Proceed to next step
    onNext();
  };
  
  // Handle product selection
  const handleProductSelect = (productId) => {
    updateFormData('treatmentPreferences', { selectedProductId: productId });
    
    // Clear error when field is updated
    if (errors.selectedProductId) {
      setErrors({ ...errors, selectedProductId: undefined });
    }
  };
  
  // Get category-specific content
  const getCategoryContent = () => {
    switch (productCategory) {
      case 'weight_management':
        return {
          title: 'Weight Management Treatment Options',
          description: 'Select the weight management medication you\'re interested in. Our healthcare provider will determine if it\'s appropriate for you based on your medical history.'
        };
      case 'ed':
        return {
          title: 'Erectile Dysfunction Treatment Options',
          description: 'Select the ED medication you\'re interested in. Our healthcare provider will determine if it\'s appropriate for you based on your medical history.'
        };
      case 'hair_loss':
        return {
          title: 'Hair Loss Treatment Options',
          description: 'Select the hair loss treatment you\'re interested in. Our healthcare provider will determine if it\'s appropriate for you based on your medical history.'
        };
      default:
        return {
          title: 'Treatment Options',
          description: 'Select the treatment you\'re interested in. Our healthcare provider will determine if it\'s appropriate for you based on your medical history.'
        };
    }
  };
  
  const content = getCategoryContent();
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
      <p className="text-gray-600 mb-6">{content.description}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {products.length > 0 ? (
            products.map(product => (
              <div 
                key={product.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  treatmentPreferences.selectedProductId === product.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
              <div className="flex items-start">
                <input
                  type="radio"
                  id={`product-${product.id}`}
                  name="selectedProductId"
                  checked={treatmentPreferences.selectedProductId === product.id}
                  onChange={() => handleProductSelect(product.id)}
                  className="mt-1 mr-3"
                />
                <div className="flex-grow">
                  <label htmlFor={`product-${product.id}`} className="font-medium cursor-pointer">
                    {product.name}
                  </label>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.dosage && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {product.dosage}
                      </span>
                    )}
                    
                    {product.frequency && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {product.frequency}
                      </span>
                    )}
                    
                    {product.supplyDuration && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {product.supplyDuration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right font-medium">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              
              {product.benefits && product.benefits.length > 0 && (
                <div className="mt-3 pl-8">
                  <div className="text-sm font-medium text-gray-700">Benefits:</div>
                  <ul className="text-sm text-gray-600 mt-1 list-disc pl-5">
                    {product.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-center text-gray-600">
                No treatment options are currently available for this category. Please continue to the next step.
              </p>
            </div>
          )}
        </div>
        
        {errors.selectedProductId && (
          <p className="mb-4 text-sm text-red-600">{errors.selectedProductId}</p>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The final treatment decision will be made by a healthcare provider 
            after reviewing your medical information. If the selected treatment is not appropriate, 
            they may recommend an alternative or request additional information.
          </p>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentPreferencesStep;
