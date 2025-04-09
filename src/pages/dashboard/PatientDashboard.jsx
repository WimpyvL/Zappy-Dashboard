import React from 'react';
import { useAuth } from '../../context/AuthContext'; // To get the current user and loading state
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { patientSidebarItems } from '../../constants/SidebarItems'; // Import patient sidebar items
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import our drawing element
import {
  Loader2,
  AlertTriangle,
  Home,
  Settings,
  FileText as RecordsIcon,
  Layout as ProgramsIcon,
  ClipboardList as FormsIcon,
  CreditCard as InvoiceIcon,
  Package as OrderIcon,
  Calendar as AppointmentIcon,
  CreditCard, // For bottom nav
  Store as ShopIcon, // For Shop
  User as ProfileIcon, // For Profile
} from 'lucide-react';
// Import hooks (using mock data below for now)
// import { useNotes } from '../../apis/notes/hooks'; // Keep notes hook commented out for now due to error
import { useGetPatientForms } from '../../apis/forms/hooks';
import { useMyOrders } from '../../apis/orders/hooks';
import { useMyInvoices } from '../../apis/subscriptionPlans/hooks';
// TODO: Import useSessions hook when available

const PatientDashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = currentUser?.id || 'dev-patient-id';

  // --- MOCK DATA (Replace with actual hook calls when ready) ---
  const mockMyForms = [
      { id: 'req-1', questionnaire_id: 'q-intake', name: 'Initial Health Intake', status: 'pending', created_at: '2025-04-01T10:00:00Z' },
      { id: 'req-2', questionnaire_id: 'q-followup-1', name: 'Week 1 Check-in', status: 'pending', created_at: '2025-04-07T11:00:00Z' },
      { id: 'req-3', questionnaire_id: 'q-consent', name: 'Telehealth Consent', status: 'completed', created_at: '2025-03-28T09:00:00Z' },
  ];
  const myForms = mockMyForms;
  const formsLoading = false;
  const formsError = null;

  const mockMyOrders = [
       { id: 'ord-1', orderId: 'ZAP-1001', orderDate: '2025-04-05T14:00:00Z', status: 'shipped', medication: 'Med A' },
       { id: 'ord-2', orderId: 'ZAP-1005', orderDate: '2025-04-08T10:00:00Z', status: 'processing', medication: 'Supplement Pack' },
       { id: 'ord-3', orderId: 'ZAP-0988', orderDate: '2025-03-15T16:30:00Z', status: 'delivered', medication: 'Med A' },
   ];
  const myOrders = mockMyOrders;
  const ordersLoading = false;
  const ordersError = null;

   const mockMyInvoices = [
       { id: 'inv-1', invoiceId: 'INV-001', createdAt: '2025-04-01T00:00:00Z', status: 'Paid', invoiceAmount: 99.00 },
       { id: 'inv-2', invoiceId: 'INV-002', createdAt: '2025-04-08T00:00:00Z', status: 'Pending', invoiceAmount: 150.00 },
   ];
  const myInvoices = mockMyInvoices;
  const invoicesLoading = false;
  const invoicesError = null;

  const mockUpcomingSession = {
      id: 'sess-1',
      type: 'Follow-up Visit',
      providerName: 'Dr. Anya Sharma',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Mock: 2 days from now
      joinUrl: 'https://meet.example.com/session-12345'
  };
  const mySessions = [mockUpcomingSession];
  const sessionsLoading = false;
  const sessionsError = null;
  // --- END MOCK DATA ---

  // Combine loading states
  const dataLoading = authLoading || formsLoading || ordersLoading || invoicesLoading || sessionsLoading; // Removed notesLoading
  // Combine error states
  const dataError = formsError || ordersError || invoicesError || sessionsError; // Removed notesError

  // Calculate derived state only if data is available and not loading/error
  const upcomingSession = !dataLoading && !dataError && mySessions?.length > 0 ? mySessions[0] : null;
  const pendingForms = !dataLoading && !dataError ? myForms?.filter(f => f.status === 'pending') : [];
  const pendingInvoices = !dataLoading && !dataError ? myInvoices?.filter(inv => inv.status?.toLowerCase() === 'pending') : [];
  const processingOrders = !dataLoading && !dataError ? myOrders?.filter(o => ['processing', 'shipped'].includes(o.status?.toLowerCase())) : [];
  const pendingFormsCount = pendingForms.length;
  const pendingInvoicesCount = pendingInvoices.length;
  const processingOrdersCount = processingOrders.length;

  // Handle Auth loading state FIRST
  if (authLoading) {
    return (
       <div className="flex justify-center items-center h-screen">
         <Loader2 className="h-16 w-16 animate-spin text-[#F85C5C]" />
         <p className="ml-4 text-lg">Loading user information...</p>
       </div>
     );
  }

  // Handle case where user is not logged in after auth check
  if (!currentUser && process.env.NODE_ENV !== 'development') {
     return (
       <div className="text-center py-10">
         <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
         <p className="text-lg font-medium">Not Logged In</p>
         <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
         <Link to="/login" className="px-4 py-2 bg-[#F85C5C] text-white rounded-md hover:bg-opacity-90 transition-colors">
           Go to Login
         </Link>
       </div>
     );
   }

   // Now handle data loading state (after auth is confirmed)
   if (dataLoading) {
     return (
       <div className="flex justify-center items-center h-screen">
         <Loader2 className="h-16 w-16 animate-spin text-[#F85C5C]" />
         <p className="ml-4 text-lg">Loading dashboard data...</p>
       </div>
     );
   }

  // Handle data error state
  if (dataError) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading your dashboard data.</p>
        {/* <p>{dataError.message}</p> */}
      </div>
    );
  }

  // Extract user's first name for greeting
  const firstName = currentUser?.user_metadata?.firstName || 'Anthony';

  return (
    <div className="pb-20 relative overflow-hidden"> {/* Add padding at bottom for the fixed navigation and position relative for the drawing elements */}
      {/* Add childish drawing elements */}
      <ChildishDrawingElement type="doodle" color="accent1" position="top-right" size={120} rotation={-15} />
      <ChildishDrawingElement type="scribble" color="accent2" position="bottom-left" size={100} rotation={10} />
      <ChildishDrawingElement type="watercolor" color="accent3" position="top-left" size={150} rotation={5} />
      {/* Welcome Header */}
      <div className="p-4 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {firstName}</h1>
        <p className="text-sm text-gray-600 font-handwritten mt-1">Your health journey continues...</p>
      </div>

      {/* Action Items & Status Section */}
      <div className="px-4 space-y-6">

        {/* Pending Forms Card */}
        {pendingFormsCount > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-yellow-500">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center">
                   <FormsIcon className="h-5 w-5 text-yellow-600 mr-2" />
                   <h3 className="text-md font-semibold text-gray-800">Pending Forms</h3>
                 </div>
                 <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                   {pendingFormsCount} pending
                 </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Please complete these forms at your earliest convenience.</p>
              {pendingForms[0] && <p className="text-xs text-gray-500 mb-3">Next: {pendingForms[0].name}</p>}
              <Link to="/forms" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Go to My Forms &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Pending Invoices Card */}
        {pendingInvoicesCount > 0 && (
           <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-red-500">
             <div className="p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <InvoiceIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-800">Pending Invoices</h3>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                    {pendingInvoicesCount} pending
                  </span>
               </div>
               <p className="text-sm text-gray-600 mb-3">You have outstanding invoices that require payment.</p>
               {pendingInvoices[0] && <p className="text-xs text-gray-500 mb-3">Next Due: Invoice #{pendingInvoices[0].invoiceId || pendingInvoices[0].id}</p>}
               <Link to="/billing" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                 Go to Billing &rarr;
               </Link>
             </div>
           </div>
         )}

        {/* Upcoming Appointment Card */}
        {upcomingSession && (
          <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-blue-500">
             <div className="p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AppointmentIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-800">Upcoming Appointment</h3>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                     {upcomingSession.type}
                  </span>
               </div>
                <p className="text-sm text-gray-800 font-medium">{upcomingSession.providerName}</p>
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(upcomingSession.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' • '}
                  {new Date(upcomingSession.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <button
                  onClick={() => {
                    if (upcomingSession?.joinUrl) {
                      window.location.href = upcomingSession.joinUrl;
                    } else {
                      alert('Appointment join link is not available.');
                    }
                  }}
                  disabled={!upcomingSession?.joinUrl}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Session
                </button>
             </div>
          </div>
        )}

        {/* Processing/Shipped Orders Card */}
        {processingOrdersCount > 0 && (
           <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-purple-500">
             <div className="p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <OrderIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-800">Recent Orders</h3>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                    {processingOrdersCount} active
                  </span>
               </div>
               <p className="text-sm text-gray-600 mb-3">Your recent orders are being processed or shipped.</p>
               {processingOrders[0] && <p className="text-xs text-gray-500 mb-3">Latest: Order #{processingOrders[0].orderId || processingOrders[0].id} ({processingOrders[0].status})</p>}
               <Link to="/my-orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                 View Order History &rarr;
               </Link>
             </div>
           </div>
         )}

        {/* Placeholder if no action items */}
        {pendingFormsCount === 0 && pendingInvoicesCount === 0 && !upcomingSession && processingOrdersCount === 0 && (
           <div className="text-center py-10 bg-white rounded-lg shadow">
             <Home className="h-12 w-12 mx-auto text-gray-400 mb-3" />
             <p className="text-gray-500">No pending actions or updates.</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;
