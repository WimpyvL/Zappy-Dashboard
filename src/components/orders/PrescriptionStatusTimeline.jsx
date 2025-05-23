import React from 'react';
import { 
  Pill, 
  ClipboardCheck, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Calendar
} from 'lucide-react';
import { StatusBadge } from '../../pages/orders/PatientOrderHistoryPage';

/**
 * PrescriptionStatusTimeline Component
 * 
 * Displays a timeline of prescription status events, from submission to delivery.
 * Used in OrderDetailModal for orders containing prescription medications.
 * 
 * @param {Object} props - Component props
 * @param {string} props.prescriptionId - Prescription ID
 * @param {string} props.status - Current prescription status
 * @param {Array} props.events - Array of prescription status events
 * @param {boolean} props.compact - Whether to show a compact version of the timeline
 */
const PrescriptionStatusTimeline = ({ prescriptionId, status, events = [], compact = false }) => {
  // Define the standard prescription flow steps
  const standardSteps = [
    {
      id: 'submitted',
      label: 'Prescription Submitted',
      description: 'Your prescription request has been received',
      icon: FileText,
      iconColor: 'text-blue-500',
      iconBgColor: 'bg-blue-100',
    },
    {
      id: 'under_review',
      label: 'Under Review',
      description: 'A healthcare provider is reviewing your request',
      icon: ClipboardCheck,
      iconColor: 'text-purple-500',
      iconBgColor: 'bg-purple-100',
    },
    {
      id: 'approved',
      label: 'Approved',
      description: 'Your prescription has been approved',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBgColor: 'bg-green-100',
    },
    {
      id: 'processing',
      label: 'Processing',
      description: 'Your prescription is being processed for shipping',
      icon: Clock,
      iconColor: 'text-orange-500',
      iconBgColor: 'bg-orange-100',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: 'Your prescription is on its way',
      icon: Truck,
      iconColor: 'text-blue-500',
      iconBgColor: 'bg-blue-100',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Your prescription has been delivered',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBgColor: 'bg-green-100',
    },
  ];

  // Alternative steps for denied prescriptions
  const deniedStep = {
    id: 'denied',
    label: 'Not Approved',
    description: 'Your prescription request was not approved',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    iconBgColor: 'bg-red-100',
  };

  // Map events to steps
  const mapEventsToSteps = () => {
    // If no events, return standard steps
    if (!events || events.length === 0) {
      return standardSteps.map(step => ({
        ...step,
        date: null,
        completed: false,
        active: step.id === status,
      }));
    }

    // If prescription was denied, show a modified timeline
    if (status === 'denied') {
      const submittedEvent = events.find(e => e.status === 'submitted');
      const reviewEvent = events.find(e => e.status === 'under_review');
      const deniedEvent = events.find(e => e.status === 'denied');

      return [
        {
          ...standardSteps[0], // submitted
          date: submittedEvent?.timestamp,
          completed: true,
          active: false,
        },
        {
          ...standardSteps[1], // under_review
          date: reviewEvent?.timestamp,
          completed: reviewEvent !== undefined,
          active: false,
        },
        {
          ...deniedStep,
          date: deniedEvent?.timestamp,
          completed: deniedEvent !== undefined,
          active: true,
        },
      ];
    }

    // For normal flow, map events to standard steps
    return standardSteps.map(step => {
      const matchingEvent = events.find(e => e.status === step.id);
      const currentStepIndex = standardSteps.findIndex(s => s.id === step.id);
      const statusIndex = standardSteps.findIndex(s => s.id === status);
      
      return {
        ...step,
        date: matchingEvent?.timestamp,
        completed: matchingEvent !== undefined || currentStepIndex < statusIndex,
        active: step.id === status,
      };
    });
  };

  const timelineSteps = mapEventsToSteps();
  
  // For compact view, only show completed steps and the next step
  const compactSteps = compact 
    ? timelineSteps.filter((step, index) => {
        const nextIncompleteIndex = timelineSteps.findIndex(s => !s.completed);
        return step.completed || index === nextIncompleteIndex;
      })
    : timelineSteps;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="prescription-timeline">
      {/* Current Status Badge */}
      <div className="flex items-center mb-4">
        <Pill className="h-4 w-4 mr-2 text-blue-600" />
        <span className="text-sm text-gray-700 mr-2">Current Status:</span>
        <StatusBadge status={status} />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line connecting timeline points */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

        {/* Timeline steps */}
        {compactSteps.map((step, index) => (
          <div key={step.id} className="flex mb-6 relative">
            {/* Timeline point */}
            <div 
              className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                step.completed 
                  ? step.iconBgColor 
                  : step.active 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
              }`}
            >
              {React.createElement(step.icon, { 
                className: `w-4 h-4 ${
                  step.completed 
                    ? step.iconColor 
                    : step.active 
                      ? 'text-blue-500' 
                      : 'text-gray-400'
                }` 
              })}
            </div>

            {/* Timeline content */}
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`text-sm font-medium ${
                    step.completed 
                      ? 'text-gray-900' 
                      : step.active 
                        ? 'text-blue-700' 
                        : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {step.date && (
                  <div className="text-right text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(step.date)}
                    </div>
                    <div className="flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(step.date)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Show "View Full Timeline" button if in compact mode and there are hidden steps */}
        {compact && compactSteps.length < timelineSteps.length && (
          <div className="ml-12 mt-2">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              onClick={() => {/* Navigate to full timeline view */}}
            >
              View Full Timeline
            </button>
          </div>
        )}
      </div>

      {/* Next Steps or Additional Information */}
      {status !== 'delivered' && status !== 'denied' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-1">What's Next?</h4>
          <p className="text-xs text-blue-700">
            {status === 'submitted' && "Your prescription request is being prepared for review by a healthcare provider."}
            {status === 'under_review' && "A healthcare provider is reviewing your information. This typically takes 24-48 hours."}
            {status === 'approved' && "Your prescription has been approved and will be processed for shipping soon."}
            {status === 'processing' && "Your prescription is being prepared for shipping. You'll receive a notification when it ships."}
            {status === 'shipped' && "Your prescription is on its way. You can track its progress using the tracking information above."}
          </p>
        </div>
      )}

      {/* Refill Information (if applicable) */}
      {status === 'delivered' && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-800 mb-1">Refill Information</h4>
          <p className="text-xs text-green-700">
            Your next refill will be available on {/* Add refill date logic here */}. 
            We'll send you a reminder when it's time to refill your prescription.
          </p>
          <button 
            className="mt-2 text-xs font-medium text-green-700 hover:text-green-900 hover:underline"
            onClick={() => {/* Navigate to refill request page */}}
          >
            Request Early Refill
          </button>
        </div>
      )}

      {/* Denial Information */}
      {status === 'denied' && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-1">Prescription Not Approved</h4>
          <p className="text-xs text-red-700">
            Your prescription request was not approved. This may be due to medical concerns, 
            incomplete information, or other factors. Please contact our healthcare team for more information.
          </p>
          <button 
            className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 hover:underline"
            onClick={() => {/* Navigate to contact page */}}
          >
            Contact Healthcare Team
          </button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionStatusTimeline;
