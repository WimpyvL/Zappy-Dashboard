import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }

      // Log the error for debugging
      console.error('API Error Response:', error.response.data);

      // Return the error response for handling in components
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else caused the error
      console.error('API Request Error:', error.message);
      return Promise.reject({
        message: 'Error setting up the request.',
      });
    }
  }
);

// Auth API
const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Patients API
const patientsAPI = {
  getAll: () => apiClient.get('/patients'),
  getById: (id) => apiClient.get(`/patients/${id}`),
  create: (patientData) => apiClient.post('/patients', patientData),
  update: (id, patientData) => apiClient.put(`/patients/${id}`, patientData),
  delete: (id) => apiClient.delete(`/patients/${id}`),
  getNotes: (id) => apiClient.get(`/patients/${id}/notes`),
  addNote: (id, noteData) => apiClient.post(`/patients/${id}/notes`, noteData),
};

// Orders API
const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (orderData) => apiClient.post('/orders', orderData),
  update: (id, orderData) => apiClient.put(`/orders/${id}`, orderData),
  delete: (id) => apiClient.delete(`/orders/${id}`),
  getByPatient: (patientId) => apiClient.get(`/orders/patient/${patientId}`),
};

// Products API
const productsAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (productData) => apiClient.post('/products', productData),
  update: (id, productData) => apiClient.put(`/products/${id}`, productData),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Services API
const servicesAPI = {
  getAll: () => apiClient.get('/services'),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (serviceData) => apiClient.post('/services', serviceData),
  update: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
  delete: (id) => apiClient.delete(`/services/${id}`),
};

// Pharmacies API
const pharmaciesAPI = {
  getAll: () => apiClient.get('/pharmacies'),
  getById: (id) => apiClient.get(`/pharmacies/${id}`),
  create: (pharmacyData) => apiClient.post('/pharmacies', pharmacyData),
  update: (id, pharmacyData) =>
    apiClient.put(`/pharmacies/${id}`, pharmacyData),
  delete: (id) => apiClient.delete(`/pharmacies/${id}`),
  getByState: (state) => apiClient.get(`/pharmacies/state/${state}`),
};

// Export all APIs
export {
  apiClient,
  authAPI,
  patientsAPI,
  ordersAPI,
  productsAPI,
  servicesAPI,
  pharmaciesAPI,
};

export default apiClient;
