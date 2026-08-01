import axios from "axios";

const REST_USER_API_BASE_URL = "http://localhost:8080/api/users";
const REST_ROLE_API_BASE_URL = "http://localhost:8080/api/roles";
const REST_PASSCODE_API_BASE_URL = "http://localhost:8080/api/passcodes";
const REST_MINISTRY_API_BASE_URL = "http://localhost:8080/api/ministries";

// User API Calls
export const getAllUsers = () => axios.get(REST_USER_API_BASE_URL);
export const createUserApi = (user) => axios.post(REST_USER_API_BASE_URL, user);
export const updateUserApi = (id, user) => axios.put(`${REST_USER_API_BASE_URL}/${id}`, user);
export const deleteUserApi = (id) => axios.delete(`${REST_USER_API_BASE_URL}/${id}`);

// Role API Calls
export const getAllRoles = () => axios.get(REST_ROLE_API_BASE_URL);

// Passcode API Calls
export const getAllPasscodes = () => axios.get(REST_PASSCODE_API_BASE_URL);

// Ministry API Calls
export const getAllMinistries = () => axios.get(REST_MINISTRY_API_BASE_URL);