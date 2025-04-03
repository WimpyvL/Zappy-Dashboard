// services/patientService.js
import { request } from '../utils/apiClient';

export const getPatients = async (currentPage, params) => {
  const data = await request({
    url: '/api/v1/admin/patients',
    method: 'GET',
    params: {
      page: currentPage,
      ...params
    }
  });
  return data;
};

export const getPatientById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/patients/${id}`,
    method: 'GET'
  });
  return data;
};

export const createPatient = async (patientData) => {
  const data = await request({
    url: '/api/v1/admin/patients',
    method: 'POST',
    data: patientData
  });
  return data;
};

export const updatePatient = async (id, patientData) => {
  const data = await request({
    url: `/api/v1/admin/patients/${id}`,
    method: 'PUT',
    data: patientData
  });
  return data;
};

export const deletePatient = async (id) => {
  const data = await request({
    url: `/api/v1/admin/patients/${id}`,
    method: 'DELETE'
  });
  return data;
};