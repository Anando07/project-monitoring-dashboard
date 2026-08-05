import api from "./api";

// ==========================================
// User API Calls
// ==========================================

// Get all users
export const getAllUsers = () =>
    api.get("/users");

// Get user by ID
export const getUserById = (id) =>
    api.get(`/users/${id}`);

// Create user
export const createUser = (user) =>
    api.post("/users", user);

// Update user
export const updateUser = (id, user) =>
    api.put(`/users/${id}`, user);

// Delete user
export const deleteUser = (id) =>
    api.delete(`/users/${id}`);


// ==========================================
// Role API Calls
// ==========================================

// Get all roles
export const getAllRoles = () =>
    api.get("/roles");


// ==========================================
// Passcode API Calls
// ==========================================

// Get all passcodes
export const getAllPasscodes = () =>
    api.get("/passcodes");


// ==========================================
// Ministry API Calls
// ==========================================

// Get all ministries
export const getAllMinistries = () =>
    api.get("/ministries");