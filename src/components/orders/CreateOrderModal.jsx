import React, { useState, useMemo } from 'react';
import { Select } from 'antd';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { XCircle } from 'lucide-react';
import {
  useCreateOrder,
  useCreateOrderItem,
} from '../../apis/orders/hooks';
import { useSessions } from '../../apis/sessions/hooks';
import { usePatients } from '../../apis/patients/hooks';
import { useProducts } from '../../apis/products/hooks';
import { usePharmacies } from '../../apis/pharmacies/hooks';

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

const CreateOrderModal = ({ isOpen, onClose, initialPatientId = null, onOrderCreated }) => {
  // State for the create order modal form
  const [newOrderData, setNewOrderData] = useState({
    patientId: initialPatientId,
    productId: null,
    pharmacyId: null,
    linkedSessionId: null,
    notes: '',
  });
  
  const [debouncedPatientSearchTerm, setDebouncedPatientSearchTerm] = useState('');
  const [debouncedProductSearchTerm, setDebouncedProductSearchTerm] = useState('');

  // Debounce handlers
  const debouncePatientSearch = useMemo(() => debounce(setDebouncedPatientSearchTerm, 500), []);
  const debounceProductSearch = useMemo(() => debounce(setDebouncedProductSearchTerm, 500), []);

  const handlePatientSearchInputChange = (value) => {
    debouncePatientSearch(value);
  };
  
  const handleProductSearchInputChange = (value) => {
    debounceProductSearch(value);
  };

  // Fetch data for modal dropdowns
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions();
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(1, { search: debouncedPatientSearchTerm }, 100);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ search: debouncedProductSearchTerm });
  const { data: pharmaciesData, isLoading: isLoadingPharmacies } = usePharmacies();

  const patientOptions = patientsData?.data || [];
  const productOptions = productsData?.data || [];
  const pharmacyOptions = pharmaciesData || [];
  const sessionOptions = sessionsData?.data || [];

  const createOrderItemMutation = useCreateOrderItem({
    onSuccess: () => {
      // Order item created successfully
    },
    onError: (error) => {
      toast.error(`Failed to create order details: ${error.message}`);
    }
  });

  const createOrderMutation = useCreateOrder({
    onSuccess: (createdOrder) => {
      // After successfully creating the order, create the order item
      const selectedProduct = productOptions.find(p => p.id === newOrderData.productId);
      
      if (selectedProduct && createdOrder) {
        // Create an order item to associate the product with the order
        const orderItemPayload = {
          order_id: createdOrder.id,
          product_id: newOrderData.productId,
          description: selectedProduct ? (selectedProduct.name || selectedProduct.title || selectedProduct.product_name) : 'Unknown Medication',
          quantity: 1,
          price_at_order: selectedProduct.price || 0.00
        };
        
        // Create the order item
        createOrderItemMutation.mutate(orderItemPayload);
      }
      
      toast.success('Order created successfully');
      resetForm();
      onClose();
      
      // Call the callback if provided
      if (onOrderCreated) {
        onOrderCreated(createdOrder);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  // Reset form to initial state
  const resetForm = () => {
    setNewOrderData({
      patientId: initialPatientId,
      productId: null,
      pharmacyId: null,
      linkedSessionId: null,
      notes: '',
    });
  };

  // Handle modal form input change
  const handleModalInputChange = (name, value) => {
    setNewOrderData(prev => ({ ...prev, [name]: value }));
  };

  // Handle modal patient selection
  const handleModalPatientSelect = (value) => {
    setNewOrderData(prev => ({ ...prev, patientId: value }));
    setDebouncedPatientSearchTerm('');
  };

  // Handle modal product selection
  const handleModalProductSelect = (value) => {
    setNewOrderData(prev => ({ ...prev, productId: value }));
    setDebouncedProductSearchTerm('');
  };

  // Handle modal pharmacy selection
  const handleModalPharmacySelect = (value) => {
    setNewOrderData(prev => ({ ...prev, pharmacyId: value }));
  };

  // Handle modal session selection
  const handleModalSessionSelect = (value) => {
    setNewOrderData(prev => ({ ...prev, linkedSessionId: value || null })); // Store null if unselected
  };

  // Handle create order submission
  const handleCreateOrder = () => {
    if (!newOrderData.patientId || !newOrderData.productId || !newOrderData.pharmacyId) {
      toast.error("Please select Patient, Medication, and Pharmacy.");
      return;
    }
    
    // Get the selected product and pharmacy for their names
    const selectedProduct = productOptions.find(p => p.id === newOrderData.productId);
    
    // Map state to the structure expected by useCreateOrder hook
    const orderPayload = {
      patient_id: newOrderData.patientId,
      pharmacy_id: newOrderData.pharmacyId,
      linked_session_id: newOrderData.linkedSessionId,
      notes: newOrderData.notes,
      status: 'pending', // Default status
      total_amount: selectedProduct?.price || 0.00, // Use product price as total amount if available
    };
    
    createOrderMutation.mutate(orderPayload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Create New Order
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Search or Select Patient"
              value={newOrderData.patientId}
              onChange={handleModalPatientSelect}
              onSearch={handlePatientSearchInputChange}
              filterOption={false}
              loading={isLoadingPatients}
              options={patientOptions.map(p => ({
                value: p.id,
                label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `ID: ${p.id}`
              }))}
              notFoundContent={isLoadingPatients ? <Spinner /> : null}
              required
              disabled={initialPatientId !== null} // Disable if patient ID is provided
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication/Product *
            </label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Search or Select Product"
              value={newOrderData.productId}
              onChange={handleModalProductSelect}
              onSearch={handleProductSearchInputChange}
              filterOption={false}
              loading={isLoadingProducts}
              options={productOptions.map(p => ({
                value: p.id,
                label: p.name || p.title || p.product_name || `ID: ${p.id}`
              }))}
              notFoundContent={isLoadingProducts ? <Spinner /> : null}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy *
            </label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Select a pharmacy"
              value={newOrderData.pharmacyId}
              onChange={handleModalPharmacySelect}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              loading={isLoadingPharmacies}
              options={pharmacyOptions.map(ph => ({
                value: ph.id,
                label: ph.name || ph.pharmacy_name || `ID: ${ph.id}`
              }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Linked Session (Optional)
            </label>
            <Select
              allowClear // Allow unselecting
              style={{ width: '100%' }}
              placeholder="Select a session (optional)"
              value={newOrderData.linkedSessionId}
              onChange={handleModalSessionSelect}
              loading={isLoadingSessions}
              options={sessionOptions.map(s => ({
                value: s.id,
                // Create a meaningful label for the session
                label: `Session on ${new Date(s.scheduled_date).toLocaleDateString()} with ${s.patients?.first_name || 'Patient'} (${s.status})`
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              placeholder="Add any notes about this order..."
              value={newOrderData.notes}
              onChange={(e) => handleModalInputChange('notes', e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            onClick={handleCreateOrder}
            disabled={createOrderMutation.isLoading}
          >
            {createOrderMutation.isLoading ? <Spinner /> : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;
