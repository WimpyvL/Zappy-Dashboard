import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoiceById, useUpdateInvoice } from '../../apis/invoices/hooks';
import { toast } from 'react-toastify';
import { ArrowLeft, Printer, Download, Edit, CreditCard } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EditInvoiceModal from '../../components/invoices/EditInvoiceModal';

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

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Fetch invoice data
  const { data: invoiceData, isLoading, error } = useInvoiceById(id);
  const invoice = invoiceData?.data;
  
  // Update invoice mutation
  const updateInvoiceMutation = useUpdateInvoice({
    onSuccess: () => {
      toast.success('Invoice updated successfully');
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    }
  });
  
  // Handle payment status update
  const handleStatusUpdate = (newStatus) => {
    if (!invoice) return;
    
    const updatedInvoice = {
      id: invoice.id,
      updates: {
        status: newStatus,
        updated_at: new Date().toISOString()
      }
    };
    
    updateInvoiceMutation.mutate(updatedInvoice);
  };
  
  // Handle print invoice
  const handlePrint = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-lg font-medium text-red-800">Error loading invoice</h2>
        <p className="text-red-700 mt-1">{error?.message || 'Invoice not found'}</p>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Back to Invoices
        </button>
      </div>
    );
  }
  
  // Extract invoice details
  const {
    created_at,
    due_date,
    status,
    amount,
    amount_paid = 0,
    discount_amount = 0,
    tax_rate = 0,
    pb_invoice_metadata
  } = invoice;
  
  const patientName = invoice.patientName || pb_invoice_metadata?.patient_name || 'Unknown';
  const items = pb_invoice_metadata?.items || [];
  const invoiceNumber = pb_invoice_metadata?.invoice_id || invoice.id?.substring(0, 8);
  
  // Get discount amount from either direct field or metadata
  const discountAmount = typeof discount_amount === 'number' ? discount_amount : 
                       (typeof pb_invoice_metadata?.discount_amount === 'number' ? 
                        pb_invoice_metadata.discount_amount : 0);
  
  // Get tax rate from either direct field or metadata
  const taxRateValue = typeof tax_rate === 'number' ? tax_rate : 
                     (typeof pb_invoice_metadata?.tax_rate === 'number' ? 
                      pb_invoice_metadata.tax_rate : 0);
  
  // Calculate subtotal from line items
  const lineItemsTotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + (quantity * price);
  }, 0);
  
  // Use the calculated total from line items, not the amount from the database
  const subtotal = lineItemsTotal;
  
  // Calculate amount after discount
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  
  // Calculate tax amount
  const taxAmount = afterDiscount * (taxRateValue / 100);
  
  // Calculate total
  const total = afterDiscount + taxAmount;
  
  // Calculate due amount
  const dueAmount = total - (typeof amount_paid === 'number' ? amount_paid : 0);
  
  return (
    <div className="relative pb-10">
      {/* Print-specific styles */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 10mm; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background-color: white; }
        `}
      </style>
      
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Invoices
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print
          </button>
          <button
            onClick={() => {/* Download functionality */}}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit
          </button>
          {status === 'pending' && (
            <button
              onClick={() => {/* Process payment */}}
              className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Process Payment
            </button>
          )}
        </div>
      </div>
      
      {/* Invoice document */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-8">
        {/* Invoice header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
            <p className="text-gray-600 mt-1">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <img src="/logo192.png" alt="Company Logo" className="h-12 mb-2" />
            <p className="font-bold">Zappy Health</p>
            <p className="text-gray-600">123 Medical Plaza</p>
            <p className="text-gray-600">San Francisco, CA 94103</p>
          </div>
        </div>
        
        {/* Invoice details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h2>
            <p className="font-medium">{patientName}</p>
            <p className="text-gray-600">{pb_invoice_metadata?.patient_email || ''}</p>
            <p className="text-gray-600">{pb_invoice_metadata?.patient_address || ''}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-600">Invoice Date:</span>
              <span className="font-medium ml-2">{formatDate(created_at)}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium ml-2">{formatDate(due_date)}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span
                className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${
                    status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'refunded'
                          ? 'bg-blue-100 text-blue-800'
                          : status === 'partially_paid'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-red-100 text-red-800'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Line items */}
        <div className="mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name || 'Item'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${parseFloat(item.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${((parseFloat(item.quantity) || 1) * (parseFloat(item.price) || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b text-green-600">
              <span>Discount:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            
            {taxRateValue > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span>Tax ({taxRateValue}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            {amount_paid > 0 && (
              <div className="flex justify-between py-2 border-b text-green-600">
                <span>Amount Paid:</span>
                <span>${amount_paid.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>Balance Due:</span>
              <span>${dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {pb_invoice_metadata?.notes && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-600">{pb_invoice_metadata.notes}</p>
          </div>
        )}
        
        {/* Payment instructions */}
        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Payment Instructions</h3>
          <p className="text-gray-600">
            Please make payment by the due date. For questions about this invoice, please contact billing@zappyhealth.com.
          </p>
        </div>
      </div>
      
      {/* Edit Invoice Modal */}
      {showEditModal && (
        <EditInvoiceModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
          invoice={invoice}
        />
      )}
    </div>
  );
};

export default InvoiceDetailPage;
