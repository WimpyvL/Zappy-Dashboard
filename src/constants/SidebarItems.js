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
  Store as ShopIcon,
  Headphones, // For Customer Support
  // Bot as AssistantIcon, // Removed unused
  // CreditCard as PaymentIcon, // Removed unused (duplicate import)
  UserCog, // For My Information
} from 'lucide-react';

import { paths } from './paths'; // Ensure paths are imported

export const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/',
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
  {
    title: 'Products',
    path: '/products',
    icon: Pill,
    color: 'primary', // Added color
  },
  // Removed Product Services item
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
  {
    title: 'Services',
    path: '/services',
    icon: Tag,
    color: 'accent2', // Added color
  },
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
    title: 'System Map',
    path: '/system-map',
    icon: Map,
    color: 'primary', // Added color
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
];

// Export the logout item
export const logoutItem = {
  title: 'Logout',
  icon: LogOut,
  action: () => console.log('Logging out...'),
};

// Define patient sidebar items (Further Simplified View)
export const patientSidebarItems = [
  { title: 'Home', path: '/', icon: PatientDashboardIcon, color: 'accent3' }, // Changed color from primary (Red) to accent3 (Blue)
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
