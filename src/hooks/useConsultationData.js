import { useState, useMemo } from 'react';
import { 
  useConsultations, 
  useUpdateConsultationStatus 
} from '../apis/consultations/hooks';
import { useServices } from '../apis/services/hooks';
import { useGetUsers } from '../apis/users/hooks';

/**
 * Custom hook to manage consultation data, filtering, and related operations
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Consultation data, filters, and handler functions
 */
export const useConsultationData = (initialFilters = {}) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter || 'all');
  const [providerFilter, setProviderFilter] = useState(initialFilters.providerFilter || 'all');
  const [serviceFilter, setServiceFilter] = useState(initialFilters.serviceFilter || 'all');
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || null);

  // Data fetching
  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
    refetch: refetchConsultations,
  } = useConsultations({
    searchTerm,
    providerId: providerFilter !== 'all' ? providerFilter : undefined,
    // Add other filters if useConsultations hook supports them
  });

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();

  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: errorProviders,
  } = useGetUsers({ role: 'practitioner' });

  // Process data
  const allConsultations = consultationsData?.data || [];
  const allServices = servicesData?.data || [];
  const allProviders = providersData || [];

  // Memoized filtered consultations
  const filteredConsultations = useMemo(() => {
    return allConsultations.filter((consultation) => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      
      // Service filter
      const matchesService = serviceFilter === 'all' || 
                            consultation.service_id === serviceFilter || 
                            consultation.service === serviceFilter;
      
      // Date range filter
      let matchesDate = true;
      if (dateRange && (dateRange[0] || dateRange[1])) {
        try {
          // Try to find a valid date field (handle different field names)
          const consultDate = new Date(
            consultation.submitted_at || 
            consultation.datesubmitted || 
            consultation.date_submitted || 
            consultation.created_at
          );
          
          const start = dateRange[0]?.startOf('day').toDate();
          const end = dateRange[1]?.endOf('day').toDate();
          
          if (start && end) {
            matchesDate = consultDate >= start && consultDate <= end;
          } else if (start) {
            matchesDate = consultDate >= start;
          } else if (end) {
            matchesDate = consultDate <= end;
          }
        } catch (e) { 
          console.warn('Date filtering error:', e);
          matchesDate = true; // If date parsing fails, include the consultation
        }
      }
      
      return matchesStatus && matchesService && matchesDate;
    });
  }, [allConsultations, statusFilter, serviceFilter, dateRange]);

  // Loading and error states
  const isLoading = isLoadingConsultations || isLoadingServices || isLoadingProviders;
  const error = errorConsultations || errorServices || errorProviders;

  return {
    // Data
    consultations: filteredConsultations,
    services: allServices,
    providers: allProviders,
    
    // Filters
    filters: {
      searchTerm,
      statusFilter,
      providerFilter,
      serviceFilter,
      dateRange,
    },
    
    // Filter setters
    setSearchTerm,
    setStatusFilter,
    setProviderFilter,
    setServiceFilter,
    setDateRange,
    
    // Loading and error states
    isLoading,
    error,
    
    // Refetch function
    refetchConsultations,
  };
};

/**
 * Custom hook to manage consultation status updates
 * @param {Function} onSuccess - Callback function on successful update
 * @returns {Object} - Mutation function and state
 */
export const useConsultationStatusUpdate = (onSuccess) => {
  return useUpdateConsultationStatus({
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
  });
};