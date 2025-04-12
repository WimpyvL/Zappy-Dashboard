import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Make environment variables available globally
if (typeof window !== 'undefined') {
  window.env = {
    VITE_SUPABASE_URL:
      process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY:
      process.env.REACT_APP_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY,
  };
}

// Instantiate QueryClient (moved from App.js)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      // Add error handling to prevent rendering error objects directly
      useErrorBoundary: true,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          {' '}
          {/* AppProvider now wraps AuthProvider */}
          <AuthProvider>
            <CartProvider>
              <NotificationsProvider>
                <Router>
                  <App />
                </Router>
              </NotificationsProvider>
            </CartProvider>
          </AuthProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
