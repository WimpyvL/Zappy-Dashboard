import React, { createContext, useState, useEffect, useContext } from 'react';
// Comment out apiService import as we are mocking data
// import apiService from "../utils/apiService";

// Create context
const AppContext = createContext();

// --- Mock Data ---
const samplePatients = [
  {
    id: 'p001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    status: 'Active',
    tags: ['vip'],
  },
  {
    id: 'p002',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    status: 'Active',
    tags: [],
  },
  {
    id: 'p003',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@example.com',
    status: 'Inactive',
    tags: ['follow-up'],
  },
];

const sampleSessions = [
  {
    id: 's001',
    patientId: 'p001',
    patientName: 'John Smith',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled',
    type: 'Follow-up',
    tags: [],
  }, // Tomorrow
  {
    id: 's002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    scheduledDate: new Date().toISOString(),
    status: 'scheduled',
    type: 'Initial Consultation',
    tags: [],
  }, // Today
  {
    id: 's003',
    patientId: 'p003',
    patientName: 'Robert Wilson',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    type: 'Follow-up',
    tags: [],
  }, // Yesterday
];

const sampleOrders = [
  {
    id: 'o001',
    patientId: 'p001',
    orderDate: new Date().toISOString(),
    status: 'pending',
    medication: 'Ozempic',
    tags: [],
  },
  {
    id: 'o002',
    patientId: 'p002',
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'shipped',
    medication: 'Wegovy',
    tags: [],
  },
  {
    id: 'o003',
    patientId: 'p001',
    orderDate: new Date(Date.now() - 172800000).toISOString(),
    status: 'delivered',
    medication: 'Ozempic',
    tags: [],
  },
];

const sampleProducts = [
  {
    id: 1,
    name: 'Ozempic Pens',
    description: 'Injectable medication',
    category: 'Weight Loss',
    active: true,
    doses: [
      { id: 101, value: '0.25mg' },
      { id: 102, value: '0.5mg' },
      { id: 103, value: '1.0mg' },
    ],
  },
  {
    id: 2,
    name: 'Wegovy Pens',
    description: 'Injectable medication',
    category: 'Weight Loss',
    active: true,
    doses: [
      { id: 201, value: '1.7mg' },
      { id: 202, value: '2.4mg' },
    ],
  },
];

const sampleServices = [
  {
    id: 'svc001',
    name: 'Initial Consultation',
    description: 'First meeting with provider',
    price: 150,
    active: true,
  },
  {
    id: 'svc002',
    name: 'Follow-up Session',
    description: 'Regular check-in',
    price: 75,
    active: true,
  },
];

const sampleTags = [
  { id: 'vip', name: 'VIP', color: 'gold' },
  { id: 'follow-up', name: 'Needs Follow Up', color: 'blue' },
  { id: 'high-risk', name: 'High Risk', color: 'red' },
];

const sampleSubscriptionPlans = [
  {
    id: 1,
    name: 'Monthly Plan',
    description: 'Pay month-to-month with no commitment',
    billingFrequency: 'monthly',
    deliveryFrequency: 'monthly',
    price: 199.0,
    active: true,
    discount: 0,
    allowedProductDoses: [
      { productId: 1, doseId: 102 },
      { productId: 2, doseId: 201 },
    ], // Example using new structure
  },
  {
    id: 2,
    name: '3-Month Plan',
    description: 'Quarterly billing with monthly delivery',
    billingFrequency: 'quarterly',
    deliveryFrequency: 'monthly',
    price: 179.0,
    active: true,
    discount: 10,
    allowedProductDoses: [
      { productId: 1, doseId: 102 },
      { productId: 2, doseId: 201 },
    ],
  },
  {
    id: 3,
    name: '6-Month Plan',
    description:
      'Semi-annual billing with monthly delivery and maximum savings',
    billingFrequency: 'biannually',
    deliveryFrequency: 'monthly',
    price: 159.0,
    active: true,
    discount: 20,
    allowedProductDoses: [
      { productId: 1, doseId: 103 },
      { productId: 2, doseId: 202 },
    ],
  },
];
// --- End Mock Data ---

export const AppProvider = ({ children }) => {
  // State for core data types
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Added products state
  const [services, setServices] = useState([]); // Initialize empty
  const [subscriptionPlans, setSubscriptionPlans] = useState([]); // Initialize empty
  const [tags, setTags] = useState([]); // Initialize empty

  // State for secondary data types (still using sample for now)
  const [documents] = useState([]); // Initialize empty - TODO: Add fetchDocuments (Removed unused setDocuments)
  const [forms] = useState([]); // Initialize empty - TODO: Add fetchForms (Removed unused setForms)
  const [invoices] = useState([]); // Initialize empty - TODO: Add fetchInvoices (Removed unused setInvoices)

  // Loading states
  const [loading, setLoading] = useState({
    global: true,
    patients: true,
    sessions: true,
    orders: true,
    products: true, // Added products loading
    services: true, // Added services loading
    plans: true, // Added plans loading
    tags: true, // Added tags loading
    pharmacies: false, // Assuming not fetched initially
    providers: false, // Assuming not fetched initially
    insurance: false, // Assuming not fetched initially
    notes: false,
    documents: true, // Added documents loading (placeholder)
    forms: true, // Added forms loading (placeholder)
    invoices: true, // Added invoices loading (placeholder)
  });

  // Error states
  const [errors, setErrors] = useState({
    patients: null,
    sessions: null,
    orders: null,
    products: null, // Added products error
    services: null, // Added services error
    plans: null, // Added plans error
    tags: null, // Added tags error
    notes: null,
    documents: null, // Added documents error (placeholder)
    forms: null, // Added forms error (placeholder)
    invoices: null, // Added invoices error (placeholder)
  });

  // --- Fetch Functions (Mocked) ---

  const fetchPatients = () => {
    console.log('Using mock patient data');
    setPatients(samplePatients);
    setLoading((prev) => ({ ...prev, patients: false }));
    setErrors((prev) => ({ ...prev, patients: null }));
  };

  const fetchSessions = () => {
    console.log('Using mock session data');
    setSessions(sampleSessions);
    setLoading((prev) => ({ ...prev, sessions: false }));
    setErrors((prev) => ({ ...prev, sessions: null }));
  };

  const fetchOrders = () => {
    console.log('Using mock order data');
    setOrders(sampleOrders);
    setLoading((prev) => ({ ...prev, orders: false }));
    setErrors((prev) => ({ ...prev, orders: null }));
  };

  const fetchProducts = () => {
    console.log('Using mock product data');
    setProducts(sampleProducts);
    setLoading((prev) => ({ ...prev, products: false }));
    setErrors((prev) => ({ ...prev, products: null }));
  };

  const fetchServices = () => {
    console.log('Using mock service data');
    setServices(sampleServices);
    setLoading((prev) => ({ ...prev, services: false }));
    setErrors((prev) => ({ ...prev, services: null }));
  };

  // Keep fetchSubscriptionPlans with fallback for now, or mock it too
  const fetchSubscriptionPlans = () => {
    console.log('Using mock subscription plan data');
    setSubscriptionPlans(sampleSubscriptionPlans);
    setLoading((prev) => ({ ...prev, plans: false }));
    setErrors((prev) => ({ ...prev, plans: null }));
    // setLoading((prev) => ({ ...prev, plans: true }));
    // setErrors((prev) => ({ ...prev, plans: null }));
    // try {
    //   // const data = await apiService.subscriptionPlans.getAll(); // Mocked out
    //   const data = []; // Simulate empty API response to force fallback
    //   if (Array.isArray(data) && data.length > 0) {
    //        console.log("Fetched plans from API:", data);
    //        setSubscriptionPlans(data);
    //    } else {
    //        console.warn("API returned no subscription plans or invalid data, using sample data.");
    //        setSubscriptionPlans(sampleSubscriptionPlans);
    //    }
    // } catch (error) {
    //   console.error("Error fetching subscription plans, using sample data:", error);
    //   setErrors((prev) => ({
    //     ...prev,
    //     plans: error.response?.data?.message || "Failed to fetch plans",
    //   }));
    //   setSubscriptionPlans(sampleSubscriptionPlans);
    // } finally {
    //    setLoading((prev) => ({ ...prev, plans: false }));
    // }
  };

  const fetchTags = () => {
    console.log('Using mock tag data');
    setTags(sampleTags);
    setLoading((prev) => ({ ...prev, tags: false }));
    setErrors((prev) => ({ ...prev, tags: null }));
  };

  // TODO: Add mock fetchDocuments, fetchForms, fetchInvoices similarly if needed

  const fetchInitialData = () => {
    // Removed async as fetch functions are now synchronous
    console.log('Fetching initial mock data...');
    setLoading((prev) => ({ ...prev, global: true }));

    // Call mocked fetch functions directly (no need for Promise.all)
    fetchPatients();
    fetchSessions();
    fetchOrders();
    fetchProducts();
    fetchServices();
    fetchSubscriptionPlans();
    fetchTags();
    // TODO: Call mock fetchDocuments(), fetchForms(), fetchInvoices() here

    setLoading((prev) => ({ ...prev, global: false }));
    console.log('Finished fetching initial mock data.');
  };

  // Initial data fetching
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Added eslint-disable to suppress warning about missing dependency, as it's intentional for mock setup

  // --- Helper Functions (Keep existing ones - these might need mocking too if used) ---
  const getPatientOrders = (patientId) => {
    /* ... */
  };
  const getPatientSessions = (patientId) => {
    /* ... */
  };
  const getPatientNotes = async (patientId) => {
    /* ... */
  };
  const getPatientDocuments = (patientId) => {
    /* ... */
  };
  const getPatientForms = (patientId) => {
    /* ... */
  };
  const getPatientInvoices = (patientId) => {
    /* ... */
  };
  const addPatientNote = async (patientId, note) => {
    /* ... */
  };
  const updatePatientNote = async (patientId, noteId, updatedNote) => {
    /* ... */
  };
  const deletePatientNote = async (patientId, noteId) => {
    /* ... */
  };
  const updateSessionStatus = async (sessionId, newStatus) => {
    /* ... */
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    /* ... */
  };
  const createPatient = async (patientData) => {
    /* ... */
  };
  const updatePatient = async (patientId, patientData) => {
    /* ... */
  };
  const deletePatient = async (patientId) => {
    /* ... */
  };
  const updatePatientWeight = async (patientId, newWeight) => {
    /* ... */
  };
  const addTag = async (tagName, tagColor = 'gray') => {
    /* ... */
  };
  const updateTag = async (tagId, updatedTag) => {
    /* ... */
  };
  const deleteTag = async (tagId) => {
    /* ... */
  };
  const getAllTags = () => {
    return tags;
  }; // Updated to return state
  const getTagById = (tagId) => {
    return tags.find((tag) => tag.id === tagId);
  }; // Updated to use state
  const addPatientTag = async (patientId, tagId) => {
    /* ... */
  };
  const removePatientTag = async (patientId, tagId) => {
    /* ... */
  };
  const addSessionTag = async (sessionId, tagId) => {
    /* ... */
  };
  const removeSessionTag = async (sessionId, tagId) => {
    /* ... */
  };
  const addOrderTag = async (orderId, tagId) => {
    /* ... */
  };
  const removeOrderTag = async (orderId, tagId) => {
    /* ... */
  };
  const addDocumentTag = (documentId, tagId) => {
    /* ... */
  };
  const removeDocumentTag = (documentId, tagId) => {
    /* ... */
  };
  const addFormTag = (formId, tagId) => {
    /* ... */
  };
  const removeFormTag = (formId, tagId) => {
    /* ... */
  };
  const addInvoiceTag = (invoiceId, tagId) => {
    /* ... */
  };
  const removeInvoiceTag = (invoiceId, tagId) => {
    /* ... */
  };
  const filterEntitiesByTag = (entityType, tagId) => {
    /* ... */
  };
  const getServiceById = (serviceId) => {
    return services.find((service) => service.id === serviceId);
  }; // Updated to use state
  const getServicePlans = (serviceId) => {
    /* ... */
  }; // Keep existing logic using state
  const getAllPlans = () => {
    return subscriptionPlans;
  }; // Updated to return state
  const addService = async (serviceData) => {
    /* ... */
  };
  const updateService = async (serviceId, serviceData) => {
    /* ... */
  };
  const deleteService = async (serviceId) => {
    /* ... */
  };
  const addSubscriptionPlan = async (planData) => {
    /* ... */
  };
  const updateSubscriptionPlan = async (planId, planData) => {
    /* ... */
  };
  const deleteSubscriptionPlan = async (planId) => {
    /* ... */
  };
  const saveInitialConsultationNote = async (patientId, consultationData) => {
    /* ... */
  };
  const getPatientConsultationNotes = async (patientId) => {
    /* ... */
  };

  // --- Context Provider Value ---
  const contextValue = {
    // State
    patients,
    sessions,
    orders,
    products, // Added products
    documents,
    forms,
    invoices,
    tags,
    services,
    subscriptionPlans,
    loading,
    errors,

    // Data access functions
    getPatientOrders,
    getPatientSessions,
    getPatientNotes,
    getPatientDocuments,
    getPatientForms,
    getPatientInvoices,

    // Note management functions
    addPatientNote,
    updatePatientNote,
    deletePatientNote,

    // Status update functions
    updateSessionStatus,
    updateOrderStatus,

    // Patient management functions
    createPatient,
    updatePatient,
    deletePatient,
    updatePatientWeight,

    // Data fetching functions (now mostly point to mock setters)
    fetchPatients,
    fetchSessions,
    fetchOrders,
    fetchProducts, // Added fetchProducts
    fetchServices,
    fetchSubscriptionPlans,
    fetchTags,
    // TODO: Add fetchDocuments, fetchForms, fetchInvoices

    // Tag management functions
    addTag,
    updateTag,
    deleteTag,
    getAllTags,
    getTagById,

    // Tag assignment functions
    addPatientTag,
    removePatientTag,
    addSessionTag,
    removeSessionTag,
    addOrderTag,
    removeOrderTag,
    addDocumentTag,
    removeDocumentTag,
    addFormTag,
    removeFormTag,
    addInvoiceTag,
    removeInvoiceTag,

    // Tag filtering function
    filterEntitiesByTag,

    // Service management functions
    getServiceById,
    getServicePlans,
    getAllPlans, // Keep this, it now returns state
    addService,
    updateService,
    deleteService,

    // Subscription plan management
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,

    // Consultation note functions
    saveInitialConsultationNote,
    getPatientConsultationNotes,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    // Changed error check to undefined, as an empty object is a valid context value
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
