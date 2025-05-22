import React, { useState, useEffect } from 'react';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useProducts } from '../../apis/products/hooks';
import { ArrowLeft, Check, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlanComparisonView = () => {
  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Process fetched data
  useEffect(() => {
    const plans = plansData?.data || plansData || [];
    const products = productsData?.data || productsData || [];
    
    setAllProducts(products);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(plans.map(p => p.category))].filter(Boolean);
    setCategories(uniqueCategories);
    
    // Filter and sort plans
    let filtered = plans.filter(p => p.active);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Sort by comparisonOrder (lower first), then by price
    filtered.sort((a, b) => {
      if (a.comparisonOrder !== b.comparisonOrder) {
        return (a.comparisonOrder || 999) - (b.comparisonOrder || 999);
      }
      return a.price - b.price;
    });
    
    setFilteredPlans(filtered);
  }, [plansData, productsData, selectedCategory]);

  // Format category name
  const formatCategoryName = (category) =>
    category
      ? category
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Uncategorized';

  // Get product dose name
  const getProductDoseName = (productId, doseId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return 'Unknown Product';
    const dose = product.doses?.find((d) => d.id === doseId);
    return dose ? `${product.name} ${dose.value}` : product.name;
  };

  if (isLoadingPlans || isLoadingProducts) {
    return (
      <div className="flex justify-center items-center p-8 h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (filteredPlans.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link to="/products" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Product Management
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Plans Available</h2>
          <p className="text-gray-600 mb-6">
            {selectedCategory === 'all'
              ? 'There are no active subscription plans available.'
              : `There are no active subscription plans in the ${formatCategoryName(selectedCategory)} category.`}
          </p>
          <div className="flex justify-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategoryName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/products" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Product Management
        </Link>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategoryName(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {selectedCategory === 'all'
          ? 'Subscription Plan Comparison'
          : `${formatCategoryName(selectedCategory)} Plans Comparison`}
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Feature
              </th>
              {filteredPlans.map((plan) => (
                <th
                  key={plan.id}
                  className={`px-6 py-3 text-center text-sm font-medium tracking-wider ${
                    plan.isFeatured ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-bold text-gray-900">{plan.name}</div>
                  {plan.isDefault && (
                    <div className="inline-block px-2 py-1 mt-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Recommended
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Price Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Price
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-price`}
                  className={`px-6 py-4 text-center ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  <div className="text-2xl font-bold text-gray-900">${plan.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {plan.billingFrequency === 'monthly'
                      ? 'per month'
                      : plan.billingFrequency === 'quarterly'
                      ? 'per quarter'
                      : plan.billingFrequency === 'biannually'
                      ? 'per 6 months'
                      : 'per year'}
                  </div>
                  {plan.discount > 0 && (
                    <div className="mt-1 text-sm text-green-600 font-medium">
                      {plan.discount}% discount
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Billing Frequency Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Billing Frequency
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-billing`}
                  className={`px-6 py-4 text-center ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  <div className="text-sm text-gray-900 capitalize">{plan.billingFrequency}</div>
                </td>
              ))}
            </tr>

            {/* Delivery Frequency Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Delivery Frequency
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-delivery`}
                  className={`px-6 py-4 text-center ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  <div className="text-sm text-gray-900 capitalize">{plan.deliveryFrequency}</div>
                </td>
              ))}
            </tr>

            {/* Consultation Required Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Requires Consultation
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-consultation`}
                  className={`px-6 py-4 text-center ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  {plan.requiresConsultation ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {/* Included Products Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Included Products
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-products`}
                  className={`px-6 py-4 ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  <ul className="text-sm text-gray-900 list-disc pl-5 space-y-1">
                    {Array.isArray(plan.allowedProductDoses) && plan.allowedProductDoses.length > 0 ? (
                      plan.allowedProductDoses.map((dose) => (
                        <li key={`${dose.productId}-${dose.doseId}`}>
                          {getProductDoseName(dose.productId, dose.doseId)}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No products included</li>
                    )}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Additional Benefits Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Additional Benefits
              </td>
              {filteredPlans.map((plan) => (
                <td
                  key={`${plan.id}-benefits`}
                  className={`px-6 py-4 ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                >
                  <ul className="text-sm text-gray-900 list-disc pl-5 space-y-1">
                    {Array.isArray(plan.additionalBenefits) && plan.additionalBenefits.length > 0 ? (
                      plan.additionalBenefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No additional benefits</li>
                    )}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Availability Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                Availability
              </td>
              {filteredPlans.map((plan) => {
                const rules = plan.availabilityRules || {};
                const hasRestrictions = 
                  (rules.regions && rules.regions.length > 0) || 
                  (rules.userGroups && rules.userGroups.length > 0) ||
                  (rules.minAge > 0) || 
                  (rules.maxAge > 0);
                
                return (
                  <td
                    key={`${plan.id}-availability`}
                    className={`px-6 py-4 ${plan.isFeatured ? 'bg-yellow-50' : ''}`}
                  >
                    {hasRestrictions ? (
                      <div className="text-sm text-gray-900">
                        {rules.regions && rules.regions.length > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">Regions:</span>{' '}
                            {rules.regions.join(', ')}
                          </div>
                        )}
                        {rules.userGroups && rules.userGroups.length > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">User Groups:</span>{' '}
                            {rules.userGroups.join(', ')}
                          </div>
                        )}
                        {rules.minAge > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">Min Age:</span> {rules.minAge}
                          </div>
                        )}
                        {rules.maxAge > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">Max Age:</span> {rules.maxAge}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Available to all</div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-600">
            This comparison view shows all active subscription plans
            {selectedCategory !== 'all' ? ` in the ${formatCategoryName(selectedCategory)} category` : ''}.
            Plans are sorted by their comparison order, then by price.
            Featured plans are highlighted in yellow, and the recommended (default) plan for each category is marked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonView;