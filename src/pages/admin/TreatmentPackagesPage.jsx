/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the unified Products & Subscriptions management page instead.
 * See src/apis/treatmentPackages/DEPRECATED.md for more information.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreatmentPackages } from '../../apis/treatmentPackages/hooks';
import { initializeSubscriptionDurations } from '../../apis/subscriptionDurations/hooks';
import { toast } from 'react-toastify';

// Display deprecation warning in console
console.warn(
  'The TreatmentPackagesPage component is deprecated and will be removed in a future version. ' +
  'Please use the unified Products & Subscriptions management page instead.'
);

// Components
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const TreatmentPackagesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    page: 1,
    search: '',
    condition: '',
  });
  
  // Fetch packages with search params
  const { 
    data: packagesData, 
    isLoading, 
    isError, 
    error 
  } = useTreatmentPackages(searchParams);

  // Extract unique conditions for filtering
  const [conditions, setConditions] = useState([]);
  
  useEffect(() => {
    if (packagesData?.data) {
      const uniqueConditions = [...new Set(packagesData.data.map(pkg => pkg.condition))].filter(Boolean);
      setConditions(uniqueConditions);
    }
  }, [packagesData]);

  // Initialize subscription durations if needed
  useEffect(() => {
    const checkAndInitializeDurations = async () => {
      try {
        await initializeSubscriptionDurations();
      } catch (error) {
        console.error('Error initializing subscription durations:', error);
        toast.error('Failed to initialize subscription durations');
      }
    };
    
    checkAndInitializeDurations();
  }, []);

  // Handle search
  const handleSearch = (searchText) => {
    setSearchParams(prev => ({
      ...prev,
      search: searchText,
      page: 1, // Reset to first page on new search
    }));
  };

  // Handle condition filter
  const handleConditionChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      condition: e.target.value,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Navigate to create/edit pages
  const handleCreatePackage = () => {
    navigate('/admin/packages/create');
  };

  const handleEditPackage = (id) => {
    navigate(`/admin/packages/edit/${id}`);
  };

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Treatment Packages" />
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>Error loading treatment packages: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Treatment Packages" 
        actionButton={{
          label: "Create Package",
          onClick: handleCreatePackage
        }}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/2">
          <SearchBar 
            placeholder="Search packages..." 
            onSearch={handleSearch}
            initialValue={searchParams.search}
          />
        </div>
        
        {conditions.length > 0 && (
          <div className="md:w-1/2">
            <select
              className="w-full p-2 border rounded"
              value={searchParams.condition}
              onChange={handleConditionChange}
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packagesData?.data?.length > 0 ? (
                  packagesData.data.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{pkg.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{pkg.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pkg.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(pkg.base_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={pkg.is_active ? 'active' : 'inactive'}
                          type={pkg.is_active ? 'success' : 'danger'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pkg.services?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditPackage(pkg.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      No treatment packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {packagesData?.meta && (
            <div className="mt-4">
              <Pagination
                currentPage={packagesData.meta.current_page}
                totalPages={packagesData.meta.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TreatmentPackagesPage;
