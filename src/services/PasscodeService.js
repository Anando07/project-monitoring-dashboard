import axios from "axios";

const REST_PASSCODE_API_BASE_URL = "http://localhost:8080/api/passcodes";

// Fetch all passcodes / password records
export const getAllPasscodes = () => axios.get(REST_PASSCODE_API_BASE_URL);

// Create passcode for a user
export const createPasscodeApi = (passcodeData) =>
  axios.post(REST_PASSCODE_API_BASE_URL, passcodeData);

// Update an existing passcode record by ID
export const updatePasscodeApi = (id, passcodeData) =>
  axios.put(`${REST_PASSCODE_API_BASE_URL}/${id}`, passcodeData);

// Delete passcode record
export const deletePasscodeApi = (id) =>
  axios.delete(`${REST_PASSCODE_API_BASE_URL}/${id}`);