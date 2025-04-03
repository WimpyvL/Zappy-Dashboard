// services/insuranceService.js
import { request } from '../../utils2/api';

export const getInsuranceRecords = async (params) => {
  const data = await request({
    url: '/api/v1/admin/insurance_records',
    method: 'GET',
    params
  });
  return data;
};

export const getInsuranceRecordById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/insurance_records/${id}`,
    method: 'GET'
  });
  return data;
};

export const createInsuranceRecord = async (recordData) => {
  const data = await request({
    url: '/api/v1/admin/insurance_records',
    method: 'POST',
    data: recordData
  });
  return data;
};

export const updateInsuranceRecord = async (id, recordData) => {
  const data = await request({
    url: `/api/v1/admin/insurance_records/${id}`,
    method: 'PUT',
    data: recordData
  });
  return data;
};

export const uploadInsuranceDocument = async (id, formData) => {
  const data = await request({
    url: `/api/v1/admin/insurance_records/${id}/upload_document`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const deleteInsuranceDocument = async (id, documentId) => {
  const data = await request({
    url: `/api/v1/admin/insurance_records/${id}/documents/${documentId}`,
    method: 'DELETE'
  });
  return data;
};