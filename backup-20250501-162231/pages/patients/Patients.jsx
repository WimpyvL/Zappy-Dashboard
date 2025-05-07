import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import {
  Search,
  Filter,
  Plus,
  X,
  Edit, // Import Edit icon
  // MoreHorizontal, // Removed unused icon
  Calendar,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
// import PatientModal from './PatientModal'; // Removed old modal import
import CrudModal from '../../components/common/CrudModal'; // Import the new generic modal
import { usePatients, useCreatePatient, useUpdatePatient } from '../../apis/patients/hooks'; // Import mutation hooks
import patientsApi from '../../apis/patients/api'; // Import the api adapter for fetchById
import { useTags } from '../../apis/tags/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks'; // Import the correct hook

// Removed unused StatusBadge component definition

// Define form fields configuration for the Patient entity
const patientFormFields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: 'First name is required.', gridCols: 1 },
  { name: 'last_name', label: 'Last Name', type: 'text', required: 'Last name is required.', gridCols: 1 },
  { name: 'email', label: 'Email', type: 'email', required: 'A valid email is required.', validation: { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } }, gridCols: 2 },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '(XXX) XXX-XXXX', gridCols: 2 },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date', gridCols: 1 },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'active', // Default status
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'blacklisted', label: 'Blacklisted' },
      { value: 'pending', label: 'Pending' },
    ],
    gridCols: 1,
  },
  { name: 'address', label: 'Street Address', type: 'text', gridCols: 2 },
  { name: 'city', label: 'City', type: 'text', gridCols: 1 },
  { name: 'state', label: 'State', type: 'text', gridCols: 1 },
  { name: 'zip', label: 'ZIP Code', type: 'text', gridCols: 1 },
  // Add other fields as needed based on patients schema and modal requirements
];


const Patients = () => {
  // Get subscription plans from context for the filter dropdown
  // Assuming subscriptionPlans are fetched elsewhere or via another hook if needed globally
  // If only needed here, consider fetching within this component.
  // For now, using a placeholder or assuming it comes from a broader context setup.
  const { data: allSubscriptionPlans = [] } = useSubscriptionPlans(); // Remove useAppContext and use the hook instead

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [affiliateFilter, setAffiliateFilter] = useState('all'); // Keep if needed, though not displayed
  const [tagFilter, setTagFilter] = useState('all');
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState('all'); // New filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchType, setSearchType] = useState('name'); // name, email, phone, order
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation(); // Get location object

  // --- Read search term from URL on initial load ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearchTerm = queryParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      // Optional: Clear the search param from URL after reading?
      // window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search]); // Re-run if search params change

  // --- Use React Query Hooks ---
  // Include searchTerm from state in filters passed to the hook
  const filtersForHook = {
    search: searchTerm || undefined,
    // search_by: searchTerm ? searchType : undefined, // search_by filter not implemented in usePatients hook yet
    status: statusFilter !== 'all' ? statusFilter : undefined,
    tag_id: tagFilter !== 'all' ? tagFilter : undefined,
    is_affiliate:
      affiliateFilter !== 'all' ? affiliateFilter === 'yes' : undefined,
  };

  const {
    data: patientsData,
    isLoading: loading,
    error,
    refetch: fetchPatients,
  } = usePatients(currentPage, filtersForHook); // Pass only supported filters

  const { data: tagsData } = useTags();

  // Extract data from hook responses
  const rawPatients = patientsData?.data || []; // Get raw data from hook
  // Corrected default meta structure and property names
  const paginationMeta = patientsData?.meta || { total: 0, total_pages: 1, current_page: 1, per_page: 10 };
  const paginationLinks = patientsData?.links || { first: null, last: null, next: null, prev: null };
  const tags = tagsData?.data || [];
  // --- End Hook Usage ---

  // --- Client-side filtering for Subscription Plan ---
  const patients = rawPatients.filter(patient => {
    if (subscriptionPlanFilter === 'all') return true;
    if (subscriptionPlanFilter === 'none') return !patient.subscriptionPlanName;
    return patient.subscriptionPlanName === subscriptionPlanFilter;
  });
  // --- End Client-side filtering ---

  // Selected patients and modals
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Effect to show/hide bulk actions based on selection
  useEffect(() => {
    setShowBulkActions(selectedPatients.length > 0);
  }, [selectedPatients]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > paginationMeta.total_pages) return;
    setCurrentPage(page);
  };

  // Extract page number from URL
  const getPageFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Go to specific pagination link
  const goToLink = (linkType) => {
    const link = paginationLinks[linkType];
    if (!link) return;

    const page = getPageFromUrl(link);
    if (page) {
      handlePageChange(page);
    }
  };

  // Handle patient selection for bulk actions
  const handlePatientSelection = (patientId) => {
    if (selectedPatients.includes(patientId)) {
      setSelectedPatients(selectedPatients.filter((id) => id !== patientId));
    } else {
      setSelectedPatients([...selectedPatients, patientId]);
    }
  };

  // Check if all patients are selected (adjust for client-side filtered list)
  const allSelected =
    patients.length > 0 &&
    patients.every((patient) => selectedPatients.includes(patient.id));

  // Toggle select all (adjust for client-side filtered list)
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((patient) => patient.id));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAffiliateFilter('all');
    setTagFilter('all');
    setSubscriptionPlanFilter('all');
    setSearchType('name');
    setCurrentPage(1);
    fetchPatients(); // Refetch with default filters
  };

  // Handle opening the modal for editing
  const handleEditClick = (patient) => {
    setEditingPatientId(patient.id);
    setShowEditModal(true); // Keep this to trigger the modal visibility
  };

  // Handle closing the modal (for both add and edit)
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingPatientId(null);
  };

  // Generate pagination controls
  const renderPagination = () => {
     if (paginationMeta.total_pages <= 1) return null;

    let pages = [];
    const totalPages = paginationMeta.total_pages;
    const currentPage = paginationMeta.current_page;

    if (totalPages <= 5) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => goToLink('prev')}
          disabled={!paginationLinks.prev}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            paginationLinks.prev ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft className="h-5 w-5" />
        </button>
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => goToLink('next')}
          disabled={!paginationLinks.next}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            paginationLinks.next ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // Get unique subscription plan names for the filter dropdown
  const uniquePlanNames = Array.from(new Set(allSubscriptionPlans.map(plan => plan.name).filter(Boolean)));

  return (
    <div>
      {/* Header and Bulk Actions */}
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <div className="flex space-x-3">
          {showBulkActions && (
            <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-3">
                {selectedPatients.length} selected
              </span>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium mx-2 flex items-center">
                <Ban className="h-4 w-4 mr-1" /> Suspend
              </button>
              <button className="text-green-600 hover:text-green-900 text-sm font-medium mx-2 flex items-center">
                <UserCheck className="h-4 w-4 mr-1" /> Activate
              </button>
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mx-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Schedule Follow-up
              </button>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedPatients([])}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={() => { setEditingPatientId(null); setShowAddModal(true); }} // Clear editing ID for Add
          >
            <Plus className="h-5 w-5 mr-2" /> Add Patient
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
           <div className="flex-1 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="text"
               placeholder={`Search patients by ${searchType}...`}
               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center space-x-2">
             <select
               className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
               value={searchType}
               onChange={(e) => setSearchType(e.target.value)}
             >
               <option value="name">Name</option>
               <option value="email">Email</option>
               <option value="phone">Phone</option>
               <option value="order">Order #</option>
             </select>
           </div>
           <div className="flex items-center space-x-2">
             <Filter className="h-5 w-5 text-gray-400" />
             <select
               className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">All Statuses</option>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
               <option value="suspended">Suspended</option>
               <option value="blacklisted">Blacklisted</option>
               <option value="pending">Pending</option>
             </select>
           </div>
           <button
             className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
             onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
           >
             {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
           </button>
         </div>

        {showAdvancedFilters && (
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Tag:</span>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-500">Plan:</span>
               <select
                 className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                 value={subscriptionPlanFilter}
                 onChange={(e) => setSubscriptionPlanFilter(e.target.value)}
               >
                 <option value="all">All Plans</option>
                 {uniquePlanNames.map((planName) => (
                   <option key={planName} value={planName}>{planName}</option>
                 ))}
                 <option value="none">No Plan</option>
               </select>
             </div>
            <div className="flex items-center space-x-2 ml-auto">
              <button
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="pl-6 py-3 text-left" scope="col">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={allSelected} onChange={toggleSelectAll} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Appointment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                     <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></div>
                    <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-red-500">Error loading patients: {error.message || 'Unknown error'}</td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="pl-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={selectedPatients.includes(patient.id)} onChange={() => handlePatientSelection(patient.id)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <Link to={`/patients/${patient.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline">
                            {/* Use correct first_name and last_name properties */}
                            {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unnamed Patient'}
                          </Link>
                          <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                          <div className="text-sm text-gray-500">{patient.mobile_phone || patient.phone || 'No phone'}</div> {/* Prefer mobile_phone if exists */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {/* Use patient.related_tags based on schema */}
                        {Array.isArray(patient.related_tags) && patient.related_tags.length > 0 ? (
                          patient.related_tags.map((tagId) => {
                             const tag = tags.find(t => t.id === tagId);
                             return tag ? (<span key={tag.id} className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{tag.name}</span>) : null;
                           })
                        ) : (<span className="text-xs text-gray-400">No Tags</span>)}
                      </div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {patient.subscriptionPlanName || (<span className="text-xs text-gray-400">None</span>)}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.next_session_date ? new Date(patient.next_session_date).toLocaleDateString() : 'None scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end">
                        <button onClick={() => handleEditClick(patient)} className="text-gray-500 hover:text-indigo-600" title="Edit Patient">
                           <Edit className="h-4 w-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No patients found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
         <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!paginationLinks.prev ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => goToLink('prev')}
              disabled={!paginationLinks.prev}
            >Previous</button>
            <button
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!paginationLinks.next ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => goToLink('next')}
              disabled={!paginationLinks.next}
            >Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{paginationMeta.total > 0 ? ((paginationMeta.current_page - 1) * paginationMeta.per_page) + 1 : 0}</span>{' '}
                to <span className="font-medium">{Math.min(paginationMeta.current_page * paginationMeta.per_page, paginationMeta.total)}</span>{' '} {/* Use total */}
                of <span className="font-medium">{paginationMeta.total || 0}</span> results {/* Use total */}
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {renderPagination()}
            </nav>
          </div>
        </div>
      </div>

      {/* Generic CRUD Modal for Add/Edit */}
      {(showAddModal || showEditModal) && (
        <CrudModal
          isOpen={showAddModal || showEditModal}
          onClose={handleCloseModal}
          entityId={editingPatientId} // Pass null for add, ID for edit
          resourceName="Patient"
          fetchById={patientsApi.getById} // Pass the fetch function
          useCreateHook={useCreatePatient} // Pass the create hook
          useUpdateHook={useUpdatePatient} // Pass the update hook
          formFields={patientFormFields} // Pass the field configuration
          onSuccess={() => {
            handleCloseModal();
            fetchPatients(); // Refetch the list on success
          }}
          formGridCols={2} // Example: Use 2 columns for the patient form
        />
      )}
    </div>
  );
};

export default Patients;
