/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the unified Products & Subscriptions management page instead.
 * See src/apis/treatmentPackages/DEPRECATED.md for more information.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useTreatmentPackageById, 
  useCreateTreatmentPackage,
  useUpdateTreatmentPackage,
  useDeleteTreatmentPackage
} from '../../apis/treatmentPackages/hooks';
import { useServices } from '../../apis/services/hooks';
import { toast } from 'react-toastify';

// Display deprecation warning in console
console.warn(
  'The TreatmentPackageForm component is deprecated and will be removed in a future version. ' +
  'Please use the unified Products & Subscriptions management page instead.'
);

// Components
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const TreatmentPackageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Form state
  const [packageData, setPackageData] = useState({
    name: '',
    description: '',
    condition: '',
    base_price: 0,
    is_active: true,
    services: []
  });
  
  // Fetch package if editing
  const { 
    data: packageDetails, 
    isLoading: isLoadingPackage,
    isError: packageError 
  } = useTreatmentPackageById(id, {
    enabled: isEditing
  });
  
  // Fetch services for selection
  const { 
    data: servicesData, 
    isLoading: isLoadingServices 
  } = useServices({ active: true });

  // Create mutation
  const { mutate: createPackage, isLoading: isCreating } = useCreateTreatmentPackage({
    onSuccess: () => {
      toast.success('Treatment package created successfully');
      navigate('/admin/packages');
    }
  });

  // Update mutation
  const { mutate: updatePackage, isLoading: isUpdating } = useUpdateTreatmentPackage({
    onSuccess: () => {
      toast.success('Treatment package updated successfully');
      navigate('/admin/packages');
    }
  });

  // Delete mutation
  const { mutate: deletePackage, isLoading: isDeleting } = useDeleteTreatmentPackage({
    onSuccess: () => {
      toast.success('Treatment package deleted successfully');
      navigate('/admin/packages');
    }
  });

  // Set form data when package details load
  useEffect(() => {
    if (isEditing && packageDetails) {
      setPackageData({
        name: packageDetails.name || '',
        description: packageDetails.description || '',
        condition: packageDetails.condition || '',
        base_price: packageDetails.base_price || 0,
        is_active: packageDetails.is_active ?? true,
        services: packageDetails.services || []
      });
    }
  }, [isEditing, packageDetails]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle numeric field changes
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : parseFloat(value);
    
    setPackageData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  // Handle service selection
  const handleServiceToggle = (serviceId) => {
    setPackageData(prev => {
      const services = [...prev.services];
      const index = services.indexOf(serviceId);
      
      if (index === -1) {
        services.push(serviceId);
      } else {
        services.splice(index, 1);
      }
      
      return {
        ...prev,
        services
      };
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!packageData.name || !packageData.condition) {
      toast.error('Name and condition are required');
      return;
    }
    
    if (packageData.base_price < 0) {
      toast.error('Base price cannot be negative');
      return;
    }
    
    // Create or update
    if (isEditing) {
      updatePackage({
        id,
        packageData
      });
    } else {
      createPackage(packageData);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this treatment package? This action cannot be undone.')) {
      deletePackage(id);
    }
  };

  const isLoading = isLoadingPackage || isLoadingServices;
  const isSubmitting = isCreating || isUpdating || isDeleting;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title={isEditing ? 'Edit Treatment Package' : 'Create Treatment Package'} />
        <LoadingSpinner />
      </div>
    );
  }

  if (isEditing && packageError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Edit Treatment Package" />
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>Error loading treatment package: Package not found or an error occurred</p>
        </div>
        <button
          onClick={() => navigate('/admin/packages')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title={isEditing ? 'Edit Treatment Package' : 'Create Treatment Package'} />
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Name*
            </label>
            <input
              type="text"
              name="name"
              value={packageData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., Weight Management Program"
              required
            />
          </div>

          {/* Medical Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Condition*
            </label>
            <input
              type="text"
              name="condition"
              value={packageData.condition}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., Weight Management"
              required
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price ($)
            </label>
            <input
              type="number"
              name="base_price"
              value={packageData.base_price}
              onChange={handleNumericChange}
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is the monthly price before any duration discounts
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={packageData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Package Active
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={packageData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded"
              placeholder="Describe the treatment package..."
            />
          </div>
        </div>

        {/* Services Selection */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Included Services</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select the telehealth services that are included in this treatment package
          </p>
          
          {isLoadingServices ? (
            <LoadingSpinner />
          ) : servicesData?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicesData.data.map(service => (
                <div 
                  key={service.id}
                  className={`p-4 border rounded cursor-pointer ${
                    packageData.services.includes(service.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={packageData.services.includes(service.id)}
                      onChange={() => {}} // Handled by the div click
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1 mr-2"
                    />
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.duration_minutes} min</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">No active services available to include in this package.</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/packages')}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
          
          <div className="flex space-x-4">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                {isDeleting ? 'Deleting...' : 'Delete Package'}
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              {isSubmitting 
                ? (isEditing ? 'Saving...' : 'Creating...') 
                : (isEditing ? 'Save Changes' : 'Create Package')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TreatmentPackageForm;
