import api from "./api";

// Get all ministries
export const getAllMinistries = () =>
    api.get("/ministries");

// Get ministry by ID
export const getMinistryById = (id) =>
    api.get(`/ministries/${id}`);

// Create ministry
export const createMinistryApi = (ministryData) =>
    api.post("/ministries", ministryData);

// Update ministry
export const updateMinistryApi = (id, ministryData) =>
    api.put(`/ministries/${id}`, ministryData);

// Delete ministry
export const deleteMinistryApi = (id) =>
    api.delete(`/ministries/${id}`);