# Telehealth Error Handling System

This document outlines the comprehensive error handling system implemented in the Telehealth application. The system provides a consistent, robust approach to handling errors across the application, improving both developer experience and user experience.

## Table of Contents

1. [Overview](#overview)
2. [Key Components](#key-components)
3. [Error Types and Severity](#error-types-and-severity)
4. [Error Boundaries](#error-boundaries)
5. [API Error Handling](#api-error-handling)
6. [Form Validation Errors](#form-validation-errors)
7. [Error Notifications](#error-notifications)
8. [Best Practices](#best-practices)
9. [Examples](#examples)

## Overview

The error handling system is designed to:

- Prevent application crashes with React Error Boundaries
- Provide consistent error handling patterns across the application
- Improve user feedback for errors with appropriate UI components
- Standardize API error handling and transformation
- Support retry mechanisms for transient errors
- Enable proper error logging and monitoring

## Key Components

The system consists of several key components:

- **ErrorHandlingSystem**: Core utility functions for handling different types of errors
- **ErrorBoundarySystem**: Enhanced React Error Boundary with different strategies
- **ErrorNotifications**: Reusable UI components for displaying errors
- **useErrorHandler**: Custom hook for consistent error handling in components
- **withErrorBoundary**: HOC for wrapping components with error boundaries
- **apiClient**: Enhanced API client with built-in error handling

## Error Types and Severity

### Error Types

The system categorizes errors into specific types to enable appropriate handling:

- `NETWORK`: Connection issues between client and server
- `API`: General API request/response errors
- `VALIDATION`: Form or data validation errors
- `AUTHENTICATION`: User authentication issues
- `AUTHORIZATION`: Permission/access issues
- `NOT_FOUND`: Requested resource not found
- `SERVER`: Server-side errors
- `DATABASE`: Database-related errors
- `TIMEOUT`: Request timeout errors
- `UNKNOWN`: Uncategorized errors

### Error Severity

Errors are also classified by severity to prioritize handling:

- `CRITICAL`: Application cannot continue, requires immediate attention
- `HIGH`: Major feature is broken, requires user intervention
- `MEDIUM`: Feature partially broken but usable, should be fixed soon
- `LOW`: Minor issue, can be fixed in future releases
- `INFO`: Informational only, not an actual error

## Error Boundaries

The application uses enhanced Error Boundaries to catch JavaScript errors in component trees and display fallback UIs instead of crashing the entire application.

### Error Boundary Strategies

Different strategies are available for different types of components:

- **Default**: Standard error handling for most components
- **Critical**: For critical components where errors are highly visible and impactful
- **Minimal**: For non-critical UI elements where a minimal error display is sufficient
- **Silent**: For optional components that can fail silently without affecting the user experience

### Usage

```jsx
// Wrap a component with an error boundary
import withErrorBoundary from '../components/common/withErrorBoundary';

const MyComponent = () => {
  // Component implementation
};

export default withErrorBoundary(MyComponent, {
  strategy: 'default',
  onError: (error, errorInfo) => {
    // Custom error handling
    console.error('Error in MyComponent:', error);
  }
});

// For critical components
import { withCriticalErrorBoundary } from '../components/common/withErrorBoundary';

export default withCriticalErrorBoundary(CriticalComponent);

// For minimal error handling
import { withMinimalErrorBoundary } from '../components/common/withErrorBoundary';

export default withMinimalErrorBoundary(NonCriticalComponent);
```

## API Error Handling

The system provides standardized API error handling through the enhanced API client and error handling utilities.

### Enhanced API Client

The `apiClient` provides built-in error handling, retries for transient errors, and consistent error transformation:

```javascript
import apiClient from '../apis/apiClient';

// Basic usage
try {
  const data = await apiClient.get('/patients/123');
  // Handle success
} catch (error) {
  // Error is already handled by the client
  // Additional custom handling if needed
}

// With custom error handling options
const data = await apiClient.post('/patients', newPatient, {}, {
  errorContext: 'Create Patient',
  handleError: true // Set to false to handle manually
});
```

### useErrorHandler Hook

The `useErrorHandler` hook provides component-level error handling:

```javascript
import useErrorHandler from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { 
    handleError, 
    withErrorHandling,
    isLoading,
    error,
    resetError
  } = useErrorHandler({ context: 'My Component' });
  
  // Wrap an async function with error handling
  const fetchData = withErrorHandling(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
  
  // Use in event handlers
  const handleSubmit = async (data) => {
    try {
      await submitData(data);
    } catch (err) {
      handleError(err, 'Submit Data');
    }
  };
  
  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    // Component JSX
  );
};
```

## Form Validation Errors

The system provides utilities for handling form validation errors:

```javascript
import { handleFormErrors, createValidationErrors } from '../utils/errorHandlingSystem';
import { FormErrorSummary, InlineError } from '../components/common/ErrorNotifications';

const MyForm = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = 'Name is required';
    }
    
    if (!data.email) {
      errors.email = 'Email is required';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };
  
  const handleSubmit = (data) => {
    const validationErrors = validateForm(data);
    
    if (validationErrors) {
      handleFormErrors(validationErrors, {
        setFieldErrors,
        context: 'My Form'
      });
      return;
    }
    
    // Submit form
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormErrorSummary errors={fieldErrors} />
      
      <div>
        <label>Name</label>
        <input name="name" />
        <InlineError message={fieldErrors.name} />
      </div>
      
      <div>
        <label>Email</label>
        <input name="email" type="email" />
        <InlineError message={fieldErrors.email} />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Error Notifications

The system provides reusable components for displaying errors to users:

- **ErrorAlert**: General-purpose error alert with severity styling
- **InlineError**: For form field validation errors
- **ErrorBanner**: Page-level error banner for critical errors
- **ApiError**: Specialized component for API errors
- **FormErrorSummary**: Summary of form validation errors
- **ErrorFallback**: Default fallback for error boundaries

### Usage

```jsx
import { 
  ErrorAlert, 
  ErrorBanner, 
  ApiError 
} from '../components/common/ErrorNotifications';
import { ERROR_SEVERITY } from '../utils/errorHandlingSystem';

// Basic error alert
<ErrorAlert 
  error="Something went wrong" 
  severity={ERROR_SEVERITY.MEDIUM}
  onRetry={() => fetchData()}
  onDismiss={() => setError(null)}
/>

// Error banner for critical errors
<ErrorBanner 
  error={error} 
  onRetry={() => fetchData()}
  onDismiss={() => setError(null)}
/>

// API error with retry
<ApiError 
  error={apiError} 
  onRetry={() => fetchData()}
/>
```

## Best Practices

1. **Use Error Boundaries Strategically**
   - Wrap critical components with `withCriticalErrorBoundary`
   - Use `withMinimalErrorBoundary` for non-critical UI elements
   - Consider component hierarchy when placing error boundaries

2. **Standardize API Error Handling**
   - Use the `apiClient` for all API requests
   - Leverage the `useErrorHandler` hook in components
   - Implement retry mechanisms for transient errors

3. **Provide Helpful User Feedback**
   - Use appropriate error notification components
   - Include recovery options when possible
   - Avoid technical jargon in user-facing error messages

4. **Log Errors Appropriately**
   - Critical and high-severity errors should be logged to monitoring services
   - Include context information with error logs
   - Don't log sensitive information

5. **Handle Form Validation Consistently**
   - Use `handleFormErrors` for form validation
   - Display inline errors for individual fields
   - Show a summary for multiple errors

## Examples

### API Request with Error Handling

```javascript
import useErrorHandler from '../hooks/useErrorHandler';
import apiClient from '../apis/apiClient';

const PatientDetails = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const { handleError, isLoading, error } = useErrorHandler({ 
    context: 'Patient Details' 
  });
  
  const fetchPatient = async () => {
    try {
      const data = await apiClient.get(`/patients/${patientId}`);
      setPatient(data);
    } catch (err) {
      handleError(err, 'Fetch Patient');
    }
  };
  
  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return (
      <ApiError 
        error={error} 
        onRetry={fetchPatient}
      />
    );
  }
  
  if (!patient) {
    return <div>No patient data</div>;
  }
  
  return (
    <div>
      <h2>{patient.firstName} {patient.lastName}</h2>
      {/* Patient details */}
    </div>
  );
};
```

### Form with Validation Errors

```javascript
import { useState } from 'react';
import { handleFormErrors } from '../utils/errorHandlingSystem';
import { FormErrorSummary, InlineError } from '../components/common/ErrorNotifications';
import { toast } from 'react-toastify';

const PatientForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors) {
      handleFormErrors(validationErrors, {
        setFieldErrors,
        toast,
        context: 'Patient Form'
      });
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormErrorSummary errors={fieldErrors} />
      
      <div className="mb-4">
        <label className="block mb-1">First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <InlineError message={fieldErrors.firstName} />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <InlineError message={fieldErrors.lastName} />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <InlineError message={fieldErrors.email} />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <InlineError message={fieldErrors.dateOfBirth} />
      </div>
      
      <button 
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Submit
      </button>
    </form>
  );
};
```

### Component with Error Boundary

```jsx
import React from 'react';
import { withCriticalErrorBoundary } from '../components/common/withErrorBoundary';
import { ErrorAlert } from '../components/common/ErrorNotifications';
import { ERROR_SEVERITY } from '../utils/errorHandlingSystem';

// Component that might throw errors
const PatientMedicalHistory = ({ patientId }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/medical-history`);
        if (!response.ok) {
          throw new Error('Failed to fetch medical history');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err);
      }
    };
    
    fetchData();
  }, [patientId]);
  
  // Handle component-level errors
  if (error) {
    return (
      <ErrorAlert 
        error={error}
        severity={ERROR_SEVERITY.MEDIUM}
        onRetry={() => {
          setError(null);
          fetchData();
        }}
      />
    );
  }
  
  if (!data) {
    return <div>Loading medical history...</div>;
  }
  
  return (
    <div>
      <h3>Medical History</h3>
      {/* Render medical history data */}
    </div>
  );
};

// Wrap with error boundary for additional protection
export default withCriticalErrorBoundary(PatientMedicalHistory);
```

## Conclusion

This error handling system provides a comprehensive approach to managing errors in the Telehealth application. By following these patterns and using the provided components, we can ensure a consistent, user-friendly experience even when errors occur, while also making it easier for developers to debug and fix issues.