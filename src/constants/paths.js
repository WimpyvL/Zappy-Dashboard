/**
 * Application route paths
 * Centralized location for all route paths used in the application
 */

export const paths = {
  // Authentication
  login: '/login',
  signup: '/signup',

  // Main routes
  dashboard: '/dashboard',
  patients: '/patients',
  orders: '/orders',
  invoices: '/invoices',
  sessions: '/sessions',
  consultations: '/consultations',
  tasks: '/tasks',
  insurance: '/insurance',

  // Management routes
  pharmacies: '/pharmacies',
  products: '/products',
  product_services: '/product-services',
  providers: '/providers',
  services: '/services',
  discounts: '/discounts',
  tags: '/tags',

  // Other routes
  settings: '/settings',
  reports: '/reports',
  forms: '/forms',
  messages: '/messages', // Added messages path
  auditlog: '/audit-log', // Added audit log path
  // AI Prompts are now managed through Settings -> AI Prompts
  // Note Templates are now managed through Settings -> Note Templates
};
