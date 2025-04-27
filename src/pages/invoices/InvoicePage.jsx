import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select } from 'antd';
import { usePatients } from '../../apis/patients/hooks';
import { useInvoices, useCreateInvoice } from '../../apis/invoices/hooks';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element
import { toast } from 'react-toastify'; // Import toast for potential errors

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// SVG icons (keep as is, or replace with Lucide if preferred)
const PlusIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const SortIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

const InvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  // State for new invoice modal, including line items and patientId
  const [newInvoice, setNewInvoice] = useState({
    patientId: null, // Changed from name
    email: '',
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: '' }],
  });
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  // Fetch Patients for dropdown
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients();
  const allPatients = patientsData?.data || [];

  // Fetch invoices using hook
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices();
  const invoices = invoicesData?.data || [];
  const loading = isLoadingInvoices;

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter invoices
  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];
    if (searchTerm) {
      sortableInvoices = sortableInvoices.filter(
        (invoice) =>
          invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      sortableInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, searchTerm, sortConfig]);

  // --- New Invoice Modal Handlers ---

  useEffect(() => {
    const total = newInvoice.lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + quantity * price;
    }, 0);
    setInvoiceTotal(total);
  }, [newInvoice.lineItems]);

  // Handle general input changes (email, dueDate)
  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice((prev) => ({ ...prev, [name]: value }));
  };

  // Handle patient selection
  const handlePatientSelect = (value) => {
    const selectedPatient = allPatients.find(p => p.id === value);
    setNewInvoice(prev => ({
      ...prev,
      patientId: value,
      email: selectedPatient?.email || '', // Auto-fill email
      // Keep name field for display in table for now, or remove if not needed
      name: selectedPatient ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() : '',
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setNewInvoice((prev) => {
      const updatedLineItems = [...prev.lineItems];
      updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
      return { ...prev, lineItems: updatedLineItems };
    });
  };

  const addLineItem = () => {
    setNewInvoice((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, unitPrice: '' },
      ],
    }));
  };

  const removeLineItem = (index) => {
    if (newInvoice.lineItems.length <= 1) return;
    setNewInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  // Create invoice mutation
  const createInvoiceMutation = useCreateInvoice({
    onSuccess: () => {
      setNewInvoice({
        patientId: null,
        email: '',
        dueDate: '',
        lineItems: [{ description: '', quantity: 1, unitPrice: '' }],
      });
      setShowCreateModal(false);
    }
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.patientId) {
      toast.error("Please select a patient.");
      return;
    }
    
    const submissionData = {
      patientId: newInvoice.patientId,
      status: 'pending',
      items: newInvoice.lineItems
        .filter(item => item.description && item.unitPrice)
        .map(item => ({
          name: item.description,
          quantity: item.quantity,
          price: item.unitPrice
        })),
      amount: invoiceTotal,
      dueDate: newInvoice.dueDate || null
    };
    
    createInvoiceMutation.mutate(submissionData);
  };

  return (
    <div className="relative overflow-hidden pb-10">
      <ChildishDrawingElement type="watercolor" color="accent3" position="top-right" size={100} rotation={-15} opacity={0.1} />
      <ChildishDrawingElement type="doodle" color="accent1" position="bottom-left" size={110} rotation={5} opacity={0.1} />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search invoices by name, email, or ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {/* ... table headers ... */}
               <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created At
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('invoiceId')}
                >
                  <div className="flex items-center">
                    Invoice ID
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount_paid')}
                >
                  <div className="flex items-center">
                    Paid ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Due ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('refunded_amount')}
                >
                  <div className="flex items-center">
                    Refunded ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('payment_date')}
                >
                  <div className="flex items-center">
                    Payment Date
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('refunded')}
                >
                  <div className="flex items-center">
                    Refunded
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Updated At
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="14" className="px-6 py-4 text-center">
                    <Spinner />
                    <span className="ml-2">Loading invoices...</span>
                  </td>
                </tr>
              ) : sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {invoice.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.invoiceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                          invoice.status === 'paid'
                              ? 'bg-accent2/10 text-accent2'
                              : invoice.status === 'pending'
                                ? 'bg-accent4/10 text-accent4'
                                : invoice.status === 'refunded'
                                  ? 'bg-accent3/10 text-accent3'
                                  : invoice.status === 'partially_paid'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-accent1/10 text-accent1'
                          }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.amount_paid?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(invoice.amount - (invoice.amount_paid || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.refunded_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.payment_date
                        ? formatDate(invoice.payment_date)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.refunded ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          View
                        </Link>
                        {invoice.status === 'pending' && (
                          <button className="text-accent2 hover:text-accent2/80">
                            Pay
                          </button>
                        )}
                        {(invoice.status === 'paid' ||
                          invoice.status === 'partially_paid') &&
                          !invoice.refunded && (
                            <button className="text-accent3 hover:text-accent3/80">
                              Refund
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="14"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Invoice
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowCreateModal(false)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Search or Select Patient"
                    optionFilterProp="children"
                    value={newInvoice.patientId} // Bind value to patientId
                    onChange={handlePatientSelect} // Use updated handler
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    loading={isLoadingPatients}
                    options={allPatients.map(p => ({
                      value: p.id,
                      label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `ID: ${p.id}`
                    }))}
                    required // Add required attribute if needed by form validation
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newInvoice.email} // Value is now set by handlePatientSelect
                    onChange={handleGeneralInputChange} // Keep for manual edits if needed
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                {/* Line Items Section */}
                <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Line Items
                   </label>
                   {newInvoice.lineItems.map((item, index) => (
                     <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md">
                       <input
                         type="text"
                         placeholder="Description"
                         value={item.description}
                         onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                         className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                         required={index === 0} // Only first line required description
                       />
                       <input
                         type="number"
                         placeholder="Qty"
                         min="1"
                         value={item.quantity}
                         onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                         className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                         required
                       />
                       <input
                         type="number"
                         placeholder="Unit Price"
                         min="0.01"
                         step="0.01"
                         value={item.unitPrice}
                         onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                         className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                         required={index === 0} // Only first line required price
                       />
                       {/* Use accent1 for remove button */}
                       <button
                         type="button"
                         onClick={() => removeLineItem(index)}
                         className={`text-accent1 hover:text-accent1/80 p-1 ${newInvoice.lineItems.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                         disabled={newInvoice.lineItems.length <= 1}
                       >
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                     </div>
                   ))}
                   {/* Use primary color for Add Line Item button */}
                   <button
                     type="button"
                     onClick={addLineItem}
                     className="text-sm text-primary hover:text-primary/80 flex items-center"
                   >
                     <PlusIcon className="h-4 w-4 mr-1" /> Add Line Item
                   </button>
                 </div>

                 {/* Total Amount Display */}
                 <div className="text-right font-medium">
                   Total: ${invoiceTotal.toFixed(2)}
                 </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newInvoice.dueDate}
                    onChange={handleGeneralInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
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
                {/* Use primary color for Create Invoice button */}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
