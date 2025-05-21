import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Removed unused Link

// Layout wrapper
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from "../appGuards/ProtectedRoute.jsx"; // Temporarily commented out

// Admin pages
import AIPromptSettingsPage from '../pages/admin/AIPromptSettingsPage.jsx';
import NoteTemplatesPage from '../pages/admin/NoteTemplatesPage.jsx';

// Authentication pages
import Login from '../pages/auth/Login.jsx';
import ProviderDashboard from '../pages/dashboard/ProviderDashboard.jsx'; // Import ProviderDashboard
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
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage';

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
import PlanComparisonView from '../pages/products/PlanComparisonView';

// Providers
import ProviderManagement from '../pages/providers/ProviderManagement';

// Settings
import Settings from '../pages/settings/Settings';

// Other components
import ServiceManagement from '../pages/services/ServiceManagement';
import DiscountManagement from '../pages/discounts/DiscountManagement';
import TagManagement from '../pages/tags/TagManagement';
import FormViewer from '../pages/settings/pages/forms/FormViewer.jsx';
import ShopPage from '../pages/patients/ShopPage.jsx'; // Import the patient-focused ShopPage
import MarketplacePage from '../pages/marketplace/MarketplacePage.jsx'; // Import the new MarketplacePage
import MessagingPage from '../pages/messaging/MessagingPage.jsx'; // Import Messaging Page
import AuditLogPage from '../pages/auditlog/AuditLogPage.jsx'; // Import Audit Log Page
import SystemMapPage from '../pages/system-map/SystemMapPage.jsx'; // Import SystemMap Page
import PatientNotesPage from '../pages/notes/PatientNotesPage.jsx'; // Import Patient Notes Page
import PatientDashboardPage from '../pages/patients/PatientDashboardPage.jsx'; // Import Patient Dashboard Page
import PatientHomePage from '../pages/patients/PatientHomePage.jsx'; // Import Patient Home Page
// DirectPatientHomePage import removed - no longer needed
// TestPage import removed - no longer needed
import ProgramsPage from '../pages/patients/ProgramsPage.jsx'; // Import Programs Page
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
import HealthPage from '../pages/patients/HealthPage.jsx'; // Import HealthPage
import IntakeFormPage from '../pages/intake/IntakeFormPage.jsx'; // Import IntakeFormPage
import TreatmentPlanPage from '../pages/patients/TreatmentPlanPage.jsx'; // Import TreatmentPlanPage
// import PatientServicesPage from '../pages/patients/PatientServicesPage.jsx'; // Removed

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
      {/* Public routes */}
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.signup} element={<Signup />} />
      <Route path={`${paths.forms}/:formId`} element={<FormViewer />} />
      {/* Redirect dashboard to patient home */}
      {/* Redirect dashboard to admin dashboard */}
      <Route
        path="/dashboard"
        element={<Navigate to="/admin/dashboard" replace />}
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

      {/* Invoice Detail Route */}
      <Route
        path={`${paths.invoices}/:id`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <InvoiceDetailPage />
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

      {/* Route for ProductServiceAssociation already removed */}

      <Route
        path="/admin/subscription-durations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SubscriptionDurationsPage />
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
        path={paths.providers}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProviderManagement />
            </MainLayout>
          </ProtectedRoute>
        }
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
        path="/admin/product-subscription"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProductSubscriptionManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Plan Comparison View Route */}
      <Route
        path="/plan-comparison"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PlanComparisonView />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* AI Prompt Settings are now managed through Settings -> AI Prompts */}

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
        path="/shop" // Define the path for the shop page
        element={
          <ProtectedRoute>
            <MainLayout>
              <ShopPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Marketplace Page Route - Redirect to Shop page */}
      <Route
        path="/marketplace"
        element={<Navigate to="/shop" replace />}
      />

      {/* Messaging Page Route */}
      <Route
        path={paths.messages} // Assuming '/messages' is added to paths.js
        element={
          <ProtectedRoute>
            <MainLayout>
              <MessagingPage /> {/* Use actual component */}
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
        path="/notes" // Define the path for the patient notes page
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientNotesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard Route */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProviderDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Dashboard Page Route - Removed */}

      {/* Patient Home Page Route - New vibrant UI */}
      <Route
        path="/" // Define the path for the patient home page
        element={
          <MainLayout>
            <PatientHomePage />
          </MainLayout>
        }
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
       
       {/* Intake Form Route */}
       <Route
         path="/intake-form"
         element={
           <ProtectedRoute>
             <MainLayout>
               <IntakeFormPage />
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
        path="/profile" // Define the path for the patient profile page
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
        path="/billing" // Define the path for the patient billing page
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientBillingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* System Map Page Route */}
      <Route
        path="/system-map" // Define the path for the system map page
        element={
          <ProtectedRoute>
            <MainLayout>
              <SystemMapPage />
            </MainLayout>
          </ProtectedRoute>
        }
       />

       {/* Patient Order History Page Route */}
       <Route
         path="/my-orders" // Define the path for the patient order history page
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
        path="/forms" // Define the path for the patient forms list page
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientFormsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Records Page Routes - Removed */}

      {/* Programs Page Route */}
      <Route
        path="/programs"
        element={
          <MainLayout>
            <ProgramsPage />
          </MainLayout>
        }
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

      {/* Customer Support Page Route */}
      <Route
        path="/support" // Define the path for customer support
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

      {/* Patient Forms Page Route */}
      <Route
        path="/forms" // Define the path for the patient forms list page
        element={
          <ProtectedRoute>
            <MainLayout>
              <PatientFormsPage />
            </MainLayout>
          </ProtectedRoute>
        }
       />

      {/* Health Page Route */}
      <Route
        path="/health" // Define the path for the new Health page
        element={
          <ProtectedRoute>
            <MainLayout>
              <HealthPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Treatment Plan Page Route */}
      <Route
        path="/treatment-plan/:planId" // Define the path for the Treatment Plan page
        element={
          <ProtectedRoute>
            <MainLayout>
              <TreatmentPlanPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Treatment Packages Management Routes - Redirected to unified Products & Subscriptions */}
      <Route
        path="/admin/packages"
        element={<Navigate to="/admin/product-subscription" replace />}
      />

      {/* Programs Page Route */}
      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProgramsPage />
            </MainLayout>
          </ProtectedRoute>
        }
       />

      {/* Notifications Page Route */}
      <Route
        path="/notifications" // Define the path for notifications
        element={
          <ProtectedRoute>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
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

      {/* Note Templates are now managed through Settings -> Note Templates */}

      {/* Patient Subscription Management Route - Removed */}

      {/* Redirect /my-subscription to /patient-dashboard - Removed */}

      {/* Redirect any unknown routes to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
