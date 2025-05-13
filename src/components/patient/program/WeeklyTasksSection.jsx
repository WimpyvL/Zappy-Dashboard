import React from 'react';
import { CheckSquare, Check } from 'lucide-react';
import { toast } from 'react-toastify'; // Assuming toast is used directly in the component

const WeeklyTasksSection = ({ tasks }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-[#4F46E5]"/>This Week's Tasks
        </h3>
      </div>
      <div className="p-5">
        {tasks.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {tasks.map(task => (
              <li key={task.id} className="py-3 flex items-center justify-between">
                <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {task.description}
                </span>
                {task.completed ? (
                  <div className="bg-green-100 p-1 rounded-full">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <button
                    onClick={() => toast.info(`Marking task "${task.description}" as complete`)}
                    className="text-xs bg-[#4F46E5] text-white px-3 py-1 rounded-full hover:bg-[#4F46E5]/90"
                  >
                    Complete
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
  );
};

export default WeeklyTasksSection;
