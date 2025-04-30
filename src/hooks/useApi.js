// hooks/useApi.js
import { useState, useCallback } from 'react';
import errorHandling from '../utils/errorHandling';

/**
 * Custom hook for handling API calls with loading state and error handling
 * 
 * @param {Function} [apiFunction] - Optional API function to bind to the hook
 * @param {String} [context] - Optional context name for error logging
 * @returns {Object} API methods and state
 */
export const useApi = (apiFunction, context = 'API call') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute an API call with error handling
   *
   * @param {Function|any} apiFunctionOrArgs - API function to call or arguments for the bound apiFunction
   * @param {Array|Object} [argsOrOptions] - Arguments or options for the API call
   * @param {Object} [optionsParam] - Options for error handling (when using the three-parameter form)
   * @returns {Object} Result object with success flag and data/error
   */
  const execute = useCallback(async (apiFunctionOrArgs, argsOrOptions, optionsParam) => {
    // Determine which parameter is which based on function signature used
    let actualApiFunction, actualArgs, actualOptions;
    
    if (typeof apiFunctionOrArgs === 'function') {
      // Called as execute(apiFunction, args, options)
      actualApiFunction = apiFunctionOrArgs;
      actualArgs = Array.isArray(argsOrOptions) ? argsOrOptions : [argsOrOptions];
      actualOptions = optionsParam || {};
    } else {
      // Called as execute(args) with apiFunction provided during hook initialization
      if (!apiFunction) {
        console.error('No API function provided to useApi hook or execute method');
        return { 
          success: false, 
          error: 'API function not configured' 
        };
      }
      actualApiFunction = apiFunction;
      actualArgs = [apiFunctionOrArgs];
      actualOptions = argsOrOptions || {};
    }

    const {
      errorMessage = 'An error occurred',
      resetData = false,
      showLoading = true,
      context: contextOverride = context,
    } = actualOptions;

    if (showLoading) {
      setLoading(true);
    }

    if (resetData) {
      setData(null);
    }

    setError(null);

    try {
      const result = await actualApiFunction(...actualArgs);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      try {
        errorHandling.logError(err, contextOverride);
      } catch (loggingError) {
        console.error('Failed to log error:', loggingError);
      }

      // Check if it's an auth error that should redirect
      try {
        if (errorHandling.handleSpecialErrors) {
          errorHandling.handleSpecialErrors(err);
        }
      } catch (handlingError) {
        console.error('Error during special error handling:', handlingError);
      }
      
      // For other errors, set the error state
      const errorMsg = errorHandling.getErrorMessage ? 
                       errorHandling.getErrorMessage(err) || errorMessage : 
                       err?.message || errorMessage;
      setError(errorMsg);

      return {
        success: false,
        error: errorMsg,
        formErrors: errorHandling.getFormErrors ? 
                   errorHandling.getFormErrors(err) : 
                   null,
      };
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [apiFunction, context]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear the current data
   */
  const clearData = useCallback(() => {
    setData(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    clearError,
    clearData,
    reset,
  };
};

/**
 * Custom hook for CRUD operations on a resource
 *
 * @param {Object} apiResource - API resource object (e.g., apiService.patients)
 * @param {String} resourceName - Name of the resource for error messages
 * @returns {Object} CRUD methods and states
 */
export const useCrud = (apiResource, resourceName = 'resource') => {
  const [list, setList] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic error handler
  const handleError = (err, context) => {
    errorHandling.logError(err, context);
    const errorMsg = errorHandling.getErrorMessage(err);
    setError(errorMsg);
    return {
      success: false,
      error: errorMsg,
      formErrors: errorHandling.getFormErrors(err),
    };
  };

  // Fetch all items
  const fetchAll = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiResource.getAll(params);
        setList(data);
        return { success: true, data };
      } catch (err) {
        return handleError(err, `${resourceName}.fetchAll`);
      } finally {
        setLoading(false);
      }
    },
    [apiResource, resourceName]
  );

  // Fetch a single item by ID
  const fetchById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiResource.getById(id);
        setItem(data);
        return { success: true, data };
      } catch (err) {
        return handleError(err, `${resourceName}.fetchById`);
      } finally {
        setLoading(false);
      }
    },
    [apiResource, resourceName]
  );

  // Create a new item
  const create = useCallback(
    async (itemData) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiResource.create(itemData);
        setList((prevList) => [...prevList, data]);
        setItem(data);
        return { success: true, data };
      } catch (err) {
        return handleError(err, `${resourceName}.create`);
      } finally {
        setLoading(false);
      }
    },
    [apiResource, resourceName]
  );

  // Update an existing item
  const update = useCallback(
    async (id, itemData) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiResource.update(id, itemData);

        // Update list if it exists
        setList((prevList) =>
          prevList.map((item) => (item.id === id ? data : item))
        );

        // Update current item if it matches
        if (item && item.id === id) {
          setItem(data);
        }

        return { success: true, data };
      } catch (err) {
        return handleError(err, `${resourceName}.update`);
      } finally {
        setLoading(false);
      }
    },
    [apiResource, resourceName, item]
  );

  // Delete an item
  const remove = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await apiResource.delete(id);

        // Remove from list if it exists
        setList((prevList) => prevList.filter((item) => item.id !== id));

        // Clear current item if it matches
        if (item && item.id === id) {
          setItem(null);
        }

        return { success: true };
      } catch (err) {
        return handleError(err, `${resourceName}.delete`);
      } finally {
        setLoading(false);
      }
    },
    [apiResource, resourceName, item]
  );

  // Clear the current error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setList([]);
    setItem(null);
  }, []);

  return {
    list,
    item,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError,
    reset,
  };
};

export default useApi;
