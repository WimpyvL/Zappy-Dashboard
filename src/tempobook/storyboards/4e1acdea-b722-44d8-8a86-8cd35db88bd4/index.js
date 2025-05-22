import React from 'react';
import ConsultationListTable from '@/pages/consultations/components/ConsultationListTable';

export default function ConsultationListTableStoryboard() {
  // Sample consultations data
  const sampleConsultations = [
    {
      id: 'consult_1',
      patientName: 'John Smith',
      email: 'john.smith@example.com',
      submitted_at: '2023-05-15T10:30:00Z',
      service: 'Hair Loss Consultation',
      draftDate: '2023-05-16T14:20:00Z',
      provider: 'Dr. Jane Wilson',
      status: 'pending',
      patient_id: 'patient_1',
    },
    {
      id: 'consult_2',
      patientName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      submitted_at: '2023-05-14T09:15:00Z',
      service: 'Weight Management',
      draftDate: '2023-05-14T16:45:00Z',
      provider: 'Dr. Michael Brown',
      status: 'reviewed',
      patient_id: 'patient_2',
    },
    {
      id: 'consult_3',
      patientName: 'Robert Davis',
      email: 'robert.d@example.com',
      submitted_at: '2023-05-13T14:20:00Z',
      service: 'Skin Care Assessment',
      draftDate: '2023-05-13T17:30:00Z',
      provider: 'Dr. Jane Wilson',
      status: 'followup',
      patient_id: 'patient_3',
    },
    {
      id: 'consult_4',
      patientName: 'Emily Wilson',
      email: 'emily.w@example.com',
      submitted_at: '2023-05-10T11:00:00Z',
      service: 'Hair Loss Consultation',
      draftDate: '2023-05-10T15:10:00Z',
      provider: 'Dr. Michael Brown',
      status: 'archived',
      patient_id: 'patient_4',
    },
  ];

  // Handler functions
  const handleViewConsultation = (consultation) => {
    console.log('View consultation:', consultation);
  };

  const handleSendEmail = (consultation) => {
    console.log('Send email to:', consultation);
  };

  const handleArchive = (consultation) => {
    console.log('Archive consultation:', consultation);
  };

  const handleUpdateStatus = (consultation, newStatus) => {
    console.log(
      'Update status for consultation:',
      consultation,
      'to',
      newStatus
    );
  };

  return (
    <div className="bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Consultation List</h2>

      <ConsultationListTable
        consultations={sampleConsultations}
        isLoading={false}
        onViewConsultation={handleViewConsultation}
        onSendEmail={handleSendEmail}
        onArchive={handleArchive}
        onUpdateStatus={handleUpdateStatus}
        isMutatingStatus={false}
      />

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Loading State</h3>
        <ConsultationListTable
          consultations={[]}
          isLoading={true}
          onViewConsultation={handleViewConsultation}
          onSendEmail={handleSendEmail}
          onArchive={handleArchive}
          onUpdateStatus={handleUpdateStatus}
          isMutatingStatus={false}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Empty State</h3>
        <ConsultationListTable
          consultations={[]}
          isLoading={false}
          onViewConsultation={handleViewConsultation}
          onSendEmail={handleSendEmail}
          onArchive={handleArchive}
          onUpdateStatus={handleUpdateStatus}
          isMutatingStatus={false}
        />
      </div>
    </div>
  );
}
