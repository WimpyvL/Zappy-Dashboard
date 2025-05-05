import React, { useState, useMemo } from 'react'; // Removed unused useEffect, Added useMemo
import { Link } from 'react-router-dom';
import { Select } from 'antd'; // Import Ant Design Select
import { debounce } from 'lodash'; // Import debounce
import { toast } from 'react-toastify'; // Import toast
import {
  useOrders,
  useUpdateOrderStatus,
  useCreateOrder, // Import create hook
  useCreateOrderItem, // Import order item hook
} from '../../apis/orders/hooks';
import { useSessions } from '../../apis/sessions/hooks';
import { usePatients } from '../../apis/patients/hooks'; // Import patient hook
import { useProducts } from '../../apis/products/hooks'; // Import product hook
import { usePharmacies } from '../../apis/pharmacies/hooks'; // Import pharmacy hook
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TruckIcon,
  Calendar,
  Loader2,
} from 'lucide-react';

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

const StatusBadge = ({ status, holdReason }) => {
  // ... (StatusBadge component remains the same) ...
    if (status === 'shipped') {
    return (
      <div>
        {/* Use accent2 for shipped */}
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent2/10 text-accent2">
          <CheckCircle className="h-3 w-3 mr-1" />
          Shipped
        </span>
      </div>
    );
  } else if (status === 'processing') {
    return (
      <div>
        {/* Use accent3 for processing */}
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent3/10 text-accent3">
          <TruckIcon className="h-3 w-3 mr-1" />
          Processing
        </span>
      </div>
    );
  } else if (status === 'pending') {
    return (
      <div>
        {/* Use accent4 for pending */}
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent4/10 text-accent4">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
        {/* Use accent1 for hold reason */}
        {holdReason && (
          <p className="text-xs text-accent1 mt-1">{holdReason}</p>
        )}
      </div>
    );
  } else if (status === 'cancelled') {
    return (
      <div>
        {/* Keep gray for cancelled */}
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      </div>
    );
  }
  return null;
};

const Orders = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // State for the create order modal form
  const [newOrderData, setNewOrderData] = useState({
    patientId: null,
    productId: null, // Changed from medication
    pharmacyId: null,
    linkedSessionId: null,
    notes: '',
  });
  // const [_patientSearchInput, setPatientSearchInput] = useState(''); // Removed unused var
  const [debouncedPatientSearchTerm, setDebouncedPatientSearchTerm] = useState('');
  // const [_productSearchInput, setProductSearchInput] = useState(''); // Removed unused var
  const [debouncedProductSearchTerm, setDebouncedProductSearchTerm] = useState('');


  // Debounce handlers
  const debouncePatientSearch = useMemo(() => debounce(setDebouncedPatientSearchTerm, 500), []);
  const debounceProductSearch = useMemo(() => debounce(setDebouncedProductSearchTerm, 500), []);

  const handlePatientSearchInputChange = (value) => {
    // setPatientSearchInput(value); // Removed call to setter for unused state
    debouncePatientSearch(value);
  };
  const handleProductSearchInputChange = (value) => {
    // setProductSearchInput(value); // Removed call to setter for unused state
    debounceProductSearch(value);
  };

  // Fetch data using React Query hooks
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useOrders(1, {   // Added page number as first parameter
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined
  }, 100);  // Added pageSize parameter to fetch more results

  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useSessions(); // Fetch all sessions for linking (consider filtering if needed)

  // Fetch data for modal dropdowns
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(1, { search: debouncedPatientSearchTerm }, 100);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ search: debouncedProductSearchTerm }); // Assuming useProducts exists and supports search
  const { data: pharmaciesData, isLoading: isLoadingPharmacies } = usePharmacies(); // Assuming usePharmacies exists

  const patientOptions = patientsData?.data || [];
  const productOptions = productsData?.data || []; // Adapt based on useProducts response
  // Fix: pharmaciesData is already an array, no need to access .data property
  const pharmacyOptions = pharmaciesData || []; // Changed from pharmaciesData?.data || []
  const sessionOptions = sessionsData?.data || []; // Adapt based on useSessions response


  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus({
    onSuccess: () => {
      toast.success('Order status updated successfully');
      refetchOrders(); // Refetch orders list
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });

  const createOrderItemMutation = useCreateOrderItem({
    onSuccess: () => {
      // Order item created successfully
      refetchOrders(); // Refetch orders list to show updated data
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
       setShowCreateModal(false);
       setNewOrderData({ patientId: null, productId: null, pharmacyId: null, linkedSessionId: null, notes: '' }); // Reset form
       refetchOrders(); // Refetch orders list
     },
     onError: (error) => {
       toast.error(`Failed to create order: ${error.message}`);
     }
  });

  // Use fetched data or default empty arrays
  const allOrders = ordersData?.data || []; // Adapt based on API response structure

  // Filter orders (client-side filtering removed as server-side is implemented in hook)
  const filteredOrders = allOrders;

  // Group orders by status
  const pendingOrders = filteredOrders.filter((order) => order.status === 'pending');
  const processingOrders = filteredOrders.filter((order) => order.status === 'processing');
  const shippedOrders = filteredOrders.filter((order) => order.status === 'shipped');

  // Function to get the linked session for an order
  const getLinkedSession = (sessionId) => {
    if (!sessionId || !sessionOptions) return null;
    return sessionOptions.find((session) => session.id === sessionId);
  };

  // Handle order status update
  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Handle modal form input change
  const handleModalInputChange = (name, value) => {
    setNewOrderData(prev => ({ ...prev, [name]: value }));
  };

   // Handle modal patient selection
  const handleModalPatientSelect = (value) => {
    setNewOrderData(prev => ({ ...prev, patientId: value }));
    // Clear search terms after selection
    // setPatientSearchInput(''); // Removed call to setter for unused state
    setDebouncedPatientSearchTerm('');
  };

  // Handle modal product selection
  const handleModalProductSelect = (value) => {
    setNewOrderData(prev => ({ ...prev, productId: value }));
    // setProductSearchInput(''); // Removed call to setter for unused state
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
     const selectedPharmacy = pharmacyOptions.find(p => p.id === newOrderData.pharmacyId);
     
     // Map state to the structure expected by useCreateOrder hook
     const orderPayload = {
       patient_id: newOrderData.patientId,
       pharmacy_id: newOrderData.pharmacyId,
       linked_session_id: newOrderData.linkedSessionId,
       notes: newOrderData.notes,
       // Remove medication field as it doesn't exist in the orders table
       // pharmacy name is also removed as it's not in the schema
       status: 'pending', // Default status
       total_amount: selectedProduct?.price || 0.00, // Use product price as total amount if available
     };
     
     console.log("Creating order with payload:", orderPayload);
     createOrderMutation.mutate(orderPayload);
  };


  // Handle loading state
  if (isLoadingOrders || isLoadingSessions) { // Add other loading states if needed
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (errorOrders || errorSessions) { // Add other error states
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading order or session data.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden pb-10">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* Alerts */}
      {/* ... (Alerts remain the same) ... */}
       {pendingOrders.some(
        (order) => order.holdReason === 'Awaiting follow-up appointment'
      ) && (
        <div className="bg-accent4/5 border-l-4 border-accent4 p-4 mb-6 rounded shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-accent4" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-accent4/80">
                <span className="font-medium text-accent4">
                  {
                    pendingOrders.filter(
                      (order) =>
                        order.holdReason === 'Awaiting follow-up appointment'
                    ).length
                  }{' '}
                  orders on hold
                </span>{' '}
                due to missed follow-up appointments.
              </p>
            </div>
            <div className="ml-auto">
              {/* Use accent4 for link */}
              <Link
                to="/sessions"
                className="text-sm font-medium text-accent4 underline hover:text-accent4/80"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </div>
      )}


      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by patient or medication..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Pending Orders Table */}
      {/* ... (Table structure remains the same, but data comes from filteredOrders) ... */}
       <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingOrders.length > 0 ? (
                pendingOrders
                  .sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
                  .map((order) => {
                    const linkedSession = getLinkedSession(order.linked_session_id);
                    const isProcessing = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id && updateOrderStatusMutation.variables?.status === 'processing';
                    const isCancelling = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id && updateOrderStatusMutation.variables?.status === 'cancelled';
                    const isMutating = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/patients/${order.patient_id}`} className="hover:text-primary">{order.patientName || 'N/A'}</Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.medication || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} holdReason={order.hold_reason} /></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {linkedSession ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className={`text-xs ${linkedSession.status === 'completed' ? 'text-green-600' : linkedSession.status === 'scheduled' ? 'text-blue-600' : 'text-red-600'}`}>
                                {new Date(linkedSession.scheduled_date).toLocaleDateString()} – {linkedSession.status}
                              </span>
                            </div>
                          ) : (<span className="text-xs text-gray-500">No session linked</span>)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.pharmacy || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleStatusUpdate(order.id, 'processing')} className={`text-accent3 hover:text-accent3/80 mr-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={order.hold_reason === 'Awaiting follow-up appointment' || isMutating}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> : null} Process
                          </button>
                          <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className={`text-accent1 hover:text-accent1/80 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isMutating}>
                            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> : null} Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No pending orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Orders Table */}
      {/* ... (Similar structure as Pending Orders) ... */}
       <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-medium text-gray-900">Processing Orders</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processingOrders.length > 0 ? (
                processingOrders.sort((a, b) => new Date(a.order_date) - new Date(b.order_date)).map((order) => {
                  const isShipping = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id && updateOrderStatusMutation.variables?.status === 'shipped';
                  const isCancelling = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id && updateOrderStatusMutation.variables?.status === 'cancelled';
                  const isMutating = updateOrderStatusMutation.isLoading && updateOrderStatusMutation.variables?.orderId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900"><Link to={`/patients/${order.patient_id}`} className="hover:text-primary">{order.patientName || 'N/A'}</Link></div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.medication || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.pharmacy || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleStatusUpdate(order.id, 'shipped')} className={`text-accent2 hover:text-accent2/80 mr-3 ${isShipping ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isMutating}>
                          {isShipping ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> : null} Mark as Shipped
                        </button>
                        <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className={`text-accent1 hover:text-accent1/80 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isMutating}>
                          {isCancelling ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> : null} Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No processing orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipped Orders Table */}
      {/* ... (Table structure remains the same) ... */}
       <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-medium text-gray-900">Recent Shipped Orders</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippedOrders.length > 0 ? (
                shippedOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date)).slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900"><Link to={`/patients/${order.patient_id}`} className="hover:text-primary">{order.patientName || 'N/A'}</Link></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.medication || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tracking_number ? (<a href={`https://tracking.example.com/${order.tracking_number}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">{order.tracking_number}</a>) : ('Not available')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.estimated_delivery || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.pharmacy || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No shipped orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Order
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowCreateModal(false)}
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
                  name="notes" // Added name attribute
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
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                onClick={handleCreateOrder} // Use the correct handler
                disabled={createOrderMutation.isLoading} // Disable while creating
              >
                {createOrderMutation.isLoading ? <Spinner /> : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
