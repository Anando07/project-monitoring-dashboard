import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    setLoading(false);
  }, [token]);

  const login = async (usernameOrCredentials, passwordArg) => {
    try {
      let payload;

      if (typeof usernameOrCredentials === "object" && usernameOrCredentials !== null) {
        payload = {
          username: (usernameOrCredentials.username || "").trim(),
          passcode: (usernameOrCredentials.passcode || "").trim(),
        };
      } else {
        payload = {
          username: (usernameOrCredentials || "").trim(),
          passcode: (passwordArg || "").trim(),
        };
      }

      if (!payload.username || !payload.passcode) {
        throw new Error("Identifier (Email/Number) and Passcode are required.");
      }

      const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
      const { token: jwtToken, ...userData } = response.data;

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
      setToken(jwtToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);

      const responseData = error.response?.data;
      let backendMessage = "Authentication failed. Please verify credentials.";

      if (typeof responseData === "object" && responseData !== null) {
        if (responseData.message) {
          backendMessage = responseData.message;
        } else if (responseData.error) {
          backendMessage = responseData.error;
        } else {
          const fieldErrors = Object.values(responseData).join(", ");
          if (fieldErrors) backendMessage = fieldErrors;
        }
      } else if (error.message) {
        backendMessage = error.message;
      }

      throw new Error(backendMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};