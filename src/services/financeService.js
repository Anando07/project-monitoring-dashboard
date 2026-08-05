import api from "./api";

// GET All Finance Records
export const getAllFinanceRecords = () =>
    api.get("/finance-records");

// GET Finance Record by ID
export const getFinanceRecordById = (id) =>
    api.get(`/finance-records/${id}`);

// GET Finance Records by Project ID
export const getFinanceRecordsByProject = (projectId) =>
    api.get(`/finance-records/project/${projectId}`);

// CREATE Finance Record
export const createFinanceRecord = (payload) =>
    api.post("/finance-records", payload);

// UPDATE Finance Record
export const updateFinanceRecord = (id, payload) =>
    api.put(`/finance-records/${id}`, payload);

// DELETE Finance Record
export const deleteFinanceRecord = (id) =>
    api.delete(`/finance-records/${id}`);