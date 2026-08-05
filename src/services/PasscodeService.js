import api from "./api";

// Get all passcodes
export const getAllPasscodes = () =>
    api.get("/passcodes");

// Get passcode by ID
export const getPasscodeById = (id) =>
    api.get(`/passcodes/${id}`);

// Create passcode
export const createPasscodeApi = (passcodeData) =>
    api.post("/passcodes", passcodeData);

// Update passcode
export const updatePasscodeApi = (id, passcodeData) =>
    api.put(`/passcodes/${id}`, passcodeData);

// Delete passcode
export const deletePasscodeApi = (id) =>
    api.delete(`/passcodes/${id}`);