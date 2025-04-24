import React from "react";
import "./App.css";
import AppRoutes from "./constants/AppRoutes";
import { ToastContainer } from "react-toastify";
// import { AppProvider } from './context/AppContext'; // Removed AppProvider import
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // Added CartProvider import
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import routes from "tempo-routes";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Removed AppProvider wrapper */}
        <CartProvider>
          <Router>
            {/* Tempo routes */}
            {import.meta.env.VITE_TEMPO && useRoutes(routes)}
            <AppRoutes />
            <ToastContainer />
          </Router>
        </CartProvider>
        {/* Removed AppProvider wrapper */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
