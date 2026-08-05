import api from "./api";

// Get all development partners
export const getAllDevPartners = () =>
  api.get("/devpartners");

// Get development partner by ID
export const getDevPartnerById = (id) =>
  api.get(`/devpartners/${id}`);

// Create development partner
export const createDevPartnerApi = (devPartnerData) =>
  api.post("/devpartners", devPartnerData);

// Update development partner
export const updateDevPartnerApi = (id, devPartnerData) =>
  api.put(`/devpartners/${id}`, devPartnerData);

// Delete development partner
export const deleteDevPartnerApi = (id) =>
  api.delete(`/devpartners/${id}`);