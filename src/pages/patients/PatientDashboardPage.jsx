import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutGrid, CreditCard } from 'lucide-react';
import PatientProgramContent from './PatientProgramContent';
import PatientSubscriptionContent from './PatientSubscriptionContent';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('treatment');
  
  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F85C5C]/10 to-[#4F46E5]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#4F46E5]/10 to-[#F85C5C]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      
      {/* Welcome Banner */}
      <section className="px-0 pt-0 pb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-bold">Hello, {user?.first_name || 'Patient'}</h2>
            <p className="text-gray-500 text-sm">Welcome to your health dashboard</p>
          </div>
        </div>
      </section>
      
      {/* Tab Navigation - Vibrant Style */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="flex overflow-x-auto">
          <button 
            className={`whitespace-nowrap flex items-center justify-center px-6 py-4 font-medium text-sm relative flex-1 ${
              activeTab === 'treatment' 
                ? 'text-[#F85C5C] border-b-2 border-[#F85C5C] bg-gradient-to-r from-[#F85C5C]/5 to-transparent' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('treatment')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            My Treatment
          </button>
          <button 
            className={`whitespace-nowrap flex items-center justify-center px-6 py-4 font-medium text-sm relative flex-1 ${
              activeTab === 'subscription' 
                ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-gradient-to-r from-[#4F46E5]/5 to-transparent' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('subscription')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            My Subscription
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'treatment' ? (
        <PatientProgramContent />
      ) : (
        <PatientSubscriptionContent />
      )}
    </div>
  );
};

export default PatientDashboardPage;
