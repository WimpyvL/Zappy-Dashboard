// services/pharmacyService.js
import { request } from '../../utils2/api';

export const getPharmacies = async (params) => {
  const data = await request({
    url: '/api/v1/admin/pharmacies',
    method: 'GET',
    params
  });
  return data;
};

export const getPharmacyById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/pharmacies/${id}`,
    method: 'GET'
  });
  return data;
};

export const createPharmacy = async (pharmacyData) => {
  const data = await request({
    url: '/api/v1/admin/pharmacies',
    method: 'POST',
    data: { pharmacy: pharmacyData }
  });
  return data;
};

export const updatePharmacy = async (id, pharmacyData) => {
  const data = await request({
    url: `/api/v1/admin/pharmacies/${id}`,
    method: 'PUT',
    data: { pharmacy: pharmacyData }
  });
  return data;
};

export const deletePharmacy = async (id) => {
  const data = await request({
    url: `/api/v1/admin/pharmacies/${id}`,
    method: 'DELETE'
  });
  return data;
};

export const togglePharmacyActive = async (id, active) => {
  const data = await request({
    url: `/api/v1/admin/pharmacies/${id}/toggle_active`,
    method: 'PUT',
    data: { active }
  });
  return data;
};