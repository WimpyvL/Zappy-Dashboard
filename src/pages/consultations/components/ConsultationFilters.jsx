import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import { Search, Filter, User, Briefcase } from 'lucide-react';

// Memoized filter components for better performance
const SearchInput = memo(({ searchTerm, onSearchTermChange }) => (
  <div className="flex-1 relative min-w-[200px]">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      placeholder="Search by patient, email, medication or provider name..."
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
      value={searchTerm}
      onChange={(e) => onSearchTermChange(e.target.value)}
      aria-label="Search consultations"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';

const StatusFilter = memo(({ statusFilter, onStatusFilterChange }) => (
  <div className="flex items-center space-x-2">
    <Filter className="h-5 w-5 text-gray-400" />
    <select
      className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none bg-white transition-colors duration-200"
      value={statusFilter}
      onChange={(e) => onStatusFilterChange(e.target.value)}
      aria-label="Filter by status"
    >
      <option value="all">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="followup">Follow-up</option>
      <option value="reviewed">Reviewed</option>
      <option value="archived">Archived</option>
    </select>
  </div>
));

StatusFilter.displayName = 'StatusFilter';

const ProviderFilter = memo(({ providerFilter, onProviderFilterChange, providers }) => {
  // Ensure providers is always an array
  const safeProviders = Array.isArray(providers) ? providers : [];
  
  return (
    <div className="flex items-center space-x-2">
      <User className="h-5 w-5 text-gray-400" />
      <select
        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none bg-white transition-colors duration-200"
        value={providerFilter}
        onChange={(e) => onProviderFilterChange(e.target.value)}
        aria-label="Filter by provider"
      >
        <option value="all">All Providers</option>
        {safeProviders.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {`${provider.first_name || ''} ${provider.last_name || ''}`.trim() || provider.id}
          </option>
        ))}
      </select>
    </div>
  );
});

ProviderFilter.displayName = 'ProviderFilter';

const ServiceFilter = memo(({ serviceFilter, onServiceFilterChange, services }) => {
  // Ensure services is always an array
  const safeServices = Array.isArray(services) ? services : [];
  
  return (
    <div className="flex items-center space-x-2">
      <Briefcase className="h-5 w-5 text-gray-400" />
      <select
        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none bg-white transition-colors duration-200"
        value={serviceFilter}
        onChange={(e) => onServiceFilterChange(e.target.value)}
        aria-label="Filter by service"
      >
        <option value="all">All Services</option>
        {safeServices.map((service) => (
          <option key={service.id} value={service.name}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
  );
});

ServiceFilter.displayName = 'ServiceFilter';

const DateRangeFilter = memo(({ dateRange, onDateRangeChange }) => (
  <div className="flex items-center space-x-2">
    <DatePicker.RangePicker
      onChange={onDateRangeChange}
      value={dateRange}
      className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200"
      aria-label="Filter by date range"
    />
  </div>
));

DateRangeFilter.displayName = 'DateRangeFilter';

const ConsultationFilters = ({
  searchTerm,
  statusFilter,
  providerFilter,
  serviceFilter,
  dateRange,
  providers,
  services,
  onSearchTermChange,
  onStatusFilterChange,
  onProviderFilterChange,
  onServiceFilterChange,
  onDateRangeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-wrap">
      <SearchInput 
        searchTerm={searchTerm} 
        onSearchTermChange={onSearchTermChange} 
      />
      
      <StatusFilter 
        statusFilter={statusFilter} 
        onStatusFilterChange={onStatusFilterChange} 
      />
      
      <ProviderFilter 
        providerFilter={providerFilter} 
        onProviderFilterChange={onProviderFilterChange} 
        providers={providers} 
      />
      
      <ServiceFilter 
        serviceFilter={serviceFilter} 
        onServiceFilterChange={onServiceFilterChange} 
        services={services} 
      />
      
      <DateRangeFilter 
        dateRange={dateRange} 
        onDateRangeChange={onDateRangeChange} 
      />
    </div>
  );
};

ConsultationFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  statusFilter: PropTypes.string.isRequired,
  providerFilter: PropTypes.string.isRequired,
  serviceFilter: PropTypes.string.isRequired,
  dateRange: PropTypes.any, // AntD DatePicker.RangePicker value (moment or dayjs)
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    })
  ),
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onSearchTermChange: PropTypes.func.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  onProviderFilterChange: PropTypes.func.isRequired,
  onServiceFilterChange: PropTypes.func.isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
};

export default memo(ConsultationFilters);
