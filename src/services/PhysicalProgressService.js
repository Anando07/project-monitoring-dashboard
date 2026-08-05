import api from "./api";

// Stage 1: Configure Project Baseline Work Parameter Targets
export const saveProjectWorkParameters = (projectId, parameters) =>
  api.post(`/physical-progress/project/${projectId}/parameters`, parameters);

export const getProjectWorkParameters = (projectId) =>
  api.get(`/physical-progress/project/${projectId}/parameters`);

// Stage 2: Log Dated Progress
export const getAllPhysicalProgress = () => api.get("/physical-progress");

export const getPhysicalProgressById = (id) => api.get(`/physical-progress/${id}`);

export const getPhysicalProgressByProjectId = (projectId) =>
  api.get(`/physical-progress/project/${projectId}`);

export const createPhysicalProgress = (data) => api.post("/physical-progress", data);

export const updatePhysicalProgress = (id, data) => api.put(`/physical-progress/${id}`, data);

export const deletePhysicalProgress = (id) => api.delete(`/physical-progress/${id}`);