/** @type {import('tailwindcss').Config} */
const themeExtension = require('./src/theme.js');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Ensures Tailwind works in all your React files
    './public/index.html', // Include HTML files if needed
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        'zappy-blue': '#2D7FF9',
        'zappy-yellow': '#FFD100',
        
        // Legacy colors (keeping for backward compatibility)
        primary: '#2D7FF9', // Updated to Zappy Blue
        accent1: '#FFB347', // Orange
        accent2: '#82D173', // Green
        accent3: '#5DA9E9', // Blue
        accent4: '#AC8FE9', // Purple
        
        // Neutral Colors
        'bg-gray': '#F9FAFB',
        'card-white': '#FFFFFF',
        'border-gray': '#E5E7EB',
        'text-dark': '#111827',
        'text-medium': '#6B7280',
        'text-light': '#9CA3AF',
        
        // Status Colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#2D7FF9',
        
        // Category/Section Colors
        'weight-blue': '#DBEAFE',
        'hair-purple': '#EDE9FE',
        'wellness-green': '#D1FAE5',
        'sexual-health-pink': '#FEE2E2',
      },
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
      },
      opacity: {
        '15': '0.15',
        '30': '0.30',
        '70': '0.70',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [], // Add plugins if needed
  // Safelist the dynamic classes used for sidebar active states and theme colors
  safelist: [
    // Legacy colors
    'bg-primary', 'text-primary',
    'bg-accent1', 'text-accent1',
    'bg-accent2', 'text-accent2',
    'bg-accent3', 'text-accent3',
    'bg-accent4', 'text-accent4',
    
    // New brand colors
    'bg-zappy-blue', 'text-zappy-blue',
    'bg-zappy-yellow', 'text-zappy-yellow',
    
    // Status colors
    'bg-success', 'text-success',
    'bg-warning', 'text-warning',
    'bg-error', 'text-error',
    'bg-info', 'text-info',
    
    // Category colors
    'bg-weight-blue', 'text-weight-blue',
    'bg-hair-purple', 'text-hair-purple',
    'bg-wellness-green', 'text-wellness-green',
    'bg-sexual-health-pink', 'text-sexual-health-pink',
    
    // Neutral colors
    'bg-bg-gray', 'text-bg-gray',
    'bg-card-white', 'text-card-white',
    'bg-border-gray', 'text-border-gray',
    'text-text-dark',
    'text-text-medium',
    'text-text-light',
    
    // Opacity variants
    'bg-opacity-15', 'text-opacity-15',
    'bg-opacity-30', 'text-opacity-30',
    'bg-opacity-70', 'text-opacity-70',
  ],
};
