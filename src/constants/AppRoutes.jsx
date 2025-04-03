import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout wrapper
import MainLayout from "../layouts/MainLayout.jsx";
// import ProtectedRoute from "../appGuards/ProtectedRoute.jsx"; // Temporarily commented out

// Authentication pages
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup";

// Dashboard
import Dashboard from "../pages/Dashboard";

// Patient components
import Patients from "../pages/patients/Patients";
import PatientDetail from "../pages/patients/PatientDetail";

// Order components
import Orders from "../pages/orders/Orders";

// Invoices components
import Invoices from "../pages/invoices/InvoicePage";

// Sessions
import Sessions from "../pages/sessions/Sessions";

// Consultations
import InitialConsultations from "../pages/consultations/InitialConsultations";

// Tasks
import TaskManagement from "../pages/tasks/TaskManagement";

// Insurance
import InsuranceDocumentation from "../pages/insurance/InsuranceDocumentation";

// Pharmacy
import PharmacyManagement from "../pages/pharmacy/PharmacyManagement";

// Products
import ProductManagement from "../pages/products/ProductManagement";

// Providers
import ProviderManagement from "../pages/providers/ProviderManagement";

// Settings
import Settings from "../pages/settings/Settings";

// Other components
import ServiceManagement from "../pages/services/ServiceManagement";
import DiscountManagement from "../pages/discounts/DiscountManagement";
import TagManagement from "../pages/tags/TagManagement";
import FormViewer from "../pages/settings/pages/forms/FormViewer.jsx";
import ShopPage from "../pages/shop/ShopPage.jsx"; // Import the new ShopPage
import MessagingPage from "../pages/messaging/MessagingPage.jsx"; // Import Messaging Page
import AuditLogPage from "../pages/auditlog/AuditLogPage.jsx"; // Import Audit Log Page

// Paths constants
import { paths } from "./paths.js";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.signup} element={<Signup />} />
      <Route path={`${paths.forms}/:formId`} element={<FormViewer />} />

      {/* Protected routes */}
      {/* Temporarily unprotected routes */}
      <Route
        path={paths.dashboard}
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

      {/* Redirect any unknown routes to dashboard */}
      <Route path="*" element={<Navigate to={paths.dashboard} replace />} />
    </Routes>
  );
};

export default AppRoutes;
