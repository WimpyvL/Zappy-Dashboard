import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  X,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import TaskModal from './TaskModal';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'react-toastify';
// Import the React Query hooks
import {
  useTasks,
  useMarkTaskCompleted,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignees,
  useTaskablePatients,
} from '../../apis/tasks/hooks';

const TaskManagement = () => {
  // State for filters
  const [nameFilter, setNameFilter] = useState('');
  const [taskableFilter, setTaskableFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // State for sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

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

  // Combined filters and sorting for React Query
  const filtersAndSorting = {
    name: nameFilter || undefined,
    taskable_id: taskableFilter || undefined,
    status: statusFilter || undefined,
    assignee_id: assigneeFilter || undefined,
    due_date: dueDateFilter || undefined,
    priority: priorityFilter || undefined,
    per_page: itemsPerPage,
  };

  const sortingDetails = {
    sort_by: sortField,
    sort_direction: sortDirection,
  };

  // Use the tasks query hook
  const {
    data: tasksData,
    isLoading: loading,
    error: queryError,
    refetch: refetchTasks,
  } = useTasks(currentPage, filtersAndSorting, sortingDetails);

  // Extract tasks and total count from the response
  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.meta?.total_count || 0;

  // Use the assignees query hook
  const { data: assigneesData, isLoading: assigneesLoading } = useAssignees();

  // Use the patients query hook
  const { data: patientsData, isLoading: patientsLoading } =
    useTaskablePatients();

  // Format assignees and patients data
  const assignees = assigneesData?.data
    ? assigneesData.data.map((user) => ({
        id: user.id,
        full_name: user.full_name || user.name,
        email: user.email,
        type: 'user',
      }))
    : [];

  const patients = patientsData?.data
    ? patientsData.data.map((patient) => ({
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        type: 'patient',
      }))
    : [];

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

  // Function to handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to handle filtering
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    refetchTasks();
  };

  // Function to clear filters
  const clearFilters = () => {
    setNameFilter('');
    setTaskableFilter('');
    setStatusFilter('');
    setAssigneeFilter('');
    setDueDateFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

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

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="inline h-4 w-4" />
      ) : (
        <ChevronDown className="inline h-4 w-4" />
      );
    }
    return null;
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
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
        <div className="flex space-x-3">
          {showBulkActions && (
            <div className="bg-white rounded-md shadow px-3 py-2 flex items-center">
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
          <button
            className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={openAddTaskModal}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </button>
        </div>
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

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={taskableFilter}
              onChange={(e) => setTaskableFilter(e.target.value)}
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name || `Patient #${patient.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <button
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Assignee:</span>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="">All Assignees</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.full_name ||
                      assignee.email ||
                      `User #${assignee.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Priority:</span>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Due Date:</span>
              <input
                type="date"
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <button
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                onClick={clearFilters}
              >
                Reset Filters
              </button>
              <button
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table with Horizontal Scrolling */}
      <div className="bg-white shadow rounded-lg mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('created_at')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                >
                  Created At {renderSortIndicator('created_at')}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                >
                  Patient
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                >
                  Assignee
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                >
                  Priority
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('due_date')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                >
                  Due Date {renderSortIndicator('due_date')}
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('updated_at')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                >
                  Updated At {renderSortIndicator('updated_at')}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No tasks found matching your search criteria.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4 pr-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelection(task.id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(task.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.taskable
                        ? task.taskable.patient?.full_name ||
                          (task.taskable.type === 'patient' &&
                            `Patient #${task.taskable.id}`) ||
                          `${task.taskable.type} #${task.taskable.id}`
                        : 'None'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assignee
                        ? task.assignee.full_name ||
                          task.assignee.email ||
                          `User #${task.assignee.id}`
                        : 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                              ? 'bg-orange-100 text-orange-800'
                              : task.priority === 'urgent'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div
                        className={`${isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-600 font-medium' : 'text-gray-900'}`}
                      >
                        {formatDate(task.due_date)}
                        {isOverdue(task.due_date) &&
                          task.status !== 'completed' && (
                            <span className="ml-1">
                              <Clock className="inline h-3 w-3" />
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(task.updated_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                        onClick={() => openEditTaskModal(task.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deleteTask.isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        patients={patients}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        isSubmitting={createTask.isLoading || updateTask.isLoading}
      />
    </div>
  );
};

export default TaskManagement;
