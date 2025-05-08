// Zappy Health Theme Extension for Tailwind CSS

module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        'zappy-blue': '#2D7FF9',
        'zappy-yellow': '#FFD100',
        
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
};
