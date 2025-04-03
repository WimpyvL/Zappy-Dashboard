// Assuming apiClient is in src/utils/apiClient.js
import { request } from '../../utils/apiClient';

const BASE_URL = '/api/v1/admin/consultations'; // Adjust if your endpoint differs

export const getConsultations = async (params) => {
  const data = await request({
    url: BASE_URL,
    method: 'GET',
    params: params,
  });
  return data;
};

export const getConsultationById = async (id) => {
  const data = await request({
    url: `${BASE_URL}/${id}`,
    method: 'GET',
  });
  return data;
};

// Assuming a specific endpoint for updating status
export const updateConsultationStatus = async (id, status) => {
  const data = await request({
    url: `${BASE_URL}/${id}/status`, // Adjust endpoint as needed
    method: 'PATCH', // Or PUT
    data: { status },
  });
  return data;
};

// Add other potential API functions if needed (create, update full, delete)
// export const createConsultation = async (consultationData) => { ... };
// export const updateConsultation = async (id, consultationData) => { ... };
// export const deleteConsultation = async (id) => { ... };
