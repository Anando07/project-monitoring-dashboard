import api from "./api";

// GET All Finance Records
export const getAllFinanceRecords = () =>
    api.get("/finances");

// GET Finance Record by ID
export const getFinanceRecordById = (id) =>
    api.get(`/finances/${id}`);

// GET Finance Records by Project ID
export const getFinanceRecordsByProject = (projectId) =>
    api.get(`/finances/project/${projectId}`);

// CREATE Finance Record
export const createFinanceRecord = (payload) =>
    api.post("/finances", payload);

// UPDATE Finance Record
export const updateFinanceRecord = (id, payload) =>
    api.put(`/finances/${id}`, payload);

// DELETE Finance Record
export const deleteFinanceRecord = (id) =>
    api.delete(`/finances/${id}`);