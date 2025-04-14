# Codebase Analysis and Database Synchronization Report

This document summarizes the analysis of the ZappyHealth Dashboard codebase and the steps taken to synchronize the Supabase database schema with the local migration files.

## 1. Codebase Architecture Overview

*   **Framework:** React (using Create React App - `react-scripts`)
*   **Routing:** React Router (`react-router-dom`)
*   **UI Libraries:** Tailwind CSS, Ant Design (`antd`)
*   **State Management:**
    *   **Server State:** React Query (`@tanstack/react-query`) via custom hooks in `src/apis/`.
    *   **Global UI State:** React Context API (`src/context/`).
    *   **Local Component State:** `useState`.
*   **Backend Interaction:** Supabase (via `supabase-js` client, configured in `src/utils/supabaseClient.js` using `REACT_APP_` environment variables from `.env`).
*   **API Calls:** Primarily through React Query hooks wrapping Supabase client calls. Some direct Axios usage might exist via `src/utils/apiService.js`.
*   **Project Structure:** Feature-based organization within `src/pages/`, with API logic in `src/apis/` and shared components/utils in `src/components/` and `src/utils/`.

## 2. Key Features Analyzed

The following core features and areas were analyzed by examining page components, API hooks, context providers, and utility functions:

*   Dashboard (`src/pages/dashboard/ProviderDashboard.jsx`)
*   Patients (`src/pages/patients/`, `src/apis/patients/`)
*   Consultations (`src/pages/consultations/`, `src/apis/consultations/`)
*   Sessions (`src/pages/sessions/`, `src/apis/sessions/`)
*   Orders (`src/pages/orders/`, `src/apis/orders/`)
*   Products (`src/pages/products/`, `src/apis/products/`)
*   Services (`src/pages/services/`, `src/apis/services/`)
*   Invoices (`src/pages/invoices/`, `src/apis/invoices/`)
*   Messaging (`src/pages/messaging/`) - *Note: No dedicated API hooks found.*
*   Insurance (`src/pages/insurance/`, `src/apis/insurances/`)
*   Tasks (`src/pages/tasks/`, `src/apis/tasks/`)
*   Tags (`src/pages/tags/`, `src/apis/tags/`)
*   Discounts (`src/pages/discounts/`, `src/apis/discounts/`)
*   Pharmacies (`src/pages/pharmacy/`, `src/apis/pharmacies/`)
*   Settings (Forms, Note Templates) (`src/pages/settings/`, `src/apis/forms/`, `src/apis/noteTemplates/`)
*   Context Providers (`src/context/`)
*   Utility Functions (`src/utils/`)

## 3. Refactoring/Improvements Identified

*   **Overloaded `AppContext`:** `src/context/AppContext.jsx` currently handles excessive state and data fetching/mutation logic, duplicating functionality present in API hooks. **Recommendation:** Refactor to remove data logic, focusing only on truly global UI state. Components should fetch data via API hooks.
*   **Complex "Management" Pages:** Several components (e.g., `ProductManagement`, `ServiceManagement`, `InvoicePage`, `TaskManagement`, `TagManagement`, `DiscountManagement`, `PharmacyManagement`) handle list display, filtering, sorting, modal state, form logic, and CRUD operations. **Recommendation:** Refactor using custom hooks to encapsulate logic and state management, similar to refactoring performed on `Patients`, `Consultations`, and `PatientNoteTemplateSettings`. Extract UI sub-components where appropriate.
*   **Inconsistent Naming:** Some inconsistencies were noted between database column names (e.g., `client_record.address`) and form field names (`street_address`). Mappings were added in hooks/modals.

## 4. Database Synchronization Task

A major discrepancy was found between the local migration files (`supabase/migrations/`) and the state of the original remote database (`htvivqlvivmxgrbpwrje`). Many migrations appeared unapplied, leading to schema errors.

**Steps Taken:**

1.  **Analysis:** Used Supabase MCP tools (`list_tables`, `list_migrations`) to identify the schema mismatch.
2.  **New Project:** Created a new Supabase project (`vyymjozlulxrceywywtu`) to ensure a clean slate.
3.  **Frontend Configuration:**
    *   Identified the project uses Create React App, not Vite.
    *   Updated `.env` file with new credentials using `REACT_APP_` prefixes.
    *   Corrected `src/utils/supabaseClient.js` to use `process.env` for CRA.
4.  **Project Linking:** Linked the local repository to the new project reference ID (`npx supabase link --project-ref vyymjozlulxrceywywtu`).
5.  **Migration Push & Debugging:**
    *   Attempted `npx supabase db push`.
    *   Encountered and fixed errors in several migration files:
        *   `20240322000002`: Corrected `stock_quantity` to `inventory_count`.
        *   `20240322000005`, `20240322000007`, `20240322000008`, `20240322000010`, `20240322000011`, `20240322000012`, `20240322000013`, `20240322000014`, `20240322000015`, `20240322000016`, `20250414074800`: Added conditional logic (`DO $$ BEGIN IF NOT EXISTS...`) around `ALTER PUBLICATION supabase_realtime ADD TABLE ...` statements to prevent errors if tables were already added.
        *   `20240322000007`: Removed attempts to add non-existent `order` and `session` tables to publication.
        *   `20240322000009`: Corrected foreign key reference from `"user"(id)` to `auth.users(id)`.
        *   `20250414074800`: Removed extraneous text (`htvivqlvivmxgrbpwrje`) from the start of the file.
    *   Successfully pushed all migrations to the new database.

## 5. Frontend Code Corrections (Post-Sync)

Based on the final schema created by applying all migrations sequentially:

*   **Patient Table:** Confirmed the primary patient table is `client_record`. Updated hooks in `src/apis/patients/hooks.js` and `src/apis/tasks/hooks.js` to query `client_record`.
*   **Tag Table:** Confirmed the table name is `tags`. Updated hooks in `src/apis/tags/hooks.js` to query `tags`.
*   **Relationship Joins:** Removed potentially problematic `patients(*)` joins from `useSessions` and `useOrders` hooks. Updated `useConsultations` to join with `client_record`.
*   **Consultation Status:** Reverted `ProviderDashboard.jsx` to fetch only `'pending'` status and removed the `'needs_more_info'` badge display, as this status is not in the migrated schema's enum.
*   **Preferred Pharmacy:** Re-added `preferred_pharmacy_id` handling to patient hooks (`src/apis/patients/hooks.js`) and the `PatientModal.jsx` component, consistent with the migration that added this FK to `client_record`.

## 6. Current Status

*   The remote Supabase database (`vyymjozlulxrceywywtu`) schema is now synchronized with the local migration files.
*   The frontend code (API hooks, components) has been updated to align with the table names (`client_record`, `tags`), relationships, and columns defined by the applied migrations.
*   The application should now connect to the correct database with a consistent schema. Further testing is recommended, especially around areas that previously showed errors. Ensure the `profiles` table is populated and RLS policies are correctly configured in Supabase.
