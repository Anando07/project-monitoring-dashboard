import axios from "axios";

const REST_MINISTRY_API_BASE_URL = "http://localhost:8080/api/ministries";

// Fetch all ministries
export const getAllMinistries = () => axios.get(REST_MINISTRY_API_BASE_URL);

// Create a new ministry
export const createMinistryApi = (ministryData) =>
  axios.post(REST_MINISTRY_API_BASE_URL, ministryData);

// Update an existing ministry record by ID
export const updateMinistryApi = (id, ministryData) =>
  axios.put(`${REST_MINISTRY_API_BASE_URL}/${id}`, ministryData);

// Delete a ministry record
export const deleteMinistryApi = (id) =>
  axios.delete(`${REST_MINISTRY_API_BASE_URL}/${id}`);
