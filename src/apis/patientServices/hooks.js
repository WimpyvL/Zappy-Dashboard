import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import useToast from '../../hooks/useToast';
import * as patientServicesApi from './api';

/**
 * Hook to fetch all services a patient is enrolled in
 * @returns {Object} Object containing services data, loading state, and error state
 */
export const usePatientServices = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPatientServices = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch patient service enrollments using the API
        const enrollments = await patientServicesApi.fetchPatientServices(user.id);

        // Format the data for easier consumption by components
        const formattedServices = enrollments.map(enrollment => ({
          id: enrollment.id,
          serviceId: enrollment.services.id,
          name: enrollment.services.name,
          description: enrollment.services.description,
          type: enrollment.services.service_type,
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
          lastActivityAt: enrollment.last_activity_at,
          settings: enrollment.settings,
          features: enrollment.services.features,
          resourceCategories: enrollment.services.resource_categories,
          productCategories: enrollment.services.product_categories
        }));

        setData(formattedServices);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient services:', err);
        setError('Failed to load your services. Please try again later.');
        showToast('error', 'Failed to load your services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientServices();
  }, [user, showToast]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch a single patient service enrollment by ID
 * @param {string} enrollmentId - The ID of the enrollment to fetch
 * @returns {Object} Object containing service data, loading state, and error state
 */
export const usePatientServiceDetails = (enrollmentId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!user || !enrollmentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch the specific enrollment using the API
        const enrollment = await patientServicesApi.fetchServiceDetails(enrollmentId, user.id);

        // Format the data
        const formattedService = {
          id: enrollment.id,
          serviceId: enrollment.services.id,
          name: enrollment.services.name,
          description: enrollment.services.description,
          type: enrollment.services.service_type,
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
          lastActivityAt: enrollment.last_activity_at,
          settings: enrollment.settings,
          features: enrollment.services.features,
          resourceCategories: enrollment.services.resource_categories,
          productCategories: enrollment.services.product_categories
        };

        setData(formattedService);
        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [user, enrollmentId]);

  return { data, isLoading, error };
};

/**
 * Hook to update a patient service enrollment status
 * @returns {Object} Object containing update function, loading state, and error state
 */
export const useUpdateServiceStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const updateStatus = async (enrollmentId, newStatus) => {
    if (!user || !enrollmentId) {
      return { success: false, error: 'Missing required information' };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Update the status using the API
      await patientServicesApi.updateServiceStatus(enrollmentId, user.id, newStatus);

      showToast('success', `Service ${newStatus === 'paused' ? 'paused' : newStatus === 'active' ? 'activated' : 'updated'} successfully`);
      return { success: true };
    } catch (err) {
      console.error('Error updating service status:', err);
      const errorMessage = 'Failed to update service status. Please try again later.';
      setError(errorMessage);
      showToast('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error };
};

/**
 * Hook to update patient service settings
 * @returns {Object} Object containing update function, loading state, and error state
 */
export const useUpdateServiceSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const updateSettings = async (enrollmentId, newSettings) => {
    if (!user || !enrollmentId) {
      return { success: false, error: 'Missing required information' };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Update the settings using the API
      const updatedEnrollment = await patientServicesApi.updateServiceSettings(enrollmentId, user.id, newSettings);

      showToast('success', 'Service settings updated successfully');
      return { success: true, settings: updatedEnrollment.settings };
    } catch (err) {
      console.error('Error updating service settings:', err);
      const errorMessage = 'Failed to update service settings. Please try again later.';
      setError(errorMessage);
      showToast('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSettings, isLoading, error };
};

/**
 * Hook to fetch medications for a patient's service
 * @param {string} serviceType - The type of service to fetch medications for
 * @returns {Object} Object containing medications data, loading state, and error state
 */
export const useServiceMedications = (serviceType) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMedications = async () => {
      if (!user || !serviceType) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch medications using the API
        const medications = await patientServicesApi.fetchServiceMedications(user.id, serviceType);
        setData(medications);
        setError(null);
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError('Failed to load medications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, [user, serviceType]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch action items for a patient's service
 * @param {string} serviceType - The type of service to fetch action items for
 * @returns {Object} Object containing action items data, loading state, and error state
 */
export const useServiceActionItems = (serviceType) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActionItems = async () => {
      if (!user || !serviceType) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch action items using the API
        const actionItems = await patientServicesApi.fetchServiceActionItems(user.id, serviceType);
        setData(actionItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching action items:', err);
        setError('Failed to load action items. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActionItems();
  }, [user, serviceType]);

  return { data, isLoading, error };
};
