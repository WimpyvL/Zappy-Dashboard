import React, { useState } from 'react';
import ConsultationFilters from '@/pages/consultations/components/ConsultationFilters';

export default function ConsultationFiltersStoryboard() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Sample data
  const sampleProviders = [
    { id: 'prov_1', first_name: 'John', last_name: 'Doe' },
    { id: 'prov_2', first_name: 'Jane', last_name: 'Smith' },
    { id: 'prov_3', first_name: 'Robert', last_name: 'Johnson' },
  ];

  const sampleServices = [
    { id: 'serv_1', name: 'Hair Loss Consultation' },
    { id: 'serv_2', name: 'Weight Management' },
    { id: 'serv_3', name: 'Skin Care Assessment' },
  ];

  return (
    <div className="bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Consultation Filters</h2>

      <ConsultationFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        providerFilter={providerFilter}
        serviceFilter={serviceFilter}
        dateRange={dateRange}
        providers={sampleProviders}
        services={sampleServices}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onProviderFilterChange={setProviderFilter}
        onServiceFilterChange={setServiceFilter}
        onDateRangeChange={setDateRange}
      />

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-md font-medium mb-2">Current Filter Values:</h3>
        <ul className="text-sm">
          <li>
            <strong>Search Term:</strong> {searchTerm || '(empty)'}
          </li>
          <li>
            <strong>Status:</strong> {statusFilter}
          </li>
          <li>
            <strong>Provider:</strong> {providerFilter}
          </li>
          <li>
            <strong>Service:</strong> {serviceFilter}
          </li>
          <li>
            <strong>Date Range:</strong>{' '}
            {dateRange ? 'Selected' : 'Not selected'}
          </li>
        </ul>
      </div>
    </div>
  );
}
