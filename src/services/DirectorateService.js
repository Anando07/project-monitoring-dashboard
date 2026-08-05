import api from "./api";

// ==========================================
// Directorate API Calls
// ==========================================

// Get all directorates
export const getAllDirectorates = () =>
    api.get("/directorates");

// Get directorates by ministry ID
export const getDirectoratesByMinistryApi = (ministryId) =>
    api.get(`/directorates/ministry/${ministryId}`);

// Get directorate by ID (Optional)
export const getDirectorateById = (id) =>
    api.get(`/directorates/${id}`);

// Create directorate
export const createDirectorateApi = (directorateData) =>
    api.post("/directorates", directorateData);

// Update directorate
export const updateDirectorateApi = (id, directorateData) =>
    api.put(`/directorates/${id}`, directorateData);

// Delete directorate
export const deleteDirectorateApi = (id) =>
    api.delete(`/directorates/${id}`);