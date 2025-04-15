# Remaining Tasks for Zappy-Dashboard Supabase Migration

The core backend migration (database schema, API services, hooks, AuthContext) is complete. The following tasks remain:

## Phase 4: Frontend Integration (Continued)

This is the most significant remaining phase and involves updating UI components to use the new Supabase data layer.

**General Steps for Each Component/Page:**

1.  **Identify Data Needs:** Determine which data the component currently fetches or modifies using the old `apiService` or related utilities.
2.  **Replace Data Fetching:**
    *   Import the relevant Supabase hooks from `src/apis/*/hooks.js` (e.g., `useOrders`, `useProductById`, `useTasks`).
    *   Call the hooks to fetch data (e.g., `const { data, isLoading, error } = useTasks(currentPage, filters);`).
    *   Update component logic to use the data structure returned by the hook (e.g., `data.data` for lists, `data.pagination` for pagination info).
    *   Replace loading/error state management with the state provided by the hooks (`isLoading`, `isFetching`, `error`).
3.  **Replace Data Mutations:**
    *   Import the relevant mutation hooks (e.g., `useUpdatePatient`, `useCreateOrder`, `useDeleteTask`).
    *   Initialize the mutation hook (e.g., `const updatePatientMutation = useUpdatePatient();`).
    *   Replace direct API calls in event handlers (e.g., form submissions, button clicks) with calls to `mutation.mutate()` or `mutation.mutateAsync()`, passing the required data.
    *   Update loading/disabled states on buttons/forms using `mutation.isPending`.
    *   Handle success/error feedback using the `onSuccess` and `onError` callbacks within the hook initialization or via `mutation.isSuccess`/`mutation.isError`/`mutation.error`.
4.  **Update Authentication Usage:**
    *   Ensure components use the refactored `useAuth` hook from `src/context/AuthContext.jsx` to get `currentUser`, `session`, and `isAuthenticated` status.
    *   Replace any manual `localStorage` checks for authentication.
    *   Use the `logout` function provided by `useAuth` for sign-out actions.
5.  **Implement Specific Features:**
    *   **Document Uploads/Deletes:** Implement UI elements (buttons, lists) in relevant components (e.g., `PatientInsurance`) to use the `useUploadInsuranceDocument` and `useDeleteInsuranceDocument` hooks.
    *   **Virtual Sessions/Status Updates:** If the commented-out task API functions (`handleSessionCreation`, etc.) are needed, implement their Supabase logic in `src/apis/tasks/api.js` and create corresponding hooks/UI interactions.

**Key Areas/Components to Refactor (Examples - Review `src/pages/` and `src/layouts/` for a full list):**

*   `src/pages/patients/PatientDetail.jsx` and its sub-components (`PatientInfo`, `PatientOrders`, `PatientDocuments`, etc.)
*   `src/pages/orders/Orders.js`
*   `src/pages/products/ProductManagement.jsx`
*   `src/pages/tasks/TaskManagement.js` and `TaskModal.jsx`
*   `src/pages/discounts/DiscountManagement.jsx`
*   `src/pages/forms/FormsManagement.jsx` and related form builder/viewer components
*   `src/pages/insurances/InsuranceDocumentation.jsx` (likely needs significant changes based on the new `patient_insurances` table)
*   `src/pages/invoices/InvoicePage.jsx`
*   `src/pages/pharmacies/PharmacyManagement.jsx`
*   `src/pages/tags/TagManagement.jsx`
*   `src/pages/auditlog/AuditLogPage.jsx`
*   `src/layouts/MainLayout.jsx` (and its components like `Sidebar`, `Headers` if they interact with data/auth)
*   Any other components directly using `apiService` or performing data fetching/mutations.

## Phase 5: Code Hygiene / Cleanup

*   **Remove Mock Data:** Search codebase for any remaining hardcoded data arrays or objects used for testing/placeholders.
*   **Remove Unused Files:** Delete the old `apiService` (`src/utils/apiService.js` or `src/utils2/api.js`), potentially old context files, and any other utilities/components made redundant by the migration.
*   **Dependency Management:**
    *   Run `npm outdated` to check for outdated packages.
    *   Run `npm update` cautiously to update dependencies.
    *   Run `npm prune` to remove unused packages listed in `package.json`.

## Phase 6: Testing & Deployment

*   **Comprehensive Testing:**
    *   Manually test all user flows (authentication, viewing lists, viewing details, creating/updating/deleting items for all modules).
    *   Test filtering, sorting, and pagination.
    *   Test document uploads/deletes.
    *   Verify RLS policies by logging in as different user types (if applicable).
    *   Update and run any existing automated tests (unit, integration, e2e).
*   **Deployment:**
    *   Configure Supabase environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`) in the production hosting environment.
    *   Deploy the application.
    *   Perform post-deployment health checks and monitor logs.
