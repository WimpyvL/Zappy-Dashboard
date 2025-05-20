import {
  Home,
  Users,
  Calendar,
  Package,
  Pill,
  UserPlus,
  Building,
  FileText,
  Settings,
  LogOut,
  ClipboardList,
  Tag,
  Percent,
  Hash,
  MessageSquare,
  History,
  Map,
  // Patient view icons
  LayoutDashboard as PatientDashboardIcon,
  // User as PatientProfileIcon, // Removed unused
  ShoppingCart as PatientOrdersIcon,
  // CalendarCheck as PatientSessionsIcon, // Removed unused
  // MessageSquare as PatientMessagesIcon, // Removed unused
  LayoutGrid as PatientProgramIcon,
  FolderClock as PatientRecordsIcon,
  // CreditCard, // Removed unused (duplicate import)
  // Store as ShopIcon, // Removed
  Headphones, // For Customer Support
  // Bot as AssistantIcon, // Removed unused
  // CreditCard as PaymentIcon, // Removed unused (duplicate import)
  UserCog, // For My Information
  ShoppingBag, // For Marketplace
  BookOpen, // For Resources
  Layers, // For My Services
  Heart, // For Health page
} from 'lucide-react';

import { paths } from './paths'; // Ensure paths are imported

export const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/dashboard', // Changed from '/' to '/dashboard'
    icon: Home,
    color: 'primary', // Added color
  },
  {
    title: 'Patients',
    path: '/patients',
    icon: Users,
    color: 'accent1', // Added color
  },
  {
    title: 'Consultations',
    path: '/consultations',
    icon: UserPlus,
    color: 'accent2', // Added color
  },
  {
    title: 'Sessions',
    path: '/sessions',
    icon: Calendar,
    color: 'accent3', // Added color
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: Package,
    color: 'accent4', // Added color
  },
  // Products are now managed through the unified Products & Subscriptions page
  {
    title: 'Discounts',
    path: '/discounts',
    icon: Percent,
    color: 'accent1', // Added color
  },
  {
    title: 'Invoices',
    path: '/invoices',
    icon: FileText,
    color: 'accent2', // Added color
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: ClipboardList,
    color: 'accent3', // Added color
  },
  {
    title: 'Providers',
    path: '/providers',
    icon: UserPlus,
    color: 'accent4', // Added color
  },
  {
    title: 'Pharmacies',
    path: '/pharmacies',
    icon: Building,
    color: 'primary', // Added color
  },
  {
    title: 'Insurance',
    path: '/insurance',
    icon: FileText,
    color: 'accent1', // Added color
  },
  // Services are now managed through the unified Products & Subscriptions page
  {
    title: 'Tags',
    path: '/tags',
    icon: Hash,
    color: 'accent3', // Added color
  },
  {
    title: 'Messages',
    path: '/messages',
    icon: MessageSquare,
    color: 'accent4', // Added color
  },
  {
    title: 'Products & Subscriptions',
    path: '/admin/product-subscription',
    icon: Package,
    color: 'primary',
    isAdmin: true,
  },
  // Treatment Packages functionality has been consolidated into Products & Subscriptions
  {
    title: 'Subscription Durations',
    path: '/admin/subscription-durations',
    icon: Calendar,
    color: 'accent2',
  },
  {
    title: 'Educational Resources',
    path: '/admin/resources',
    icon: BookOpen,
    color: 'accent3',
    isAdmin: true,
  },
];

// Define settings items separately
export const settingsItems = [
  {
    title: 'Settings',
    path: paths.settings,
    icon: Settings,
    color: 'accent1', // Added color
  },
  {
    title: 'Audit Log',
    path: paths.auditlog,
    icon: History,
    color: 'accent2', // Added color
  },
  // AI Prompts are now managed through the Settings page
  // Note Templates are now managed through the Settings page
];

// Export the logout item
export const logoutItem = {
  title: 'Logout',
  icon: LogOut,
  action: () => console.log('Logging out...'),
};

// Define patient sidebar items (Further Simplified View)
export const patientSidebarItems = [
  { title: 'Home', path: '/', icon: Home, color: 'primary' }, // Updated to Home page
  { title: 'Health', path: '/health', icon: Heart, color: 'primary' }, // Updated to Health page
  { title: 'Shop', path: '/shop', icon: ShoppingBag, color: 'primary' }, // Shop page replacing Marketplace
  { title: 'Programs', path: '/programs', icon: PatientProgramIcon, color: 'primary' }, // Patient programs
];

// Define profile dropdown menu items (Simplified)
export const profileMenuItems = [
  { title: 'My Account', path: '/profile', icon: UserCog, color: 'primary' }, // Central hub for profile, payment, plan
  { title: 'My Orders', path: '/my-orders', icon: PatientOrdersIcon, color: 'primary' }, // Keep orders separate
  { title: 'Help Center', path: '/support', icon: Headphones, color: 'primary' }, // Central support link
];

// Note: Logout item is handled separately in Sidebar.js
