import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, User } from 'lucide-react';

const TaskModal = ({
  isOpen,
  onClose,
  task,
  onSave,
  assignees,
  statusOptions,
  isSubmitting,
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    status: 'pending',
    due_date: '',
    assignable_id: '',
  });

  // Search state for assignee dropdown
  const [assigneeSearch, setAssigneeSearch] = useState('');

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      // Format dates for input fields
      const formattedTask = { ...task };

      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        formattedTask.due_date = dueDate.toISOString().slice(0, 16);
      }

      // Extract assignee info
      if (task.user_id) {
        formattedTask.assignable_id = task.user_id;
      } else if (task.assignee) {
        formattedTask.assignable_id = task.assignee.id;
      }

      setTaskData(formattedTask);
    } else {
      // Set default values for new task
      setTaskData({
        title: '',
        status: 'pending',
        due_date: '',
        assignable_id: '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskData({
      ...taskData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(taskData);
  };

  // Filter assignees based on search
  const filteredAssignees = assignees && assigneeSearch
    ? assignees.filter(assignee => 
        `${assignee.first_name} ${assignee.last_name} ${assignee.email || ''}`
          .toLowerCase()
          .includes(assigneeSearch.toLowerCase())
      )
    : assignees || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Assignee */}
            <div>
              <label
                htmlFor="assignable_id"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search assignees..."
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                />
              </div>
              {filteredAssignees.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                  {filteredAssignees.map((assignee) => (
                    <div 
                      key={assignee.id} 
                      className={`p-2 cursor-pointer hover:bg-gray-50 ${taskData.assignable_id === assignee.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setTaskData({...taskData, assignable_id: assignee.id})}
                    >
                      <span className="block text-sm">
                        {assignee.first_name} {assignee.last_name} {assignee.email ? `(${assignee.email})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                assigneeSearch && (
                  <div className="p-2 text-gray-500 text-sm">
                    No assignees found matching your search
                  </div>
                )
              )}
            </div>

            {/* Task */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Task *
              </label>
              <textarea
                id="title"
                name="title"
                rows="3"
                required
                value={taskData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter task description"
              />
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={taskData.due_date}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
