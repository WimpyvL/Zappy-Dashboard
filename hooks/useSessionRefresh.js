import { useState, useCallback, useEffect, useRef } from 'react';

export const useSessionRefresh = (refetchFunction, autoRefreshInterval = 120000) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);
  
  const refreshSessions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchFunction();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchFunction]);
  
  // Set up automatic refresh
  useEffect(() => {
    // Initial refresh
    refreshSessions();
    
    // Set up interval if autoRefreshInterval is provided
    if (autoRefreshInterval > 0) {
      intervalRef.current = setInterval(refreshSessions, autoRefreshInterval);
    }
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshInterval, refreshSessions]);
  
  // Manual stop/start refresh controls
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const startAutoRefresh = useCallback(() => {
    if (!intervalRef.current && autoRefreshInterval > 0) {
      intervalRef.current = setInterval(refreshSessions, autoRefreshInterval);
    }
  }, [autoRefreshInterval, refreshSessions]);
  
  return {
    isRefreshing,
    lastRefresh,
    refreshSessions,
    stopAutoRefresh,
    startAutoRefresh
  };
};
