import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Beaker, Pill, 
  Calendar, Clock, ArrowRight,
  StickyNote, Eye // Removed unused FileText, Package, CreditCard, ShieldAlert, Stethoscope, Folder
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';
import NoteViewModal from '../../components/notes/NoteViewModal'; // Import the modal

// Timeline Item Component - Modified to handle note clicks
const TimelineItem = ({ record, onNoteClick }) => {
  const { date, title, description, icon: Icon, color, type } = record;
  const isNote = type === 'note';

  const handleClick = () => {
    if (isNote && onNoteClick) {
      onNoteClick(record);
    }
    // Add other click handlers if needed for other types
  };

  return (
    <div 
      className={`relative pl-8 pb-8 ${isNote ? 'cursor-pointer group' : ''}`} 
      onClick={handleClick}
    >
      <div className={`absolute left-0 top-0 h-full w-0.5 bg-${color}`}></div>
      <div className={`absolute left-[-8px] top-0 w-4 h-4 rounded-full border-2 border-${color} bg-white`}></div>
      <div className="flex items-start">
        <div className={`p-2 rounded-full bg-${color}/10 mr-3`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{date}</p>
          <h3 className={`font-medium ${isNote ? 'group-hover:text-accent3' : ''}`}>{title}</h3>
          {/* Truncate description for notes in timeline */}
          <p className={`text-sm text-gray-600 ${isNote ? 'line-clamp-2' : ''}`}>{description}</p>
          {isNote && (
            <span className="text-xs text-accent3 group-hover:underline mt-1 inline-flex items-center">
              <Eye className="h-3 w-3 mr-1" /> View Full Note
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Button Component
const CategoryButton = ({ active, onClick, children, color }) => (
  <button
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      active ? `bg-${color} text-white` : `bg-${color}/10 text-${color}`
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const PatientRecordsPage = ({ showAllHistory = false }) => {
  // State for active category
  const [activeCategory, setActiveCategory] = useState('all');
  // State for note modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Mock data for records
  const recentRecords = [
    { 
      id: 1, 
      date: 'April 5, 2025', 
      title: 'Follow-up Appointment', 
      description: 'Routine check-up with Dr. Sharma',
      type: 'appointment',
      icon: Calendar,
      color: 'accent3'
    },
    { 
      id: 2, 
      date: 'April 2, 2025', 
      title: 'Lab Results Received', 
      description: 'Blood work results from Quest Diagnostics',
      type: 'lab',
      icon: Beaker,
      color: 'accent2'
    },
    { 
      id: 3, 
      date: 'March 28, 2025', 
      title: 'Prescription Refilled', 
      description: 'Monthly medication refill processed',
      type: 'medication',
      icon: Pill,
      color: 'primary'
    },
    { 
      id: 4, 
      date: 'March 15, 2025', 
      title: 'Initial Consultation', 
      description: 'First appointment with Dr. Sharma',
      type: 'appointment',
      icon: Calendar,
      color: 'accent3'
    },
    { 
      id: 5, 
      date: 'March 10, 2025', 
      title: 'Health Questionnaire Completed', 
      description: 'Intake form submitted before first appointment',
      type: 'form',
      icon: ClipboardList,
      color: 'accent1'
    }
  ];

  // Mock Notes Data
  const mockNotes = [
    {
      id: 'note-1',
      date: 'April 5, 2025', // Use same date format for consistency
      created_at: '2025-04-05T11:00:00Z', // Keep original date for sorting if needed
      title: 'Follow-up Session Summary',
      description: 'Patient reports good progress with weight loss. Discussed adjusting medication dosage next month if needed. Reviewed meal logs, suggested incorporating more vegetables. Next check-in scheduled.',
      authorName: 'Dr. Sharma',
      type: 'note', // Add type for filtering
      icon: StickyNote, // Add icon
      color: 'accent4' // Add color
    },
    {
      id: 'note-2',
      date: 'March 15, 2025',
      created_at: '2025-03-15T17:00:00Z',
      title: 'Initial Consultation Notes',
      description: 'Patient presented for weight management. Reviewed medical history and goals. Prescribed initial dose of Medication A. Provided Healthy Eating Guide. Patient motivated to start program.',
      authorName: 'Dr. Sharma',
      type: 'note',
      icon: StickyNote,
      color: 'accent4'
    }
  ];
  
  // Combine all records and sort by date
  // Ensure created_at exists for sorting, fallback to date string if needed
  const allRecords = [...recentRecords, ...mockNotes].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date);
    const dateB = new Date(b.created_at || b.date);
    // Handle potential invalid dates during sort
    if (isNaN(dateA) || isNaN(dateB)) return 0; 
    return dateB - dateA;
  });

  // Add more historical records if showing all history
  const allHistoricalRecords = [
    ...allRecords, // Start with combined recent records and notes
    { 
      id: 6, 
      date: 'February 28, 2025', 
      title: 'Annual Physical', 
      description: 'Comprehensive annual check-up',
      type: 'appointment',
      icon: Calendar,
      color: 'accent3'
    },
    { 
      id: 7, 
      date: 'February 15, 2025', 
      title: 'Vaccination', 
      description: 'Seasonal flu vaccine',
      type: 'appointment',
      icon: Calendar,
      color: 'accent3'
    },
    { 
      id: 8, 
      date: 'January 20, 2025', 
      title: 'Blood Test Results', 
      description: 'Routine blood panel',
      type: 'lab',
      icon: Beaker,
      color: 'accent2'
    },
    { 
      id: 9, 
      date: 'December 10, 2024', 
      title: 'Specialist Consultation', 
      description: 'Cardiology consultation',
      type: 'appointment',
      icon: Calendar,
      color: 'accent3'
    },
    { 
      id: 10, 
      date: 'November 5, 2024', 
      title: 'Prescription Update', 
      description: 'Medication dosage adjustment',
      type: 'medication',
      icon: Pill,
      color: 'primary'
    }
  ];
  
  // Use all historical records if showAllHistory is true
  const recordsToDisplay = showAllHistory ? allHistoricalRecords : allRecords; // Use combined records
  
  // Filter records based on active category
  const filteredRecords = activeCategory === 'all' 
    ? recordsToDisplay 
    : recordsToDisplay.filter(record => record.type === activeCategory);
  
  // Stats for the summary cards
  const stats = {
    appointments: 8,
    forms: 5,
    medications: 3,
    labs: 4,
    notes: mockNotes.length // Add notes count
  };

  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="watercolor" color="accent3" position="top-right" size={150} rotation={-10} opacity={0.2} />
      <ChildishDrawingElement type="doodle" color="accent2" position="bottom-left" size={120} rotation={15} opacity={0.15} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        {showAllHistory ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Complete Medical History</h1>
            <p className="text-sm font-handwritten text-primary mt-1">Your entire health journey</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-sm font-handwritten text-accent4 mt-1">Your health story</p>
          </>
        )}
      </div>
      
      {/* Action Buttons - Removed Export */}
      <div className="mb-6 flex justify-end space-x-3">
        {showAllHistory && (
          <Link 
            to="/records" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Back to Recent Records
          </Link>
        )}
        {/* Export button removed */}
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-accent3">
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8 text-accent3" />
              <span className="text-2xl font-bold">{stats.appointments}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Appointments</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-accent1">
            <div className="flex items-center justify-between">
              <ClipboardList className="h-8 w-8 text-accent1" />
              <span className="text-2xl font-bold">{stats.forms}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Forms</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-primary">
            <div className="flex items-center justify-between">
              <Pill className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{stats.medications}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Medications</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-accent2">
            <div className="flex items-center justify-between">
              <Beaker className="h-8 w-8 text-accent2" />
              <span className="text-2xl font-bold">{stats.labs}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Lab Results</p>
          </div>
        </div>
        
        {/* Category filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter Records</h2>
          <div className="flex flex-wrap gap-2">
            <CategoryButton 
              active={activeCategory === 'all'} 
              onClick={() => setActiveCategory('all')}
              color="accent4"
            >
              All Records
            </CategoryButton>
            
            <CategoryButton 
              active={activeCategory === 'appointment'} 
              onClick={() => setActiveCategory('appointment')}
              color="accent3"
            >
              Appointments
            </CategoryButton>
            
            <CategoryButton 
              active={activeCategory === 'lab'} 
              onClick={() => setActiveCategory('lab')}
              color="accent2"
            >
              Lab Results
            </CategoryButton>
            
            <CategoryButton 
              active={activeCategory === 'medication'} 
              onClick={() => setActiveCategory('medication')}
              color="primary"
            >
              Medications
            </CategoryButton>
            
            <CategoryButton 
              active={activeCategory === 'form'} 
              onClick={() => setActiveCategory('form')}
              color="accent1"
            >
              Forms
            </CategoryButton>
            
            <CategoryButton 
              active={activeCategory === 'note'} 
              onClick={() => setActiveCategory('note')}
              color="accent4" // Use the same color as the note icon
            >
              Notes
            </CategoryButton>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold">Recent Medical History</h2>
          </div>
          
          <div className="timeline">
            {filteredRecords.map(record => (
              <TimelineItem 
                key={record.id}
                record={record} // Pass the whole record object
                onNoteClick={(note) => {
                  setSelectedNote(note);
                  setIsNoteModalOpen(true);
                }}
              />
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No records found for this category.</p>
              </div>
            )}
          </div>
          
          {!showAllHistory && (
            <div className="mt-4 text-center">
              <Link 
                to="/records/all" 
                className="inline-flex items-center px-4 py-2 text-accent4 font-medium hover:underline"
              >
                View Complete History <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Note View Modal */}
      <NoteViewModal 
        note={selectedNote} 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
      />
    </div>
  );
};

export default PatientRecordsPage;
