import React, { createContext, useState, useContext, useCallback } from 'react'; // Removed useEffect

// Create context
const AppContext = createContext();

// Removed all Mock Data (samplePatients, sampleSessions, etc.)

export const AppProvider = ({ children }) => {
  // State for view mode simulation
  const [viewMode, setViewMode] = useState('admin'); // 'admin' or 'patient'

  // NOTE: Removed state for patients, sessions, orders, products, services, plans, tags, documents, forms, invoices
  // It's assumed this data will be fetched and managed via React Query hooks (e.g., usePatients, useOrders)
  // in the components where it's needed, rather than being held globally in this context.

  // NOTE: Removed loading and error states. React Query handles this per-query.
  // If truly global loading/error states are needed, they could be managed here,
  // but it's often better handled closer to the data fetching logic.

  // --- Removed Mock Fetch Functions ---
  // (fetchPatients, fetchSessions, fetchOrders, fetchProducts, fetchServices, fetchSubscriptionPlans, fetchTags, fetchInitialData)

  // --- Removed Initial Data Fetching useEffect ---

  // --- Helper Functions (Placeholder - Functionality depends on actual data fetching/state management) ---
  // These functions likely need to be removed or significantly refactored
  // depending on how data is managed (e.g., using React Query hooks directly in components).
  // Keeping them as placeholders for now, but they won't work without the removed state.

  const getPatientOrders = (patientId) => {
    console.warn('getPatientOrders function needs implementation based on actual data fetching.');
    return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getPatientSessions = (patientId) => {
     console.warn('getPatientSessions function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getPatientNotes = async (patientId) => {
     console.warn('getPatientNotes function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getPatientDocuments = (patientId) => {
     console.warn('getPatientDocuments function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getPatientForms = (patientId) => {
     console.warn('getPatientForms function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getPatientInvoices = (patientId) => {
     console.warn('getPatientInvoices function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const addPatientNote = async (patientId, note) => {
     console.warn('addPatientNote function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updatePatientNote = async (patientId, noteId, updatedNote) => {
     console.warn('updatePatientNote function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const deletePatientNote = async (patientId, noteId) => {
     console.warn('deletePatientNote function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updateSessionStatus = async (sessionId, newStatus) => {
     console.warn('updateSessionStatus function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updateOrderStatus = async (orderId, newStatus) => {
     console.warn('updateOrderStatus function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const createPatient = async (patientData) => {
     console.warn('createPatient function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updatePatient = async (patientId, patientData) => {
     console.warn('updatePatient function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const deletePatient = async (patientId) => {
     console.warn('deletePatient function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updatePatientWeight = async (patientId, newWeight) => {
     console.warn('updatePatientWeight function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addTag = async (tagName, tagColor = 'gray') => {
     console.warn('addTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updateTag = async (tagId, updatedTag) => {
     console.warn('updateTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const deleteTag = async (tagId) => {
     console.warn('deleteTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const getAllTags = () => {
     console.warn('getAllTags function needs implementation based on actual data fetching.');
     return []; // Placeholder
  };
  const getTagById = (tagId) => {
     console.warn('getTagById function needs implementation based on actual data fetching.');
     return undefined; // Placeholder
  };
  const addPatientTag = async (patientId, tagId) => {
     console.warn('addPatientTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removePatientTag = async (patientId, tagId) => {
     console.warn('removePatientTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addSessionTag = async (sessionId, tagId) => {
     console.warn('addSessionTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removeSessionTag = async (sessionId, tagId) => {
     console.warn('removeSessionTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addOrderTag = async (orderId, tagId) => {
     console.warn('addOrderTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removeOrderTag = async (orderId, tagId) => {
     console.warn('removeOrderTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addDocumentTag = (documentId, tagId) => {
     console.warn('addDocumentTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removeDocumentTag = (documentId, tagId) => {
     console.warn('removeDocumentTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addFormTag = (formId, tagId) => {
     console.warn('addFormTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removeFormTag = (formId, tagId) => {
     console.warn('removeFormTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addInvoiceTag = (invoiceId, tagId) => {
     console.warn('addInvoiceTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const removeInvoiceTag = (invoiceId, tagId) => {
     console.warn('removeInvoiceTag function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const filterEntitiesByTag = (entityType, tagId) => {
     console.warn('filterEntitiesByTag function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getServiceById = (serviceId) => {
     console.warn('getServiceById function needs implementation based on actual data fetching.');
     return undefined; // Placeholder
  };
  const getServicePlans = (serviceId) => {
     console.warn('getServicePlans function needs implementation based on actual data fetching.');
     return []; // Placeholder
    /* ... */ // Placeholder
  };
  const getAllPlans = () => {
     console.warn('getAllPlans function needs implementation based on actual data fetching.');
     return []; // Placeholder
  };
  const addService = async (serviceData) => {
     console.warn('addService function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updateService = async (serviceId, serviceData) => {
     console.warn('updateService function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const deleteService = async (serviceId) => {
     console.warn('deleteService function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const addSubscriptionPlan = async (planData) => {
     console.warn('addSubscriptionPlan function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const updateSubscriptionPlan = async (planId, planData) => {
     console.warn('updateSubscriptionPlan function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const deleteSubscriptionPlan = async (planId) => {
     console.warn('deleteSubscriptionPlan function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const saveInitialConsultationNote = async (patientId, consultationData) => {
     console.warn('saveInitialConsultationNote function needs implementation based on actual data fetching.');
    /* ... */ // Placeholder
  };
  const getPatientConsultationNotes = async (patientId) => {
     console.warn('getPatientConsultationNotes function needs implementation based on actual data fetching.');
     return []; // Placeholder
  };

  // --- View Mode Setter ---
  // Changed from toggleViewMode to setViewMode to accept a specific mode
  const handleSetViewMode = useCallback((newMode) => {
    if (newMode === 'admin' || newMode === 'patient') {
      setViewMode(newMode);
      console.log(`Switched view mode to: ${newMode}`);
    } else {
      console.warn(`Invalid view mode attempted: ${newMode}`);
    }
  }, []); // No dependency needed as setViewMode from useState is stable

  // --- Context Provider Value ---
  const contextValue = {
    // State
    viewMode, // Keep viewMode state

    // Removed data state (patients, sessions, etc.)
    // Removed loading and errors state

    // Placeholder Data access functions (to be removed or refactored)
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

    // Removed fetch functions

    // Placeholder Tag management functions (to be removed or refactored)
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

    // View Mode function
    setViewMode: handleSetViewMode, // Changed to setViewMode
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
