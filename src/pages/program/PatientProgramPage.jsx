import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { CheckSquare, Target, BookOpen, MessageSquare, BarChart2, Check } from 'lucide-react'; // Import icons
import { Link } from 'react-router-dom'; // Import Link for potential future use
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

const PatientProgramPage = () => {
  const navigate = useNavigate(); // Initialize navigate
  // --- MOCK DATA ---
  const program = {
    name: "Weight Management Program - Phase 1",
    goal: "Lose 5-10% of body weight in 3 months.",
    duration: "12 Weeks",
    currentWeek: 4,
    tasks: [
      { id: 't1', description: "Log meals daily", completed: true },
      { id: 't2', description: "Complete 30 min walk (Mon, Wed, Fri)", completed: true },
      { id: 't3', description: "Attend weekly check-in call", completed: false },
      { id: 't4', description: "Read 'Healthy Eating Guide'", completed: false },
    ],
    progress: [ // Example progress data points
      { week: 1, metric: 'Weight', value: 210, unit: 'lbs' },
      { week: 2, metric: 'Weight', value: 208, unit: 'lbs' },
      { week: 3, metric: 'Weight', value: 207, unit: 'lbs' },
      { week: 4, metric: 'Weight', value: 205, unit: 'lbs' },
    ],
    resources: [
      { id: 'r1', title: "Healthy Eating Guide", type: "PDF" },
      { id: 'r2', title: "Exercise Video: Low Impact Cardio", type: "Video" },
    ],
    coach: { name: "Dr. Emily Carter", id: "provider-1" }
  };
  // --- END MOCK DATA ---

  // Calculate program progress percentage
  const progressPercentage = Math.round((program.currentWeek / program.duration.split(' ')[0]) * 100); // Assuming duration is like "12 Weeks"

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="scribble" color="accent4" position="top-right" size={150} rotation={-10} opacity={0.1} />
      <ChildishDrawingElement type="doodle" color="accent1" position="bottom-left" size={120} rotation={15} opacity={0.15} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
        <p className="text-sm font-handwritten text-accent4 mt-1">Week {program.currentWeek} of {program.duration.split(' ')[0]} - Stay on track!</p>
      </div>

      {/* Program Overview Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent3">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center"><Target className="h-5 w-5 mr-2 text-accent3"/>Program Goal</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">{program.goal}</p>
          {/* Progress Bar */}
          <div className="mb-1 text-sm font-medium text-gray-700">Overall Progress: {progressPercentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-accent3 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Weekly Tasks Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent2">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center"><CheckSquare className="h-5 w-5 mr-2 text-accent2"/>This Week's Tasks</h2>
        </div>
        <div className="p-6">
          {program.tasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {program.tasks.map(task => (
                <li key={task.id} className="py-3 flex items-center justify-between">
                  <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.description}
                  </span>
                  {task.completed ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <button 
                      onClick={() => alert(`Completing task "${task.description}" not yet implemented.`)}
                      className="text-xs text-accent3 hover:text-accent3/80 hover:underline"
                    >
                      Mark Complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-gray-500 text-center py-4">No tasks assigned for this week.</p>
          )}
        </div>
      </div>

      {/* Progress Tracking Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent1">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-accent1"/>Progress: Weight</h2>
        </div>
        <div className="p-6">
          {/* TODO: Implement a chart here */}
          <div className="text-sm text-gray-700 space-y-1 mb-2">
            {program.progress.filter(p => p.metric === 'Weight').map(p => (
               <p key={`prog-${p.week}`}>Week {p.week}: <span className="font-medium">{p.value} {p.unit}</span></p>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">(Chart visualization coming soon)</p>
        </div>
      </div>

      {/* Resources Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center"><BookOpen className="h-5 w-5 mr-2 text-accent4"/>Resources</h2>
        </div>
        <div className="p-6">
          {program.resources.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {program.resources.map(res => (
                <li key={res.id} className="py-3">
                  {/* TODO: Implement actual resource linking */}
                  <button 
                    onClick={() => alert(`Viewing resource "${res.title}" not yet implemented.`)}
                    className="text-sm text-accent3 hover:text-accent3/80 hover:underline text-left w-full"
                  >
                    {res.title} ({res.type})
                  </button>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-gray-500 text-center py-4">No resources available for this program.</p>
          )}
        </div>
      </div>
      
       {/* Contact Coach Card */}
       <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-gray-300">
         <div className="px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-medium flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-gray-600"/>Program Coach</h2>
         </div>
         <div className="p-6">
           <p className="text-gray-700 mb-4">Your coach is <span className="font-medium">{program.coach.name}</span>.</p>
           {/* TODO: Potentially pass coach ID as state in navigation */}
           <button 
             onClick={() => navigate('/messages')} // Navigate to messages page
             className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
           >
             <MessageSquare className="h-4 w-4 mr-2" /> Message Coach
           </button>
         </div>
       </div>
    </div>
  );
};

export default PatientProgramPage;
