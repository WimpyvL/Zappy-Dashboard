import axios from 'axios';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import 'react-toastify/dist/ReactToastify.css';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': true
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    // Check for meta message in the response and show success toast
    if (response.data.meta && response.data.meta.message) {
      toast.success(response.data.meta.message);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token handling for login/register requests to prevent redirect loops
    const isAuthRequest =
      originalRequest.url.includes('/sign_in') ||
      originalRequest.url.includes('/register');

    // Handle token expiration/401 errors, but not for auth requests
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      // If a refresh token exists, try to get a new access token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await apiClient.post('/auth/refresh-token', { refreshToken });
          const { token } = res.data;

          localStorage.setItem('token', token);
          apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear auth state
          clearAuthState();

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear auth state
        clearAuthState();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Handle errors and show error messages using React Toastify
    if (error.response) {
      const errorMessage = error.response.data.error || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } else {
      toast.error('An error occurred. Please check your network connection and try again.');
    }

    return Promise.reject(error);
  }
);

// Helper function to clear auth state
const clearAuthState = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
};

// API service object with methods for common operations
const apiService = {
  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      try {
        const response = await apiClient.post('/admin/sign_in', { user: { email, password } });
        return response;
      } catch (error) {
        // Just throw the error, don't redirect on login failures
        console.error('Login error:', error);
        throw error;
      }
    },
    register: async (userData) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    forgotPassword: async (email) => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
    resetPassword: async (token, newPassword) => {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    },
    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      clearAuthState();
      return response.data;
    },
  },

  // User related endpoints
  users: {
    getProfile: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
    updateProfile: async (userData) => {
      const response = await apiClient.put('/users/profile', userData);
      return response.data;
    },
    changePassword: async (currentPassword, newPassword) => {
      const response = await apiClient.post('/users/change-password', { currentPassword, newPassword });
      return response.data;
    },
    // Added method for user referral info
    getReferralInfo: async () => {
      const response = await apiClient.get('/api/v1/me/referral-info'); // Assumed endpoint
      return response.data;
    },
  },

  patients: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/patients', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/patients/${id}`);
      return response.data;
    },
    create: async (patientData) => {
      const response = await apiClient.post('/api/v1/admin/patients', patientData);
      return response.data;
    },
    update: async (id, patientData) => {
      const response = await apiClient.put(`/api/v1/admin/patients/${id}`, patientData);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/patients/${id}`);
      return response.data;
    },
  },

  // Task related endpoints
  tasks: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/tasks', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/tasks/${id}`);
      return response.data;
    },
    create: async (taskData) => {
      const response = await apiClient.post('/api/v1/admin/tasks', { task: taskData });
      return response.data;
    },
    update: async (id, taskData) => {
      const response = await apiClient.put(`/api/v1/admin/tasks/${id}`, { task: taskData });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/tasks/${id}`);
      return response.data;
    },
    markCompleted: async (id) => {
      const response = await apiClient.put(`/api/v1/admin/tasks/${id}/mark_completed`);
      return response.data;
    },
    // Get all assignable users for a task
    getAssignees: async () => {
      const response = await apiClient.get('/api/v1/admin/users');
      return response.data;
    },
    // Get all patients that can be associated with a task
    getTaskablePatients: async () => {
      const response = await apiClient.get('/api/v1/admin/patients');
      return response.data;
    }
  },

  // Tags related endpoints
  tags: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/tags', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/tags/${id}`);
      return response.data;
    },
    create: async (tagData) => {
      const response = await apiClient.post('/api/v1/admin/tags', { tag: tagData });
      return response.data;
    },
    update: async (id, tagData) => {
      const response = await apiClient.put(`/api/v1/admin/tags/${id}`, { tag: tagData });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/tags/${id}`);
      return response.data;
    },
    getUsage: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/tags/${id}/usage`);
      return response.data;
    }
  },

  // Service related endpoints
  services: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/services', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/services/${id}`);
      return response.data;
    },
    create: async (serviceData) => {
      const response = await apiClient.post('/api/v1/admin/services', { service: serviceData });
      return response.data;
    },
    update: async (id, serviceData) => {
      const response = await apiClient.put(`/api/v1/admin/services/${id}`, { service: serviceData });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/services/${id}`);
      return response.data;
    },
    toggleActive: async (id, active) => {
      const response = await apiClient.put(`/api/v1/admin/services/${id}/toggle_active`, { active });
      return response.data;
    }
  },

  // Order related endpoints
  orders: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/orders', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/orders/${id}`);
      return response.data;
    },
    create: async (orderData) => {
      const response = await apiClient.post('/api/v1/admin/orders', orderData);
      return response.data;
    },
    update: async (id, orderData) => {
      const response = await apiClient.put(`/api/v1/admin/orders/${id}`, orderData);
      return response.data;
    },
    updateStatus: async (id, status) => {
      const response = await apiClient.put(`/api/v1/admin/orders/${id}/status`, { status });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/orders/${id}`);
      return response.data;
    },
  },

  // Product related endpoints
  products: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/products', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/products/${id}`);
      return response.data;
    },
    create: async (productData) => {
      const response = await apiClient.post('/api/v1/admin/products', productData);
      return response.data;
    },
    update: async (id, productData) => {
      const response = await apiClient.put(`/api/v1/admin/products/${id}`, productData);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/products/${id}`);
      return response.data;
    },
  },


  // Product-Service Links endpoints
  productServiceLinks: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/product_service_links', { params });
      return response.data;
    },
    getByProductId: async (productId) => {
      const response = await apiClient.get(`/api/v1/admin/product_service_links`, { params: { product_id: productId } });
      return response.data;
    },
    create: async (linkData) => {
      const response = await apiClient.post('/api/v1/admin/product_service_links', linkData);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/product_service_links/${id}`);
      return response.data;
    },
    // Create or update multiple links for a product
    createBulk: async (productId, serviceIds) => {
      const response = await apiClient.post('/api/v1/admin/product_service_links', {
        product_id: productId,
        service_ids: serviceIds
      });
      return response.data;
    }
  },

  // Subscription Plan related endpoints (Renamed from subscriptions)
  subscriptionPlans: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/subscription_plans', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/subscription_plans/${id}`);
      return response.data;
    },
    create: async (planData) => { // Renamed parameter
      const response = await apiClient.post('/api/v1/admin/subscription_plans', { subscription_plan: planData }); // Assuming nested structure
      return response.data;
    },
    update: async (id, planData) => { // Renamed parameter
      const response = await apiClient.put(`/api/v1/admin/subscription_plans/${id}`, { subscription_plan: planData }); // Assuming nested structure
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/subscription_plans/${id}`);
      return response.data;
    },
  },

  // Pharmacy related endpoints
  pharmacies: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/pharmacies', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/pharmacies/${id}`);
      return response.data;
    },
    create: async (pharmacyData) => {
      const response = await apiClient.post('/api/v1/admin/pharmacies', { pharmacy: pharmacyData });
      return response.data;
    },
    update: async (id, pharmacyData) => {
      const response = await apiClient.put(`/api/v1/admin/pharmacies/${id}`, { pharmacy: pharmacyData });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/pharmacies/${id}`);
      return response.data;
    },
    toggleActive: async (id, active) => {
      const response = await apiClient.put(`/api/v1/admin/pharmacies/${id}/toggle_active`, { active });
      return response.data;
    }
  },

  // Insurance related endpoints
  insurances: {
    getAllRecords: () => apiService.get("/api/v1/admin/insurance_records"),
    getRecord: (id) => apiService.get(`/api/v1/admin/insurance_records/${id}`),
    createRecord: (data) =>
      apiService.post("/api/v1/admin/insurance_records", data),
    updateRecord: (id, data) =>
      apiService.put(`/api/v1/admin/insurance_records/${id}`, data),
    uploadDocument: (id, formData) =>
      apiService.post(
        `/api/v1/admin/insurance_records/${id}/upload_document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ),
    deleteDocument: (id, documentId) =>
      apiService.delete(
        `/api/v1/admin/insurance_records/${id}/documents/${documentId}`
      ),
  },

  // Discount related endpoints
  discounts: {
    getAll: async (params) => {
      const response = await apiClient.get('/api/v1/admin/discounts', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/discounts/${id}`);
      return response.data;
    },
    create: async (discountData) => {
      const response = await apiClient.post('/api/v1/admin/discounts', { discount: discountData });
      return response.data;
    },
    update: async (id, discountData) => {
      const response = await apiClient.put(`/api/v1/admin/discounts/${id}`, { discount: discountData });
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/discounts/${id}`);
      return response.data;
    },
    toggleActive: async (id, active) => {
      const response = await apiClient.put(`/api/v1/admin/discounts/${id}/toggle_active`, { active });
      return response.data;
    }
  },

  // Added Referrals section
  referrals: {
    getSettings: async () => {
      // Fetches current reward amount and recipient - needs public or specific user access
      const response = await apiClient.get('/api/v1/referral-settings'); // Assumed endpoint
      return response.data;
    },
    updateSettings: async (settingsData) => { // For Admin
      // Updates reward amount and recipient
      const response = await apiClient.put('/api/v1/admin/referral-settings', settingsData); // Assumed admin endpoint
      return response.data;
    },
    getAllAdmin: async (params) => { // For Admin
      // Fetches the full referral history
      const response = await apiClient.get('/api/v1/admin/referrals', { params }); // Assumed admin endpoint
      return response.data; // Assuming response structure { referrals: [...] } or similar
    },
  },

  // Generic request methods for custom endpoints
  get: async (endpoint, params) => {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },
  post: async (endpoint, data) => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },
  put: async (endpoint, data) => {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  },
  delete: async (endpoint) => {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },
};

// React Query hooks
export const useGetProfile = () => {
  return useQuery('getProfile', apiService.users.getProfile);
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(apiService.users.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('getProfile');
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while updating the profile.');
    },
  });
};

export const useChangePassword = () => {
  return useMutation(apiService.users.changePassword, {
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while changing the password.');
    },
  });
};

// Tag related hooks
export const useGetAllTags = (params) => {
  return useQuery(['getAllTags', params], () => apiService.tags.getAll(params), {
    onError: (error) => {
      toast.error(error.message || 'An error occurred while fetching tags.');
    },
  });
};

export const useGetTagById = (id) => {
  return useQuery(['getTagById', id], () => apiService.tags.getById(id), {
    enabled: !!id,
    onError: (error) => {
      toast.error(error.message || 'An error occurred while fetching the tag.');
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation(apiService.tags.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('getAllTags');
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while creating the tag.');
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, tagData }) => apiService.tags.update(id, tagData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getAllTags');
        toast.success('Tag updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'An error occurred while updating the tag.');
      },
    }
  );
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation(apiService.tags.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('getAllTags');
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the tag.');
    },
  });
};

export const useGetTagUsage = (id) => {
  return useQuery(['getTagUsage', id], () => apiService.tags.getUsage(id), {
    enabled: !!id,
    onError: (error) => {
      toast.error(error.message || 'An error occurred while fetching tag usage.');
    },
  });
};

export const useGetAllPatients = (params) => {
  return useQuery(['getAllPatients', params], () => apiService.patients.getAll(params), {
    onError: (error) => {
      toast.error(error.message || 'An error occurred while fetching patients.');
    },
  });
};

export const useGetPatientById = (id) => {
  return useQuery(['getPatientById', id], () => apiService.patients.getById(id), {
    onError: (error) => {
      toast.error(error.message || 'An error occurred while fetching the patient.');
    },
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation(apiService.patients.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('getAllPatients');
      toast.success('Patient created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while creating the patient.');
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, patientData }) => apiService.patients.update(id, patientData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getAllPatients');
        toast.success('Patient updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'An error occurred while updating the patient.');
      },
    }
  );
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation(apiService.patients.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('getAllPatients');
      toast.success('Patient deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the patient.');
    },
  });
};

// Add similar hooks for other endpoints as needed

export default apiService;
