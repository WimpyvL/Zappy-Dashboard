// src/pages/tasks/TaskManagement.js - Refactored for Supabase
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Added Link import
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
  ChevronLeft, // Added
  ChevronRight // Added
} from 'lucide-react';
import TaskModal from './TaskModal';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
// Import the React Query hooks
import {
  useTasks,
  useMarkTaskCompleted,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignees,
  useTaskablePatients
} from '../../apis/tasks/hooks'; // Ensure path is correct
import LoadingSpinner from '../patients/patientDetails/common/LoadingSpinner'; // Adjust path if needed

// Status Badge Component
const StatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  let icon = <Clock className="h-3 w-3 mr-1" />; // Default to pending/todo
  let style = "bg-yellow-100 text-yellow-800";

  if (lowerStatus === 'completed') {
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    style = "bg-green-100 text-green-800";
  } else if (lowerStatus === 'in_progress') {
    icon = <Clock className="h-3 w-3 mr-1" />; // Or another icon for in progress
    style = "bg-blue-100 text-blue-800";
  } else if (lowerStatus === 'cancelled' || lowerStatus === 'archived') {
    icon = <X className="h-3 w-3 mr-1" />;
    style = "bg-gray-100 text-gray-800";
  } else if (lowerStatus !== 'todo') {
     // Default/unknown status
     icon = null;
     style = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {icon}
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
    </span>
  );
};


const TaskManagement = () => {
  // State for filters
  const [nameFilter, setNameFilter] = useState(''); // Search by title
  const [patientFilter, setPatientFilter] = useState(''); // Changed from taskableFilter
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
  // const [itemsPerPage] = useState(10); // Use API default or pass via filters

  // State for task modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Status and priority options from schema
  const statusOptions = ['todo', 'in_progress', 'completed', 'archived']; // Match schema
  const priorityOptions = ['low', 'medium', 'high'];

  const queryClient = useQueryClient();

  // --- Data Fetching ---
  // Combined filters and sorting for React Query
   const filters = useMemo(() => {
    const activeFilters = {};
    if (nameFilter) activeFilters.title = nameFilter;
    if (patientFilter) activeFilters.patientId = patientFilter; // Use patientId
    if (statusFilter) activeFilters.status = statusFilter;
    if (assigneeFilter) activeFilters.assignedToUserId = assigneeFilter; // Use assignedToUserId
    if (dueDateFilter) activeFilters.dueDate = dueDateFilter; // Assuming API supports dueDate filter
    if (priorityFilter) activeFilters.priority = priorityFilter;
    // activeFilters.perPage = itemsPerPage; // Pass itemsPerPage if needed by API
    return activeFilters;
  }, [nameFilter, patientFilter, statusFilter, assigneeFilter, dueDateFilter, priorityFilter]);

  const sortingDetails = useMemo(() => ({
    sortBy: sortField,
    ascending: sortDirection === 'asc'
  }), [sortField, sortDirection]);

  // Use the tasks query hook
  const {
    data: tasksData,
    isLoading,
    error: queryError,
    isFetching, // Use isFetching for background loading indicators
  } = useTasks(currentPage, filters, sortingDetails);

  // Extract tasks and pagination info from the response
  const tasks = tasksData?.data || [];
  const pagination = tasksData?.pagination || { totalCount: 0, totalPages: 1, itemsPerPage: 10 }; // Provide default
  const totalTasks = pagination.totalCount;
  const totalPages = pagination.totalPages;
  const itemsPerPage = pagination.itemsPerPage; // Get itemsPerPage from response

  // Use the assignees query hook
  const { data: assigneesData, isLoading: assigneesLoading } = useAssignees();
  // Use the patients query hook
  const { data: patientsData, isLoading: patientsLoading } = useTaskablePatients();

  // Format assignees and patients data for dropdowns
  const assignees = useMemo(() =>
    assigneesData?.map(user => ({
      id: user.id,
      // Prefer email as display name if available, fallback to ID
      display_name: user.email || `User #${user.id.substring(0, 6)}`,
    })) || [], [assigneesData]);

  const patients = useMemo(() =>
    patientsData?.map(patient => ({
      id: patient.id,
      // Combine first and last name for display
      display_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `Patient #${patient.id.substring(0, 6)}`,
    })) || [], [patientsData]);


  // --- Mutations ---
  const markTaskCompletedMutation = useMarkTaskCompleted({
    onSuccess: (data, variables) => {
      toast.success('Task marked as completed');
      queryClient.invalidateQueries({ queryKey: ['tasks', currentPage, filters, sortingDetails] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
    },
     onError: (error) => toast.error(`Error marking task complete: ${error.message}`)
  });

  const createTaskMutation = useCreateTask({
    onSuccess: () => {
      toast.success('Task created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate the list query
    },
     onError: (error) => toast.error(`Error creating task: ${error.message}`)
  });

  const updateTaskMutation = useUpdateTask({
    onSuccess: (data, variables) => {
      toast.success('Task updated successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tasks', currentPage, filters, sortingDetails] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
     onError: (error) => toast.error(`Error updating task: ${error.message}`)
  });

  const deleteTaskMutation = useDeleteTask({
    onSuccess: (data, variables) => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', variables] });
    },
     onError: (error) => toast.error(`Error deleting task: ${error.message}`)
  });

  // --- Effects ---
  useEffect(() => {
    setShowBulkActions(selectedTasks.length > 0);
  }, [selectedTasks]);

  // --- Handlers ---
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
     setCurrentPage(1); // Reset to first page on sort change
  };

  const applyFilters = () => {
    setCurrentPage(1);
    // Refetch is handled by query key change
  };

  const clearFilters = () => {
    setNameFilter('');
    setPatientFilter('');
    setStatusFilter('');
    setAssigneeFilter('');
    setDueDateFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
        prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  };
  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;


  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMarkComplete = () => {
    selectedTasks.forEach(taskId => {
        markTaskCompletedMutation.mutate(taskId);
    });
    setSelectedTasks([]);
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    // Add created_by_user_id if needed by RLS (fetch user from AuthContext)
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, taskData: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
       deleteTaskMutation.mutate(taskId);
    }
  };

  // --- Render Logic ---
  const renderSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ?
        <ChevronUp className="inline h-4 w-4 ml-1 text-gray-600" /> :
        <ChevronDown className="inline h-4 w-4 ml-1 text-gray-600" />;
    }
    return <ChevronDown className="inline h-4 w-4 ml-1 text-gray-300 group-hover:text-gray-400" />; // Show default down arrow on hover
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (e) { return "Invalid Date"; }
  };

   const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy p'); // Include time
    } catch (e) { return "Invalid Date"; }
  };


  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed' || status === 'cancelled' || status === 'archived') return false;
    try {
      return isAfter(new Date(), parseISO(dueDate));
    } catch (e) { return false; }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const error = queryError?.message || null; // Use queryError

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
        <div className="flex space-x-3">
          {showBulkActions && (
            <div className="bg-white rounded-md shadow px-3 py-2 flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-3">
                {selectedTasks.length} selected
              </span>
              <button
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mx-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMarkComplete}
                disabled={markTaskCompletedMutation.isPending || selectedTasks.length === 0} // Use isPending
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete {markTaskCompletedMutation.isPending ? '...' : ''}
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

      {/* Error Display */}
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

      {/* Filters */}
       <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-2">
          {/* Search Input */}
          <div className="flex-1 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-gray-400" />
             </div>
             <input type="text" placeholder="Search by title..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
           </div>
           {/* Patient Filter */}
           <div className="flex items-center space-x-2">
             <Filter className="h-5 w-5 text-gray-400" />
             <select className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
               <option value="">All Patients</option>
               {patientsLoading ? <option disabled>Loading...</option> : patients.map(p => (<option key={p.id} value={p.id}>{p.display_name}</option>))}
             </select>
           </div>
           {/* Status Filter */}
           <div className="flex items-center space-x-2">
             <Filter className="h-5 w-5 text-gray-400" />
             <select className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
               <option value="">All Statuses</option>
               {statusOptions.map(s => (<option key={s} value={s}>{formatStatus(s)}</option>))}
             </select>
           </div>
           {/* Advanced Filters Toggle */}
           <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
             {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
           </button>
         </div>
         {/* Advanced Filters Section */}
         {showAdvancedFilters && (
           <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 pt-2 border-t border-gray-200 mt-2">
             {/* Assignee Filter */}
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-500">Assignee:</span>
               <select className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                 <option value="">All Assignees</option>
                 {assigneesLoading ? <option disabled>Loading...</option> : assignees.map(a => (<option key={a.id} value={a.id}>{a.display_name}</option>))}
               </select>
             </div>
             {/* Priority Filter */}
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-500">Priority:</span>
               <select className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                 <option value="">All Priorities</option>
                 {priorityOptions.map(p => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
               </select>
             </div>
             {/* Due Date Filter */}
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-500">Due Date:</span>
               <input type="date" className="block w-full md:w-auto pl-3 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={dueDateFilter} onChange={(e) => setDueDateFilter(e.target.value)} />
             </div>
             {/* Action Buttons */}
             <div className="flex items-center space-x-2 md:ml-auto">
               <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50" onClick={clearFilters}>Reset Filters</button>
               <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700" onClick={applyFilters}>Apply Filters</button>
             </div>
           </div>
         )}
       </div>


      {/* Tasks Table */}
      <div className="bg-white shadow rounded-lg mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th scope="col" onClick={() => handleSort('created_at')} className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32">Created At {renderSortIndicator('created_at')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Title</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Patient</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Assignee</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Priority</th>
                <th scope="col" onClick={() => handleSort('due_date')} className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32">Due Date {renderSortIndicator('due_date')}</th>
                <th scope="col" onClick={() => handleSort('updated_at')} className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32">Updated At {renderSortIndicator('updated_at')}</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isLoading || isFetching) && !tasksData ? ( // Use isLoading from useTasks hook
                 <tr><td colSpan="10" className="text-center py-10"><LoadingSpinner message="Loading tasks..." /></td></tr>
              ) : queryError ? (
                 <tr><td colSpan="10" className="text-center py-10 text-red-600">Error loading tasks: {queryError.message}</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500">No tasks found matching criteria.</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4 pr-3 whitespace-nowrap">
                      <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={selectedTasks.includes(task.id)} onChange={() => handleTaskSelection(task.id)} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(task.created_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{task.title}</div></td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.patient ? (<Link to={`/patients/${task.patient_id}`} className="hover:text-indigo-600">{task.patient.first_name} {task.patient.last_name}</Link>) : 'None'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assigned_user ? (task.assigned_user.email || `User #${task.assigned_to_user_id?.substring(0,6)}`) : 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {task.priority ? (<span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>) : <span className="text-xs text-gray-500">-</span> }
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className={`${isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {formatDate(task.due_date)}
                        {isOverdue(task.due_date, task.status) && (<span className="ml-1"><Clock className="inline h-3 w-3" /></span>)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(task.updated_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2" onClick={() => openEditTaskModal(task.id)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteTask(task.id)} disabled={deleteTaskMutation.isPending && deleteTaskMutation.variables === task.id}>
                        Delete {deleteTaskMutation.isPending && deleteTaskMutation.variables === task.id && '...'}
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
       {pagination.totalPages > 1 && (
         <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
           <div className="flex-1 flex justify-between sm:hidden">
             <button className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
             <button className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
           </div>
           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
             <div>
               <p className="text-sm text-gray-700">Showing <span className="font-medium">{pagination.totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalTasks)}</span> of <span className="font-medium">{totalTasks}</span> results</p>
             </div>
             <div>
               <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                 <button className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                   <span className="sr-only">Previous</span><ChevronLeft className="h-5 w-5" />
                 </button>
                 {/* TODO: Implement numbered pagination buttons */}
                 <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                 <button className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage < totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                   <span className="sr-only">Next</span><ChevronRight className="h-5 w-5" />
                 </button>
               </nav>
             </div>
           </div>
         </div>
       )}


      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        assignees={assignees} // Pass formatted assignees
        patients={patients} // Pass formatted patients
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending} // Use mutation state
      />
    </div>
  );
};

export default TaskManagement;
