import axios from "axios";

const REST_PROJECT_API_BASE_URL = "http://localhost:8080/api/projects";

// Fetch all projects
export const getAllProjects = () => axios.get(REST_PROJECT_API_BASE_URL);

// Fetch projects belonging to a specific ministry
export const getProjectsByMinistryApi = (ministryId) =>
  axios.get(`${REST_PROJECT_API_BASE_URL}/ministry/${ministryId}`);

// Create a new project under a ministry
export const createProjectApi = (projectData) =>
  axios.post(REST_PROJECT_API_BASE_URL, projectData);

// Update an existing project record by ID
export const updateProjectApi = (id, projectData) =>
  axios.put(`${REST_PROJECT_API_BASE_URL}/${id}`, projectData);

// Delete a project record
export const deleteProjectApi = (id) =>
  axios.delete(`${REST_PROJECT_API_BASE_URL}/${id}`);
