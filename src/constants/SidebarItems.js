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
  User as PatientProfileIcon,
  ShoppingCart as PatientOrdersIcon,
  CalendarCheck as PatientSessionsIcon,
  MessageSquare as PatientMessagesIcon,
  LayoutGrid as PatientProgramIcon,
  FolderClock as PatientRecordsIcon,
  CreditCard,
  Store as ShopIcon,
  Headphones, // For Customer Support
  Bot as AssistantIcon, // For My Assistant
  CreditCard as PaymentIcon, // For Payment Methods
  UserCog, // For My Information
} from 'lucide-react';

import { paths } from './paths'; // Ensure paths are imported

export const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: Home,
  },
  {
    title: 'Patients',
    path: '/patients',
    icon: Users,
  },
  {
    title: 'Consultations',
    path: '/consultations',
    icon: UserPlus,
  },
  {
    title: 'Sessions',
    path: '/sessions',
    icon: Calendar,
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: Package,
  },
  {
    title: 'Products',
    path: '/products',
    icon: Pill,
  },
  // Removed Product Services item
  {
    title: 'Discounts',
    path: '/discounts',
    icon: Percent,
  },
  {
    title: 'Invoices',
    path: '/invoices',
    icon: FileText, // Changed from Percent to FileText which is more appropriate for invoices
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: ClipboardList,
  },
  {
    title: 'Providers',
    path: '/providers',
    icon: UserPlus,
  },
  {
    title: 'Pharmacies',
    path: '/pharmacies',
    icon: Building,
  },
  {
    title: 'Insurance',
    path: '/insurance',
    icon: FileText,
  },
  {
    title: 'Services',
    path: '/services',
    icon: Tag,
  },
  {
    title: 'Tags',
    path: '/tags',
    icon: Hash,
  },
  {
    title: 'Messages',
    path: '/messages', // Define path for messages
    icon: MessageSquare,
  },
  {
    title: 'System Map', // Updated title
    path: '/system-map', // Updated path
    icon: Map, // Updated icon
  },
];

// Define settings items separately
export const settingsItems = [
  {
    title: 'Settings',
    path: paths.settings, // Use path constant
    icon: Settings,
  },
  {
    title: 'Audit Log',
    path: paths.auditlog, // Use path constant
    icon: History,
  },
];

// Export the logout item
export const logoutItem = {
  title: 'Logout',
  icon: LogOut,
  action: () => console.log('Logging out...'),
};

// Define patient sidebar items (Further Simplified View)
export const patientSidebarItems = [
  { title: 'Home', path: '/dashboard', icon: PatientDashboardIcon, color: 'primary' }, 
  { title: 'Records', path: '/records', icon: PatientRecordsIcon, color: 'accent3' },
  { title: 'Programs', path: '/program', icon: PatientProgramIcon, color: 'accent4' },
  { title: 'Shop', path: '/shop', icon: ShopIcon, color: 'accent2' },
];

// Define profile dropdown menu items (Simplified)
export const profileMenuItems = [
  { title: 'My Account', path: '/profile', icon: UserCog, color: 'accent4' }, // Central hub for profile, payment, plan
  { title: 'My Orders', path: '/my-orders', icon: PatientOrdersIcon, color: 'accent1' }, // Keep orders separate
  { title: 'Help Center', path: '/support', icon: Headphones, color: 'accent2' }, // Central support link
];

// Note: Logout item is handled separately in Sidebar.js
