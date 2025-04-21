# Supabase Integration Plan for Zappy Dashboard

This document outlines the steps to migrate the Zappy Dashboard frontend from using mock data to interacting with the live Supabase database.

## 1. Environment Variables Setup

*   **Action:** Store the Supabase URL and Anon Key securely using environment variables.
*   **Details:**
    *   Create a `.env` file in the project root (if one doesn't exist).
    *   Add the following variables to the `.env` file:
        ```dotenv
        VITE_SUPABASE_URL=https://htvivqlvivmxgrbpwrje.supabase.co
        VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dml2cWx2aXZteGdyYnB3cmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTM0MjcsImV4cCI6MjA1NzcyOTQyN30.WxsjlBlh7XfHzoeEFSrkGnyn738jihRfLOL4xsQRLJU
        ```
    *   Ensure `.env` is added to the `.gitignore` file to prevent committing credentials.
    *   Access these variables in the application code using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

## 2. Supabase Client Initialization

*   **Action:** Set up the Supabase JavaScript client.
*   **Details:**
    *   Install the client library: `npm install @supabase/supabase-js`.
    *   Create a utility file (e.g., `src/utils/supabaseClient.js`).
    *   Initialize and export a single Supabase client instance in this file, using the environment variables.

## 3. API Service Layer Refactoring

*   **Action:** Adapt the existing API service layer to use the Supabase client.
*   **Details:**
    *   Review `src/utils/apiService.js` and `src/utils2/api.js` to identify the primary service layer pattern.
    *   Refactor the chosen service layer functions (or create new ones) to replace mock logic with calls to the Supabase client (e.g., `supabase.from('table_name').select('*')`).
    *   Ensure functions encapsulate specific Supabase operations (select, insert, update, delete).

## 4. React Query Hooks Update

*   **Action:** Modify React Query hooks (`src/apis/*hooks.js`) to use the refactored API service layer.
*   **Details:**
    *   Remove mock data (`sample...Data`) and mock `queryFn` implementations from each hook file.
    *   Update the `queryFn` in each hook to call the appropriate function from the API service layer (which now interacts with Supabase).
    *   Verify data transformations match Supabase's response structure.
    *   Ensure mutation hooks correctly map to Supabase `insert`, `update`, `delete` operations via the service layer.
    *   Confirm `onSuccess` callbacks correctly invalidate relevant queries.

## 5. Authentication Integration (`AuthContext.jsx`)

*   **Action:** Replace mock authentication with Supabase Auth.
*   **Details:**
    *   Use `supabase.auth.signInWithPassword`, `supabase.auth.signUp`, `supabase.auth.signOut`, etc.
    *   Implement `supabase.auth.onAuthStateChange` listener to update the application's authentication state (`currentUser`) automatically.
    *   Remove manual token management from `localStorage` if Supabase handles session persistence.

## 6. Data Context Cleanup (`AppContext.jsx`)

*   **Action:** Remove mock data and potentially redundant state management from `AppContext`.
*   **Details:**
    *   Delete mock data arrays (`samplePatientsData`, etc.) and mock fetch functions.
    *   Remove direct data state variables (`patients`, `sessions`, etc.) if components now fetch data exclusively via React Query hooks.
    *   Evaluate if `AppContext` is still necessary for other global state management.

## 7. Schema Alignment

*   **Action:** Ensure frontend code aligns with the Supabase database schema.
*   **Details:**
    *   Cross-reference table names, column names, and relationships used in API service calls against the actual Supabase schema (`supabase/final_optimized_schema.sql` or Supabase dashboard).
    *   Correct any discrepancies.

## 8. Database Password Security

*   **Action:** Ensure the direct database connection string (containing the password) is **not** used in the frontend code.
*   **Details:**
    *   Only the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` should be used in the frontend for client-side access. The PostgreSQL connection string is for backend or direct database access only.

## 9. Incremental Implementation & Testing

*   **Action:** Implement the changes module by module (e.g., Patients, then Sessions, etc.).
*   **Details:**
    *   Refactor hooks and components for one feature area at a time.
    *   Test thoroughly after each module to ensure data is fetched, displayed, and mutated correctly against the live database.
