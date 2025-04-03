import React from 'react';
import './App.css';
import AppRoutes from './constants/AppRoutes';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // Added CartProvider import
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <CartProvider> {/* Added CartProvider wrapper */}
            <Router>
              <AppRoutes />
              <ToastContainer />
            </Router>
          </CartProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
