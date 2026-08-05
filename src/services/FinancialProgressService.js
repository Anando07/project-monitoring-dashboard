import api from "./api";

export const getAllFinancialProgress = () => api.get('/financial-progress');

export const getFinancialProgressById = (id) => api.get(`/financial-progress/${id}`);

export const getFinancialProgressByProjectId = (projectId) => api.get(`/financial-progress/project/${projectId}`);

export const createFinancialProgress = (data) => api.post('/financial-progress', data);

export const updateFinancialProgress = (id, data) => api.put(`/financial-progress/${id}`, data);

export const deleteFinancialProgress = (id) => api.delete(`/financial-progress/${id}`);