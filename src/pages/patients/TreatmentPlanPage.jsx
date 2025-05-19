import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, FileText, Pill, 
  ChevronRight, ChevronDown, CheckCircle, AlertCircle,
  Download, Printer, Share2, BookOpen
} from 'lucide-react';

// This would be fetched from an API in a real implementation
const MOCK_TREATMENT_PLAN = {
  id: 'tp-123456',
  patientId: 'p-123456',
  patientName: 'Michel Choueiri',
  providerId: 'dr-123456',
  providerName: 'Dr. Sarah Johnson',
  createdAt: '2025-05-10T14:30:00Z',
  updatedAt: '2025-05-15T09:15:00Z',
  serviceType: 'weight-management',
  serviceName: 'Weight Management',
  status: 'active',
  nextCheckIn: '2025-05-25',
  medications: [
    {
      id: 'med-123456',
      name: 'Semaglutide',
      dosage: '0.25mg',
      frequency: 'once weekly',
      instructions: 'Inject subcutaneously once weekly. Rotate injection sites.',
      startDate: '2025-05-12',
      endDate: null,
      refills: 3,
      nextRefillDate: '2025-06-12',
      status: 'active',
      sideEffects: [
        'Nausea',
        'Diarrhea',
        'Vomiting',
        'Constipation',
        'Abdominal pain'
      ],
      instructionType: 'semaglutide'
    }
  ],
  notes: [
    {
      id: 'note-123456',
      title: 'Initial Consultation',
      content: 'Patient is starting weight management program with Semaglutide. Initial dose of 0.25mg weekly for 4 weeks, then increase to 0.5mg if tolerated well.',
      createdAt: '2025-05-10T14:30:00Z',
      createdBy: 'Dr. Sarah Johnson'
    },
    {
      id: 'note-123457',
      title: 'Dietary Recommendations',
      content: 'Patient should follow a reduced-calorie diet with emphasis on protein and vegetables. Aim for 1500-1800 calories per day with at least 100g of protein.',
      createdAt: '2025-05-10T14:45:00Z',
      createdBy: 'Dr. Sarah Johnson'
    }
  ],
  goals: [
    {
      id: 'goal-123456',
      title: 'Weight Loss',
      target: 'Lose 20 lbs',
      timeframe: '3 months',
      status: 'in-progress',
      progress: 25
    },
    {
      id: 'goal-123457',
      title: 'Physical Activity',
      target: '30 minutes of moderate exercise 5 days per week',
      timeframe: 'Ongoing',
      status: 'in-progress',
      progress: 60
    }
  ],
  timeline: [
    {
      id: 'event-123456',
      title: 'Initial Consultation',
      date: '2025-05-10',
      description: 'Completed initial consultation with Dr. Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'event-123457',
      title: 'First Medication Dose',
      date: '2025-05-12',
      description: 'Started Semaglutide 0.25mg',
      status: 'completed'
    },
    {
      id: 'event-123458',
      title: 'First Check-in',
      date: '2025-05-25',
      description: 'Scheduled check-in with provider',
      status: 'upcoming'
    },
    {
      id: 'event-123459',
      title: 'Dose Increase',
      date: '2025-06-09',
      description: 'Scheduled increase to 0.5mg if tolerated',
      status: 'upcoming'
    }
  ],
  resources: [
    {
      id: 'resource-123456',
      title: 'Semaglutide Injection Guide',
      type: 'pdf',
      url: '/resources/semaglutide-guide.pdf',
      description: 'Step-by-step guide for Semaglutide injections'
    },
    {
      id: 'resource-123457',
      title: 'Healthy Meal Planning',
      type: 'article',
      url: '/resources/meal-planning.html',
      description: 'Tips for planning healthy, balanced meals'
    },
    {
      id: 'resource-123458',
      title: 'Managing Side Effects',
      type: 'video',
      url: '/resources/side-effects-management.mp4',
      description: 'How to manage common medication side effects'
    }
  ]
};

const TreatmentPlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    medications: true,
    notes: true,
    goals: true,
    timeline: true,
    resources: true
  });

  // Fetch treatment plan data
  useEffect(() => {
    // In a real implementation, this would be an API call
    const fetchTreatmentPlan = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setTreatmentPlan(MOCK_TREATMENT_PLAN);
        setLoading(false);
      } catch (err) {
        setError('Failed to load treatment plan');
        setLoading(false);
      }
    };

    fetchTreatmentPlan();
  }, [planId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
              <button 
                className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                onClick={() => navigate(-1)}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!treatmentPlan) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button 
          className="flex items-center text-blue-600 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{treatmentPlan.serviceName} Treatment Plan</h1>
        <p className="text-gray-600">
          Last updated {formatDate(treatmentPlan.updatedAt)} by {treatmentPlan.providerName}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF
        </button>
        <button className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
          <Printer className="w-4 h-4 mr-1.5" />
          Print
        </button>
        <button className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </button>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Treatment Status</h2>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-sm text-gray-600">Next check-in: {formatDate(treatmentPlan.nextCheckIn)}</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
            Schedule Check-in
          </button>
        </div>
      </div>

      {/* Medications section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button 
          className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200"
          onClick={() => toggleSection('medications')}
        >
          <div className="flex items-center">
            <Pill className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Medications</h2>
          </div>
          {expandedSections.medications ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.medications && (
          <div className="p-4">
            {treatmentPlan.medications.map(medication => (
              <div key={medication.id} className="border rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                    <p className="text-gray-600">{medication.dosage}, {medication.frequency}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions</h4>
                  <p className="text-sm text-gray-600">{medication.instructions}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
                    <p className="text-sm text-gray-600">{formatDate(medication.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Next Refill</h4>
                    <p className="text-sm text-gray-600">{formatDate(medication.nextRefillDate)}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Possible Side Effects</h4>
                  <ul className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                    {medication.sideEffects.map((effect, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <button className="text-blue-600 text-sm font-medium flex items-center">
                    View detailed instructions
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provider Notes section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button 
          className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200"
          onClick={() => toggleSection('notes')}
        >
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Provider Notes</h2>
          </div>
          {expandedSections.notes ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.notes && (
          <div className="p-4">
            {treatmentPlan.notes.map(note => (
              <div key={note.id} className="border rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-gray-600 whitespace-pre-line">{note.content}</p>
                <p className="text-sm text-gray-500 mt-3">- {note.createdBy}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button 
          className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200"
          onClick={() => toggleSection('goals')}
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Treatment Goals</h2>
          </div>
          {expandedSections.goals ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.goals && (
          <div className="p-4">
            {treatmentPlan.goals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-gray-600">{goal.target}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {goal.timeframe}
                  </span>
                </div>
                
                <div className="mb-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button 
          className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200"
          onClick={() => toggleSection('timeline')}
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Treatment Timeline</h2>
          </div>
          {expandedSections.timeline ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.timeline && (
          <div className="p-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline events */}
              {treatmentPlan.timeline.map((event, index) => (
                <div key={event.id} className="relative pl-10 pb-8 last:pb-0">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center ${
                    event.status === 'completed' 
                      ? 'bg-green-100' 
                      : event.status === 'upcoming' 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                  }`}>
                    {event.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  
                  {/* Event content */}
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-semibold text-gray-900">{event.title}</h3>
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resources section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button 
          className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200"
          onClick={() => toggleSection('resources')}
        >
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
          </div>
          {expandedSections.resources ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.resources && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatmentPlan.resources.map(resource => (
                <div key={resource.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          resource.type === 'pdf' 
                            ? 'bg-red-100 text-red-800' 
                            : resource.type === 'video' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help section */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need help?</h3>
            <p className="text-sm text-blue-700 mt-1">
              If you have questions about your treatment plan or are experiencing side effects, please contact your provider.
            </p>
            <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">
              Contact Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanPage;
