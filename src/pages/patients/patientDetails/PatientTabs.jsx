// components/patients/components/PatientTabs.jsx
import React from 'react';
import {
  User,
  Calendar,
  Package,
  FileText,
  File,
  Clipboard,
  CreditCard,
} from 'lucide-react';

const TabButton = ({ active, onClick, icon, label, count }) => {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`py-4 px-6 text-sm font-medium ${
        active
          ? 'border-b-2 border-indigo-500 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-4 w-4 inline mr-1" />
      {label} {count !== undefined && `(${count})`}
    </button>
  );
};

const PatientTabs = ({
  activeTab,
  setActiveTab,
  patientSessions,
  patientOrders,
  patientNotes,
  patientDocuments,
  patientForms,
}) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto">
        <TabButton
          active={activeTab === 'info'}
          onClick={() => setActiveTab('info')}
          icon={User}
          label="Patient Info"
        />
        <TabButton
          active={activeTab === 'sessions'}
          onClick={() => setActiveTab('sessions')}
          icon={Calendar}
          label="Sessions"
          count={patientSessions.length}
        />
        <TabButton
          active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          icon={Package}
          label="Orders"
          count={patientOrders.length}
        />
        <TabButton
          active={activeTab === 'notes'}
          onClick={() => setActiveTab('notes')}
          icon={FileText}
          label="Notes"
          count={patientNotes.length}
        />
        <TabButton
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          icon={File}
          label="Documents"
          count={patientDocuments.length}
        />
        <TabButton
          active={activeTab === 'forms'}
          onClick={() => setActiveTab('forms')}
          icon={Clipboard}
          label="Forms"
          count={patientForms.length}
        />
        <TabButton
          active={activeTab === 'billing'}
          onClick={() => setActiveTab('billing')}
          icon={CreditCard}
          label="Billing"
        />
      </nav>
    </div>
  );
};

export default PatientTabs;
