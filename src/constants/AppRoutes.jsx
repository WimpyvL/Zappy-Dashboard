import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Removed unused Link

// Layout wrapper
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from "../appGuards/ProtectedRoute.jsx"; // Uncommented ProtectedRoute import

// Authentication pages
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup';

// Dashboard
import Dashboard from '../pages/Dashboard';

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
import ShopPage from '../pages/shop/ShopPage.jsx'; // Import the new ShopPage
import MarketplacePage from '../pages/marketplace/MarketplacePage.jsx'; // Import the new MarketplacePage
import MessagingPage from '../pages/messaging/MessagingPage.jsx'; // Import Messaging Page
import AuditLogPage from '../pages/auditlog/AuditLogPage.jsx'; // Import Audit Log Page
import SystemMapPage from '../pages/system-map/SystemMapPage.jsx'; // Import SystemMap Page
import PatientNotesPage from '../pages/notes/PatientNotesPage.jsx'; // Import Patient Notes Page
import PatientProgramPage from '../pages/program/PatientProgramPage.jsx'; // Import Patient Program Page
import PatientRecordsPage from '../pages/records/PatientRecordsPage.jsx'; // Import Patient Records Page
import PatientFormsPage from '../pages/forms/PatientFormsPage.jsx'; // Import Patient Forms Page
import PatientOrderHistoryPage from '../pages/orders/PatientOrderHistoryPage.jsx'; // Import Patient Order History Page
import PatientBillingPage from '../pages/billing/PatientBillingPage.jsx'; // Import Patient Billing Page
import PatientProfilePage from '../pages/profile/PatientProfilePage.jsx'; // Import Patient Profile Page
import EditProfilePage from '../pages/profile/EditProfilePage.jsx'; // Import Edit Profile Page
import FormsManagementV2 from '../pages/settings/pages/forms-v2/FormsManagementV2.jsx'; // Import Forms V2
import PaymentMethodsPage from '../pages/payment/PaymentMethodsPage.jsx'; // Import Payment Methods Page
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx'; // Import Notifications Page
import LandingPage from '../pages/LandingPage.jsx'; // Import Landing Page

// Import ChangePasswordPage component
import ChangePasswordPage from '../pages/profile/ChangePasswordPage.jsx'; // Import Change Password Page

// Subscription components
// Treatment Packages have been deprecated in favor of the unified Products & Subscriptions management
// import TreatmentPackagesPage from '../pages/admin/TreatmentPackagesPage';
// import TreatmentPackageForm from '../pages/admin/TreatmentPackageForm';
import SubscriptionDurationsPage from '../pages/admin/SubscriptionDurationsPage';
import SubscriptionPlansPage from '../pages/admin/SubscriptionPlansPage';
import PatientSubscriptionPage from '../pages/patients/PatientSubscriptionPage';
import ProductSubscriptionManagement from '../pages/admin/ProductSubscriptionManagement';

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

      {/* Protected Routes - All routes requiring authentication are now wrapped with ProtectedRoute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.patients}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Patients />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${paths.patients}/:patientId`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Add Patient Notes Route */}
      <Route
        path={`${paths.patients}/:patientId/notes/new`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientNotesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.orders}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Orders />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Add Order Detail Route */}
      <Route
        path={`${paths.orders}/:orderId`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrderDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.invoices}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Invoices />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.sessions}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Sessions />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.consultations}
        element={
          <ProtectedRoute>
            <MainLayout>
              <InitialConsultations />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.tasks}
        element={
          <ProtectedRoute>
            <MainLayout>
              <TaskManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.insurance}
        element={
          <ProtectedRoute>
            <MainLayout>
              <InsuranceDocumentation />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.pharmacies}
        element={
          <ProtectedRoute>
            <MainLayout>
              <PharmacyManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Products are now managed through the unified Products & Subscriptions page */}
      <Route
        path={paths.products}
        element={<Navigate to="/admin/product-subscription" replace />}
      />

      <Route
        path={paths.providers}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProviderManagement />
            </MainLayout>
          </ProtectedRoute>
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
          <ProtectedRoute>
            <MainLayout>
              <DiscountManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.tags}
        element={
          <ProtectedRoute>
            <MainLayout>
              <TagManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings routes */}
      <Route
        path={`${paths.settings}/*`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={paths.reports}
        element={
          <ProtectedRoute>
            <MainLayout>
              <div>Reports - Coming Soon</div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Shop Page Route */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ShopPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Marketplace Page Route - Unified shop, programs, and subscriptions */}
      <Route
        path="/marketplace" 
        element={
          <MainLayout>
            <MarketplacePage />
          </MainLayout>
        }
      />

      {/* Messaging Page Route */}
      <Route
        path={paths.messages}
        element={
          <ProtectedRoute>
            <MainLayout>
              <MessagingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Audit Log Page Route */}
      <Route
        path={paths.auditlog}
        element={
          <ProtectedRoute>
            <MainLayout>
              <AuditLogPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Notes Page Route */}
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientNotesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Program Page Route */}
      <Route
        path="/program"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientProgramPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

       {/* Placeholder Refill Page Route */}
       <Route
         path="/request-refill" 
         element={
           <ProtectedRoute>
             <MainLayout>
               <div className="p-6">
                 <h2 className="text-xl font-semibold">Request Refill</h2>
                 <p className="mt-4 text-gray-600">(Medication selection and refill request form coming soon...)</p>
               </div>
             </MainLayout>
           </ProtectedRoute>
         }
       />

      {/* Placeholder Booking Page Route */}
       <Route
         path="/book-appointment" 
         element={
           <ProtectedRoute>
             <MainLayout>
               <div className="p-6">
                 <h2 className="text-xl font-semibold">Book Appointment</h2>
                 <p className="mt-4 text-gray-600">(Appointment booking/scheduling interface coming soon...)</p>
               </div>
             </MainLayout>
           </ProtectedRoute>
        }
      />

       {/* Placeholder Change Password Page Route */}
       <Route
         path="/profile/change-password" 
         element={
           <ProtectedRoute>
             <MainLayout>
               <ChangePasswordPage />
             </MainLayout>
           </ProtectedRoute>
         }
       />

       {/* Placeholder Edit Profile Page Route */}
       <Route
         path="/profile/edit" 
         element={
           <ProtectedRoute>
             <MainLayout>
               <EditProfilePage />
             </MainLayout>
           </ProtectedRoute>
         }
       />

      {/* Patient Profile Page Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Billing Page Route */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientBillingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

       {/* Patient Order History Page Route */}
       <Route
         path="/my-orders"
         element={
           <ProtectedRoute>
             <MainLayout>
               <PatientOrderHistoryPage />
             </MainLayout>
           </ProtectedRoute>
         }
       />

      {/* Patient Forms Page Route */}
      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientFormsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* System Map Page Route */}
      <Route
        path="/system-map"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SystemMapPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Forms V2 Route */}
      <Route
        path="/settings/forms-v2"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FormsManagementV2 />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Records Page Route */}
      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientRecordsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Patient Records All History Page Route */}
      <Route
        path="/records/all"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientRecordsPage showAllHistory={true} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Notifications Page Route */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Customer Support Page Route */}
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h2 className="text-xl font-semibold">Customer Support</h2>
                <p className="mt-4 text-gray-600">(Customer support interface coming soon...)</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* My Assistant Page Route */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h2 className="text-xl font-semibold">My Assistant</h2>
                <p className="mt-4 text-gray-600">(AI assistant interface coming soon...)</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Payment Methods Page Route */}
      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PaymentMethodsPage />
            </MainLayout>
          </ProtectedRoute>
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
      
      {/* Patient Subscription Management Route */}
      <Route
        path="/my-subscription"
        element={
          <MainLayout>
            <PatientSubscriptionPage />
          </MainLayout>
        }
      />

      {/* Redirect any unknown routes to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
