import api from "./api";

// ==========================================
// Director API Calls
// ==========================================

// Get all directors
export const getAllDirectors = () =>
    api.get("/directors");

// Get director by ID
export const getDirectorById = (id) =>
    api.get(`/directors/${id}`);

// Create director
export const createDirector = (director) =>
    api.post("/directors", director);

// Update director
export const updateDirector = (id, director) =>
    api.put(`/directors/${id}`, director);

// Delete director
export const deleteDirector = (id) =>
    api.delete(`/directors/${id}`);

// Get directors by project
export const getDirectorsByProjectId = (projectId) =>
    api.get(`/directors/project/${projectId}`);