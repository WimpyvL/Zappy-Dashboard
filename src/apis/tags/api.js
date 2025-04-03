// api.js - Tags API methods
import { request } from '../../utils2/api';

// Get all tags
export const getTags = async (params) => {
  const data = await request({
    url: '/api/v1/admin/tags',
    method: 'GET',
    params
  });
  return data;
};

// Get a specific tag by ID
export const getTagById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tags/${id}`,
    method: 'GET'
  });
  return data;
};

// Create a new tag
export const createTag = async (tagData) => {
  const data = await request({
    url: '/api/v1/admin/tags',
    method: 'POST',
    data: { tag: tagData }
  });
  return data;
};

// Update an existing tag
export const updateTag = async (id, tagData) => {
  const data = await request({
    url: `/api/v1/admin/tags/${id}`,
    method: 'PUT',
    data: { tag: tagData }
  });
  return data;
};

// Delete a tag
export const deleteTag = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tags/${id}`,
    method: 'DELETE'
  });
  return data;
};

// Get tag usage information
export const getTagUsage = async (id) => {
  const data = await request({
    url: `/api/v1/admin/tags/${id}/usage`,
    method: 'GET'
  });
  return data;
};
