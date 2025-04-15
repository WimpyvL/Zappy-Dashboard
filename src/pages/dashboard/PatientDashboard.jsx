import React from 'react';
import { useAuth } from '../../context/AuthContext'; // To get the current user and loading state
import { Link } from 'react-router-dom'; // Removed unused useNavigate, useLocation
// import { patientSidebarItems } from '../../constants/SidebarItems'; // Removed unused import
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import our drawing element
import {
  Loader2,
  AlertTriangle,
  Home,
  // Settings, // Removed unused
  // FileText as RecordsIcon, // Removed unused
  // Layout as ProgramsIcon, // Removed unused
  ClipboardList as FormsIcon,
  CreditCard as InvoiceIcon,
  Package as OrderIcon,
  // Calendar as AppointmentIcon, // Removed unused
  CreditCard, // For bottom nav (used in OnboardingStatusTimeline)
  // Store as ShopIcon, // Removed unused
  // User as ProfileIcon, // Removed unused
  CheckCircle, // For timeline
  Truck, // For timeline
  Clock as ClockIcon, // Alias Clock for timeline
  UserPlus, // For onboarding
  Play, // For onboarding
  Stethoscope, // For onboarding
} from 'lucide-react';
// Import hooks (using mock data below for now)
// import { useNotes } from '../../apis/notes/hooks'; // Keep notes hook commented out for now due to error
// import { useGetPatientForms } from '../../apis/forms/hooks'; // Removed unused import
import { useMyOrders } from '../../apis/orders/hooks';
import { useMyInvoices } from '../../apis/subscriptionPlans/hooks';
// TODO: Import useSessions hook when available

// Simple Order Status Timeline Component
const OrderStatusTimeline = ({ order }) => {
  // Define the steps based on potential statuses
  const steps = [
    { name: 'Placed', status: 'placed', icon: CheckCircle, color: 'accent2' }, // Assuming 'placed' status exists or is implied
    { name: 'Processing', status: 'processing', icon: ClockIcon, color: 'accent4' },
    { name: 'Shipped', status: 'shipped', icon: Truck, color: 'accent3' },
    // Add 'Delivered' if needed
  ];

  // Find the index of the current status, default to -1 if not found
  let currentStatusIndex = steps.findIndex(step => step.status === order.status?.toLowerCase());
  
  // If status is 'delivered' or something beyond 'shipped', mark all as completed
  if (order.status?.toLowerCase() === 'delivered') {
      currentStatusIndex = steps.length; // Mark all as completed
  } else if (currentStatusIndex === -1 && order.status) {
      // If status exists but not in steps (e.g., 'pending'), assume it's before 'processing'
      currentStatusIndex = 0; // Show 'Placed' as current/completed
  } else if (currentStatusIndex === -1) {
      // Default if status is missing or unknown
      currentStatusIndex = 0; 
  }


  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-700 mb-2">Order #{order.orderId || order.id} ({order.medication || 'Item'})</p>
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center text-center w-16"> {/* Added fixed width and centering */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted ? `bg-${step.color}` : 
                  isCurrent ? `bg-${step.color} ring-2 ring-offset-1 ring-${step.color}` : 
                  'bg-gray-300'
                }`}>
                  <step.icon className={`h-4 w-4 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs leading-tight ${isCurrent ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{step.name}</span>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-12px] ${isCompleted ? `bg-${steps[index+1].color}` : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Simple Onboarding Status Timeline Component
const OnboardingStatusTimeline = ({ stepsCompleted = 0 }) => {
  // Define the onboarding steps
  const steps = [
    { name: 'Sign Up', icon: UserPlus, color: 'accent2' },
    { name: 'Complete Forms', icon: FormsIcon, color: 'accent1' },
    { name: 'Payment Setup', icon: CreditCard, color: 'primary' },
    { name: 'Consultation Review', icon: Stethoscope, color: 'accent3' }, // Or MessageSquare
    { name: 'Program Started', icon: Play, color: 'accent4' },
  ];

  // Determine completion based on stepsCompleted prop (0-indexed)
  const currentStepIndex = stepsCompleted; 

  return (
    <div className="mt-3">
      <div className="flex items-center space-x-1 sm:space-x-2"> {/* Reduced spacing */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center text-center w-14 sm:w-16"> {/* Adjusted width */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted ? `bg-${step.color}` : 
                  isCurrent ? `bg-${step.color} ring-2 ring-offset-1 ring-${step.color}` : 
                  'bg-gray-300'
                }`}>
                  <step.icon className={`h-4 w-4 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs leading-tight ${isCurrent ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{step.name}</span>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-12px] ${isCompleted ? `bg-${steps[index+1].color}` : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


const PatientDashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  // const _navigate = useNavigate(); // Removed unused var
  // const _location = useLocation(); // Removed unused var
  // const _patientId = currentUser?.id || 'dev-patient-id'; // Removed unused var (top-level patientId is used by hooks)

  // --- MOCK DATA for Forms (Reverted due to missing useGetPatientForms hook) ---
  const mockMyForms = [
      { id: 'req-1', questionnaire_id: 'q-intake', name: 'Initial Health Intake', status: 'pending', created_at: '2025-04-01T10:00:00Z' },
      { id: 'req-2', questionnaire_id: 'q-followup-1', name: 'Week 1 Check-in', status: 'pending', created_at: '2025-04-07T11:00:00Z' },
      { id: 'req-3', questionnaire_id: 'q-consent', name: 'Telehealth Consent', status: 'completed', created_at: '2025-03-28T09:00:00Z' },
  ];
  const myForms = mockMyForms;
  const formsLoading = false; // Use mock loading state for forms
  const formsError = null; // Use mock error state for forms
  // --- END MOCK DATA for Forms ---

  // --- Use Actual Hooks for Orders and Invoices ---
  const { data: myOrders, isLoading: ordersLoading, error: ordersError } = useMyOrders();
  const { data: myInvoices, isLoading: invoicesLoading, error: invoicesError } = useMyInvoices();
  // --- END HOOK USAGE ---

  // Combine loading states (using mock formsLoading)
  const dataLoading = authLoading || formsLoading || ordersLoading || invoicesLoading;
  // Combine error states (using mock formsError)
  const dataError = formsError || ordersError || invoicesError;

  // Calculate derived state only if data is available and not loading/error
  const pendingForms = !dataLoading && !dataError ? myForms?.filter(f => f.status === 'pending') : []; // Uses mock myForms
  const pendingInvoices = !dataLoading && !dataError && Array.isArray(myInvoices) ? myInvoices.filter(inv => inv.status?.toLowerCase() === 'pending') : []; // Uses real myInvoices
  // Get the most recent active order that is processing or shipped
  const activeOrders = !dataLoading && !dataError && Array.isArray(myOrders)
    ? myOrders
        .filter(o => ['processing', 'shipped'].includes(o.status?.toLowerCase()))
        .sort((a, b) => new Date(b.orderDate || b.created_at) - new Date(a.orderDate || a.created_at)) // Sort recent first
        .slice(0, 1) // Show only the most recent active order for simplicity
    : []; // Uses real myOrders
  const pendingFormsCount = pendingForms.length;
  const pendingInvoicesCount = pendingInvoices.length;
  const activeOrdersCount = activeOrders.length; // Use activeOrders count

  // --- Calculate Onboarding Status (using mock form data) ---
  const calculateOnboardingSteps = () => {
    // Use mock form data, but real invoice/order data if available
    if (authLoading || ordersLoading || invoicesLoading) return 0; // Wait for auth, orders, invoices
    if (ordersError || invoicesError) return 0; // Handle errors for real data

    let steps = 1; // Step 1: Sign Up is always done if they are here

    // Step 2: Forms (using mock data)
    const intakeFormCompleted = myForms.some(f => f.name?.toLowerCase().includes('intake') && f.status === 'completed');
    if (intakeFormCompleted) steps++;

    // Step 3: Payment (using real data)
    const paymentMade = Array.isArray(myInvoices) && myInvoices.some(inv => inv.status?.toLowerCase() === 'paid');
    if (paymentMade && steps === 2) steps++;

    // Step 4: Consultation Review (Placeholder)
    const consultationReviewed = false;
    if (consultationReviewed && steps === 3) steps++;

    // Step 5: Program Started (using real data)
    const programStarted = Array.isArray(myOrders) && myOrders.some(o => ['shipped', 'delivered'].includes(o.status?.toLowerCase()));
    if (programStarted && steps === 4) steps++;

    return steps;
  }
  const onboardingStepsCompleted = calculateOnboardingSteps();
  const isOnboardingComplete = onboardingStepsCompleted >= 5; // Assuming 5 steps total
  // --- End Mock Onboarding Status ---


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
        <p>Error loading your dashboard data:</p>
        <p className="text-sm text-red-500 mt-1">{dataError.message || 'An unknown error occurred.'}</p>
      </div>
    );
  }

  // Extract user's first name for greeting
  const firstName = currentUser?.user_metadata?.firstName || currentUser?.email?.split('@')[0] || 'User'; // Fallback to email part or generic 'User'

  return (
    <div className="pb-20 relative overflow-hidden"> {/* Add padding at bottom for the fixed navigation and position relative for the drawing elements */}
      {/* Add childish drawing elements */}
      <ChildishDrawingElement type="doodle" color="accent1" position="top-right" size={120} rotation={-15} opacity={0.15} />
      <ChildishDrawingElement type="scribble" color="accent2" position="bottom-left" size={100} rotation={10} opacity={0.1} />
      {/* Adjusted blue watercolor element: moved further left and slightly up */}
      <ChildishDrawingElement type="watercolor" color="accent3" position="-top-4 -left-4" size={140} rotation={5} opacity={0.15} /> 
      {/* Welcome Header */}
      <div className="p-4 border-b border-gray-200 mb-6 relative z-10"> {/* Added relative z-10 to ensure text is above drawings */}
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {firstName}</h1>
        <p className="text-sm text-gray-600 font-handwritten mt-1">Your health journey continues...</p>
      </div>

      {/* Action Items & Status Section */}
      <div className="px-4 space-y-6">
      
        {/* Onboarding Progress Card - Show if not complete */}
        {!isOnboardingComplete && (
          <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-accent2">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center">
                   <UserPlus className="h-5 w-5 text-accent2 mr-2" />
                   <h3 className="text-md font-semibold text-gray-800">Getting Started</h3>
                 </div>
                 <span className="px-2 py-0.5 text-xs rounded-full bg-accent2/10 text-accent2 font-medium">
                   Step {onboardingStepsCompleted} of 5
                 </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Complete the steps to start your program.</p>
              <OnboardingStatusTimeline stepsCompleted={onboardingStepsCompleted} />
              {/* Optional: Add a CTA related to the current step */}
              {onboardingStepsCompleted === 1 && pendingFormsCount > 0 && (
                 <Link 
                   to="/forms" 
                   className="mt-4 inline-flex items-center px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90 transition-colors"
                 >
                   Complete Forms &rarr;
                 </Link>
              )}
               {onboardingStepsCompleted === 2 && pendingInvoicesCount > 0 && (
                 <Link 
                   to="/billing" 
                   className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                 >
                   Setup Payment &rarr;
                 </Link>
              )}
            </div>
          </div>
        )}

        {/* Pending Forms Card - Only show if onboarding is complete OR if forms are not the current onboarding step */}
        {pendingFormsCount > 0 && (isOnboardingComplete || onboardingStepsCompleted !== 1) && (
          <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-yellow-500">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center">
                   <FormsIcon className="h-5 w-5 text-yellow-600 mr-2" />
                   <h3 className="text-md font-semibold text-gray-800">Pending Check-in Forms</h3> {/* Updated title */}
                 </div>
                 <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                   {pendingFormsCount} pending
                 </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Please complete your check-in forms.</p>
              {pendingForms[0] && <p className="text-xs text-gray-500 mb-3">Next: {pendingForms[0].name}</p>}
              {/* CTA Button */}
              <Link 
                to="/forms" 
                className="inline-flex items-center px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90 transition-colors"
              >
                Complete Forms Now &rarr;
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
               {/* CTA Button */}
               <Link 
                 to="/billing" 
                 className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
               >
                 Pay Invoices Now &rarr;
               </Link>
             </div>
           </div>
         )}

        {/* Active Orders Card with Timeline */}
        {activeOrdersCount > 0 && (
           <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-purple-500">
             <div className="p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <OrderIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-800">Active Order Status</h3>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                    {activeOrdersCount} active
                  </span>
               </div>
               {/* Render timeline for the most recent active order */}
               {activeOrders.map(order => (
                 <OrderStatusTimeline key={order.id} order={order} />
               ))}
               <div className="mt-4 text-right">
                 <Link to="/my-orders" className="text-sm font-medium text-accent3 hover:text-accent3/80">
                   View All Orders &rarr;
                 </Link>
               </div>
             </div>
           </div>
         )}

        {/* Placeholder if no action items - Updated condition */}
        {pendingFormsCount === 0 && pendingInvoicesCount === 0 && activeOrdersCount === 0 && (
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
