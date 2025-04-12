# API Issues and Testing Plan

## Problematic API Calls

Based on the codebase analysis, the following API endpoints and hooks appear to have issues:

### Supabase Connection Issues

- **Client Record Table Access**: The application is attempting to access a `client_record` table that doesn't exist or has permission issues.
  - Error: `404 error` when trying to query the `client_record` table
  - Location: `src/App.js` in the `testSupabaseConnection` function
  - Fix: Created migration for the missing table

### Environment Variable Access Issues

- **Supabase Client Initialization**: The application is trying to access environment variables that aren't properly configured.
  - Error: `Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')`
  - Location: `src/utils/supabaseClient.js`
  - Fix: Updated to use hardcoded credentials as fallback

### Potential API Hook Issues

Based on the file structure, these API hooks might have issues and should be tested:

1. **Patient APIs**:
   - `src/apis/patients/hooks.js` - Used in multiple components

2. **Session APIs**:
   - `src/apis/sessions/hooks.js` - Used in Sessions.js

3. **Invoice APIs**:
   - `src/apis/invoices/hooks.js` - Used in InvoicePage.jsx

4. **Auth APIs**:
   - `src/apis/auth/hooks.js` - Used in AuthContext.jsx

5. **Notes APIs**:
   - `src/apis/notes/hooks.js` - Used in PatientNotesPage.jsx

## Comprehensive Testing Plan

### 1. Unit Testing

#### API Client Tests

```javascript
// Example test for src/utils/supabaseClient.js
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/utils/supabaseClient';

describe('Supabase Client', () => {
  test('should initialize with valid credentials', () => {
    expect(supabase).toBeDefined();
    expect(SUPABASE_URL).toBeDefined();
    expect(SUPABASE_ANON_KEY).toBeDefined();
  });
});
```

#### API Hook Tests

```javascript
// Example test for src/apis/patients/hooks.js
import { renderHook, act } from '@testing-library/react-hooks';
import { usePatients } from '../src/apis/patients/hooks';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('usePatients hook', () => {
  test('should return patients data', async () => {
    const { result, waitFor } = renderHook(() => usePatients(), { wrapper });
    
    await waitFor(() => result.current.isSuccess);
    
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data.data)).toBe(true);
  });
});
```

### 2. Integration Testing

#### API Flow Tests

```javascript
// Example test for patient creation and retrieval flow
import { renderHook, act } from '@testing-library/react-hooks';
import { useCreatePatient, usePatientById } from '../src/apis/patients/hooks';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Patient API Flow', () => {
  test('should create and then retrieve a patient', async () => {
    // Create patient
    const { result: createResult } = renderHook(() => useCreatePatient(), { wrapper });
    
    const newPatient = {
      first_name: 'Test',
      last_name: 'Patient',
      email: 'test@example.com'
    };
    
    await act(async () => {
      await createResult.current.mutateAsync(newPatient);
    });
    
    expect(createResult.current.isSuccess).toBe(true);
    const patientId = createResult.current.data.id;
    
    // Retrieve the created patient
    const { result: getResult, waitFor } = renderHook(() => usePatientById(patientId), { wrapper });
    
    await waitFor(() => getResult.current.isSuccess);
    
    expect(getResult.current.data).toBeDefined();
    expect(getResult.current.data.email).toBe('test@example.com');
  });
});
```

### 3. Component Testing

#### Testing Components with API Hooks

```javascript
// Example test for PatientHeader.jsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import PatientHeader from '../src/pages/patients/patientDetails/PatientHeader';

// Mock the usePatientById hook
jest.mock('../src/apis/patients/hooks', () => ({
  usePatientById: () => ({
    data: {
      id: '123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      date_of_birth: '1990-01-01'
    },
    isLoading: false,
    isError: false
  })
}));

const queryClient = new QueryClient();

describe('PatientHeader', () => {
  test('renders patient information correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PatientHeader 
            patient={{
              id: '123',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              date_of_birth: '1990-01-01'
            }} 
            patientId="123" 
          />
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 4. End-to-End Testing

Implement Cypress tests for critical user flows:

```javascript
// cypress/integration/patient_management.spec.js
describe('Patient Management', () => {
  beforeEach(() => {
    cy.login(); // Custom command to handle authentication
    cy.visit('/patients');
  });

  it('should display patient list', () => {
    cy.get('[data-testid="patient-list"]').should('be.visible');
    cy.get('[data-testid="patient-list-item"]').should('have.length.greaterThan', 0);
  });

  it('should navigate to patient details', () => {
    cy.get('[data-testid="patient-list-item"]').first().click();
    cy.url().should('include', '/patients/');
    cy.get('[data-testid="patient-header"]').should('be.visible');
  });

  it('should create a new patient', () => {
    cy.get('[data-testid="add-patient-button"]').click();
    cy.get('[data-testid="patient-form"]').should('be.visible');
    
    // Fill out the form
    cy.get('[data-testid="first-name-input"]').type('Cypress');
    cy.get('[data-testid="last-name-input"]').type('Test');
    cy.get('[data-testid="email-input"]').type('cypress@example.com');
    cy.get('[data-testid="dob-input"]').type('1990-01-01');
    
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify the new patient appears in the list
    cy.get('[data-testid="patient-list"]').should('contain', 'Cypress Test');
  });
});
```

### 5. API Mocking Strategy

For reliable testing, implement API mocking:

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock the patients endpoint
  rest.get('*/rest/v1/patients', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_birth: '1990-01-01'
          },
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            date_of_birth: '1992-05-15'
          }
        ],
        meta: {
          total: 2,
          total_pages: 1,
          current_page: 1,
          per_page: 10
        }
      })
    );
  }),
  
  // Mock the single patient endpoint
  rest.get('*/rest/v1/patients/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_birth: '1990-01-01'
      })
    );
  }),
  
  // Add more endpoint mocks as needed
];
```

## Implementation Steps

1. **Set up testing environment**:
   - Install testing libraries: `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event msw cypress`
   - Configure Jest and Cypress

2. **Add data-testid attributes** to key components for easier testing

3. **Implement tests in order**:
   - Unit tests for utility functions and hooks
   - Integration tests for API flows
   - Component tests for UI elements
   - End-to-end tests for critical user journeys

4. **Set up CI/CD pipeline** to run tests automatically

5. **Monitor and fix** failing tests as they occur

## Priority API Issues to Fix

1. Supabase connection and environment variable issues
2. Patient data retrieval in PatientDetail.jsx
3. Session management in Sessions.js
4. Invoice creation and retrieval in InvoicePage.jsx
5. Authentication flows in AuthContext.jsx

By systematically addressing these issues and implementing the testing strategy outlined above, we can significantly improve the reliability and maintainability of the application.
