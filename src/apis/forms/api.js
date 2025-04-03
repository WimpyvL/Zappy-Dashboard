import { request } from '../../utils2/api';

// Get all forms
export const getForms = async (params) => {
  const data = await request({
    url: '/api/v1/admin/forms',
    method: 'GET',
    params,
  });
  return data;
};

// Get a specific form by ID
export const getFormById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/forms/${id}`,
    method: 'GET',
  });
  return data;
};

// Create a new form
export const createForm = async (formData) => {
  const data = await request({
    url: '/api/v1/admin/forms',
    method: 'POST',
    data: { form: formData },
  });
  return data;
};

// Update an existing form
export const updateForm = async (id, formData) => {
  const data = await request({
    url: `/api/v1/admin/forms/${id}`,
    method: 'PUT',
    data: { form: formData },
  });
  return data;
};

// Delete a form
export const deleteForm = async (id) => {
  const data = await request({
    url: `/api/v1/admin/forms/${id}`,
    method: 'DELETE',
  });
  return data;
};
