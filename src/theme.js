// Zappy Health Theme Extension for Tailwind CSS

module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Updated
        'zappy-blue': '#4f46e5', // Updated to indigo-600
        'zappy-yellow': '#FFD100',
        'zappy-teal': '#0d9488', // New primary teal (Tailwind teal-600)
        
        // Neutral Colors - Updated
        'bg-gray': '#F9FAFB',
        'card-white': '#FFFFFF',
        'border-gray': '#E5E7EB',
        'text-dark': '#1f2937', // Updated to Tailwind gray-800
        'text-medium': '#4b5563', // Updated to Tailwind gray-600
        'text-light': '#9ca3af', // Updated to Tailwind gray-400
        
        // Status Colors - Updated
        'success': '#10b981', // Updated to Tailwind green-600
        'warning': '#f59e0b', // Updated to Tailwind amber-500
        'error': '#EF4444',
        'info': '#4f46e5', // Updated to match primary
        
        // Category/Section Colors - Updated
        'weight-teal': '#0d9488', // Updated to match primary teal
        'hair-purple': '#8b5cf6', // Updated to Tailwind purple-500
        'wellness-green': '#10b981', // Updated to match success green
        'sexual-health-pink': '#FEE2E2',
      },
      opacity: {
        '15': '0.15',
        '30': '0.30',
        '70': '0.70',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
};
