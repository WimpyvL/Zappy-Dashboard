import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useServiceManagement = (initialServices = {}) => {
  const [activeServices, setActiveServices] = useState(initialServices);
  
  const addService = useCallback((id, name, dotClass) => {
    if (activeServices[id]) {
      toast.info(`${name} service is already active`);
      return;
    }
    
    setActiveServices(prev => ({
      ...prev,
      [id]: { name, dotClass }
    }));
    
    toast.info(`${name} service added`);
  }, [activeServices]);
  
  const removeService = useCallback((id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    const serviceName = activeServices[id]?.name;
    
    if (!serviceName) {
      return;
    }
    
    // Don't allow removing the last service
    if (Object.keys(activeServices).length === 1) {
      toast.warning('At least one service must be selected');
      return;
    }
    
    setActiveServices(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    
    toast.info(`${serviceName} service removed`);
  }, [activeServices]);
  
  const updateService = useCallback((id, updates) => {
    if (!activeServices[id]) {
      console.error(`Service ${id} not found`);
      return;
    }
    
    setActiveServices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates
      }
    }));
  }, [activeServices]);
  
  const hasService = useCallback((id) => {
    return !!activeServices[id];
  }, [activeServices]);
  
  const getServiceCount = useCallback(() => {
    return Object.keys(activeServices).length;
  }, [activeServices]);
  
  const getPrimaryService = useCallback(() => {
    const serviceIds = Object.keys(activeServices);
    if (serviceIds.length === 0) return null;
    
    return {
      id: serviceIds[0],
      ...activeServices[serviceIds[0]]
    };
  }, [activeServices]);
  
  return {
    activeServices,
    addService,
    removeService,
    updateService,
    hasService,
    getServiceCount,
    getPrimaryService
  };
};
