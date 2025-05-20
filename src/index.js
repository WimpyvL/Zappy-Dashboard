import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProviders } from './contexts/auth';
import { AppProvider } from './contexts/app/AppContext';
import { CartProvider } from './contexts/cart/CartContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { RouteTrackerProvider } from './contexts/route/RouteTrackerContext';
import ErrorBoundary from './components/common/ErrorBoundary';

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
        <AppProvider> {/* AppProvider now wraps AuthProviders */}
          <AuthProviders>
            <CartProvider>
              <NotificationsProvider>
                <Router>
                  <RouteTrackerProvider options={{ enabled: true, logPrevious: true }}>
                    <App />
                  </RouteTrackerProvider>
                </Router>
              </NotificationsProvider>
            </CartProvider>
          </AuthProviders>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
