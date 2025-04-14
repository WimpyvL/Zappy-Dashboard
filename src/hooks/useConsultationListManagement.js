import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  useConsultations,
  useUpdateConsultationStatus,
} from '../apis/consultations/hooks';
import { useServices } from '../apis/services/hooks';
import { useGetUsers } from '../apis/users/hooks';

export const useConsultationListManagement = (initialStatusFilter = 'pending') => {
  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  // Add pagination state if needed by useConsultations hook
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);

  // --- Data Fetching ---
  const filtersForHook = useMemo(() => ({
    searchTerm: searchTerm || undefined,
    providerId: providerFilter !== 'all' ? providerFilter : undefined,
    // Pass other filters if supported by the hook
    status: statusFilter !== 'all' ? statusFilter : undefined, // Uncommented
    serviceId: serviceFilter !== 'all' ? serviceFilter : undefined, // Uncommented (assuming API uses serviceId)
    startDate: dateRange?.[0]?.toISOString(), // Uncommented
    endDate: dateRange?.[1]?.toISOString(), // Uncommented
    // page: currentPage, // Keep commented if useConsultations doesn't handle pagination
    // perPage: pageSize, // Keep commented if useConsultations doesn't handle pagination
  }), [searchTerm, providerFilter, statusFilter, serviceFilter, dateRange /*, currentPage, pageSize*/]);

  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
    refetch: refetchConsultations,
  } = useConsultations(filtersForHook);

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();

  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: errorProviders,
  } = useGetUsers({ role: 'practitioner' }); // Assuming role filter is supported

  // --- Mutations ---
  const updateStatusMutation = useUpdateConsultationStatus({
    onSuccess: () => {
      toast.success('Consultation status updated.');
      refetchConsultations(); // Refetch list after status update
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
    },
  });

  // --- Derived Data & Logic ---
  const allConsultations = useMemo(() => consultationsData?.data || [], [consultationsData]);
  const allServices = useMemo(() => servicesData?.data || [], [servicesData]);
  const allProviders = useMemo(() => providersData || [], [providersData]); // Assuming providersData is the array

  // REMOVED Client-side filtering logic as filters are now passed to the API hook

  // --- Handlers ---
  const handleUpdateStatus = useCallback((consultation, status) => {
    updateStatusMutation.mutate({ consultationId: consultation.id, status });
  }, [updateStatusMutation]);

  const handleArchive = useCallback((consultation) => {
    // Consider adding a confirmation dialog here before mutating
    handleUpdateStatus(consultation, 'archived');
  }, [handleUpdateStatus]);

  // --- Loading & Error States ---
  const isLoading = isLoadingConsultations || isLoadingServices || isLoadingProviders;
  const error = errorConsultations || errorServices || errorProviders;

  // --- Return Values ---
  return {
    // State
    searchTerm,
    statusFilter,
    providerFilter,
    serviceFilter,
    dateRange,
    isLoading,
    error,
    consultations: allConsultations, // Use data directly from API hook
    allServices,
    allProviders,
    isMutatingStatus: updateStatusMutation.isLoading,

    // Setters & Handlers
    setSearchTerm,
    setStatusFilter,
    setProviderFilter,
    setServiceFilter,
    setDateRange,
    handleUpdateStatus,
    handleArchive,
    refetchConsultations,
  };
};
