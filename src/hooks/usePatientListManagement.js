import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePatients } from '../apis/patients/hooks';
import { useTags } from '../apis/tags/hooks';
import { useAppContext } from '../context/AppContext';

export const usePatientListManagement = (initialPageSize = 10) => {
  const { subscriptionPlans: allSubscriptionPlans = [] } = useAppContext();
  const location = useLocation();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [affiliateFilter, setAffiliateFilter] = useState('all'); // Keep if needed
  const [tagFilter, setTagFilter] = useState('all');
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState('all');
  const [searchType, setSearchType] = useState('name'); // name, email, phone, order
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [pageSize, setPageSize] = useState(initialPageSize); // Add page size state if needed

  // --- Read search term from URL on initial load ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearchTerm = queryParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      // Optional: Clear the search param from URL after reading?
      // window.history.replaceState({}, document.title, location.pathname);
    }
    // Reset page on search change? Maybe not ideal UX.
    // setCurrentPage(1);
  }, [location.search]);

  // --- Data Fetching ---
  const filtersForHook = useMemo(() => ({
    search: searchTerm || undefined,
    // search_by: searchTerm ? searchType : undefined, // Not implemented in hook yet
    status: statusFilter !== 'all' ? statusFilter : undefined,
    tag_id: tagFilter !== 'all' ? tagFilter : undefined,
    is_affiliate: affiliateFilter !== 'all' ? affiliateFilter === 'yes' : undefined,
    // Add other filters supported by the API hook here
  }), [searchTerm, statusFilter, tagFilter, affiliateFilter /*, searchType*/]);

  const {
    data: patientsData,
    isLoading: loading,
    error,
    refetch: fetchPatients,
  } = usePatients(currentPage, filtersForHook, pageSize); // Pass pageSize

  const { data: tagsData, isLoading: loadingTags } = useTags();

  // --- Derived Data ---
  const rawPatients = useMemo(() => patientsData?.data || [], [patientsData]);
  const paginationMeta = useMemo(() => patientsData?.meta || { total: 0, total_pages: 1, current_page: 1, per_page: pageSize }, [patientsData, pageSize]);
  const paginationLinks = useMemo(() => patientsData?.links || { first: null, last: null, next: null, prev: null }, [patientsData]);
  const tags = useMemo(() => tagsData?.data || [], [tagsData]);
  const uniquePlanNames = useMemo(() => Array.from(new Set(allSubscriptionPlans.map(plan => plan.name).filter(Boolean))), [allSubscriptionPlans]);

  // --- Client-side filtering (if needed, e.g., for Subscription Plan) ---
  const filteredPatients = useMemo(() => {
    return rawPatients.filter(patient => {
      if (subscriptionPlanFilter === 'all') return true;
      if (subscriptionPlanFilter === 'none') return !patient.subscriptionPlanName; // Assuming patient object has this property
      return patient.subscriptionPlanName === subscriptionPlanFilter;
    });
  }, [rawPatients, subscriptionPlanFilter]);

  // --- Selection Logic ---
  const allSelected = useMemo(() =>
    filteredPatients.length > 0 &&
    filteredPatients.every((patient) => selectedPatients.includes(patient.id)),
    [filteredPatients, selectedPatients]
  );

  const handlePatientSelection = useCallback((patientId) => {
    setSelectedPatients(prevSelected =>
      prevSelected.includes(patientId)
        ? prevSelected.filter((id) => id !== patientId)
        : [...prevSelected, patientId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map((patient) => patient.id));
    }
  }, [allSelected, filteredPatients]);

  const clearSelection = useCallback(() => {
    setSelectedPatients([]);
  }, []);

  // --- Pagination Logic ---
  const getPageFromUrl = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= paginationMeta.total_pages) {
      setCurrentPage(page);
      clearSelection(); // Clear selection when changing page
    }
  }, [paginationMeta.total_pages, clearSelection]);

  const goToLink = useCallback((linkType) => {
    const link = paginationLinks[linkType];
    if (!link) return;
    const page = getPageFromUrl(link);
    if (page) {
      handlePageChange(page);
    }
  }, [paginationLinks, getPageFromUrl, handlePageChange]);

  // --- Filter Logic ---
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setAffiliateFilter('all');
    setTagFilter('all');
    setSubscriptionPlanFilter('all');
    setSearchType('name');
    setCurrentPage(1);
    clearSelection();
    // fetchPatients(); // usePatients hook refetches automatically on filter/page change
  }, [clearSelection]);

  // --- Effects ---
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    clearSelection();
  }, [searchTerm, statusFilter, tagFilter, affiliateFilter, subscriptionPlanFilter, searchType, pageSize, clearSelection]);

  // Show/hide bulk actions derived state
  const showBulkActions = selectedPatients.length > 0;

  // --- Return Values ---
  return {
    // State
    searchTerm,
    statusFilter,
    tagFilter,
    subscriptionPlanFilter,
    searchType,
    currentPage,
    selectedPatients,
    pageSize,
    loading: loading || loadingTags, // Combine loading states
    error,
    patients: filteredPatients, // Use client-side filtered list
    paginationMeta,
    paginationLinks,
    tags,
    uniquePlanNames,
    allSelected,
    showBulkActions,

    // Setters & Handlers
    setSearchTerm,
    setStatusFilter,
    setTagFilter,
    setSubscriptionPlanFilter,
    setSearchType,
    setPageSize, // Expose if page size change is needed
    handlePageChange,
    goToLink,
    handlePatientSelection,
    toggleSelectAll,
    clearSelection,
    resetFilters,
    refetchPatients: fetchPatients, // Expose refetch if manual refresh is needed
  };
};
