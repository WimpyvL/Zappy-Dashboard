import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Custom Spinner component for loading states
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// SVG icons
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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    name: "",
    email: "",
    amount: "",
    dueDate: "",
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    const fetchInvoices = async () => {
      try {
        // Simulating delay for API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockInvoices = [
          {
            id: "INV-001",
            createdAt: "2025-02-15T10:30:00",
            name: "John Doe",
            email: "john@example.com",
            invoiceId: "INV-001",
            status: "Paid",
            invoiceAmount: 299.99,
            amountPaid: 299.99,
            dueAmount: 0,
            refundedAmount: 0,
            paymentDate: "2025-02-20T14:00:00",
            refunded: false,
            updatedAt: "2025-02-20T14:00:00",
          },
          {
            id: "INV-002",
            createdAt: "2025-02-10T09:15:00",
            name: "Jane Smith",
            email: "jane@example.com",
            invoiceId: "INV-002",
            status: "Pending",
            invoiceAmount: 199.99,
            amountPaid: 0,
            dueAmount: 199.99,
            refundedAmount: 0,
            paymentDate: null,
            refunded: false,
            updatedAt: "2025-02-10T09:15:00",
          },
          {
            id: "INV-003",
            createdAt: "2025-01-25T15:45:00",
            name: "Robert Johnson",
            email: "robert@example.com",
            invoiceId: "INV-003",
            status: "Refunded",
            invoiceAmount: 399.99,
            amountPaid: 399.99,
            dueAmount: 0,
            refundedAmount: 399.99,
            paymentDate: "2025-01-28T11:30:00",
            refunded: true,
            updatedAt: "2025-02-05T16:20:00",
          },
          {
            id: "INV-004",
            createdAt: "2025-01-20T13:10:00",
            name: "Sarah Williams",
            email: "sarah@example.com",
            invoiceId: "INV-004",
            status: "Partially Paid",
            invoiceAmount: 599.99,
            amountPaid: 300.0,
            dueAmount: 299.99,
            refundedAmount: 0,
            paymentDate: "2025-01-25T10:15:00",
            refunded: false,
            updatedAt: "2025-01-25T10:15:00",
          },
          {
            id: "INV-005",
            createdAt: "2025-01-15T11:20:00",
            name: "Michael Brown",
            email: "michael@example.com",
            invoiceId: "INV-005",
            status: "Cancelled",
            invoiceAmount: 499.99,
            amountPaid: 0,
            dueAmount: 0,
            refundedAmount: 0,
            paymentDate: null,
            refunded: false,
            updatedAt: "2025-01-18T09:30:00",
          },
        ];

        setInvoices(mockInvoices);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter invoices
  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];

    // Filter based on search term
    if (searchTerm) {
      sortableInvoices = sortableInvoices.filter(
        (invoice) =>
          invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      sortableInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, searchTerm, sortConfig]);

  // Handle input change for new invoice
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };

  // Handle create invoice
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    console.log("Creating invoice:", newInvoice);

    // Create a new invoice object
    const newInvoiceObj = {
      id: `INV-00${invoices.length + 1}`,
      createdAt: new Date().toISOString(),
      name: newInvoice.name,
      email: newInvoice.email,
      invoiceId: `INV-00${invoices.length + 1}`,
      status: "Pending",
      invoiceAmount: parseFloat(newInvoice.amount),
      amountPaid: 0,
      dueAmount: parseFloat(newInvoice.amount),
      refundedAmount: 0,
      paymentDate: null,
      refunded: false,
      updatedAt: new Date().toISOString(),
    };

    // Add to invoices list
    setInvoices([newInvoiceObj, ...invoices]);

    // Reset form and close modal
    setNewInvoice({
      name: "",
      email: "",
      amount: "",
      dueDate: "",
    });
    setShowCreateModal(false);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search invoices by name, email, or ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created At
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("email")}
                >
                  <div className="flex items-center">
                    Email
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("invoiceId")}
                >
                  <div className="flex items-center">
                    Invoice ID
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("invoiceAmount")}
                >
                  <div className="flex items-center">
                    Invoice Amount ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("amountPaid")}
                >
                  <div className="flex items-center">
                    Amount Paid ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("dueAmount")}
                >
                  <div className="flex items-center">
                    Due Amount ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("refundedAmount")}
                >
                  <div className="flex items-center">
                    Refunded Amount ($)
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("paymentDate")}
                >
                  <div className="flex items-center">
                    Payment Date
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("refunded")}
                >
                  <div className="flex items-center">
                    Refunded
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("updatedAt")}
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
                      {formatDate(invoice.createdAt)}
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
                            invoice.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : invoice.status === "Refunded"
                              ? "bg-blue-100 text-blue-800"
                              : invoice.status === "Partially Paid"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.invoiceAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.amountPaid.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.dueAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.refundedAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.paymentDate
                        ? formatDate(invoice.paymentDate)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.refunded ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
                        {invoice.status === "Pending" && (
                          <button className="text-green-600 hover:text-green-900">
                            Pay
                          </button>
                        )}
                        {(invoice.status === "Paid" ||
                          invoice.status === "Partially Paid") &&
                          !invoice.refunded && (
                            <button className="text-blue-600 hover:text-blue-900">
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
                  <input
                    type="text"
                    name="name"
                    value={newInvoice.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newInvoice.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newInvoice.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
