import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Removed unused Link

// Layout wrapper
import MainLayout from '../layouts/MainLayout.jsx';
// import ProtectedRoute from "../appGuards/ProtectedRoute.jsx"; // Temporarily commented out

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
      {/* Dashboard moved to /dashboard */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
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

      <Route
        path={paths.products}
        element={
          <MainLayout>
            <ProductManagement />
          </MainLayout>
        }
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

      <Route
        path={paths.services}
        element={
          <MainLayout>
            <ServiceManagement />
          </MainLayout>
        }
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

      {/* Shop Page Route */}
      <Route
        path="/shop" // Define the path for the shop page
        element={
          <MainLayout>
            <ShopPage />
          </MainLayout>
        }
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

      {/* Patient Program Page Route */}
      <Route
        path="/program" // Define the path for the patient program page
        element={
          <MainLayout>
            <PatientProgramPage />
          </MainLayout>
        }
      />

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
             <div className="p-6">
               <h2 className="text-xl font-semibold">Change Password</h2>
               <p className="mt-4 text-gray-600">(Password change form coming soon...)</p>
             </div>
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

      {/* Patient Records Page Route */}
      <Route
        path="/records" // Define the path for the patient records page
        element={
          <MainLayout>
            <PatientRecordsPage />
          </MainLayout>
        }
      />
      
      {/* Patient Records All History Page Route */}
      <Route
        path="/records/all" // Define the path for the complete records history
        element={
          <MainLayout>
            <PatientRecordsPage showAllHistory={true} />
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

      {/* Redirect any unknown routes to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
