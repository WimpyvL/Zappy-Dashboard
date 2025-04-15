import React, { useState } from 'react';
// import { useAuth } from '../../context/AuthContext'; // Removed unused useAuth
// import { useGetPatientForms } from '../../apis/forms/hooks'; // Temporarily disable hook for mock data
// import { Link } from 'react-router-dom'; // Removed unused Link
import { 
  // Loader2, // Removed unused Loader2
  // AlertTriangle, // Removed unused AlertTriangle
  FileText, Edit, CheckCircle, 
  Clock, Award, ChevronRight, Eye, 
  // ArrowRight, // Removed unused ArrowRight
  Star
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Form Progress Indicator Component
const FormProgressIndicator = ({ completionPercentage = 0, color = "accent2" }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{completionPercentage}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color} h-2 rounded-full`} 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Form Completion Celebration Component
const FormCompletionCelebration = ({ formName, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative overflow-hidden">
        <ChildishDrawingElement type="scribble" color="accent1" position="top-right" size={100} rotation={-15} />
        <ChildishDrawingElement type="doodle" color="accent2" position="bottom-left" size={80} rotation={10} />
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Form Completed!</h2>
          <p className="text-gray-600 mt-2">You've successfully completed the "{formName}" form.</p>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>
        
        <p className="text-sm text-center text-gray-500 mb-6">Thank you for taking the time to provide this important information for your healthcare journey.</p>
        
        <div className="flex justify-center">
          <button
            onClick={onDismiss}
            className="px-6 py-2 bg-accent2 text-white rounded-md hover:bg-accent2/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientFormsPage = () => {
  // useAuth(); // Removed empty destructuring
  // Use a default ID for testing if currentUser is null (due to auth bypass)
  // const _patientId = currentUser?.id || 'dev-patient-id'; // Removed unused var
  
  // State for showing celebration modal
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedFormName, setCompletedFormName] = useState('');

  // --- MOCK DATA ---
  const mockForms = [
      { 
        id: 'req-1', 
        questionnaire_id: 'q-intake', 
        name: 'Initial Health Intake', 
        status: 'pending', 
        created_at: '2025-04-01T10:00:00Z', 
        updated_at: '2025-04-01T10:00:00Z',
        due_date: '2025-04-10T23:59:59Z',
        completion_percentage: 25,
        estimated_time: '15 min',
        priority: 'high'
      },
      { 
        id: 'req-2', 
        questionnaire_id: 'q-followup-1', 
        name: 'Week 1 Check-in', 
        status: 'pending', 
        created_at: '2025-04-07T11:00:00Z', 
        updated_at: '2025-04-07T11:00:00Z',
        due_date: '2025-04-14T23:59:59Z',
        completion_percentage: 0,
        estimated_time: '5 min',
        priority: 'medium'
      },
      { 
        id: 'req-3', 
        questionnaire_id: 'q-consent', 
        name: 'Telehealth Consent', 
        status: 'completed', 
        created_at: '2025-03-28T09:00:00Z', 
        updated_at: '2025-03-28T09:15:00Z',
        completion_percentage: 100,
        estimated_time: '3 min',
        priority: 'low'
      },
  ];
  const forms = mockForms;
  // const _isLoading = false; // Removed unused var - Simulate loaded state
  // const _error = null; // Removed unused var - Simulate no error
  // --- END MOCK DATA ---


  // Original hook usage (commented out)
  /*
  const { data: forms, isLoading, error } = useGetPatientForms(patientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading your forms.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }
  */ // End of original hook logic comment

  // Use mock data
  const pendingForms = forms?.filter(f => f.status === 'pending') || [];
  const completedForms = forms?.filter(f => f.status === 'completed') || []; // Assuming 'completed' status

  // Function to simulate completing a form (for demo purposes)
  const simulateFormCompletion = (formName) => {
    setCompletedFormName(formName);
    setShowCelebration(true);
  };

  // Render the component using mock data (or real data if hook was enabled)
  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="watercolor" color="accent2" position="top-right" size={180} rotation={-10} />
      <ChildishDrawingElement type="doodle" color="accent4" position="bottom-left" size={150} rotation={15} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
        <p className="text-sm font-handwritten text-accent3 mt-1">Your health information journey</p>
      </div>

      {/* Pending Forms Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 text-accent1 mr-2" />
          Pending Forms
        </h2>
        {pendingForms.length > 0 ? (
          <div className="space-y-4">
            {pendingForms.map((form) => (
              <div key={form.id} className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${
                form.priority === 'high' ? 'border-primary' : 
                form.priority === 'medium' ? 'border-accent1' : 'border-accent2'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{form.name || 'Untitled Form'}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="mr-3">Assigned: {formatDate(form.created_at)}</span>
                      {form.due_date && (
                        <span className={`flex items-center ${
                          new Date(form.due_date) < new Date() ? 'text-red-500' : 'text-amber-600'
                        }`}>
                          <Clock className="h-3 w-3 mr-1" /> 
                          Due: {formatDate(form.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Est. time: {form.estimated_time || '10 min'}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <FormProgressIndicator 
                    completionPercentage={form.completion_percentage} 
                    color={
                      form.priority === 'high' ? 'primary' : 
                      form.priority === 'medium' ? 'accent1' : 'accent2'
                    }
                  />
                </div>
                
                <div className="flex justify-end">
                  {/* For demo purposes, we'll show the celebration when clicking this button */}
                  <button
                    onClick={() => simulateFormCompletion(form.name)}
                    className={`px-4 py-2 text-white text-sm font-medium rounded-md flex items-center ${
                      form.priority === 'high' ? 'bg-primary hover:bg-primary/90' : 
                      form.priority === 'medium' ? 'bg-accent1 hover:bg-accent1/90' : 'bg-accent2 hover:bg-accent2/90'
                    }`}
                  >
                    <Edit className="h-4 w-4 mr-2" /> 
                    {form.completion_percentage > 0 ? 'Continue Form' : 'Start Form'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-700 font-medium">You have no pending forms. Great job!</p>
            <p className="text-sm text-gray-500 mt-1">We'll notify you when new forms are available.</p>
          </div>
        )}
      </section>

      {/* Completed Forms Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="h-5 w-5 text-accent2 mr-2" />
          Completed Forms
        </h2>
        {completedForms.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {completedForms.map((form) => (
                <li key={form.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {form.name || 'Untitled Form'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Completed: {formatDate(form.updated_at)}</p>
                    </div>
                    <button 
                      onClick={() => alert(`Viewing submission for "${form.name}" not yet implemented.`)}
                      className="flex items-center text-sm text-accent3 hover:text-accent3/80"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-700">You have not completed any forms yet.</p>
            <p className="text-sm text-gray-500 mt-1">Complete your pending forms to see them here.</p>
          </div>
        )}
      </section>
      
      {/* Form Completion Celebration Modal */}
      {showCelebration && (
        <FormCompletionCelebration 
          formName={completedFormName} 
          onDismiss={() => setShowCelebration(false)} 
        />
      )}
    </div>
  );
};

export default PatientFormsPage;
