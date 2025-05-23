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
  Palette,
  ClipboardCheck,
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
} from 'lucide-react';

import { paths } from './paths'; // Ensure paths are imported

// Group admin sidebar items into sections
export const adminSidebarSections = [
  {
    title: "Overview",
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        color: 'primary',
      },
    ]
  },
  {
    title: "Patient Care",
    items: [
      {
        title: 'Patients',
        path: '/patients',
        icon: Users,
        color: 'accent1',
      },
      {
        title: 'Consultations',
        path: '/consultations',
        icon: UserPlus,
        color: 'accent2',
      },
      {
        title: 'Sessions',
        path: '/sessions',
        icon: Calendar,
        color: 'accent3',
      },
    ]
  },
  {
    title: "Orders & Billing",
    items: [
      {
        title: 'Orders',
        path: '/orders',
        icon: Package,
        color: 'accent4',
      },
      {
        title: 'Invoices',
        path: '/invoices',
        icon: FileText,
        color: 'accent2',
      },
      {
        title: 'Discounts',
        path: '/discounts',
        icon: Percent,
        color: 'accent1',
      },
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: 'Tasks',
        path: '/tasks',
        icon: ClipboardList,
        color: 'accent3',
      },
      {
        title: 'Providers',
        path: '/providers',
        icon: UserPlus,
        color: 'accent4',
      },
      {
        title: 'Pharmacies',
        path: '/pharmacies',
        icon: Building,
        color: 'primary',
      },
      {
        title: 'Insurance',
        path: '/insurance',
        icon: FileText,
        color: 'accent1',
      },
      {
        title: 'Tags',
        path: '/tags',
        icon: Hash,
        color: 'accent3',
      },
      {
        title: 'Messages',
        path: '/messages',
        icon: MessageSquare,
        color: 'accent4',
      },
    ]
  },
  {
    title: "Products & Content",
    items: [
      {
        title: 'Products & Subscriptions',
        path: '/admin/product-subscription',
        icon: Package,
        color: 'primary',
        isAdmin: true,
      },
      {
        title: 'Educational Resources',
        path: '/admin/resources',
        icon: BookOpen,
        color: 'accent3',
        isAdmin: true,
      },
    ]
  },
  {
    title: "System",
    items: [
      {
        title: 'Settings',
        path: paths.settings,
        icon: Settings,
        color: 'accent1',
      },
      {
        title: 'Intake Forms',
        path: '/settings/intake-forms',
        icon: ClipboardList,
        color: 'accent4',
      },
      {
        title: 'Audit Log',
        path: paths.auditlog,
        icon: History,
        color: 'accent2',
      },
      {
        title: 'UI Components',
        path: paths.ui_components,
        icon: Palette,
        color: 'accent3',
      },
    ]
  }
];

// Patient sidebar sections
export const patientSidebarSections = [
  {
    title: "My Health",
    items: [
      { title: 'New Home', path: '/patient-home-v2', icon: Home, color: 'primary' },
      { title: 'My Services', path: '/my-services', icon: Layers, color: 'primary' },
    ]
  },
  {
    title: "Shop & Programs",
    items: [
      { title: 'Shop', path: '/shop', icon: ShoppingBag, color: 'primary' },
      { title: 'Programs', path: '/programs', icon: PatientProgramIcon, color: 'primary' },
    ]
  }
];

// For backward compatibility, flatten the sections into arrays
export const sidebarItems = adminSidebarSections.flatMap(section => section.items);
export const settingsItems = adminSidebarSections
  .find(section => section.title === "System")?.items || [];
export const patientSidebarItems = patientSidebarSections.flatMap(section => section.items);

// Export the logout item
export const logoutItem = {
  title: 'Logout',
  icon: LogOut,
  action: () => console.log('Logging out...'),
};

// Define profile dropdown menu items (Simplified)
export const profileMenuItems = [
  { title: 'My Account', path: '/profile', icon: UserCog, color: 'primary' }, // Central hub for profile, payment, plan
  { title: 'My Orders', path: '/my-orders', icon: PatientOrdersIcon, color: 'primary' }, // Keep orders separate
  { title: 'Help Center', path: '/support', icon: Headphones, color: 'primary' }, // Central support link
];

// Note: Logout item is handled separately in Sidebar.js
