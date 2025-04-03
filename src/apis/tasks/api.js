// services/taskService.js
import { request } from '../../utils2/api';  // Adjust the path to match your project structure

export const getTasks = async (
  currentPage,
  params,
  download,
  sortingDetails
) => {
  const data = await request({
    url: '/api/v1/admin/tasks',
    method: 'GET',
    params: {
      page: currentPage,
      download: download,
      ...params,
      ...sortingDetails
    }
  });
  return data;
};

export const getTaskById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tasks/${id}`,
    method: 'GET'
  });
  return data;
};

export const createTask = async (taskData) => {
  const data = await request({
    url: '/api/v1/admin/tasks',
    method: 'POST',
    data: { task: taskData }
  });
  return data;
};

export const updateTask = async (id, taskData) => {
  const data = await request({
    url: `/api/v1/admin/tasks/${id}`,
    method: 'PUT',
    data: { task: taskData }
  });
  return data;
};

export const deleteTask = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tasks/${id}`,
    method: 'DELETE'
  });
  return data;
};

export const markTaskCompleted = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tasks/${id}/mark_completed`,
    method: 'PUT'
  });
  return data;
};

export const handleSessionCreation = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tasks/virtual-session/${id}`,
    method: 'PUT',
    data: { task_ids: [id] }
  });
  return data;
};

export const handleUpdateStatus = async (ids) => {
  const response = await request({
    url: '/api/v1/admin/tasks/status-update',
    method: 'PUT',
    data: { ids: ids }
  });
  return response;
};

export const handleBulkSessionCreation = async (selectedTaskIds) => {
  const data = await request({
    url: `/api/v1/admin/tasks/virtual-session/${selectedTaskIds[0]}`,
    method: 'PUT',
    data: { task_ids: selectedTaskIds }
  });
  return data;
};

export const getAssignees = async () => {
  const data = await request({
    url: '/api/v1/admin/users',
    method: 'GET'
  });
  return data;
};

export const getTaskablePatients = async () => {
  const data = await request({
    url: '/api/v1/admin/patients',
    method: 'GET'
  });
  return data;
};