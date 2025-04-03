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
  Layers,
  Tag,
  Percent,
  Hash,
  MessageSquare, // Import icon for Messages
  History, // Import icon for Audit Log
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
