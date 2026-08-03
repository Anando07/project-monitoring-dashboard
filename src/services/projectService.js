import axios from "axios";

// Base API Endpoint
const API_BASE_URL = "http://localhost:8080/api";

// Endpoint URLs
const REST_PROJECT_API_BASE_URL = `${API_BASE_URL}/projects`;
const REST_MINISTRY_API_BASE_URL = `${API_BASE_URL}/ministries`;
const REST_DIRECTORATE_API_BASE_URL = `${API_BASE_URL}/directorates`;

// ==========================================
// Projects API Calls
// ==========================================
export const getAllProjects = () => axios.get(REST_PROJECT_API_BASE_URL);

export const getProjectById = (id) => axios.get(`${REST_PROJECT_API_BASE_URL}/${id}`);

export const createProject = async (project) => {
    try {
        const response = await axios.post(REST_PROJECT_API_BASE_URL, project);
        return response;
    } catch (error) {
        console.log("Status:", error.response?.status);
        console.log("Response:", error.response?.data);
        console.log("Request:", project);
        throw error;
    }
};

export const updateProject = (id, project) => axios.put(`${REST_PROJECT_API_BASE_URL}/${id}`, project);

export const deleteProject = (id) => axios.delete(`${REST_PROJECT_API_BASE_URL}/${id}`);

// ==========================================
// Ministries & Directorates API Calls
// ==========================================
export const getAllMinistries = () => axios.get(REST_MINISTRY_API_BASE_URL);

export const getAllDirectorates = () => axios.get(REST_DIRECTORATE_API_BASE_URL);

// Cascading endpoint to fetch directorates by ministry ID
export const getDirectoratesByMinistry = (ministryId) =>
  axios.get(`${REST_DIRECTORATE_API_BASE_URL}/ministry/${ministryId}`);