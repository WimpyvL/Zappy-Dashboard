import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccessibleModal from '../ui/redesign/AccessibleModal';
import { 
  FormInput, 
  FormSelect, 
  FormSection,
  FormRadioGroup 
} from '../ui/FormComponents';
import { usePatients } from '../../apis/patients/hooks';
import { useProducts } from '../../apis/products/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useDiscounts } from '../../apis/discounts/hooks';
import { useCreateInvoice } from '../../apis/invoices/hooks';
import { Plus, Trash2, Search, X } from 'lucide-react';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  // State for the invoice form
  const [formData, setFormData] = useState({
    patientId: null,
    patientSearch: '',
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: '', productId: null }],
    subscriptionPlanId: null,
    discountAmount: 0,
    taxRate: 0
  });
  
  // State for patient search results
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Calculation state
  const [invoiceSubtotal, setInvoiceSubtotal] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Fetch data
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: subscriptionPlansData, isLoading: isLoadingSubscriptionPlans } = useSubscriptionPlans();
  const { data: discountsData, isLoading: isLoadingDiscounts } = useDiscounts({ status: 'Active' });
  
  const allPatients = patientsData?.data || [];
  const products = productsData?.data || [];
  const subscriptionPlans = subscriptionPlansData || [];
  const discounts = discountsData?.data || [];
  
  // Create invoice mutation
  const createInvoiceMutation = useCreateInvoice({
    onSuccess: () => {
      toast.success('Invoice created successfully');
      resetForm();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    }
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      patientId: null,
      patientSearch: '',
      dob: '',
      dueDate: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: '', productId: null }],
      subscriptionPlanId: null,
      discountId: null,
      discountCode: '',
      discountAmount: 0,
      taxRate: 0
    });
    setErrors({});
    setSearchResults([]);
    setShowSearchResults(false);
  };
  
  // Calculate totals
  useEffect(() => {
    // Calculate subtotal from line items
    const subtotal = formData.lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + quantity * price;
    }, 0);
    
    // Apply discount
    const discountAmount = formData.discountAmount || 0;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    
    // Apply tax
    const taxAmount = afterDiscount * (parseFloat(formData.taxRate || 0) / 100);
    
    // Calculate final total
    const total = afterDiscount + taxAmount;
    
    setInvoiceSubtotal(subtotal);
    setInvoiceTotal(total);
  }, [formData.lineItems, formData.discountAmount, formData.taxRate]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle patient search
  const handlePatientSearch = (e) => {
    const searchTerm = e.target.value;
    setFormData(prev => ({ ...prev, patientSearch: searchTerm }));
    
    if (searchTerm.trim().length > 1) {
      const filteredPatients = allPatients.filter(patient => {
        const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               (patient.id && patient.id.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      
      setSearchResults(filteredPatients);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Handle patient selection from search results
  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientSearch: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
      dob: patient.date_of_birth || ''
    }));
    setShowSearchResults(false);
  };
  
  // Clear selected patient
  const clearSelectedPatient = () => {
    setFormData(prev => ({
      ...prev,
      patientId: null,
      patientSearch: '',
      dob: ''
    }));
  };
  
  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedLineItems = [...prev.lineItems];
      updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
      return { ...prev, lineItems: updatedLineItems };
    });
  };

  // Handle line item product selection
  const handleLineItemProductSelect = (index, productId) => {
    if (productId) {
      const selectedProduct = products.find(p => p.id === productId);
      if (selectedProduct) {
        setFormData(prev => {
          const updatedLineItems = [...prev.lineItems];
          updatedLineItems[index] = { 
            ...updatedLineItems[index], 
            productId,
            description: selectedProduct.name || 'Product',
            unitPrice: selectedProduct.price || 0
          };
          return { ...prev, lineItems: updatedLineItems };
        });
      }
    } else {
      // Switch between product list and custom item
      setFormData(prev => {
        const updatedLineItems = [...prev.lineItems];
        const currentItem = updatedLineItems[index];
        
        // If currently using a product, switch to custom item
        if (currentItem.productId) {
          updatedLineItems[index] = {
            ...currentItem,
            productId: null,
            customName: currentItem.description || '',
          };
        } 
        // If currently using custom item, switch to product list
        else {
          updatedLineItems[index] = {
            ...currentItem,
            productId: '',  // Empty string to show dropdown
          };
        }
        
        return { ...prev, lineItems: updatedLineItems };
      });
    }
  };
  
  // Add line item
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, unitPrice: '', productId: null }
      ]
    }));
  };
  
  // Remove line item
  const removeLineItem = (index) => {
    if (formData.lineItems.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };
  
  // Handle subscription plan selection
  const handleSubscriptionPlanSelect = (planId) => {
    if (planId) {
      const selectedPlan = subscriptionPlans.find(p => p.id === planId);
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          subscriptionPlanId: planId,
          lineItems: [
            {
              description: `Subscription: ${selectedPlan.name}`,
              quantity: 1,
              unitPrice: selectedPlan.price || 0,
              productId: null
            }
          ]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        subscriptionPlanId: null
      }));
    }
  };
  
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Please select a due date';
    }
    
    // Validate line items
    const validLineItems = formData.lineItems.filter(
      item => parseFloat(item.unitPrice) > 0
    );
    
    if (validLineItems.length === 0) {
      newErrors.lineItems = 'At least one valid line item is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }
    
    const submissionData = {
      patientId: formData.patientId,
      status: 'pending',
      items: formData.lineItems
        .filter(item => parseFloat(item.unitPrice) > 0)
        .map(item => ({
          name: item.productId ? item.description : (item.customName || 'Custom Item'),
          description: item.description || 'No description provided',
          quantity: item.quantity,
          price: item.unitPrice,
          product_id: item.productId || null
        })),
      amount: invoiceTotal,
      dueDate: formData.dueDate || null,
      // Store subscription plan ID in metadata instead of direct column
      subscription_plan_id: formData.subscriptionPlanId
    };
    
    createInvoiceMutation.mutate(submissionData);
  };
  
  return (
      <AccessibleModal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Invoice"
        size="2xl"
      >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <FormSection title="Customer Information">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a patient..."
                className={`block w-full pl-10 pr-10 py-2 border ${errors.patientId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.patientSearch}
                onChange={handlePatientSearch}
                required
              />
              {formData.patientId && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={clearSelectedPatient}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {errors.patientId && (
              <p className="mt-1 text-sm text-red-500">{errors.patientId}</p>
            )}
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                <ul className="py-1">
                  {searchResults.map(patient => (
                    <li 
                      key={patient.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `ID: ${patient.id}`}
                      {patient.date_of_birth && ` (DOB: ${formatDate(patient.date_of_birth)})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <FormInput
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            error={errors.dueDate}
          />
        </FormSection>
        
        {/* Subscription Plan */}
        <FormSection title="Subscription Plan">
          <FormSelect
            label="Subscription Plan"
            name="subscriptionPlanId"
            value={formData.subscriptionPlanId || ''}
            onChange={(e) => handleSubscriptionPlanSelect(e.target.value)}
            options={[
              { value: '', label: 'None (Custom Invoice)' },
              ...subscriptionPlans.map(plan => ({
                value: plan.id,
                label: `${plan.name} - $${plan.price} (${plan.billing_cycle})`
              }))
            ]}
          />
        </FormSection>
        
        {/* Line Items */}
        <FormSection title="Line Items" error={errors.lineItems}>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-1 px-2">
              <div className="col-span-3">Product/Service</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Price/Item ($)</div>
              <div className="col-span-1"></div>
            </div>
            
            {formData.lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded-md bg-white">
                {/* Line item row */}
                <div className="col-span-3">
                  {item.productId ? (
                    <select
                      value={item.productId || ''}
                      onChange={(e) => handleLineItemProductSelect(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">Custom Item</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <input
                        type="text"
                        placeholder="Product/Service Name"
                        value={item.customName || ''}
                        onChange={(e) => handleLineItemChange(index, 'customName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={() => handleLineItemProductSelect(index, '')}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Switch to product list
                      </button>
                    </div>
                  )}
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Description (up to 150 chars)"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    maxLength={150}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleLineItemChange(index, 'quantity', value || '1');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-center"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      // Only allow numeric input with decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}`
                        : value;
                      handleLineItemChange(index, 'unitPrice', formattedValue);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-center"
                    required={index === 0}
                  />
                </div>
                {/* Item total calculation display */}
                <div className="col-span-1 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className={`text-accent1 hover:text-accent1/80 p-1 ${formData.lineItems.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={formData.lineItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="text-xs text-gray-500 mt-1">
                    ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-primary hover:text-primary/80 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Line Item
            </button>
          </div>
        </FormSection>
        
        {/* Discount and Tax */}
        <FormSection title="Discount and Tax">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount ($)
              </label>
              <input
                type="text"
                name="discountAmount"
                placeholder="0.00"
                value={formData.discountAmount}
                onChange={(e) => {
                  // Only allow numeric input with decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  const formattedValue = parts.length > 2 
                    ? `${parts[0]}.${parts.slice(1).join('')}`
                    : value;
                  setFormData(prev => ({ ...prev, discountAmount: formattedValue }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="text"
                name="taxRate"
                placeholder="0.00"
                value={formData.taxRate}
                onChange={(e) => {
                  // Only allow numeric input with decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  const formattedValue = parts.length > 2 
                    ? `${parts[0]}.${parts.slice(1).join('')}`
                    : value;
                  setFormData(prev => ({ ...prev, taxRate: formattedValue }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
        </FormSection>
        
        {/* Summary */}
        <FormSection title="Summary">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoiceSubtotal.toFixed(2)}</span>
            </div>
            
            {parseFloat(formData.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${parseFloat(formData.discountAmount).toFixed(2)}</span>
              </div>
            )}
            
            {parseFloat(formData.taxRate) > 0 && (
              <div className="flex justify-between">
                <span>Tax ({formData.taxRate}%):</span>
                <span>${((invoiceSubtotal - parseFloat(formData.discountAmount)) * (parseFloat(formData.taxRate) / 100)).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${invoiceTotal.toFixed(2)}</span>
            </div>
          </div>
        </FormSection>
        
        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                status: 'draft'
              }));
              handleSubmit(new Event('submit'));
            }}
          >
            Save as Draft
          </button>

          <div className="space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              disabled={createInvoiceMutation.isLoading}
            >
              {createInvoiceMutation.isLoading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </form>
    </AccessibleModal>
  );
};

export default CreateInvoiceModal;
