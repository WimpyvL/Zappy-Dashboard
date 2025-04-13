import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Plus, Loader2, AlertTriangle } from 'lucide-react'; // Keep necessary icons
import { toast } from 'react-toastify';

// Import React Query hooks
import { useInsuranceRecords } from '../../apis/insurances/hooks';

// Import Sub-components
import InsuranceRecordTable from './components/InsuranceRecordTable';
import InsuranceRecordFilters from './components/InsuranceRecordFilters';
import AddInsuranceRecordModal from './components/AddInsuranceRecordModal';
import ViewInsuranceRecordModal from './components/ViewInsuranceRecordModal';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';

// Helper function to format date (can be moved to utils)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(date);
  } catch (e) { return 'Invalid Date Format'; }
};

// Parse verification history (can be moved to utils)
const parseVerificationHistory = (historyString) => {
    if (!historyString) return [];
    try {
      const history = JSON.parse(historyString);
      return history.map((log, index) => ({
        id: `v${index}`, // Generate temporary ID
        status: log.status || 'pending',
        timestamp: log.timestamp || new Date().toISOString(),
        user: log.user || 'System',
        notes: log.notes || '',
      }));
    } catch (e) {
      console.error('Error parsing verification history:', e);
      return [];
    }
};

// Transform API data (can be moved to utils or hook)
const transformApiData = (apiRecord) => {
    if (!apiRecord) return null;
    try {
      // Find patient name logic might need adjustment if not directly joined in useInsuranceRecords
      const patientName = apiRecord.patient_name || (apiRecord.patients ? `${apiRecord.patients.first_name || ''} ${apiRecord.patients.last_name || ''}`.trim() : `Patient ID: ${apiRecord.patient_id}`);

      return {
        id: apiRecord.id,
        patientId: apiRecord.patient_id?.toString() || '',
        patientName: patientName,
        insuranceProvider: apiRecord.provider_name || 'N/A', // Use provider_name from schema
        policyNumber: apiRecord.policy_number || 'N/A',
        groupNumber: apiRecord.group_number || 'N/A',
        verificationStatus: apiRecord.status || 'pending', // Use status from schema
        verificationDate: apiRecord.verification_date || null, // Use verification_date from schema
        coverageType: apiRecord.coverage_type || 'Medical', // Assuming this exists
        coverageDetails: apiRecord.coverage_details || '', // Assuming this exists
        priorAuthRequired: apiRecord.prior_auth_status !== null, // Logic might need adjustment based on schema
        priorAuthStatus: apiRecord.prior_auth_status || null, // Needs schema confirmation
        priorAuthExpiryDate: apiRecord.prior_auth_expiry_date || null, // Needs schema confirmation
        notes: apiRecord.notes || '',
        documents: apiRecord.insurance_document || [], // Use insurance_document relation name from schema
        verificationLogs: parseVerificationHistory(apiRecord.verification_history) || [], // Assuming verification_history column exists
      };
    } catch (error) {
      console.error('Error transforming record:', error);
      return null;
    }
};


const InsuranceDocumentation = () => {
  const [filters, setFilters] = useState({ searchTerm: '', status: 'all' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Fetch insurance records based on current filters
  // NOTE: The useInsuranceRecords hook needs to be updated to use correct table/column names ('insurance_policy', 'patient_id', 'status')
  const { data: insuranceRecordsData, isLoading, error, refetch } = useInsuranceRecords({
    search: filters.searchTerm || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  });

  // Transform data after fetching
  const transformedRecords = useMemo(() => {
    const rawData = insuranceRecordsData?.data || insuranceRecordsData || []; // Adapt based on hook response
    return rawData.map(transformApiData).filter(Boolean); // Apply transformation and filter out nulls
  }, [insuranceRecordsData]);


  // Handler for filter changes from InsuranceRecordFilters component
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Refetching happens automatically due to queryKey change in useInsuranceRecords
  };

  // Handler for opening the view modal from InsuranceRecordTable
  const handleViewDetails = (record) => {
    setSelectedRecordId(record.id); // Set the ID to view
    setShowViewModal(true);
  };

  // Handler for closing modals
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setSelectedRecordId(null);
  };

  // Handler for successful add/update/delete operations (to refetch list)
  const handleSuccess = () => {
    refetch(); // Refetch the list of insurance records
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-gray-600">Loading insurance records...</p>
      </div>
    );
  }

  if (error) {
     return (
       <div className="p-8 text-center text-red-600">
         <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
         <p>Error loading insurance data: {error.message}</p>
       </div>
     );
   }


  return (
    <div className="relative overflow-hidden pb-10">
      <ChildishDrawingElement type="watercolor" color="accent3" position="top-right" size={100} rotation={-15} opacity={0.1} />
      <ChildishDrawingElement type="doodle" color="accent1" position="bottom-left" size={110} rotation={5} opacity={0.1} />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-800">
          Insurance Documentation
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Insurance Record
        </button>
      </div>

      {/* Render Filters Component */}
      <InsuranceRecordFilters onFilterChange={handleFilterChange} />

      {/* Render Table Component */}
      <InsuranceRecordTable
        records={transformedRecords} // Pass transformed data
        isLoading={isLoading} // Pass loading state
        onViewDetails={handleViewDetails}
        // Pass sorting props if implemented in table
        // onSort={handleSort}
        // sortConfig={sortConfig}
      />

      {/* Render Modals */}
      <AddInsuranceRecordModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess} // Refetch list on success
      />

      {showViewModal && selectedRecordId && ( // Conditionally render View modal
        <ViewInsuranceRecordModal
          isOpen={showViewModal}
          onClose={handleCloseModal}
          recordId={selectedRecordId}
          // Pass onSuccess if ViewModal performs updates that require list refetch
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default InsuranceDocumentation;
