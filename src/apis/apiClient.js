/**
 * Enhanced API client with built-in error handling
 */
import { 
  handleApiError, 
  handleNetworkError, 
  isRetryableError,
  ERROR_TYPES
} from '../utils/errorHandlingSystem';

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Creates a timeout promise that rejects after the specified time
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Promise that rejects after timeout
 */
const createTimeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Enhanced fetch with timeout and error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise} Promise that resolves with the response
 */
const enhancedFetch = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = createTimeoutPromise(timeout);
    
    // Race the fetch against the timeout
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise
    ]);
    
    // Check if response is ok
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If we can't parse JSON, use text
        errorData = { message: await response.text() };
      }
      
      // Create error object with status and data
      const error = new Error(errorData.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      
      // Add error code if available
      if (errorData.code) {
        error.code = errorData.code;
      }
      
      throw error;
    }
    
    return response;
  } catch (error) {
    // Enhance error with additional information
    if (error.message.includes('timed out')) {
      error.type = ERROR_TYPES.TIMEOUT;
    } else if (!error.status && error.message.includes('fetch')) {
      error.type = ERROR_TYPES.NETWORK;
    }
    
    throw error;
  }
};

/**
 * Creates an API client with built-in error handling
 * @param {Object} options - Client configuration options
 * @returns {Object} API client with request methods
 */
export const createApiClient = (options = {}) => {
  const {
    baseUrl = '',
    defaultHeaders = {},
    timeout = DEFAULT_TIMEOUT,
    maxRetries = 3,
    retryDelay = 1000,
    onError = null,
    context = 'API'
  } = options;
  
  /**
   * Makes an API request with error handling and retries
   * @param {string} url - URL to request
   * @param {Object} requestOptions - Request options
   * @param {Object} errorOptions - Error handling options
   * @returns {Promise} Promise that resolves with the parsed response
   */
  const request = async (url, requestOptions = {}, errorOptions = {}) => {
    const {
      method = 'GET',
      headers = {},
      body = null,
      params = null,
      responseType = 'json',
      retries = maxRetries,
      currentRetry = 0
    } = requestOptions;
    
    const {
      errorContext = `${context} - ${method}`,
      handleError = true
    } = errorOptions;
    
    // Build full URL with query parameters
    let fullUrl = `${baseUrl}${url}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    // Prepare request options
    const fetchOptions = {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
        'Content-Type': 'application/json',
      },
    };
    
    // Add body if provided
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    try {
      // Make the request
      const response = await enhancedFetch(fullUrl, fetchOptions, timeout);
      
      // Parse response based on responseType
      let data;
      switch (responseType) {
        case 'json':
          data = await response.json();
          break;
        case 'text':
          data = await response.text();
          break;
        case 'blob':
          data = await response.blob();
          break;
        case 'arrayBuffer':
          data = await response.arrayBuffer();
          break;
        default:
          data = await response.json();
      }
      
      return data;
    } catch (error) {
      // Determine if we should retry
      if (currentRetry < retries) {
        const shouldRetry = error.type === ERROR_TYPES.NETWORK || 
                           error.type === ERROR_TYPES.TIMEOUT ||
                           (error.status >= 500 && error.status < 600);
        
        if (shouldRetry) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, currentRetry);
          
          console.log(`Retrying request (${currentRetry + 1}/${retries}) after ${delay}ms...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the request
          return request(url, {
            ...requestOptions,
            currentRetry: currentRetry + 1
          }, errorOptions);
        }
      }
      
      // Handle the error if requested
      if (handleError) {
        // Determine error type and use appropriate handler
        if (error.type === ERROR_TYPES.NETWORK) {
          handleNetworkError(error, errorContext, { onError });
        } else {
          handleApiError(error, errorContext, { onError });
        }
      }
      
      // Rethrow the error
      throw error;
    }
  };
  
  // Create convenience methods for common HTTP methods
  return {
    request,
    
    get: (url, options = {}, errorOptions = {}) => {
      return request(url, { ...options, method: 'GET' }, errorOptions);
    },
    
    post: (url, body = {}, options = {}, errorOptions = {}) => {
      return request(url, { ...options, method: 'POST', body }, errorOptions);
    },
    
    put: (url, body = {}, options = {}, errorOptions = {}) => {
      return request(url, { ...options, method: 'PUT', body }, errorOptions);
    },
    
    patch: (url, body = {}, options = {}, errorOptions = {}) => {
      return request(url, { ...options, method: 'PATCH', body }, errorOptions);
    },
    
    delete: (url, options = {}, errorOptions = {}) => {
      return request(url, { ...options, method: 'DELETE' }, errorOptions);
    }
  };
};

/**
 * Default API client instance
 */
const apiClient = createApiClient({
  baseUrl: process.env.REACT_APP_API_URL || '',
  defaultHeaders: {
    'Accept': 'application/json'
  },
  context: 'Telehealth API'
});

export default apiClient;