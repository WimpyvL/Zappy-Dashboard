import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  X,
  MoreHorizontal,
  Calendar,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PatientModal from "./PatientModal";
// Remove apiService import
// import apiService from "../../utils/apiService";
import { usePatients } from "../../apis/patients/hooks"; // Import patient hooks
import { useTags } from "../../apis/tags/hooks"; // Import tag hooks
import { useMemo } from "react"; // Import useMemo for filters object
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

const StatusBadge = ({ status }) => {
  // Make status check case-insensitive and handle null/undefined
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === "active") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  } else if (lowerStatus === "inactive") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  } else if (lowerStatus === "suspended") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Suspended
      </span>
    );
  } else if (lowerStatus === "pending") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  } else if (lowerStatus === "blacklisted") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-black text-white">
        Blacklisted
      </span>
    );
  }
  return null;
};

const AffiliateTag = ({ isAffiliate }) => {
  if (isAffiliate) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        Affiliate
      </span>
    );
  }
  return null;
};

const Patients = () => {
  const queryClient = useQueryClient(); // Initialize query client
  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); // name, email, phone
  const [statusFilter, setStatusFilter] = useState("all");
  // const [affiliateFilter, setAffiliateFilter] = useState("all"); // Assuming affiliate status is on patient record now
  const [tagFilter, setTagFilter] = useState("all"); // Keep tag filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selected patients and modals state (keep as is)
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Data Fetching with React Query Hooks ---

  // Memoize filters object to prevent unnecessary refetches
  const filters = useMemo(() => {
    const activeFilters = {};
    if (searchTerm && searchType === 'name') { // Adapt search based on type
        activeFilters.name = searchTerm; // Assumes API handles partial match
    }
    if (searchTerm && searchType === 'email') {
        activeFilters.email = searchTerm; // Assumes API handles partial match
    }
     if (searchTerm && searchType === 'phone') {
        activeFilters.phone = searchTerm; // Assumes API handles partial match
    }
    if (statusFilter !== "all") {
      activeFilters.status = statusFilter;
    }
    if (tagFilter !== "all") {
      activeFilters.tag_id = tagFilter; // Assuming API filters by tag ID
    }
    // Add affiliate filter if needed, e.g., activeFilters.is_affiliate = affiliateFilter === 'yes';
    return activeFilters;
  }, [searchTerm, searchType, statusFilter, tagFilter /*, affiliateFilter*/]);

  // Fetch Patients using usePatients hook
  const {
    data: patientsData, // Rename data to avoid conflict
    isLoading: patientsLoading,
    error: patientsError,
    isFetching: patientsIsFetching, // Use isFetching for loading indicators during refetch
  } = usePatients(currentPage, filters);

  // Extract patients array and pagination info
  const patients = patientsData?.data || [];
  const pagination = patientsData?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 }; // Provide default

  // Fetch Tags using useTags hook
  const { data: tags = [], isLoading: tagsLoading, error: tagsError } = useTags(); // Default tags to empty array

  // Remove old fetch functions: fetchPatients, fetchTags
  // Remove old useEffects that called fetchPatients/fetchTags

   // Effect to show/hide bulk actions based on selection (keep as is)
  useEffect(() => {
    setShowBulkActions(selectedPatients.length > 0);
  }, [selectedPatients]);

  // Handle page change - directly set the currentPage state
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Remove getPageFromUrl and goToLink as pagination is now handled differently

  // Handle patient selection for bulk actions
  const handlePatientSelection = (patientId) => {
    if (selectedPatients.includes(patientId)) {
      setSelectedPatients(selectedPatients.filter((id) => id !== patientId));
    } else {
      setSelectedPatients([...selectedPatients, patientId]);
    }
  };

  // Check if all patients are selected
  const allSelected =
    patients.length > 0 &&
    patients.every((patient) => selectedPatients.includes(patient.id));

  // Toggle select all
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((patient) => patient.id));
    }
  };

  // Reset filters - ensure currentPage is reset
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    // setAffiliateFilter("all"); // Remove if affiliate filter state is removed
    setTagFilter("all");
    setSearchType("name");
    setCurrentPage(1); // Reset to page 1
  };

  // Generate pagination controls using data from usePatients hook
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    let pages = [];
    const totalPages = pagination.totalPages;
    // Use currentPage state variable which drives the query
    // const currentPage = pagination.currentPage; // This reflects the data's page, not necessarily the requested one if fetching

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      pages.push(1);

      // Add ellipsis if needed
      if (currentPage > 3) {
        pages.push("...");
      }

      // Add pages around current
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Add last page if not already included
      if (totalPages > 1 && !pages.includes(totalPages)) { // Check if already included
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage > 1
              ? "text-gray-500 hover:bg-gray-50"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage < totalPages
              ? "text-gray-500 hover:bg-gray-50"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <div className="flex space-x-3">
          {showBulkActions && (
            <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-3">
                {selectedPatients.length} selected
              </span>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium mx-2 flex items-center">
                <Ban className="h-4 w-4 mr-1" />
                Suspend
              </button>
              <button className="text-green-600 hover:text-green-900 text-sm font-medium mx-2 flex items-center">
                <UserCheck className="h-4 w-4 mr-1" />
                Activate
              </button>
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mx-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Follow-up
              </button>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedPatients([])}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Patient
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
            {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 pt-4 border-t border-gray-200">
            {/* Affiliate Filter Removed - Add back if needed based on patient data */}
            {/* <div className="flex items-center space-x-2"> ... </div> */}

            {/* Tag Filter - Use tags from useTags hook */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Tags:</span>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Insurance:</span>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All Types</option>
                <option value="insured">Insurance</option>
                <option value="self-pay">Self-Pay</option>
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
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Use patientsLoading or patientsIsFetching for loading state */}
              {(patientsLoading || patientsIsFetching) ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading patients...
                    </p>
                  </td>
                </tr>
              ) : patientsError ? ( // Use patientsError for error state
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-red-500"
                  >
                    {/* Display error message from hook */}
                    Error loading patients: {patientsError.message}
                  </td>
                </tr>
              ) : patients.length > 0 ? ( // Use patients array from hook data
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="pl-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handlePatientSelection(patient.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {/* Use first_name and last_name from Supabase schema */}
                            {patient.first_name} {patient.last_name}
                            {/* Add AffiliateTag back if is_affiliate field exists */}
                            {/* {patient.is_affiliate && <AffiliateTag isAffiliate={patient.is_affiliate} />} */}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={patient.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {patient.risk_level || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.next_session_date
                        ? new Date(
                            patient.next_session_date
                          ).toLocaleDateString()
                        : "None scheduled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor || "Not assigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No patients found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          {/* Mobile Pagination - Use currentPage and totalPages */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                 currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </button>
          </div>

          {/* Desktop Pagination Info - Use pagination object */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {/* Calculate starting item number */}
                  {pagination.totalCount > 0 ? (currentPage - 1) * pagination.itemsPerPage + 1 : 0}
                </span>{" "}
                to <span className="font-medium">
                  {/* Calculate ending item number */}
                  {Math.min(currentPage * pagination.itemsPerPage, pagination.totalCount)}
                  </span>{" "}
                of{" "}
                <span className="font-medium">
                  {pagination.totalCount}
                  </span>{" "}
                results
              </p>
            </div>

            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              {renderPagination()}
            </nav>
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      {showAddModal && (
        <PatientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // Invalidate the query instead of fetching manually
            queryClient.invalidateQueries({ queryKey: ['patients'] });
          }}
        />
      )}
    </div>
  );
};

export default Patients;
