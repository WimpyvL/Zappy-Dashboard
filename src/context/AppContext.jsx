import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../utils/apiService";

// Create context
const AppContext = createContext();

// Sample tags data - Will be replaced by API call
// const sampleTags = [ ... ];

// Sample documents for patients - Will be replaced by API call
// const sampleDocuments = [ ... ];

// Sample forms sent to patients - Will be replaced by API call
// const sampleForms = [ ... ];

// Sample invoices for patients - Will be replaced by API call
// const sampleInvoices = [ ... ];

// Sample services data - Will be replaced by API call
// const sampleServices = [ ... ];

// Re-added Sample subscription plans as fallback
const sampleSubscriptionPlans = [
  {
    id: 1,
    name: 'Monthly Plan',
    description: 'Pay month-to-month with no commitment',
    billingFrequency: 'monthly',
    deliveryFrequency: 'monthly',
    price: 199.00,
    active: true,
    discount: 0,
    allowedProductDoses: [{ productId: 1, doseId: 102 }, { productId: 2, doseId: 201 }] // Example using new structure
  },
  {
    id: 2,
    name: '3-Month Plan',
    description: 'Quarterly billing with monthly delivery',
    billingFrequency: 'quarterly',
    deliveryFrequency: 'monthly',
    price: 179.00,
    active: true,
    discount: 10,
    allowedProductDoses: [{ productId: 1, doseId: 102 }, { productId: 2, doseId: 201 }]
  },
  {
    id: 3,
    name: '6-Month Plan',
    description: 'Semi-annual billing with monthly delivery and maximum savings',
    billingFrequency: 'biannually',
    deliveryFrequency: 'monthly',
    price: 159.00,
    active: true,
    discount: 20,
    allowedProductDoses: [{ productId: 1, doseId: 103 }, { productId: 2, doseId: 202 }]
  }
];

// Sample products data - Will be replaced by API call
// const sampleProducts = [ ... ]; // Need to define or fetch

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
  const [documents, setDocuments] = useState([]); // Initialize empty - TODO: Add fetchDocuments
  const [forms, setForms] = useState([]); // Initialize empty - TODO: Add fetchForms
  const [invoices, setInvoices] = useState([]); // Initialize empty - TODO: Add fetchInvoices


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

  // --- Fetch Functions ---

  const fetchPatients = async () => {
    setLoading((prev) => ({ ...prev, patients: true }));
    setErrors((prev) => ({ ...prev, patients: null })); // Clear previous error
    try {
      const data = await apiService.patients.getAll();
      setPatients(data.data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching patients:", error);
      setErrors((prev) => ({
        ...prev,
        patients: error.response?.data?.message || "Failed to fetch patients",
      }));
      setPatients([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }
  };

  const fetchSessions = async () => {
    setLoading((prev) => ({ ...prev, sessions: true }));
    setErrors((prev) => ({ ...prev, sessions: null }));
    try {
      const data = await apiService.sessions.getAll();
      const sessionsWithTags = (data || []).map((session) => ({ // Ensure data is array
        ...session,
        tags: session.tags || [],
      }));
      setSessions(sessionsWithTags);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setErrors((prev) => ({
        ...prev,
        sessions: error.response?.data?.message || "Failed to fetch sessions",
      }));
      setSessions([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, sessions: false }));
    }
  };

  const fetchOrders = async () => {
    setLoading((prev) => ({ ...prev, orders: true }));
    setErrors((prev) => ({ ...prev, orders: null }));
    try {
      const data = await apiService.orders.getAll();
      const ordersWithTags = (data.data || []).map((order) => ({ // Ensure data.data is array
        ...order,
        tags: order.tags || [],
      }));
      setOrders(ordersWithTags);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setErrors((prev) => ({
        ...prev,
        orders: error.response?.data?.message || "Failed to fetch orders",
      }));
      setOrders([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  // Added fetchProducts
  const fetchProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    setErrors((prev) => ({ ...prev, products: null }));
    try {
      const data = await apiService.products.getAll(); // Assuming this exists
      setProducts(data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrors((prev) => ({
        ...prev,
        products: error.response?.data?.message || "Failed to fetch products",
      }));
      setProducts([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const fetchServices = async () => {
    setLoading((prev) => ({ ...prev, services: true }));
    setErrors((prev) => ({ ...prev, services: null }));
    try {
      const data = await apiService.services.getAll(); // Use API call
      setServices(data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching services:", error);
      setErrors((prev) => ({
        ...prev,
        services: error.response?.data?.message || "Failed to fetch services",
      }));
      setServices([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, services: false }));
    }
  };

  const fetchSubscriptionPlans = async () => {
    setLoading((prev) => ({ ...prev, plans: true }));
    setErrors((prev) => ({ ...prev, plans: null }));
    try {
      const data = await apiService.subscriptionPlans.getAll();
      // Use fetched data only if it's a non-empty array, otherwise use sample data
      if (Array.isArray(data) && data.length > 0) {
           console.log("Fetched plans from API:", data);
           setSubscriptionPlans(data);
       } else {
           console.warn("API returned no subscription plans or invalid data, using sample data.");
           setSubscriptionPlans(sampleSubscriptionPlans); // Use sample data if API returns empty/invalid
       }
    } catch (error) {
      console.error("Error fetching subscription plans, using sample data:", error);
      setErrors((prev) => ({
        ...prev,
        plans: error.response?.data?.message || "Failed to fetch plans",
      }));
      setSubscriptionPlans(sampleSubscriptionPlans); // Use sample data on error too
    } finally {
       setLoading((prev) => ({ ...prev, plans: false }));
    }
  };

  const fetchTags = async () => {
    setLoading((prev) => ({ ...prev, tags: true }));
    setErrors((prev) => ({ ...prev, tags: null }));
    try {
      const data = await apiService.tags.getAll(); // Use API call
      setTags(data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching tags:", error);
      setErrors((prev) => ({
        ...prev,
        tags: error.response?.data?.message || "Failed to fetch tags",
      }));
      setTags([]); // Set empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  // TODO: Add fetchDocuments, fetchForms, fetchInvoices similarly

  const fetchInitialData = async () => {
    setLoading((prev) => ({ ...prev, global: true }));
    try {
      // Fetch data in parallel
      await Promise.all([
        fetchPatients(),
        fetchSessions(),
        fetchOrders(),
        fetchProducts(), // Added fetchProducts
        fetchServices(),
        fetchSubscriptionPlans(),
        fetchTags(),
        // TODO: Add fetchDocuments(), fetchForms(), fetchInvoices() here
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      // Set a global error state?
    } finally {
      setLoading((prev) => ({ ...prev, global: false }));
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- Helper Functions (Keep existing ones) ---
  const getPatientOrders = (patientId) => { /* ... */ };
  const getPatientSessions = (patientId) => { /* ... */ };
  const getPatientNotes = async (patientId) => { /* ... */ };
  const getPatientDocuments = (patientId) => { /* ... */ };
  const getPatientForms = (patientId) => { /* ... */ };
  const getPatientInvoices = (patientId) => { /* ... */ };
  const addPatientNote = async (patientId, note) => { /* ... */ };
  const updatePatientNote = async (patientId, noteId, updatedNote) => { /* ... */ };
  const deletePatientNote = async (patientId, noteId) => { /* ... */ };
  const updateSessionStatus = async (sessionId, newStatus) => { /* ... */ };
  const updateOrderStatus = async (orderId, newStatus) => { /* ... */ };
  const createPatient = async (patientData) => { /* ... */ };
  const updatePatient = async (patientId, patientData) => { /* ... */ };
  const deletePatient = async (patientId) => { /* ... */ };
  const updatePatientWeight = async (patientId, newWeight) => { /* ... */ };
  const addTag = async (tagName, tagColor = "gray") => { /* ... */ };
  const updateTag = async (tagId, updatedTag) => { /* ... */ };
  const deleteTag = async (tagId) => { /* ... */ };
  const getAllTags = () => { return tags; }; // Updated to return state
  const getTagById = (tagId) => { return tags.find((tag) => tag.id === tagId); }; // Updated to use state
  const addPatientTag = async (patientId, tagId) => { /* ... */ };
  const removePatientTag = async (patientId, tagId) => { /* ... */ };
  const addSessionTag = async (sessionId, tagId) => { /* ... */ };
  const removeSessionTag = async (sessionId, tagId) => { /* ... */ };
  const addOrderTag = async (orderId, tagId) => { /* ... */ };
  const removeOrderTag = async (orderId, tagId) => { /* ... */ };
  const addDocumentTag = (documentId, tagId) => { /* ... */ };
  const removeDocumentTag = (documentId, tagId) => { /* ... */ };
  const addFormTag = (formId, tagId) => { /* ... */ };
  const removeFormTag = (formId, tagId) => { /* ... */ };
  const addInvoiceTag = (invoiceId, tagId) => { /* ... */ };
  const removeInvoiceTag = (invoiceId, tagId) => { /* ... */ };
  const filterEntitiesByTag = (entityType, tagId) => { /* ... */ };
  const getServiceById = (serviceId) => { return services.find((service) => service.id === serviceId); }; // Updated to use state
  const getServicePlans = (serviceId) => { /* ... */ }; // Keep existing logic using state
  const getAllPlans = () => { return subscriptionPlans; }; // Updated to return state
  const addService = async (serviceData) => { /* ... */ };
  const updateService = async (serviceId, serviceData) => { /* ... */ };
  const deleteService = async (serviceId) => { /* ... */ };
  const addSubscriptionPlan = async (planData) => { /* ... */ };
  const updateSubscriptionPlan = async (planId, planData) => { /* ... */ };
  const deleteSubscriptionPlan = async (planId) => { /* ... */ };
  const saveInitialConsultationNote = async (patientId, consultationData) => { /* ... */ };
  const getPatientConsultationNotes = async (patientId) => { /* ... */ };

  // --- Context Provider Value ---
  return (
    <AppContext.Provider
      value={{
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

        // Data fetching functions
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.error("useAppContext must be used within an AppProvider");
    // Optionally throw an error or return a default context value
    // throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
