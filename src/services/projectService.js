import api from "./api";

// ==========================================
// Projects API Calls
// ==========================================

// Get all projects
export const getAllProjects = () =>
    api.get("/projects");

// Get project by ID
export const getProjectById = (id) =>
    api.get(`/projects/${id}`);

// Create project
export const createProject = async (project) => {
    try {
        const response = await api.post("/projects", project);
        return response;
    } catch (error) {
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Request:", project);
        throw error;
    }
};

// Update project
export const updateProject = (id, project) =>
    api.put(`/projects/${id}`, project);

// Delete project
export const deleteProject = (id) =>
    api.delete(`/projects/${id}`);


// ==========================================
// Ministries API Calls
// ==========================================

// Get all ministries
export const getAllMinistries = () =>
    api.get("/ministries");


// ==========================================
// Directorates API Calls
// ==========================================

// Get all directorates
export const getAllDirectorates = () =>
    api.get("/directorates");

// Get directorates by ministry ID
export const getDirectoratesByMinistry = (ministryId) =>
    api.get(`/directorates/ministry/${ministryId}`);