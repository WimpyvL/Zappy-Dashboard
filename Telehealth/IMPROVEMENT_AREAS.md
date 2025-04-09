# Telehealth Dashboard - Potential Improvement Areas

This document summarizes potential areas for improvement identified during a codebase review, based on analysis of `package.json`, core application setup (`src/index.js`, `src/App.js`), context files (`src/context/*`), and the patient API layer (`src/apis/patients/*`).

## High Priority Areas

### 1. State Management (`AppContext.jsx` Refactor)

*   **Problem:** The current `AppContext` acts as a "mega context," managing almost all application data (patients, orders, products, etc.), loading states, and error states manually. This leads to performance issues (unnecessary re-renders due to broad context updates) and makes the code complex and hard to maintain. It also fetches a large amount of data on initial load, potentially slowing down startup.
*   **Improvement:**
    *   **Delegate Server State:** Migrate all server state management (API data fetching, caching, updates, loading/error states) to the existing **React Query (`@tanstack/react-query`)** library.
    *   **Use Custom Hooks:** Replace manual fetching (`fetchPatients`, etc.) and state management (`patients`, `loading.patients`, etc.) in `AppContext` with custom hooks using `useQuery` and `useMutation` (similar to the pattern in `apis/patients/hooks.js`).
    *   **Simplify Context:** This will significantly simplify `AppContext`, potentially reducing it to only manage true global *client* state, if any.
    *   **Fetch On Demand:** Fetch data within components/routes as needed, relying on React Query's caching, instead of fetching everything upfront in `AppContext`.
    *   **Remove Sample Data:** Eliminate reliance on sample data fallbacks; use proper loading/error states provided by React Query.

### 2. Authentication Security (`AuthContext.jsx`)

*   **Problem:** Storing JWT tokens (`token`, `refreshToken`) and sensitive user details directly in `localStorage` is insecure and vulnerable to Cross-Site Scripting (XSS) attacks. The `isAuthenticated` flag in `localStorage` is redundant. Token validation on load is currently commented out.
*   **Improvement:**
    *   **Secure Token Storage:** Change the token storage strategy.
        *   **Best:** Use **HTTP-only cookies** set by the backend.
        *   **Alternative:** Store tokens **in memory** within React state (accepting re-login on refresh). Avoid `localStorage` for tokens.
    *   **Remove Redundant Flag:** Remove the `isAuthenticated` item from `localStorage`. Derive the `isAuthenticated` state directly from the presence/validity of the token/user object in context state.
    *   **Robust Validation:** Implement reliable token validation on app load (e.g., via an API call) or through API request interceptors that handle 401/403 errors.
    *   **Encapsulate Login:** Move the login API call logic into the `AuthContext`'s `login` function for better cohesion.

## Other Improvement Areas

### 3. Build & Development Environment

*   **Build Tool:** Consider migrating from Create React App (`react-scripts`) to **Vite**. This typically offers a significantly faster development server, quicker Hot Module Replacement (HMR), and more flexible configuration.
*   **React Router Version:** The version specified in `package.json` (`react-router-dom@7.2.0`) appears incorrect (latest stable is v6). Verify the installed version and update `package.json` accordingly.

### 4. Dependencies & Libraries

*   **UI Libraries (Ant Design + Tailwind CSS):** Review the combined usage. Define clear guidelines on when to use Ant Design components vs. Tailwind utilities to ensure consistency, avoid style conflicts, and manage CSS bundle size. Consider if standardizing more heavily on one is feasible.
*   **Icon Libraries (`@ant-design/icons` + `lucide-react`):** Consolidate icon usage to a single library to reduce bundle size and simplify developer workflow.
*   **Dependency Audit:** Regularly audit dependencies using tools like `npm outdated` or `npm-check-updates` to identify outdated or unused packages. Check the necessity of `@tailwindcss/postcss`.

### 5. Code Quality & Structure

*   **Linting/Formatting:** Implement **Prettier** for automatic code formatting. Enhance ESLint rules (e.g., `eslint-plugin-import`, `eslint-plugin-react-hooks`) for stricter code quality checks.
*   **Provider Location:** Move top-level providers (`QueryClientProvider`, `AuthProvider`, `Router`, etc.) from `App.js` to `src/index.js` to centralize application setup. Consider a dedicated `Providers` component for cleaner composition.
*   **API Layer Consistency:** Ensure the `api.js`/`hooks.js` pattern is applied consistently across all features in `src/apis/`. Verify relative import paths (e.g., `../utils/apiClient` in `patients/api.js` seems incorrect).
*   **React Query Refinements:** Consider more precise cache invalidation strategies, specific `onError` handling in mutations, and optimistic updates where appropriate for a smoother UX.
*   **TODOs:** Address any remaining `TODO` comments in the codebase (e.g., fetching documents, forms, invoices in `AppContext`).
