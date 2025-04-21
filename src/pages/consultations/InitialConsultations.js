import React, { useState } from 'react'; // Removed unused useEffect
import { Link } from 'react-router-dom';
// Removed useAppContext import
import { usePatients } from '../../apis/patients/hooks'; // Assuming hook exists
import {
  useConsultations,
  useUpdateConsultationStatus,
  // useArchiveConsultation, // Assuming these hooks exist or will be created
} from '../../apis/consultations/hooks';
import { useServices } from '../../apis/services/hooks'; // Import useServices
import { DatePicker } from 'antd'; // Import Ant Design DatePicker
// Other Icons
import {
  Search,
  Plus,
  Filter,
  Calendar, // Added Calendar icon import
  Clock,
  CheckCircle,
  AlertTriangle,
  Briefcase, // Added Briefcase icon
  // FileText, // Removed unused import
  User,
  X,
  Mail,
  Archive,
  MoreHorizontal,
  Loader2, // Added for loading state
} from 'lucide-react';
// Import the consultation notes component
import InitialConsultationNotes from './InitialConsultationNotes';

// StatusBadge and FormCompletedBadge remain the same

const StatusBadge = ({ status }) => {
  // ... (StatusBadge implementation remains the same)
  if (status === 'reviewed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <Calendar className="h-3 w-3 mr-1" /> {/* Corrected icon name */}
        Follow-up
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  } else if (status === 'followup') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <Calendar className="h-3 w-3 mr-1" /> {/* Corrected icon name */}
        Follow-up
      </span>
    );
  } else if (status === 'archived') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        <Archive className="h-3 w-3 mr-1" />
        Archived
      </span>
    );
  }
  return null;
};

const FormCompletedBadge = ({ completed }) => {
  // ... (FormCompletedBadge implementation remains the same)
  if (completed) {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Complete
      </span>
    );
  } else {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <X className="h-3 w-3 mr-1" />
        Incomplete
      </span>
    );
  }
};

const InitialConsultations = () => {
  // Local state for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default filter to 'pending'
  const [providerFilter, setProviderFilter] = useState('all'); // State for provider filter
  const [serviceFilter, setServiceFilter] = useState('all'); // State for service filter
  const [dateRange, setDateRange] = useState(null); // State for date range [startDate, endDate]
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showNewConsultationModal, setShowNewConsultationModal] =
    useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState(null); // Tracks which dropdown is open

  // Fetch data using React Query hooks
  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    error: errorPatients,
  } = usePatients(); // Fetch patients for selection modal
  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
  } = useConsultations(); // Fetch consultations
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices(); // Fetch services for filter

  // Mutation hooks
  const updateStatusMutation = useUpdateConsultationStatus({
    onSuccess: () => setShowActionDropdown(null), // Close dropdown on success
    onError: (error) => console.error('Error updating status:', error),
  });
  // const archiveMutation = useArchiveConsultation({ // Assuming this hook exists
  //   onSuccess: () => setShowActionDropdown(null),
  //   onError: (error) => console.error("Error archiving:", error),
  // });

  // Process fetched data
  const patients = patientsData?.data || patientsData || [];
  const allConsultations = consultationsData?.data || consultationsData || [];
  const allServices = servicesData?.data || servicesData || []; // Process services data

  // Get unique providers for filter dropdown
  const uniqueProviders = [
    ...new Set(allConsultations.map(c => c.provider).filter(Boolean))
  ].sort();

  // Filter consultations based on search and filters (status, provider, service, date)
  const filteredConsultations = allConsultations.filter((consultation) => {
    const patientName = consultation.patientName || '';
    const provider = consultation.provider || '';
    const email = consultation.email || '';
    const preferredMed = consultation.preferredMedication || ''; // Keep for search

    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preferredMed.toLowerCase().includes(searchTerm.toLowerCase()); // Keep preferredMed in search

    const matchesStatus =
      statusFilter === 'all' || consultation.status === statusFilter;

    const matchesProvider =
       providerFilter === 'all' || consultation.provider === providerFilter;

    // Assuming consultation.service holds the service name string
    const matchesService =
       serviceFilter === 'all' || consultation.service === serviceFilter;

    // Date Range Filter Logic using Ant Design's date objects (likely Dayjs)
    let matchesDate = true;
    if (dateRange && (dateRange[0] || dateRange[1])) {
        try {
            const submittedDate = new Date(consultation.dateSubmitted); // Keep as Date object
            const start = dateRange[0] ? dateRange[0].startOf('day').toDate() : null; // Get start of day as Date
            const end = dateRange[1] ? dateRange[1].endOf('day').toDate() : null; // Get end of day as Date

            if (start && end) {
                matchesDate = submittedDate >= start && submittedDate <= end;
            } else if (start) {
                matchesDate = submittedDate >= start;
            } else if (end) {
                matchesDate = submittedDate <= end;
            }
        } catch (e) {
            console.error("Error processing date for filtering:", consultation.dateSubmitted, e);
            matchesDate = false; // Exclude if date is invalid
        }
    }

    return matchesSearch && matchesStatus && matchesProvider && matchesService && matchesDate;
  });

  // Handle viewing a consultation
  const handleViewConsultation = (consultation) => {
    // Find patient data from the fetched list
    const patient = patients.find((p) => p.id === consultation.patientId) || {
      id: consultation.patientId,
      name: consultation.patientName,
      email: consultation.email,
      // Add other necessary patient fields if available
    };
    setSelectedPatient(patient);
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  // Handle creating a new consultation (opens patient selection first)
  const handleOpenNewConsultationModal = () => {
    setSelectedPatient(null); // Clear selected patient first
    setShowNewConsultationModal(true);
  };

  // Handle selecting a patient to start a new consultation
  const handleSelectPatientForNewConsultation = (patient) => {
    setSelectedPatient(patient);
    setSelectedConsultation(null); // Ensure no old consultation data lingers
    // Keep the modal open, but now InitialConsultationNotes will render with the selected patient
  };

  // Handle consultation modal close
  const handleCloseConsultationModal = () => {
    setShowConsultationModal(false);
    setShowNewConsultationModal(false);
    setSelectedPatient(null);
    setSelectedConsultation(null);
    setSearchTerm(''); // Reset search term when closing patient selection
  };

  // Handle email sending modal opening
  const handleSendEmail = (consultation) => {
    setSelectedConsultation(consultation);
    setEmailContent(
      `Dear ${consultation.patientName},\n\nThank you for your recent consultation submission. We're writing to inform you about the next steps in your treatment plan.\n\nSincerely,\nThe Medical Team`
    );
    setShowEmailModal(true);
  };

  // Handle email sending confirmation (placeholder for API call)
  const handleConfirmSendEmail = () => {
    // console.log(
    //   `Sending email to ${selectedConsultation.email} with content: ${emailContent}`
    // ); // Removed log
    // TODO: Integrate with an email sending API/service
    // Optionally update status after sending email using mutation
    // updateStatusMutation.mutate({ consultationId: selectedConsultation.id, status: 'followup' });
    setShowEmailModal(false);
    setSelectedConsultation(null);
  };

  // Handle archiving a consultation using mutation
  const handleArchiveConsultation = (consultation) => {
    // archiveMutation.mutate(consultation.id); // Assuming hook takes ID
    // For now, simulate with status update:
    updateStatusMutation.mutate({
      consultationId: consultation.id,
      status: 'archived',
    });
  };

  // Handle updating consultation status using mutation
  const handleUpdateStatus = (consultation, newStatus) => {
    updateStatusMutation.mutate({
      consultationId: consultation.id,
      status: newStatus,
    });
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Handle loading state
  if (isLoadingConsultations || isLoadingPatients || isLoadingServices) { // Added isLoadingServices
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle error state
  if (errorConsultations || errorPatients || errorServices) { // Added errorServices
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading consultation or patient data.</p>
        {/* <p>{errorConsultations?.message || errorPatients?.message || errorServices?.message}</p> */}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Initial Consultations
        </h1>
        <div className="flex">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={handleOpenNewConsultationModal} // Updated handler
          >
            <Plus className="h-5 w-5 mr-2" />
            New Consultation
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-wrap"> {/* Added flex-wrap */}
        <div className="flex-1 relative min-w-[200px]"> {/* Added min-width */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by patient, email, medication or provider name..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="followup">Follow-up</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {/* Provider Filter Dropdown */}
        <div className="flex items-center space-x-2">
           <User className="h-5 w-5 text-gray-400" /> {/* Using User icon for provider */}
           <select
             className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
             value={providerFilter}
             onChange={(e) => setProviderFilter(e.target.value)}
           >
             <option value="all">All Providers</option>
             {uniqueProviders.map((provider) => (
               <option key={provider} value={provider}>
                 {provider}
               </option>
             ))}
           </select>
         </div>
         {/* Service Filter Dropdown */}
         <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-gray-400" /> {/* Using Briefcase icon for service */}
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">All Services</option>
              {allServices.map((service) => (
                // Assuming consultation.service stores the name, so filter value is name
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
             ))}
           </select>
          </div>
          {/* Date Range Filter using Ant Design */}
           <div className="flex items-center space-x-2">
             <DatePicker.RangePicker
               onChange={(dates) => setDateRange(dates)}
               // You might need to format the value prop if needed, but often null is fine
               // value={dateRange}
               className="text-sm" // Adjust styling as needed
             />
           </div>
      </div>

      {/* Consultations list */}
      <div className="bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient / Email
              </th>
              {/* Removed Email column header */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Submitted
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              {/* Removed Preferred Medication column header */}
              {/* Removed Preferred Plan column header */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Draft Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {/* Removed Form Completed column header */}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConsultations.length > 0 ? (
              filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            to={`/patients/${consultation.patientId}`}
                            className="hover:text-indigo-600"
                          >
                            {consultation.patientName || 'N/A'}
                          </Link>
                        </div>
                         {/* Added email below name */}
                        <div className="text-xs text-gray-500 mt-1">
                          {consultation.email || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Removed separate Email cell */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(consultation.dateSubmitted)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.service || '-'}
                  </td>
                  {/* Removed Preferred Medication cell */}
                  {/* Removed Preferred Plan cell */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(consultation.draftDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.provider || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={consultation.status} />
                  </td>
                  {/* Removed Form Completed cell */}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative flex justify-end">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleViewConsultation(consultation)}
                      >
                        Complete Consult {/* Renamed button */}
                      </button>

                      <div className="relative">
                        <button
                          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          onClick={() =>
                            setShowActionDropdown(
                              showActionDropdown === consultation.id
                                ? null
                                : consultation.id
                            )
                          }
                          disabled={updateStatusMutation.isLoading} // Disable while any status update is loading
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {showActionDropdown === consultation.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <button
                                onClick={() => handleSendEmail(consultation)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" /> {/* Corrected icon name */}
                                  Mark for Follow-up
                                </button>

                              {consultation.status !== 'archived' && (
                                <button
                                  onClick={() =>
                                    handleArchiveConsultation(consultation)
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Archive className="h-4 w-4 mr-2 text-gray-500" />
                                  Archive
                                </button>
                              )}

                              {consultation.status !== 'pending' && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(consultation, 'pending')
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  Mark as Pending
                                </button>
                              )}

                              {consultation.status !== 'reviewed' && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(consultation, 'reviewed')
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                                  Mark as Reviewed
                                </button>
                              )}

                              {consultation.status !== 'followup' && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(consultation, 'followup')
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" /> {/* Corrected icon name */}
                                  Mark for Follow-up
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8" // Adjusted colspan again
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No consultations found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Select Patient Modal for New Consultation */}
      {showNewConsultationModal && !selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Select Patient for Consultation
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCloseConsultationModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  // Use a separate search term for this modal if needed, or reuse main one
                  // value={patientSearchTerm}
                  // onChange={(e) => setPatientSearchTerm(e.target.value)}
                />
              </div>
              <div className="divide-y divide-gray-200">
                {isLoadingPatients ? (
                  <div className="text-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin inline-block" />
                  </div>
                ) : (
                  patients
                    // .filter((patient) =>
                    //   patient.name?.toLowerCase().includes(patientSearchTerm?.toLowerCase())
                    // )
                    .map((patient) => (
                      <div
                        key={patient.id}
                        className="py-3 flex items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          handleSelectPatientForNewConsultation(patient)
                        }
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email}
                          </div>
                        </div>
                        {/* Optional: Indicate if patient already has consultations */}
                      </div>
                    ))
                )}
                {!isLoadingPatients && patients.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No patients found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Notes Modal (View/Edit Existing) */}
      {showConsultationModal && selectedPatient && selectedConsultation && (
        // Overlay covers screen, centers content horizontally
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center z-50">
          {/* Container fills screen, manages internal layout */}
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            <InitialConsultationNotes
              patient={selectedPatient}
              consultationData={selectedConsultation?.consultationData} // Pass existing data
              consultationId={selectedConsultation.id} // Pass ID for potential updates
              readOnly={
                selectedConsultation?.status === 'reviewed' ||
                selectedConsultation?.status === 'archived'
              }
              onClose={handleCloseConsultationModal}
              // Pass mutation hooks if notes component handles saving
              updateStatusMutation={updateStatusMutation} // Pass down mutation
            />
          </div>
        </div>
      )}

      {/* New Consultation Modal (After Patient Selected) */}
      {showNewConsultationModal && selectedPatient && !selectedConsultation && (
        // Overlay covers screen, centers content horizontally
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center z-50">
           {/* Container fills screen, manages internal layout */}
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            <InitialConsultationNotes
              patient={selectedPatient} // Pass selected patient
              onClose={handleCloseConsultationModal}
              // Pass mutation hooks if notes component handles saving
            />
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedConsultation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Send Email to Patient
                </h3>
                <p className="text-sm text-gray-500">
                  To: {selectedConsultation.email}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEmailModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue={`Consultation Follow-up for ${selectedConsultation.patientName}`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={10}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                onClick={handleConfirmSendEmail}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialConsultations;
