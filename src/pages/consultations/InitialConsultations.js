import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAppContext } from '../../context/AppContext'; // Removed
// TODO: Import useSessions hook
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  X,
  Mail,
  Archive,
  MoreHorizontal
} from 'lucide-react';
// Import the consultation notes component
import InitialConsultationNotes from './InitialConsultationNotes';

// Sample initial consultations data
const sampleConsultations = [
  {
    id: 'cons_1',
    patientId: 1,
    patientName: 'John Doe',
    email: 'john.doe@example.com',
    dateSubmitted: '2025-02-10T09:45:00',
    date: '2025-02-15T10:30:00',
    status: 'reviewed',
    provider: 'Dr. Sarah Johnson',
    service: 'Weight Management',
    preferredMedication: 'Semaglutide',
    preferredPlan: 'Monthly Subscription',
    draftDate: '2025-02-12T11:20:00',
    formCompleted: true,
    notes: 'Patient presents with symptoms of fatigue and weight gain over the past 6 months. BMI: 32.5. Blood pressure: 135/85. Heart rate: 78 bpm.',
    consultationData: {
      chiefComplaint: 'Weight gain, fatigue',
      vitalSigns: {
        height: '5\'10"',
        weight: '220 lbs',
        bmi: 32.5,
        bloodPressure: '135/85',
        heartRate: 78,
        respiratoryRate: 16,
        temperature: 98.6
      },
      medicalHistory: 'Hypertension (diagnosed 2020), Family history of diabetes',
      medications: 'Lisinopril 10mg daily',
      allergies: 'Penicillin (hives)',
      labResults: {
        glucose: '120 mg/dL (elevated)',
        hba1c: '6.4% (elevated)',
        cholesterol: '210 mg/dL (elevated)',
        ldl: '140 mg/dL (elevated)',
        hdl: '38 mg/dL (low)',
        triglycerides: '180 mg/dL (elevated)'
      }
    }
  },
  {
    id: 'cons_2',
    patientId: 2,
    patientName: 'Jane Smith',
    email: 'jane.smith@example.com',
    dateSubmitted: '2025-01-05T14:30:00',
    date: '2025-01-10T09:15:00',
    status: 'followup',
    provider: 'Dr. Michael Chen',
    service: 'Weight Management',
    preferredMedication: 'Tirzepatide',
    preferredPlan: 'Quarterly Subscription',
    draftDate: '2025-01-08T10:15:00',
    formCompleted: true,
    notes: 'Patient presents with BMI of 38.2, history of sleep apnea requiring CPAP. Reports multiple failed attempts at weight loss with diet and exercise alone.',
    consultationData: {
      chiefComplaint: 'Obesity, sleep apnea',
      vitalSigns: {
        height: '5\'6"',
        weight: '235 lbs',
        bmi: 38.2,
        bloodPressure: '142/88',
        heartRate: 82,
        respiratoryRate: 18,
        temperature: 98.4
      },
      medicalHistory: 'Sleep apnea (diagnosed 2022), GERD, Anxiety',
      medications: 'Omeprazole 20mg daily, Sertraline 50mg daily',
      allergies: 'None known',
      labResults: {
        glucose: '115 mg/dL (elevated)',
        hba1c: '5.9% (normal)',
        cholesterol: '225 mg/dL (elevated)',
        ldl: '145 mg/dL (elevated)',
        hdl: '42 mg/dL (low)',
        triglycerides: '200 mg/dL (elevated)'
      }
    }
  },
  {
    id: 'cons_3',
    patientId: 3,
    patientName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    dateSubmitted: '2025-03-01T11:20:00',
    date: null,
    status: 'pending',
    scheduledDate: '2025-03-15T14:30:00',
    provider: 'Dr. Emily Parker',
    service: 'Diabetes Management',
    preferredMedication: 'Semaglutide',
    preferredPlan: 'Monthly Subscription',
    draftDate: null,
    formCompleted: false,
    notes: 'Initial consultation for weight management and pre-diabetes assessment.',
    consultationData: null
  },
  {
    id: 'cons_4',
    patientId: 4,
    patientName: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    dateSubmitted: '2025-03-05T13:45:00',
    date: null,
    status: 'pending',
    provider: null,
    service: 'Weight Management',
    preferredMedication: 'Tirzepatide',
    preferredPlan: 'Quarterly Subscription',
    draftDate: null,
    formCompleted: false,
    notes: 'Initial consultation needed',
    consultationData: null
  },
  {
    id: 'cons_5',
    patientId: 5,
    patientName: 'David Wilson',
    email: 'david.wilson@example.com',
    dateSubmitted: '2025-02-15T10:20:00',
    date: '2025-02-20T11:00:00',
    status: 'reviewed',
    provider: 'Dr. Lisa Wong',
    service: 'Metabolic Health',
    preferredMedication: 'Semaglutide',
    preferredPlan: 'Monthly Subscription',
    draftDate: '2025-02-18T09:30:00',
    formCompleted: true,
    notes: 'Patient presents with class I obesity and concerns about metabolic health. Reports family history of type 2 diabetes.',
    consultationData: {
      chiefComplaint: 'Weight concerns, family history of diabetes',
      vitalSigns: {
        height: '6\'0"',
        weight: '225 lbs',
        bmi: 30.5,
        bloodPressure: '130/82',
        heartRate: 74,
        respiratoryRate: 16,
        temperature: 98.5
      },
      medicalHistory: 'Mild hypertension, Seasonal allergies',
      medications: 'Loratadine 10mg as needed',
      allergies: 'Sulfa drugs (rash)',
      labResults: {
        glucose: '108 mg/dL (normal)',
        hba1c: '5.8% (normal)',
        cholesterol: '195 mg/dL (normal)',
        ldl: '125 mg/dL (borderline)',
        hdl: '45 mg/dL (borderline)',
        triglycerides: '150 mg/dL (normal)'
      }
    }
  },
  {
    id: 'cons_6',
    patientId: 6,
    patientName: 'Sarah Thompson',
    email: 'sarah.thompson@example.com',
    dateSubmitted: '2025-01-20T09:30:00',
    date: '2025-01-25T13:45:00',
    status: 'archived',
    provider: 'Dr. Sarah Johnson',
    service: 'Weight Management',
    preferredMedication: 'Semaglutide',
    preferredPlan: 'Monthly Subscription',
    draftDate: null,
    formCompleted: false,
    notes: 'Consultation cancelled by patient due to scheduling conflict.',
    consultationData: null
  }
];

const StatusBadge = ({ status }) => {
  if (status === 'reviewed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Reviewed
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
        <Calendar className="h-3 w-3 mr-1" />
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
  return null;
};

const InitialConsultations = () => {
  // const { patients, getPatientNotes } = useAppContext(); // Removed context usage
  const patients = []; // Placeholder
  const getPatientNotes = async (id) => []; // Placeholder function

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [consultations, setConsultations] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showNewConsultationModal, setShowNewConsultationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState(null);

  // Generate consultations data from patients and their notes
  useEffect(() => {
    setConsultations(sampleConsultations);
  }, []);

  // Filter consultations based on search and status filter
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch =
      consultation.patientName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (consultation.provider && consultation.provider?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
      (consultation.email && consultation.email?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
      (consultation.preferredMedication && consultation.preferredMedication?.toLowerCase().includes(searchTerm?.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle viewing a consultation
  const handleViewConsultation = (consultation) => {
    const patient = patients?.find(p => p.id === consultation.patientId) || {
      id: consultation.patientId,
      name: consultation.patientName,
      email: consultation.email
    };
    setSelectedPatient(patient);
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  // Handle creating a new consultation
  const handleNewConsultation = (patient) => {
    setSelectedPatient(patient);
    setSelectedConsultation(null);
    setShowNewConsultationModal(true);
  };

  // Handle consultation modal close
  const handleCloseConsultationModal = () => {
    setShowConsultationModal(false);
    setShowNewConsultationModal(false);
    setSelectedPatient(null);
    setSelectedConsultation(null);
  };

  // Handle email sending
  const handleSendEmail = (consultation) => {
    setSelectedConsultation(consultation);
    setEmailContent(`Dear ${consultation.patientName},\n\nThank you for your recent consultation submission. We're writing to inform you about the next steps in your treatment plan.\n\nSincerely,\nThe Medical Team`);
    setShowEmailModal(true);
  };

  // Handle email sending confirmation
  const handleConfirmSendEmail = () => {
    // In a real app, you would send the email here
    console.log(`Sending email to ${selectedConsultation.email} with content: ${emailContent}`);

    // Update the consultation status to reflect the email was sent
    const updatedConsultations = consultations.map(cons =>
      cons.id === selectedConsultation.id
        ? { ...cons, status: cons.status === 'pending' ? 'followup' : cons.status }
        : cons
    );
    setConsultations(updatedConsultations);

    // Close the modal
    setShowEmailModal(false);
    setSelectedConsultation(null);
  };

  // Handle archiving a consultation
  const handleArchiveConsultation = (consultation) => {
    const updatedConsultations = consultations.map(cons =>
      cons.id === consultation.id
        ? { ...cons, status: 'archived' }
        : cons
    );
    setConsultations(updatedConsultations);
    setShowActionDropdown(null);
  };

  // Handle updating consultation status
  const handleUpdateStatus = (consultation, newStatus) => {
    const updatedConsultations = consultations.map(cons =>
      cons.id === consultation.id
        ? { ...cons, status: newStatus }
        : cons
    );
    setConsultations(updatedConsultations);
    setShowActionDropdown(null);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Initial Consultations</h1>
        <div className="flex">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={() => setShowNewConsultationModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Consultation
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
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
      </div>

      {/* Consultations list */}
      <div className="bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Submitted
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferred Medication
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferred Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Draft Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form Completed
              </th>
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
                            {consultation.patientName}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.email || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(consultation.dateSubmitted)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.service || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.preferredMedication || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.preferredPlan || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(consultation.draftDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.provider || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={consultation.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <FormCompletedBadge completed={consultation.formCompleted} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative flex justify-end">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleViewConsultation(consultation)}
                      >
                        View
                      </button>

                      <div className="relative">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setShowActionDropdown(showActionDropdown === consultation.id ? null : consultation.id)}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {showActionDropdown === consultation.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={() => handleSendEmail(consultation)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                role="menuitem"
                              >
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                Send Email
                              </button>

                              {consultation.status !== 'archived' && (
                                <button
                                  onClick={() => handleArchiveConsultation(consultation)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Archive className="h-4 w-4 mr-2 text-gray-500" />
                                  Archive
                                </button>
                              )}

                              {consultation.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(consultation, 'pending')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  Mark as Pending
                                </button>
                              )}

                              {consultation.status !== 'reviewed' && (
                                <button
                                  onClick={() => handleUpdateStatus(consultation, 'reviewed')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                                  Mark as Reviewed
                                </button>
                              )}

                              {consultation.status !== 'followup' && (
                                <button
                                  onClick={() => handleUpdateStatus(consultation, 'followup')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
                <td colSpan="11" className="px-4 py-4 text-center text-gray-500">
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
              <h3 className="text-lg font-medium text-gray-900">Select Patient for Consultation</h3>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="divide-y divide-gray-200">
                {patients?.filter(patient => patient.name?.toLowerCase().includes(searchTerm?.toLowerCase()))
                  .map(patient => (
                    <div
                      key={patient.id}
                      className="py-3 flex items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNewConsultation(patient)}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </div>
                      {consultations.some(c =>
                        c.patientId === patient.id && c.status === 'reviewed'
                      ) && (
                          <span className="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Has Consultation
                          </span>
                        )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Notes Modal */}
      {showConsultationModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <InitialConsultationNotes
              patient={selectedPatient}
              consultationData={selectedConsultation?.consultationData}
              readOnly={selectedConsultation?.status === 'reviewed' || selectedConsultation?.status === 'archived'}
              onClose={handleCloseConsultationModal}
            />
          </div>
        </div>
      )}

      {/* New Consultation Modal */}
      {showNewConsultationModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <InitialConsultationNotes
              patient={selectedPatient}
              onClose={handleCloseConsultationModal}
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
                <h3 className="text-lg font-medium text-gray-900">Send Email to Patient</h3>
                <p className="text-sm text-gray-500">To: {selectedConsultation.email}</p>
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
