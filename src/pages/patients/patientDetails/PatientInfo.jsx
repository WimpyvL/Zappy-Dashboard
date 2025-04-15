// components/patients/components/PatientInfo.jsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import PatientSubscriptions from "../PatientSubscriptions";
import StatusBadge from "./common/StatusBadge";

const PatientInfo = ({ patient }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Calculate patient age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "Unknown";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Patient Information Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Patient Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              {/* Use optional chaining for safety */}
              <p className="text-sm font-medium">{patient?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              {/* Assuming 'phone' column exists */}
              <p className="text-sm font-medium">{patient?.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              {/* Assuming 'address' is a jsonb object with fields like street, city, etc. */}
              {/* Adjust display based on actual address structure */}
              <p className="text-sm font-medium">
                {patient?.address ? `${patient.address.street || ''}, ${patient.address.city || ''}` : "No address on file"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="text-sm font-medium">
              {patient?.dob ? `${formatDate(patient.dob)} (Age: ${calculateAge(patient.dob)})` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div>
              <StatusBadge status={patient.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preferred Pharmacy</p>
            {/* TODO: Add preferred_pharmacy_id FK to patients table and join pharmacy name */}
            <p className="text-sm font-medium">
              {patient?.preferredPharmacy || "Not specified"} {/* Placeholder */}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Information Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Medical Information
        </h2>
        <div className="space-y-3">
          {/* TODO: Add assigned_doctor_id FK to patients table and join doctor name */}
          <div>
            <p className="text-sm text-gray-500">Assigned Doctor</p>
            <p className="text-sm font-medium">{patient?.assignedDoctor || 'N/A'}</p> {/* Placeholder */}
          </div>
          {/* TODO: Current Medication might come from orders or a separate prescriptions table */}
          <div>
            <p className="text-sm text-gray-500">Current Medication</p>
            <p className="text-sm font-medium">{patient?.medication || 'N/A'}</p> {/* Placeholder */}
          </div>
          {/* TODO: Medical Notes might be a separate table or field */}
          <div>
            <p className="text-sm text-gray-500">Medical Notes</p>
            <p className="text-sm font-medium">
              {patient?.medicalNotes || "No notes available"} {/* Placeholder */}
            </p>
          </div>
          {/* TODO: Last Visit / Next Appointment likely come from a sessions/appointments table */}
          <div>
            <p className="text-sm text-gray-500">Last Visit</p>
            <p className="text-sm font-medium">
              {patient?.lastVisit
                ? formatDate(patient.lastVisit)
                : "No visits recorded"} {/* Placeholder */}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Appointment</p>
            <p className="text-sm font-medium">
              {patient?.nextAppointment
                ? formatDate(patient.nextAppointment)
                : "No appointment scheduled"} {/* Placeholder */}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="md:col-span-2">
        <PatientSubscriptions patient={patient} />
      </div>
    </div>
  );
};

export default PatientInfo;
