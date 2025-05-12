import React from 'react';
import { useParams } from 'react-router-dom';
import PatientMeasurementSection from '../../components/patient/PatientMeasurementSection';
import { usePatientServiceEnrollment } from '../../apis/patientServices/hooks';

/**
 * PatientMeasurementsPage - Page for displaying patient measurements
 * 
 * This page shows measurement tracking for a specific patient service.
 */
const PatientMeasurementsPage = () => {
  const { patientId, serviceId } = useParams();
  
  // Get the patient's enrollment for this service
  const { data: enrollment, isLoading, error } = usePatientServiceEnrollment(patientId, serviceId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>Error loading patient service: {error.message}</p>
        </div>
      </div>
    );
  }
  
  if (!enrollment) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Patient is not enrolled in this service.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {enrollment.service?.name || 'Service'} Measurements
        </h1>
        <p className="text-gray-600">
          Track and monitor your progress over time.
        </p>
      </div>
      
      <PatientMeasurementSection
        enrollmentId={enrollment.id}
        serviceType={enrollment.service?.service_type}
      />
      
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
        <h3 className="font-medium">Tips for Success</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Consistently track your measurements at the same time of day</li>
          <li>Set realistic goals and celebrate small victories</li>
          <li>Reach out to your provider if you have questions about your progress</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientMeasurementsPage;
