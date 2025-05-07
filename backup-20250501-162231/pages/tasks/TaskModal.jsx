import React, { useState, useEffect } from 'react';
import { X, Calendar, Bell, Clock, Search } from 'lucide-react';

const TaskModal = ({
  isOpen,
  onClose,
  task,
  onSave,
  assignees,
  patients,
  statusOptions,
  priorityOptions,
  isSubmitting,
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    reminder_date: '',
    message: '',
    duration: 30,
    notify_assignee: false,
    assignable_id: '',
    taskable_id: '',
  });

  // Search states for patient and assignee dropdowns
  const [patientSearch, setPatientSearch] = useState('');
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

      if (task.reminder_date) {
        const reminderDate = new Date(task.reminder_date);
        formattedTask.reminder_date = reminderDate.toISOString().slice(0, 16);
      }

      // Extract assignee info
      if (task.user_id) {
        formattedTask.assignable_id = task.user_id;
      } else if (task.assignee) {
        formattedTask.assignable_id = task.assignee.id;
      }

      // Extract patient info
      if (task.patient_id) {
        formattedTask.taskable_id = task.patient_id;
      } else if (task.patient) {
        formattedTask.taskable_id = task.patient.id;
      }

      setTaskData(formattedTask);
    } else {
      // Set default values for new task
      setTaskData({
        title: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        reminder_date: '',
        message: '',
        duration: 30,
        notify_assignee: false,
        assignable_id: '',
        taskable_id: '',
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

  // Filter patients based on search
  const filteredPatients = patients && patientSearch
    ? patients.filter(patient => 
        `${patient.first_name} ${patient.last_name}`
          .toLowerCase()
          .includes(patientSearch.toLowerCase())
      )
    : patients || [];

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Task Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={taskData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter task title"
              />
            </div>

            {/* Patient */}
            <div className="col-span-2">
              <label
                htmlFor="taskable_id"
                className="block text-sm font-medium text-gray-700"
              >
                Patient
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={`p-2 cursor-pointer hover:bg-gray-50 ${taskData.taskable_id === patient.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setTaskData({...taskData, taskable_id: patient.id})}
                    >
                      <span className="block text-sm">
                        {patient.first_name} {patient.last_name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-sm">
                    {patientSearch ? "No patients found matching your search" : "Loading patients..."}
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={taskData.status}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
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
                  type="datetime-local"
                  value={taskData.due_date}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Reminder Date */}
            <div>
              <label
                htmlFor="reminder_date"
                className="block text-sm font-medium text-gray-700"
              >
                Reminder Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bell className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="reminder_date"
                  name="reminder_date"
                  type="datetime-local"
                  value={taskData.reminder_date}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (minutes)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="0"
                  value={taskData.duration}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Notify Assignee */}
            <div className="flex items-center">
              <input
                id="notify_assignee"
                name="notify_assignee"
                type="checkbox"
                checked={taskData.notify_assignee}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notify_assignee"
                className="ml-2 block text-sm text-gray-900"
              >
                Notify Assignee
              </label>
            </div>

            {/* Assignee */}
            <div className="col-span-2">
              <label
                htmlFor="assignable_id"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search assignees..."
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                {filteredAssignees.length > 0 ? (
                  filteredAssignees.map((assignee) => (
                    <div 
                      key={assignee.id} 
                      className={`p-2 cursor-pointer hover:bg-gray-50 ${taskData.assignable_id === assignee.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setTaskData({...taskData, assignable_id: assignee.id})}
                    >
                      <span className="block text-sm">
                        {assignee.first_name} {assignee.last_name} {assignee.email ? `(${assignee.email})` : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-sm">
                    {assigneeSearch ? "No assignees found matching your search" : "Loading assignees..."}
                  </div>
                )}
              </div>
            </div>

            {/* Message/Notes */}
            <div className="col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Notes/Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="3"
                value={taskData.message}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add notes or a message about this task..."
              />
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
