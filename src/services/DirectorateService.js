import axios from "axios";

const REST_DIRECTORATE_API_BASE_URL = "http://localhost:8080/api/directorates";

// Fetch all directorates
export const getAllDirectorates = () => axios.get(REST_DIRECTORATE_API_BASE_URL);

// Fetch directorates belonging to a specific ministry
export const getDirectoratesByMinistryApi = (ministryId) =>
  axios.get(`${REST_DIRECTORATE_API_BASE_URL}/ministry/${ministryId}`);

// Create a new directorate under a ministry
export const createDirectorateApi = (directorateData) =>
  axios.post(REST_DIRECTORATE_API_BASE_URL, directorateData);

// Update an existing directorate record by ID
export const updateDirectorateApi = (id, directorateData) =>
  axios.put(`${REST_DIRECTORATE_API_BASE_URL}/${id}`, directorateData);

// Delete a directorate record
export const deleteDirectorateApi = (id) =>
  axios.delete(`${REST_DIRECTORATE_API_BASE_URL}/${id}`);
