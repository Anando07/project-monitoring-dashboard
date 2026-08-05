import api from "./api"; // adjust import path to your base Axios config


export const getAllReceivedFunds = () => api.get('/received-funds');
export const getReceivedFundById = (id) => api.get(`/received-funds/${id}`);
export const getReceivedFundsByProjectId = (projectId) => api.get(`/received-funds/project/${projectId}`);
export const createReceivedFund = (payload) => api.post('/received-funds', payload);
export const updateReceivedFund = (id, payload) => api.put(`/received-funds/${id}`, payload);
export const deleteReceivedFund = (id) => api.delete(`/received-funds/${id}`);