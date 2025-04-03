import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Filter,
  Tag,
  Package,
  DollarSign,
  Check,
  Briefcase // Icon for Service
} from 'lucide-react';

import {
  PageHeader,
  SearchAndFilters,
  Badge,
  Modal,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox
} from './ProductComponents';

// Assuming AppContext provides services
import { useAppContext } from '../../context/AppContext';


// Component to manage medication doses (Price removed, allowOneTimePurchase added)
const DosesFormSection = ({ doses = [], onChange }) => {
  const [newDose, setNewDose] = useState({ value: '', description: '', allowOneTimePurchase: false });

  const handleAddDose = () => {
    if (newDose.value.trim() === '') return;
    const updatedDoses = [
      ...doses,
      {
        id: Date.now(), // Use timestamp for temporary ID
        value: newDose.value,
        description: newDose.description,
        allowOneTimePurchase: newDose.allowOneTimePurchase
      }
    ];
    onChange(updatedDoses);
    setNewDose({ value: '', description: '', allowOneTimePurchase: false });
  };

  const handleRemoveDose = (doseId) => {
    const updatedDoses = doses.filter(dose => dose.id !== doseId);
    onChange(updatedDoses);
  };

  const handleDoseChange = (e, field, doseId) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const newValue = value; // No price parsing needed

    if (doseId) {
      const updatedDoses = doses.map(dose => {
        if (dose.id === doseId) {
          return { ...dose, [field]: newValue };
        }
        return dose;
      });
      onChange(updatedDoses);
    } else {
      setNewDose(prev => ({ ...prev, [field]: newValue }));
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h4 className="text-md font-medium mb-4">Available Doses</h4>
      {doses.length > 0 ? (
        <div className="mb-4 space-y-4">
          {doses.map(dose => (
            <div key={dose.id} className="flex items-start bg-gray-50 p-3 rounded-md">
              <div className="flex-grow flex flex-col space-y-2">
                {/* Dose Value */}
                <div className="flex-1">
                   <label className="block text-xs font-medium text-gray-500 mb-1">Dose</label>
                   <input type="text" value={dose.value} onChange={(e) => handleDoseChange(e, 'value', dose.id)} placeholder="e.g., 10mg" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"/>
                 </div>
                 {/* Price Removed */}
                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
                  <input type="text" value={dose.description || ''} onChange={(e) => handleDoseChange(e, 'description', dose.id)} placeholder="Description for this dose" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"/>
                </div>
                {/* Allow One-Time Purchase Checkbox */}
                <div className="flex items-center pt-1">
                   <input type="checkbox" id={`allowOneTime-${dose.id}`} checked={!!dose.allowOneTimePurchase} onChange={(e) => handleDoseChange(e, 'allowOneTimePurchase', dose.id)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                   <label htmlFor={`allowOneTime-${dose.id}`} className="ml-2 text-xs text-gray-700">Allow One-Time Purchase</label>
                 </div>
              </div>
              <button type="button" onClick={() => handleRemoveDose(dose.id)} className="ml-3 p-1 text-red-500 hover:text-red-700 mt-8"><Trash2 className="h-5 w-5" /></button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-md">No doses added yet.</p>
      )}

      {/* Add New Dose Section */}
      <div className="mt-3 pt-4 border-t">
        <h5 className="text-sm font-medium mb-3">Add New Dose</h5>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex flex-col space-y-3">
            {/* Dose Value */}
             <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Dose</label>
                <input type="text" value={newDose.value} onChange={(e) => handleDoseChange(e, 'value')} placeholder="e.g., 10mg" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"/>
              </div>
             {/* Price Removed */}
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
              <input type="text" value={newDose.description} onChange={(e) => handleDoseChange(e, 'description')} placeholder="Description for this dose" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"/>
            </div>
             {/* Allow One-Time Purchase Checkbox */}
             <div className="flex items-center pt-1">
               <input type="checkbox" id="allowOneTime-new" checked={newDose.allowOneTimePurchase} onChange={(e) => handleDoseChange(e, 'allowOneTimePurchase')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
               <label htmlFor="allowOneTime-new" className="ml-2 text-xs text-gray-700">Allow One-Time Purchase</label>
             </div>
            {/* Add Button */}
            <div className="flex justify-end mt-2">
              <button type="button" onClick={handleAddDose} className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center text-sm hover:bg-indigo-700" disabled={!newDose.value.trim()}><Plus className="h-4 w-4 mr-1" /> Add Dose</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProductManagement = () => {
  const { services } = useAppContext(); // Get services from context

  // --- State Definitions ---
  const [activeTab, setActiveTab] = useState('products');
  // Mock data - Includes fulfillmentSource, oneTimePurchasePrice, removed price from doses
  const [products, setProducts] = useState([
    { id: 1, name: 'Semaglutide', type: 'medication', description: 'GLP-1 agonist', active: true, requiresPrescription: true, category: 'weight-management', associatedServiceIds: [1, 2], stockStatus: 'in-stock', interactionWarnings: ['ACE inhibitors'], oneTimePurchasePrice: 219.99, fulfillmentSource: 'compounding_pharmacy', doses: [ { id: 101, value: '0.25mg', description: 'Starting dose', allowOneTimePurchase: true }, { id: 102, value: '0.5mg', description: 'Standard dose', allowOneTimePurchase: false }, { id: 103, value: '1.0mg', description: 'Higher dose', allowOneTimePurchase: false } ] },
    { id: 2, name: 'Tirzepatide', type: 'medication', description: 'Dual GIP/GLP-1 agonist', active: true, requiresPrescription: true, category: 'weight-management', associatedServiceIds: [1, 2, 3], stockStatus: 'in-stock', interactionWarnings: ['Insulin'], oneTimePurchasePrice: 299.99, fulfillmentSource: 'compounding_pharmacy', doses: [ { id: 201, value: '5mg', description: 'Standard dose', allowOneTimePurchase: false }, { id: 202, value: '10mg', description: 'Higher dose', allowOneTimePurchase: false } ] },
    { id: 3, name: 'Vitamin D3', type: 'supplement', description: 'High-potency D3', active: true, requiresPrescription: false, category: 'supplements', associatedServiceIds: [1, 3], stockStatus: 'in-stock', price: 19.99, allowOneTimePurchase: true, fulfillmentSource: 'internal_supplement' }
  ]);
  // Mock data - Updated plans to include specific doses
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    { id: 1, name: 'Starter Weight Management', description: 'Initial starter plan', billingFrequency: 'monthly', deliveryFrequency: 'monthly', price: 169.99, active: true, discount: 0, allowedProductDoses: [{ productId: 1, doseId: 101 }], category: 'weight-management', popularity: 'high', requiresConsultation: true, additionalBenefits: ['Benefit 1'] },
    { id: 2, name: 'Standard Weight Management', description: 'Standard plan', billingFrequency: 'monthly', deliveryFrequency: 'monthly', price: 199.00, active: true, discount: 0, allowedProductDoses: [{ productId: 1, doseId: 102 }, { productId: 2, doseId: 201 }], category: 'weight-management', popularity: 'high', requiresConsultation: true, additionalBenefits: ['Benefit 1', 'Benefit 2'] },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Initial form state - Product
  const initialProductFormData = { name: '', type: 'medication', description: '', price: 0, oneTimePurchasePrice: 0, active: true, requiresPrescription: true, category: 'weight-management', associatedServiceIds: [], stockStatus: 'in-stock', interactionWarnings: [], doses: [], allowOneTimePurchase: false, fulfillmentSource: 'compounding_pharmacy' };
  const [productFormData, setProductFormData] = useState(initialProductFormData);
  // Initial form state - Plan (updated for doses)
  const initialPlanFormData = { name: '', description: '', billingFrequency: 'monthly', deliveryFrequency: 'monthly', price: 0, active: true, discount: 0, allowedProductDoses: [], category: 'weight-management', popularity: 'medium', requiresConsultation: true, additionalBenefits: [] };
  const [planFormData, setPlanFormData] = useState(initialPlanFormData);

  // --- Derived Data ---
  const productCategories = [...new Set([...products.map(p => p.category), ...subscriptionPlans.map(p => p.category)])].filter(Boolean).sort();
  const filteredProducts = products.filter(p =>
    (typeFilter === 'all' || p.type === typeFilter) &&
    (categoryFilter === 'all' || p.category === categoryFilter) &&
    (serviceFilter === 'all' || (Array.isArray(p.associatedServiceIds) && p.associatedServiceIds.includes(parseInt(serviceFilter)))) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  const filteredPlans = subscriptionPlans.filter(p => (categoryFilter === 'all' || p.category === categoryFilter) && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))));


  // --- Handlers ---
  const handleDosesChange = (updatedDoses) => { setProductFormData(prev => ({ ...prev, doses: updatedDoses })); };

  const handleAddProduct = () => {
    setEditMode(false);
    setProductFormData(initialProductFormData);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditMode(true);
    setCurrentProduct(product);
    setProductFormData({
      name: product.name || '',
      type: product.type || 'medication',
      description: product.description || '',
      price: product.price || 0,
      oneTimePurchasePrice: product.oneTimePurchasePrice || 0,
      active: product.active !== undefined ? product.active : true,
      requiresPrescription: product.requiresPrescription !== undefined ? product.requiresPrescription : true,
      category: product.category || 'weight-management',
      associatedServiceIds: Array.isArray(product.associatedServiceIds) ? [...product.associatedServiceIds] : [],
      stockStatus: product.stockStatus || 'in-stock',
      interactionWarnings: product.interactionWarnings || [],
      doses: product.doses || [],
      allowOneTimePurchase: product.allowOneTimePurchase !== undefined ? product.allowOneTimePurchase : false,
      fulfillmentSource: product.fulfillmentSource || (product.type === 'medication' ? 'compounding_pharmacy' : 'internal_supplement')
    });
    setShowProductModal(true);
  };

  const handleAddPlan = () => {
    setEditMode(false);
    setPlanFormData(initialPlanFormData); // Use the updated initial state
    setShowPlanModal(true);
  };
  const handleEditPlan = (plan) => {
    setEditMode(true);
    setCurrentPlan(plan);
    // Ensure allowedProductDoses is initialized correctly
    setPlanFormData({ ...plan, allowedProductDoses: Array.isArray(plan.allowedProductDoses) ? [...plan.allowedProductDoses] : [] });
    setShowPlanModal(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (type === 'number' || name === 'price' || name === 'oneTimePurchasePrice' ? parseFloat(value) || 0 : value);
    if (name === 'interactionWarnings') {
      setProductFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    } else {
      setProductFormData(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleServiceSelectionChange = (serviceId) => {
      setProductFormData(prev => {
          const currentIds = prev.associatedServiceIds || [];
          const newIds = currentIds.includes(serviceId)
              ? currentIds.filter(id => id !== serviceId)
              : [...currentIds, serviceId];
          return { ...prev, associatedServiceIds: newIds };
      });
  };


  // Plan input handlers
  const handlePlanInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
     if (name === 'additionalBenefits') {
       setPlanFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
     } else {
       setPlanFormData(prev => ({ ...prev, [name]: newValue }));
     }
  };

  // Handler for dose selection checkboxes in plan modal
  const handleDoseSelectionChange = (productId, doseId) => {
    setPlanFormData(prev => {
        const currentDoses = prev.allowedProductDoses || [];
        const doseIndex = currentDoses.findIndex(d => d.productId === productId && d.doseId === doseId);

        let newDoses;
        if (doseIndex > -1) {
            // Dose exists, remove it
            newDoses = currentDoses.filter((_, index) => index !== doseIndex);
        } else {
            // Dose doesn't exist, add it
            newDoses = [...currentDoses, { productId, doseId }];
        }
        return { ...prev, allowedProductDoses: newDoses };
    });
  };

  // Updated product submit handler
  const handleProductSubmit = () => {
    const submissionData = { ...productFormData };

    if (submissionData.type !== 'medication') {
      submissionData.doses = [];
      submissionData.oneTimePurchasePrice = 0;
    } else {
      submissionData.price = 0;
      submissionData.doses = submissionData.doses.map((dose, index) => ({
        id: dose.id || Date.now() + index, // Ensure ID exists
        value: dose.value,
        description: dose.description,
        allowOneTimePurchase: !!dose.allowOneTimePurchase
      }));
    }
    submissionData.allowOneTimePurchase = !!submissionData.allowOneTimePurchase;
    submissionData.active = !!submissionData.active;
    submissionData.requiresPrescription = !!submissionData.requiresPrescription;
    if (!submissionData.fulfillmentSource) {
        submissionData.fulfillmentSource = submissionData.type === 'medication' ? 'compounding_pharmacy' : 'internal_supplement';
    }
    submissionData.associatedServiceIds = Array.isArray(submissionData.associatedServiceIds) ? submissionData.associatedServiceIds : [];


    if (editMode && currentProduct) {
      setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...submissionData } : p));
    } else {
      const newProduct = { id: Math.max(0, ...products.map(p => p.id)) + 1, ...submissionData };
      setProducts([...products, newProduct]);
    }
    setShowProductModal(false);
  };

  // Updated plan submit handler
  const handlePlanSubmit = () => {
     const submissionData = { ...planFormData };
     // Ensure allowedProductDoses is an array
     submissionData.allowedProductDoses = Array.isArray(submissionData.allowedProductDoses) ? submissionData.allowedProductDoses : [];
     // Remove the old allowedProducts if it exists
     delete submissionData.allowedProducts;

     if (editMode && currentPlan) {
       setSubscriptionPlans(plans => plans.map(p => p.id === currentPlan.id ? { ...p, ...submissionData } : p));
     } else {
       const newPlan = { id: Math.max(0, ...subscriptionPlans.map(p => p.id)) + 1, ...submissionData };
       setSubscriptionPlans(plans => [...plans, newPlan]);
     }
     setShowPlanModal(false);
  };

  // Updated Delete handlers
  const handleDeleteProduct = (id) => {
     // Check if any dose of this product is in any plan
     const isUsed = subscriptionPlans.some(plan =>
        Array.isArray(plan.allowedProductDoses) &&
        plan.allowedProductDoses.some(doseRef => doseRef.productId === id)
     );
     if (isUsed) {
       alert("This product cannot be deleted as one of its doses is used in a subscription plan.");
       return;
     }
     setProducts(products.filter(p => p.id !== id));
  };
  const handleDeletePlan = (id) => {
     setSubscriptionPlans(plans => plans.filter(p => p.id !== id));
  };

  // Utility functions
  const getServiceNameById = (id) => {
    if (!Array.isArray(services) || id == null) return null;
    const service = services.find(s => s.id === id);
    return service ? service.name : null;
   };
  const formatCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
   };
  const formatFulfillmentSource = (source) => {
      if (!source) return 'N/A';
      return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  // Helper to get product and dose name for plan table/modal
  const getProductDoseName = (productId, doseId) => {
      const product = products.find(p => p.id === productId);
      if (!product) return 'Unknown Product';
      const dose = product.doses?.find(d => d.id === doseId);
      return dose ? `${product.name} ${dose.value}` : product.name; // Fallback to product name if dose not found
  };

  // --- Render ---
  return (
    <div>
      <PageHeader title="Product & Subscription Management" />
      {/* Tabs */}
      <div className="mb-6"><div className="border-b border-gray-200"><nav className="flex -mb-px">
         <button onClick={() => setActiveTab('products')} className={`py-4 px-6 text-sm font-medium ${activeTab === 'products' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Package className="h-4 w-4 inline-block mr-1" />Products</button>
         <button onClick={() => setActiveTab('plans')} className={`py-4 px-6 text-sm font-medium ${activeTab === 'plans' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Tag className="h-4 w-4 inline-block mr-1" />Subscription Plans</button>
      </nav></div></div>
      {/* Search and filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder={activeTab === 'products' ? "Search products..." : "Search subscription plans..."}
        filters={[
          ...(activeTab === 'products' ? [{ value: typeFilter, onChange: setTypeFilter, options: [ { value: 'all', label: 'All Types' }, { value: 'medication', label: 'Medications' }, { value: 'supplement', label: 'Supplements' }, { value: 'service', label: 'Services' } ], icon: Filter }] : []),
          ...(activeTab === 'products' && Array.isArray(services) && services.length > 0
            ? [{
                value: serviceFilter,
                onChange: setServiceFilter,
                options: [
                  { value: 'all', label: 'All Services' },
                  ...services.map(s => ({ value: s.id.toString(), label: s.name }))
                ],
                icon: Briefcase
              }]
            : []
          ),
          { value: categoryFilter, onChange: setCategoryFilter, options: [ { value: 'all', label: 'All Categories' }, ...productCategories.map(c => ({ value: c, label: formatCategoryName(c) })) ] }
        ]}
      >
         <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={activeTab === 'products' ? handleAddProduct : handleAddPlan}><Plus className="h-5 w-5 mr-2" />{activeTab === 'products' ? 'Add Product' : 'Add Plan'}</button>
      </SearchAndFilters>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={handleAddProduct}><Plus className="h-5 w-5 mr-2" />Add Product</button>
          </div>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name / Dose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">One-Time Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.flatMap(product => {
                  if (product.type !== 'medication' || !product.doses || product.doses.length === 0) {
                    return [{ ...product, displayName: product.name, key: `${product.id}-base`, allowOneTimePurchase: !!product.allowOneTimePurchase, price: product.price }];
                  }
                  return product.doses.map((dose, index) => ({ ...product, displayName: `${product.name} ${dose.value}`, currentDose: dose, price: product.oneTimePurchasePrice, doseDescription: dose.description, key: `${product.id}-${dose.id}`, isFirstDose: index === 0, allowOneTimePurchase: !!dose.allowOneTimePurchase }));
                }).map((product) => (
                  <tr key={product.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{product.displayName}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={product.type === 'medication' ? 'bg-blue-100 text-blue-800' : product.type === 'supplement' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</Badge></td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.isArray(product.associatedServiceIds) && product.associatedServiceIds.map(serviceId => {
                                const serviceName = getServiceNameById(serviceId);
                                return serviceName ? (
                                    <Badge key={serviceId} className="bg-gray-100 text-gray-800">
                                        {serviceName}
                                    </Badge>
                                ) : null;
                            })}
                            {(!Array.isArray(product.associatedServiceIds) || product.associatedServiceIds.length === 0) && <span className="text-xs text-gray-500">None</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFulfillmentSource(product.fulfillmentSource)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.allowOneTimePurchase
                        ? <span className="text-xs text-green-600 flex items-center"><Check size={12} className="mr-1"/>Allowed (${Number(product.price).toFixed(2)})</span>
                        : <span className="text-xs text-gray-500">Subscription Only</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{product.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{(!product.currentDose || product.isFirstDose) && (<> <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => handleEditProduct(products.find(p => p.id === product.id))}><Edit className="h-5 w-5" /></button> <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-5 w-5" /></button> </>)}</td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (<tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No products found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Plans Tab - Updated Products column */}
      {activeTab === 'plans' && (
        <>
          <div className="flex justify-end mb-4"> {/* Add Plan Button Added */}
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={handleAddPlan}><Plus className="h-5 w-5 mr-2" />Add Plan</button>
          </div>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Included Doses</th> {/* Changed column name */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{plan.name}</div><div className="text-xs text-gray-500 truncate mt-1">{plan.description}</div><div className="mt-1"><Badge className={plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{plan.active ? 'Active' : 'Inactive'}</Badge></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge className="bg-purple-100 text-purple-800">{formatCategoryName(plan.category)}</Badge><div className="mt-1 text-xs"><span className="text-gray-500">Bill: </span><span className="font-medium capitalize">{plan.billingFrequency}</span></div><div className="mt-1 text-xs"><span className="text-gray-500">Delivery: </span><span className="font-medium capitalize">{plan.deliveryFrequency}</span></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 font-medium">${plan.price.toFixed(2)}</div>{plan.discount > 0 && (<div className="text-xs text-green-600">{plan.discount}% discount</div>)}</td>
                    {/* Updated Products column to show doses */}
                    <td className="px-6 py-4"><div className="flex flex-col"><div className="mb-1 text-xs text-gray-500 font-medium">{plan.allowedProductDoses?.length || 0} doses included</div><div className="flex flex-wrap gap-1">{Array.isArray(plan.allowedProductDoses) && plan.allowedProductDoses.map((doseRef) => (<Badge key={`${doseRef.productId}-${doseRef.doseId}`} className="bg-gray-100 text-gray-800">{getProductDoseName(doseRef.productId, doseRef.doseId)}</Badge>))}</div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => handleEditPlan(plan)}><Edit className="h-5 w-5" /></button><button className="text-red-600 hover:text-red-900" onClick={() => handleDeletePlan(plan.id)}><Trash2 className="h-5 w-5" /></button></td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (<tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No plans found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Product Modal */}
      <Modal title={editMode ? 'Edit Product' : 'Add New Product'} isOpen={showProductModal} onClose={() => setShowProductModal(false)} onSubmit={handleProductSubmit} submitText={editMode ? 'Save Changes' : 'Add Product'}>
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-5">
            <FormInput label="Product Name" name="name" value={productFormData.name} onChange={handleProductInputChange} required />
            <FormSelect label="Type" name="type" value={productFormData.type} onChange={handleProductInputChange} options={[{ value: 'medication', label: 'Medication' }, { value: 'supplement', label: 'Supplement' }, { value: 'service', label: 'Service' }]} />
            <FormSelect
              label="Fulfillment Source"
              name="fulfillmentSource"
              value={productFormData.fulfillmentSource}
              onChange={handleProductInputChange}
              options={[
                  { value: 'compounding_pharmacy', label: 'Compounding Pharmacy' },
                  { value: 'retail_pharmacy', label: 'Retail Pharmacy' },
                  { value: 'internal_supplement', label: 'Internal (Supplement)' },
                  { value: 'internal_service', label: 'Internal (Service)' },
              ]}
            />
            <FormSelect label="Category" name="category" value={productFormData.category} onChange={handleProductInputChange} options={productCategories.map(c => ({ value: c, label: formatCategoryName(c) }))} />
            <FormTextarea label="Description" name="description" value={productFormData.description} onChange={handleProductInputChange} rows={3} />
            {productFormData.type !== 'medication' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (One-Time)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                  <input type="number" name="price" min="0" step="0.01" className="block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={productFormData.price} onChange={handleProductInputChange}/>
                </div>
              </div>
            )}
             {productFormData.type === 'medication' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Purchase Price</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                  <input type="number" name="oneTimePurchasePrice" min="0" step="0.01" className="block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={productFormData.oneTimePurchasePrice} onChange={handleProductInputChange}/>
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div className="col-span-7">
            {productFormData.type === 'medication' ? ( <DosesFormSection doses={productFormData.doses || []} onChange={handleDosesChange} /> ) : ( <div> <FormSelect label="Stock Status" name="stockStatus" value={productFormData.stockStatus} onChange={handleProductInputChange} options={[{ value: 'in-stock', label: 'In Stock' }, { value: 'limited', label: 'Limited Stock' }, { value: 'out-of-stock', label: 'Out of Stock' }, { value: 'backorder', label: 'On Backorder' }]} /> <FormTextarea label="Interaction Warnings" name="interactionWarnings" value={Array.isArray(productFormData.interactionWarnings) ? productFormData.interactionWarnings.join(', ') : ''} onChange={handleProductInputChange} rows={2} placeholder="e.g. Nitrates, Beta-blockers" /> </div> )}
            <div className={productFormData.type === 'medication' ? 'mt-4' : ''}>
              <FormSelect label="Stock Status" name="stockStatus" value={productFormData.stockStatus} onChange={handleProductInputChange} options={[{ value: 'in-stock', label: 'In Stock' }, { value: 'limited', label: 'Limited Stock' }, { value: 'out-of-stock', label: 'Out of Stock' }, { value: 'backorder', label: 'On Backorder' }]} />
              {productFormData.type === 'medication' && ( <FormTextarea label="Interaction Warnings" name="interactionWarnings" value={Array.isArray(productFormData.interactionWarnings) ? productFormData.interactionWarnings.join(', ') : ''} onChange={handleProductInputChange} rows={2} placeholder="e.g. Nitrates, Beta-blockers" /> )}
              {/* Associated Services Multi-Select */}
              <div className="mb-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Associated Services (Standalone)
                  </label>
                  <div className="border border-gray-300 rounded-md p-2 h-32 overflow-y-auto space-y-1">
                      {/* Ensure services is an array before mapping */}
                      {Array.isArray(services) ? services.map(service => (
                          <div key={service.id} className="flex items-center">
                              <input
                                  type="checkbox"
                                  id={`service-assoc-${service.id}`}
                                  checked={productFormData.associatedServiceIds?.includes(service.id) || false}
                                  onChange={() => handleServiceSelectionChange(service.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`service-assoc-${service.id}`} className="ml-2 text-sm text-gray-700">{service.name}</label>
                          </div>
                      )) : <p className="text-xs text-gray-500">Loading services...</p>}
                  </div>
              </div>
              <div className="flex space-x-6 mt-4">
                <FormCheckbox label="Active" name="active" checked={productFormData.active} onChange={handleProductInputChange} />
                <FormCheckbox label="Requires Prescription" name="requiresPrescription" checked={productFormData.requiresPrescription} onChange={handleProductInputChange} />
                {productFormData.type !== 'medication' && (
                   <FormCheckbox label="Allow One-Time Purchase" name="allowOneTimePurchase" checked={!!productFormData.allowOneTimePurchase} onChange={handleProductInputChange} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Plan Modal - Updated Included Products section */}
      <Modal title={editMode ? 'Edit Plan' : 'Add New Plan'} isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} onSubmit={handlePlanSubmit} submitText={editMode ? 'Save Changes' : 'Add Plan'}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div> {/* Left Column */}
             <FormInput label="Plan Name" name="name" value={planFormData.name} onChange={handlePlanInputChange} required />
             <FormTextarea label="Description" name="description" value={planFormData.description} onChange={handlePlanInputChange} rows={2} />
             <FormSelect label="Category" name="category" value={planFormData.category} onChange={handlePlanInputChange} options={productCategories.map(c => ({ value: c, label: formatCategoryName(c) }))} />
             <div className="grid grid-cols-2 gap-4">
               <FormSelect label="Billing Frequency" name="billingFrequency" value={planFormData.billingFrequency} onChange={handlePlanInputChange} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'biannually', label: 'Biannually' }, { value: 'annually', label: 'Annually' }]} />
               <FormSelect label="Delivery Frequency" name="deliveryFrequency" value={planFormData.deliveryFrequency} onChange={handlePlanInputChange} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Biweekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'bimonthly', label: 'Bimonthly' }]} />
             </div>
             <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><div className="relative rounded-md shadow-sm"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div><input type="number" name="price" min="0" step="0.01" className="block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={planFormData.price} onChange={handlePlanInputChange}/></div></div>
             <div className="grid grid-cols-2 gap-4">
               <FormInput label="Discount (%)" name="discount" type="number" min="0" max="100" value={planFormData.discount} onChange={handlePlanInputChange} />
               <FormSelect label="Popularity" name="popularity" value={planFormData.popularity} onChange={handlePlanInputChange} options={[{ value: 'high', label: 'High Demand' }, { value: 'medium', label: 'Medium Demand' }, { value: 'low', label: 'Low Demand' }]} />
             </div>
           </div>
           <div> {/* Right Column */}
             {/* Updated Included Products/Doses section */}
             <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Included Product Doses</label>
                <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto space-y-2">
                    {products.filter(p => p.type === 'medication' && p.doses?.length > 0).map((product) => (
                        <div key={product.id}>
                            <h4 className="text-xs font-semibold text-gray-600 mb-1">{product.name}</h4>
                            <div className="pl-2 space-y-1">
                                {product.doses.map(dose => (
                                    <div key={dose.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`dose-select-${product.id}-${dose.id}`}
                                            checked={planFormData.allowedProductDoses?.some(d => d.productId === product.id && d.doseId === dose.id) || false}
                                            onChange={() => handleDoseSelectionChange(product.id, dose.id)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`dose-select-${product.id}-${dose.id}`} className="ml-2 text-sm text-gray-700">
                                            {dose.value} {dose.description ? `(${dose.description})` : ''}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {products.filter(p => p.type === 'medication' && p.doses?.length > 0).length === 0 && <p className="text-xs text-gray-500">No medication products with doses available.</p>}
                </div>
                <p className="mt-1 text-xs text-gray-500">{planFormData.allowedProductDoses?.length || 0} doses selected</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <FormCheckbox label="Active" name="active" checked={planFormData.active} onChange={handlePlanInputChange} />
               <FormCheckbox label="Requires Consultation" name="requiresConsultation" checked={planFormData.requiresConsultation} onChange={handlePlanInputChange} />
             </div>
             <FormTextarea label="Additional Benefits" name="additionalBenefits" value={Array.isArray(planFormData.additionalBenefits) ? planFormData.additionalBenefits.join(', ') : ''} onChange={handlePlanInputChange} rows={3} placeholder="e.g. Free anti-nausea medication" />
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
