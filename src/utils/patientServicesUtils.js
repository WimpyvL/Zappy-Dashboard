/**
 * Utility functions for processing patient services data
 */

/**
 * Processes a patient service with related data
 * @param {Object} service - The patient service to process
 * @param {Array} medications - Medications related to the service
 * @param {Array} actionItems - Action items related to the service
 * @param {Array} resources - Educational resources related to the service
 * @param {Array} recommendations - Product recommendations related to the service
 * @returns {Object} The processed service with all related data
 */
export const processServiceData = (service, medications = [], actionItems = [], resources = [], recommendations = []) => {
  if (!service) return null;

  // Calculate progress data
  const progressTitle = `${service.name} Progress`;
  const progressSubtitle = 'Updates';
  const progressStatus = service.status || 'Active';
  const progressToGoalText = 'Progress to goal';
  
  // Calculate progress percentage based on completed action items or other metrics
  const progressPercentage = calculateProgressPercentage(actionItems);

  // Calculate status information
  const nextRefillDate = calculateNextRefillDate(medications);
  const upcomingRefills = getUpcomingRefills(medications);
  const nextCheckinDate = calculateNextCheckinDate(actionItems);
  const checkinStatus = calculateCheckinStatus(nextCheckinDate);

  // Determine priority task
  const priorityTask = determinePriorityTask(service, actionItems, medications);

  return {
    ...service,
    medications,
    actionItems,
    resources,
    recommendations,
    progressTitle,
    progressSubtitle,
    progressStatus,
    progressToGoalText,
    progressPercentage,
    nextRefillDate,
    upcomingRefills,
    nextCheckinDate,
    checkinStatus,
    priorityTask
  };
};

/**
 * Creates a fallback service when no services are available
 * @returns {Object} A fallback service with placeholder data
 */
export const createFallbackService = () => ({
  id: 'fallback-service-1',
  name: 'Placeholder Program',
  service_type: 'placeholder',
  medications: [],
  actionItems: [],
  resources: [],
  recommendations: [],
  progressTitle: 'Progress N/A',
  progressSubtitle: 'No data available',
  progressStatus: 'Inactive',
  progressToGoalText: 'N/A',
  progressPercentage: 0,
  nextRefillDate: 'N/A',
  upcomingRefills: [],
  nextCheckinDate: 'N/A',
  checkinStatus: 'normal',
  priorityTask: null
});

/**
 * Calculate progress percentage based on completed action items
 * @param {Array} actionItems - List of action items
 * @returns {number} Progress percentage (0-100)
 */
const calculateProgressPercentage = (actionItems) => {
  if (!actionItems || actionItems.length === 0) return 0;
  
  const completedItems = actionItems.filter(item => item.status === 'completed');
  return Math.round((completedItems.length / actionItems.length) * 100);
};

/**
 * Calculate the next refill date from medications
 * @param {Array} medications - List of medications
 * @returns {string} Next refill date or 'N/A'
 */
const calculateNextRefillDate = (medications) => {
  if (!medications || medications.length === 0) return 'N/A';
  
  // Find medications with refill dates
  const medsWithRefills = medications.filter(med => med.nextRefillDate);
  if (medsWithRefills.length === 0) return 'N/A';
  
  // Sort by refill date (assuming date strings are comparable)
  medsWithRefills.sort((a, b) => {
    if (!a.nextRefillDate) return 1;
    if (!b.nextRefillDate) return -1;
    return a.nextRefillDate.localeCompare(b.nextRefillDate);
  });
  
  return medsWithRefills[0].nextRefillDate;
};

/**
 * Get list of upcoming medication refills
 * @param {Array} medications - List of medications
 * @returns {Array} List of medications with upcoming refills
 */
const getUpcomingRefills = (medications) => {
  if (!medications || medications.length === 0) return [];
  return medications.filter(med => med.nextRefillDate);
};

/**
 * Calculate the next check-in date from action items
 * @param {Array} actionItems - List of action items
 * @returns {string} Next check-in date or 'N/A'
 */
const calculateNextCheckinDate = (actionItems) => {
  if (!actionItems || actionItems.length === 0) return 'N/A';
  
  // Find action items with due dates
  const itemsWithDueDates = actionItems.filter(item => item.dueDate && item.status !== 'completed');
  if (itemsWithDueDates.length === 0) return 'N/A';
  
  // Sort by due date
  itemsWithDueDates.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  
  return itemsWithDueDates[0].dueDate;
};

/**
 * Calculate check-in status based on the next check-in date
 * @param {string} nextCheckinDate - Next check-in date
 * @returns {string} Status: 'overdue', 'due-today', 'due-tomorrow', 'due-in-two-days', or 'normal'
 */
const calculateCheckinStatus = (nextCheckinDate) => {
  if (nextCheckinDate === 'N/A') return 'normal';
  
  // This is a placeholder implementation
  // In a real implementation, we would parse the date and compare with current date
  return 'normal';
};

/**
 * Determine the priority task for a service
 * @param {Object} service - The service
 * @param {Array} actionItems - List of action items
 * @param {Array} medications - List of medications
 * @returns {Object|null} Priority task object or null
 */
const determinePriorityTask = (service, actionItems, medications) => {
  // This is a placeholder implementation
  // In a real implementation, we would analyze action items and medications
  // to determine the highest priority task
  
  if (!service) return null;
  
  return {
    text: `Your ${service.name} task is due`,
    taskId: null
  };
};