import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Removed unused Link

// Layout wrapper
import MainLayout from '../layouts/MainLayout.jsx';
// import ProtectedRoute from "../appGuards/ProtectedRoute.jsx"; // Temporarily commented out

// Authentication pages
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup';

// Dashboard import removed - no longer needed

// Patient components
import Patients from '../pages/patients/Patients';
import PatientDetail from '../pages/patients/PatientDetail';

// Order components
import Orders from '../pages/orders/Orders';
import OrderDetail from '../pages/orders/OrderDetail.jsx'; // Import OrderDetail component

// Invoices components
import Invoices from '../pages/invoices/InvoicePage';

// Sessions
import Sessions from '../pages/sessions/Sessions';

// Consultations
import InitialConsultations from '../pages/consultations/InitialConsultations';

// Tasks
import TaskManagement from '../pages/tasks/TaskManagement';

// Insurance
import InsuranceDocumentation from '../pages/insurance/InsuranceDocumentation';

// Pharmacy
import PharmacyManagement from '../pages/pharmacy/PharmacyManagement';

// Products
import ProductManagement from '../pages/products/ProductManagement';

// Providers
import ProviderManagement from '../pages/providers/ProviderManagement';

// Settings
import Settings from '../pages/settings/Settings';

// Other components
import ServiceManagement from '../pages/services/ServiceManagement';
import DiscountManagement from '../pages/discounts/DiscountManagement';
import TagManagement from '../pages/tags/TagManagement';
import FormViewer from '../pages/settings/pages/forms/FormViewer.jsx';
import MarketplacePage from '../pages/marketplace/MarketplacePage.jsx'; // Import the new MarketplacePage
import MessagingPage from '../pages/messaging/MessagingPage.jsx'; // Import Messaging Page
import AuditLogPage from '../pages/auditlog/AuditLogPage.jsx'; // Import Audit Log Page
import SystemMapPage from '../pages/system-map/SystemMapPage.jsx'; // Import SystemMap Page
import PatientNotesPage from '../pages/notes/PatientNotesPage.jsx'; // Import Patient Notes Page
import PatientDashboardPage from '../pages/patients/PatientDashboardPage.jsx'; // Import Patient Dashboard Page
import PatientHomePage from '../pages/patients/PatientHomePage.jsx'; // Import Patient Home Page
import ProgramsPage from '../pages/patients/ProgramsPage.jsx'; // Import Programs Page
import ShopPage from '../pages/patients/ShopPage.jsx'; // Import Shop Page
// LearnPage import removed
// DirectPatientHomePage import removed - no longer needed
// TestPage import removed - no longer needed
// PatientProgramPage import removed - no longer needed
import PatientRecordsPage from '../pages/records/PatientRecordsPage.jsx'; // Import Patient Records Page
import PatientFormsPage from '../pages/forms/PatientFormsPage.jsx'; // Import Patient Forms Page
import PatientOrderHistoryPage from '../pages/orders/PatientOrderHistoryPage.jsx'; // Import Patient Order History Page
import PatientBillingPage from '../pages/billing/PatientBillingPage.jsx'; // Import Patient Billing Page
import PatientProfilePage from '../pages/profile/PatientProfilePage.jsx'; // Import Patient Profile Page
import PatientServicesPage from '../pages/patients/PatientServicesPage.jsx'; // Import Patient Services Page
import ModularPatientServicesPage from '../pages/patients/ModularPatientServicesPage.jsx'; // Import Modular Patient Services Page
import EditProfilePage from '../pages/profile/EditProfilePage.jsx'; // Import Edit Profile Page
import FormsManagementV2 from '../pages/settings/pages/forms-v2/FormsManagementV2.jsx'; // Import Forms V2
import PaymentMethodsPage from '../pages/payment/PaymentMethodsPage.jsx'; // Import Payment Methods Page
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx'; // Import Notifications Page
import LandingPage from '../pages/LandingPage.jsx'; // Import Landing Page

// Resources pages
import ResourcesPage from '../pages/resources/ResourcesPage.jsx'; // Import Resources Page
import ResourceDetailPage from '../pages/resources/ResourceDetailPage.jsx'; // Import Resource Detail Page

// Import ChangePasswordPage component
import ChangePasswordPage from '../pages/profile/ChangePasswordPage.jsx'; // Import Change Password Page

// Subscription components
// Treatment Packages have been deprecated in favor of the unified Products & Subscriptions management
// TreatmentPackagesPage and TreatmentPackageForm imports removed - files deleted
import SubscriptionDurationsPage from '../pages/admin/SubscriptionDurationsPage';
import SubscriptionPlansPage from '../pages/admin/SubscriptionPlansPage';
import PatientSubscriptionPage from '../pages/patients/PatientSubscriptionPage';
import ProductSubscriptionManagement from '../pages/admin/ProductSubscriptionManagement';
import ResourceManagementPage from '../pages/admin/ResourceManagementPage';
import CartPage from '../pages/cart/CartPage'; // Import the new CartPage

// Paths constants
import { paths } from './paths.js';

// Removed unused tempoRoutes definition and try...catch block

const AppRoutes = () => {
  // Add future flags for React Router v7 compatibility
  const future = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };

  return (
    <Routes future={future}>
      {/* Landing page as root */}
      <Route path="/" element={<Login />} />
      {/* Public routes */}
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.signup} element={<Signup />} />
      <Route path={`${paths.forms}/:formId`} element={<FormViewer />} />
      {/* Redirect dashboard to care page */}
      <Route
        path="/dashboard"
        element={<Navigate to="/care" replace />}
      />

      <Route
        path={paths.patients}
        element={
          <MainLayout>
            <Patients />
          </MainLayout>
        }
      />

      <Route
        path={`${paths.patients}/:patientId`}
        element={
          <MainLayout>
            <PatientDetail />
          </MainLayout>
        }
      />

      <Route
        path={paths.orders}
        element={
          <MainLayout>
            <Orders />
          </MainLayout>
        }
      />

      {/* Add Order Detail Route */}
      <Route
        path={`${paths.orders}/:orderId`}
        element={
          <MainLayout>
            <OrderDetail />
          </MainLayout>
        }
      />

      <Route
        path={paths.invoices}
        element={
          <MainLayout>
            <Invoices />
          </MainLayout>
        }
      />

      <Route
        path={paths.sessions}
        element={
          <MainLayout>
            <Sessions />
          </MainLayout>
        }
      />

      <Route
        path={paths.consultations}
        element={
          <MainLayout>
            <InitialConsultations />
          </MainLayout>
        }
      />

      <Route
        path={paths.tasks}
        element={
          <MainLayout>
            <TaskManagement />
          </MainLayout>
        }
      />

      <Route
        path={paths.insurance}
        element={
          <MainLayout>
            <InsuranceDocumentation />
          </MainLayout>
        }
      />

      <Route
        path={paths.pharmacies}
        element={
          <MainLayout>
            <PharmacyManagement />
          </MainLayout>
        }
      />

      {/* Products are now managed through the unified Products & Subscriptions page */}
      <Route
        path={paths.products}
        element={<Navigate to="/admin/product-subscription" replace />}
      />

      {/* Route for ProductServiceAssociation already removed */}

      <Route
        path={paths.providers}
        element={
          <MainLayout>
            <ProviderManagement />
          </MainLayout>
        }
      />

      {/* Services are now managed through the unified Products & Subscriptions page */}
      <Route
        path={paths.services}
        element={<Navigate to="/admin/product-subscription" replace />}
      />

      <Route
        path={paths.discounts}
        element={
          <MainLayout>
            <DiscountManagement />
          </MainLayout>
        }
      />

      <Route
        path={paths.tags}
        element={
          <MainLayout>
            <TagManagement />
          </MainLayout>
        }
      />

      {/* Settings routes */}
      <Route
        path={`${paths.settings}/*`}
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />

      <Route
        path={paths.reports}
        element={
          <MainLayout>
            <div>Reports - Coming Soon</div>
          </MainLayout>
        }
      />

      {/* Shop Page Route - New UI (replacing Marketplace) */}
      <Route
        path="/shop" // Define the path for the shop page
        element={
          <MainLayout>
            <ShopPage />
          </MainLayout>
        }
      />

      {/* Redirect Marketplace to Shop */}
      <Route
        path="/marketplace"
        element={<Navigate to="/shop" replace />}
      />

      {/* Messaging Page Route */}
      <Route
        path={paths.messages} // Assuming '/messages' is added to paths.js
        element={
          <MainLayout>
            <MessagingPage /> {/* Use actual component */}
          </MainLayout>
        }
      />

      {/* Audit Log Page Route */}
      <Route
        path={paths.auditlog}
        element={
          <MainLayout>
            <AuditLogPage />
          </MainLayout>
        }
      />

      {/* Patient Notes Page Route */}
      <Route
        path="/notes" // Define the path for the patient notes page
        element={
          <MainLayout>
            <PatientNotesPage />
          </MainLayout>
        }
      />

      {/* Patient Dashboard Page Route - Removed */}

      {/* Patient Home Page Route - New vibrant UI */}
      <Route
        path="/patient-home-v2" // Define the path for the patient home page
        element={
          <MainLayout>
            <PatientHomePage />
          </MainLayout>
        }
      />
      
      {/* Home Page Route - Redesigned UI (replacing Records) */}
      <Route
        path="/home" // Define the path for the home page
        element={
          <MainLayout>
            <PatientHomePage />
          </MainLayout>
        }
      />
      
      {/* Programs Page Route - Redesigned UI (replacing Resources) */}
      <Route
        path="/programs" // Define the path for the programs page
        element={
          <MainLayout>
            <ProgramsPage />
          </MainLayout>
        }
      />
      
      {/* Learn Page Route - Removed */}

      {/* Redirect root to home page */}
      <Route
        path="/"
        element={<Navigate to="/home" replace />}
      />

      {/* Test Page Route - Removed */}

      {/* Direct Patient Home Page Route - Removed */}

      {/* Patient Program Page Route - Removed */}

       {/* Placeholder Refill Page Route */}
       <Route
         path="/request-refill" 
         element={
           <MainLayout>
             <div className="p-6">
               <h2 className="text-xl font-semibold">Request Refill</h2>
               <p className="mt-4 text-gray-600">(Medication selection and refill request form coming soon...)</p>
             </div>
           </MainLayout>
         }
       />

      {/* Placeholder Booking Page Route */}
       <Route
         path="/book-appointment" 
         element={
           <MainLayout>
             <div className="p-6">
               <h2 className="text-xl font-semibold">Book Appointment</h2>
               <p className="mt-4 text-gray-600">(Appointment booking/scheduling interface coming soon...)</p>
             </div>
           </MainLayout>
        }
      />

       {/* Placeholder Change Password Page Route */}
       <Route
         path="/profile/change-password" 
         element={
           <MainLayout>
             <ChangePasswordPage />
           </MainLayout>
         }
       />

       {/* Placeholder Edit Profile Page Route */}
       <Route
         path="/profile/edit" 
         element={
           <MainLayout>
             <EditProfilePage />
           </MainLayout>
         }
       />

      {/* Patient Profile Page Route */}
      <Route
        path="/profile" // Define the path for the patient profile page
        element={
          <MainLayout>
            <PatientProfilePage />
          </MainLayout>
        }
      />

      {/* Patient Billing Page Route */}
      <Route
        path="/billing" // Define the path for the patient billing page
        element={
          <MainLayout>
            <PatientBillingPage />
          </MainLayout>
        }
      />

       {/* Patient Order History Page Route */}
       <Route
         path="/my-orders" // Define the path for the patient order history page
         element={
           <MainLayout>
             <PatientOrderHistoryPage />
           </MainLayout>
         }
       />

      {/* Patient Forms Page Route */}
      <Route
        path="/forms" // Define the path for the patient forms list page
        element={
          <MainLayout>
            <PatientFormsPage />
          </MainLayout>
        }
      />

      {/* System Map Page Route */}
      <Route
        path="/system-map" // Define the path for the system map page
        element={
          <MainLayout>
            <SystemMapPage />
          </MainLayout>
        }
      />

      {/* Forms V2 Route */}
      <Route
        path="/settings/forms-v2" // Define the path for the forms v2 page
        element={
          <MainLayout>
            <FormsManagementV2 />
          </MainLayout>
        }
      />

      {/* Care Page Route (formerly Patient Services) */}
      <Route
        path="/care" // Define the path for the care page
        element={
          <MainLayout>
            <ModularPatientServicesPage />
          </MainLayout>
        }
      />
      
      {/* Redirect old my-services paths to care */}
      <Route
        path="/my-services"
        element={<Navigate to="/care" replace />}
      />
      
      <Route
        path="/my-services-v3"
        element={<Navigate to="/care" replace />}
      />

      {/* Redirect Records to Home */}
      <Route
        path="/records"
        element={<Navigate to="/home" replace />}
      />
      
      {/* Redirect Records All History to Home */}
      <Route
        path="/records/all"
        element={<Navigate to="/home" replace />}
      />
      
      {/* Redirect Resources to Programs */}
      <Route
        path="/resources"
        element={<Navigate to="/programs" replace />}
      />
      
      {/* Resource Detail Page Route - Redirected to Programs */}
      <Route
        path="/resources/:id"
        element={<Navigate to="/programs" replace />}
      />
      
      {/* Records Export Page Route - REMOVED */}

      {/* Notifications Page Route */}
      <Route
        path="/notifications" // Define the path for notifications
        element={
          <MainLayout>
            <NotificationsPage />
          </MainLayout>
        }
      />

      {/* Customer Support Page Route */}
      <Route
        path="/support" // Define the path for customer support
        element={
          <MainLayout>
            <div className="p-6">
              <h2 className="text-xl font-semibold">Customer Support</h2>
              <p className="mt-4 text-gray-600">(Customer support interface coming soon...)</p>
            </div>
          </MainLayout>
        }
      />

      {/* My Assistant Page Route */}
      <Route
        path="/assistant" // Define the path for my assistant
        element={
          <MainLayout>
            <div className="p-6">
              <h2 className="text-xl font-semibold">My Assistant</h2>
              <p className="mt-4 text-gray-600">(AI assistant interface coming soon...)</p>
            </div>
          </MainLayout>
        }
      />

      {/* Payment Methods Page Route */}
      <Route
        path="/payment-methods" // Define the path for payment methods
        element={
          <MainLayout>
            <PaymentMethodsPage />
          </MainLayout>
        }
      />
      
      {/* Cart Page Route */}
      <Route
        path="/cart" // Define the path for the cart page
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />

      {/* Admin Dashboard for Products & Subscriptions */}
      <Route
        path="/admin/product-subscription"
        element={
          <MainLayout>
            <ProductSubscriptionManagement />
          </MainLayout>
        }
      />

      {/* Treatment Packages Management Routes - Redirected to unified Products & Subscriptions */}
      <Route
        path="/admin/packages"
        element={<Navigate to="/admin/product-subscription" replace />}
      />
      
      <Route
        path="/admin/packages/create"
        element={<Navigate to="/admin/product-subscription" replace />}
      />
      
      <Route
        path="/admin/packages/edit/:id"
        element={<Navigate to="/admin/product-subscription" replace />}
      />
      
      {/* Subscription Durations Management Route */}
      <Route
        path="/admin/subscription-durations"
        element={
          <MainLayout>
            <SubscriptionDurationsPage />
          </MainLayout>
        }
      />
      
      {/* Subscription Plans Management Route */}
      <Route
        path="/admin/subscription-plans"
        element={
          <MainLayout>
            <SubscriptionPlansPage />
          </MainLayout>
        }
      />
      
      {/* Educational Resources Management Route */}
      <Route
        path="/admin/resources"
        element={
          <MainLayout>
            <ResourceManagementPage />
          </MainLayout>
        }
      />
      
      {/* Patient Subscription Management Route - Removed */}
      
      {/* Redirect /my-subscription to /patient-dashboard - Removed */}

      {/* Redirect any unknown routes to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
