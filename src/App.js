import React from 'react';
import './App.css';
import AppRoutes from './constants/AppRoutes';
import { ToastContainer } from 'react-toastify';
// Providers and Router are now in src/index.js

function App() {
  // Providers and Router are now wrapping <App /> in src/index.js
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
