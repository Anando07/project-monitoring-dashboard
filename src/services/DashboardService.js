import axios from "axios";

// Configurable API base URL (defaults to spring boot backend default port 8080)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Helper to construct authorization headers from JWT stored in LocalStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    : {
        headers: {
          "Content-Type": "application/json",
        },
      };
};

export const DashboardService = {
  /**
   * Fetches full dashboard summary metrics, charts, and project records.
   * Fallback data is returned if the API endpoint is unavailable.
   */
  getDashboardData: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.warn(
        "Backend API unreachable. Falling back to default dashboard dataset.",
        error.message
      );
      return null; // Triggers default initial states defined inside Dashboard.jsx
    }
  },

  /**
   * Fetches filtered list of projects with backend query searching.
   * @param {string} query Search keyword for project title or PD
   */
  getProjects: async (query = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        ...getAuthHeaders(),
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching projects from backend service:", error);
      return null;
    }
  },

  /**
   * Retrieves specific project details by ID for the modal viewer.
   * @param {number|string} id Project identifier
   */
  getProjectById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching project details for ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Exports project list report (CSV/Excel).
   */
  exportReport: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/export`, {
        ...getAuthHeaders(),
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to generate project report export:", error);
      throw error;
    }
  },
};

export default DashboardService;