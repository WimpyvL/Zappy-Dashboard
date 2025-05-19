import React from 'react';

const ReviewStep = ({ 
  formData, 
  prescriptionItems,
  productCategory,
  onNext,
  onPrevious
}) => {
  const { basicInfo, healthHistory, treatmentPreferences } = formData;
  
  // Find the selected product with better fallback handling
  const selectedProduct = prescriptionItems && prescriptionItems.length > 0 ? 
    (prescriptionItems.find(item => item.id === treatmentPreferences?.selectedProductId) || prescriptionItems[0]) : 
    { name: 'No product selected', price: 0 };
  
  // Get category-specific content
  const getCategoryContent = () => {
    switch (productCategory) {
      case 'weight_management':
        return {
          title: 'Weight Management Consultation Review',
          sections: [
            {
              title: 'Weight Information',
              items: [
                { label: 'Current Weight', value: basicInfo?.weight ? `${basicInfo.weight} ${basicInfo.weightUnit || 'lbs'}` : 'Not provided' },
                { label: 'Goal Weight', value: basicInfo?.goalWeight ? `${basicInfo.goalWeight} ${basicInfo.weightUnit || 'lbs'}` : 'Not provided' },
                { label: 'Height', value: basicInfo?.height || 'Not provided' },
              ]
            },
            {
              title: 'Medical History',
              items: [
                { 
                  label: 'Medical Conditions', 
                  value: healthHistory?.medicalConditions?.length 
                    ? healthHistory.medicalConditions.join(', ') 
                    : 'None reported' 
                },
                { 
                  label: 'Previous Weight Loss Attempts', 
                  value: healthHistory?.previousTreatments?.length 
                    ? healthHistory.previousTreatments.join(', ') 
                    : 'None reported' 
                },
              ]
            }
          ]
        };
      case 'ed':
        return {
          title: 'Erectile Dysfunction Consultation Review',
          sections: [
            {
              title: 'Basic Information',
              items: [
                { label: 'Height', value: basicInfo?.height || 'Not provided' },
                { label: 'Weight', value: basicInfo?.weight ? `${basicInfo.weight} ${basicInfo.weightUnit || 'lbs'}` : 'Not provided' },
              ]
            },
            {
              title: 'ED History',
              items: [
                { 
                  label: 'Duration of ED', 
                  value: healthHistory?.edDuration 
                    ? healthHistory.edDuration.replace(/_/g, ' ') 
                    : 'Not specified' 
                },
              ]
            }
          ]
        };
      case 'hair_loss':
        return {
          title: 'Hair Loss Consultation Review',
          sections: [
            {
              title: 'Basic Information',
              items: [
                { label: 'Height', value: basicInfo?.height || 'Not provided' },
                { label: 'Weight', value: basicInfo?.weight ? `${basicInfo.weight} ${basicInfo.weightUnit || 'lbs'}` : 'Not provided' },
                { 
                  label: 'Hair Loss Pattern', 
                  value: basicInfo?.hairLossPattern 
                    ? basicInfo.hairLossPattern.replace(/_/g, ' ') 
                    : 'Not specified' 
                },
              ]
            }
          ]
        };
      default:
        return {
          title: 'Consultation Review',
          sections: [
            {
              title: 'Basic Information',
              items: [
                { label: 'Height', value: basicInfo?.height || 'Not provided' },
                { label: 'Weight', value: basicInfo?.weight ? `${basicInfo.weight} ${basicInfo.weightUnit || 'lbs'}` : 'Not provided' },
              ]
            }
          ]
        };
    }
  };
  
  const content = getCategoryContent();
  
  // Common sections for all categories
  const commonSections = [
    {
      title: 'Current Medications',
      items: [
        { 
          label: 'Medications', 
          value: healthHistory?.medicationsText 
            ? healthHistory.medicationsText 
            : 'None reported' 
        },
      ]
    },
    {
      title: 'Allergies',
      items: [
        { 
          label: 'Allergies', 
          value: healthHistory?.allergiesText 
            ? healthHistory.allergiesText 
            : 'None reported' 
        },
      ]
    },
    {
      title: 'Selected Treatment',
      items: [
        { label: 'Medication', value: selectedProduct?.name || 'No product selected' },
        { label: 'Price', value: selectedProduct?.price ? `$${selectedProduct.price.toFixed(2)}` : 'N/A' },
        ...(selectedProduct?.dosage ? [{ label: 'Dosage', value: selectedProduct.dosage }] : []),
        ...(selectedProduct?.frequency ? [{ label: 'Frequency', value: selectedProduct.frequency }] : []),
      ]
    }
  ];
  
  // Combine category-specific and common sections
  const allSections = [...content.sections, ...commonSections];
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
      <p className="text-gray-600 mb-6">
        Please review your information before proceeding to checkout. You can go back to make changes if needed.
      </p>
      
      <div className="space-y-6">
        {allSections.map((section, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium text-gray-900">{section.title}</h3>
            </div>
            <div className="divide-y">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="px-4 py-3 flex justify-between">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Next steps:</strong> After reviewing your information, click "Continue to Checkout" to complete your order. 
          A healthcare provider will review your information within 24-48 hours. If approved, your medication will be shipped directly to you.
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
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
