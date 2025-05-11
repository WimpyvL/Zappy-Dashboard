import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  X,
  User,
  Users,
  AlertTriangle,
} from 'lucide-react';
import TaskModal from './TaskModal';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'react-toastify';
// Import the React Query hooks
import {
  useMyTasks,
  useTasksAssignedByMe,
  useMarkTaskCompleted,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignees,
  useCurrentUserId,
} from '../../apis/tasks/hooks';

const TaskManagement = () => {
  // State for view mode
  const [viewMode, setViewMode] = useState('my-tasks'); // 'my-tasks' or 'assigned-by-me'
  
  // State for simple filters
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for sorting - simplified
  const [sortField] = useState('due_date');
  const [sortDirection] = useState('asc');

  // State for selected tasks
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  // State for task modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Status and priority options
  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];
  const priorityOptions = ['low', 'medium', 'high'];

  // Get current user ID
  const { data: currentUserId, isLoading: userLoading } = useCurrentUserId();
  
  // Combined filters and sorting for React Query
  const filtersAndSorting = {
    search: nameFilter || undefined,
    status: statusFilter || undefined,
  };
  // Function to clear search
  const clearSearch = () => {
    setNameFilter('');
    setCurrentPage(1);
    refetchTasks();
  };
  const sortingDetails = {
    column: sortField,
    ascending: sortDirection === 'asc',
  };

  // Use both hooks but only use the data from the appropriate one based on view mode
  const {
    data: myTasksData,
    isLoading: myTasksLoading,
    error: myTasksError,
    refetch: refetchMyTasks,
  } = useMyTasks(currentUserId, currentPage, filtersAndSorting, sortingDetails, itemsPerPage);
  
  const {
    data: assignedByMeData,
    isLoading: assignedByMeLoading,
    error: assignedByMeError,
    refetch: refetchAssignedByMe,
  } = useTasksAssignedByMe(currentUserId, currentPage, filtersAndSorting, sortingDetails, itemsPerPage);
  
  // Select the appropriate data based on view mode
  const tasksData = viewMode === 'my-tasks' ? myTasksData : assignedByMeData;
  const loading = viewMode === 'my-tasks' ? myTasksLoading : assignedByMeLoading;
  const queryError = viewMode === 'my-tasks' ? myTasksError : assignedByMeError;
  const refetchTasks = () => {
    refetchMyTasks();
    refetchAssignedByMe();
  };

  // Extract tasks and total count from the response
  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.meta?.total || 0;

  // Use the assignees query hook
  const { 
    data: assignees = [], 
    isLoading: assigneesLoading 
  } = useAssignees();


  // Use mutation hooks
  const markTaskCompleted = useMarkTaskCompleted({
    onSuccess: () => {
      toast.success('Task marked as completed');
      refetchTasks();
    },
  });

  const createTask = useCreateTask({
    onSuccess: () => {
      toast.success('Task created successfully');
      setIsModalOpen(false);
      refetchTasks();
    },
  });

  const updateTask = useUpdateTask({
    onSuccess: () => {
      toast.success('Task updated successfully');
      setIsModalOpen(false);
      refetchTasks();
    },
  });

  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast.success('Task deleted successfully');
      refetchTasks();
    },
  });

  // Effect to show/hide bulk actions based on selection
  useEffect(() => {
    setShowBulkActions(selectedTasks.length > 0);
  }, [selectedTasks]);


  // Handle task selection for bulk actions
  const handleTaskSelection = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // Check if all tasks are selected
  const allSelected =
    tasks.length > 0 && tasks.every((task) => selectedTasks.includes(task.id));

  // Toggle select all
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((task) => task.id));
    }
  };

  // Function to handle pagination
  const totalPages = Math.ceil(totalTasks / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Action functions
  const handleMarkComplete = async () => {
    try {
      // Mark each selected task as complete
      const markPromises = selectedTasks.map((taskId) =>
        markTaskCompleted.mutateAsync(taskId)
      );

      await Promise.all(markPromises);
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error marking tasks as complete:', error);
      toast.error('Failed to update tasks. Please try again.');
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  };

  // Handle save from modal
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTask.mutateAsync({ id: editingTask.id, taskData });
      } else {
        // Add new task
        await createTask.mutateAsync(taskData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task. Please try again.');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task. Please try again.');
      }
    }
  };


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    try {
      return isAfter(new Date(), parseISO(dueDate));
    } catch (e) {
      return false;
    }
  };

  // Format task status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return (
      status.replace('_', ' ').charAt(0).toUpperCase() +
      status.replace('_', ' ').slice(1)
    );
  };

  // Display error from React Query
  const error = queryError?.message || null;

  return (
    <div>
      {/* Header with title, tabs, and action button */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
          <button
            className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={openAddTaskModal}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </button>
        </div>
        
        {/* Task View Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              viewMode === 'my-tasks'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('my-tasks')}
          >
            <User className="h-4 w-4 mr-2" />
            My Tasks
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              viewMode === 'assigned-by-me'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('assigned-by-me')}
          >
            <Users className="h-4 w-4 mr-2" />
            Assigned by Me
          </button>
        </div>
        
        {showBulkActions && (
          <div className="bg-white rounded-md shadow px-3 py-2 flex items-center mb-4">
            <span className="text-sm font-medium text-gray-600 mr-3">
              {selectedTasks.length} selected
            </span>
            <button
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mx-2 flex items-center"
              onClick={handleMarkComplete}
              disabled={markTaskCompleted.isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </button>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedTasks([])}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && refetchTasks()}
            />
          </div>

          <div className="flex items-center">
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
                setTimeout(() => refetchTasks(), 0);
              }}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {nameFilter && (
            <button
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              onClick={clearSearch}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white shadow rounded-lg mb-4">
        <div className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex items-center">
            <div className="flex-1 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-3"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {viewMode === 'my-tasks' ? 'My Tasks' : 'Tasks I Assigned'}
              </span>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-4 text-center text-gray-500">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                {viewMode === 'my-tasks' 
                  ? 'You have no tasks assigned to you.' 
                  : 'You haven\'t assigned any tasks yet.'}
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelection(task.id)}
                      />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : task.status === 'cancelled'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {formatStatus(task.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-1 flex justify-between">
                        <div className="text-sm text-gray-500">
                          {viewMode === 'my-tasks' 
                            ? `Assigned by: ${task.createdByName || 'Unknown'}`
                            : `Assigned to: ${task.assigneeName || 'Unassigned'}`}
                        </div>
                        <div
                          className={`text-sm ${isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                        >
                          {task.due_date ? formatDate(task.due_date) : 'No due date'}
                          {isOverdue(task.due_date) &&
                            task.status !== 'completed' && (
                              <span className="ml-1">
                                <Clock className="inline h-3 w-3" />
                              </span>
                            )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex space-x-2">
                        {task.status !== 'completed' && (
                          <button
                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded"
                            onClick={() => markTaskCompleted.mutate(task.id)}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded"
                          onClick={() => openEditTaskModal(task.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deleteTask.isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalTasks)}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalTasks)}
              </span>{' '}
              of <span className="font-medium">{totalTasks}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
                const pageNum = i + Math.max(1, currentPage - 2);
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNum ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              <button
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        assignees={assignees}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        isSubmitting={createTask.isLoading || updateTask.isLoading}
      />
    </div>
  );
};

export default TaskManagement;
