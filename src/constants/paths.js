/**
 * Application route paths
 * Centralized location for all route paths used in the application
 */

export const paths = {
  // Developer tools
  ui_components: '/ui-components',
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
  subscription_durations: '/subscription-durations',

  // Other routes
  settings: '/settings',
  reports: '/reports',
  forms: '/forms',
  messages: '/messages', // Added messages path
  auditlog: '/audit-log', // Added audit log path
  intake: '/intake', // Added intake form path
  // AI Prompts are now managed through Settings -> AI Prompts
  // Note Templates are now managed through Settings -> Note Templates
};
