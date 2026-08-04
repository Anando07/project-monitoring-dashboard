import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth"


import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import "./MainLayout.css";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout-root">
      {/* Sidebar renders ONLY when authenticated */}
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* Main Container dynamically offsets when sidebar is open/collapsed */}
      <div
        className={`page-wrapper ${
          !isAuthenticated
            ? "public-mode"
            : sidebarOpen
            ? "sidebar-open"
            : "sidebar-collapsed"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="portal-footer">
          &copy; {new Date().getFullYear()} National Project Management Portal. All rights reserved.
        </footer>
      </div>
    </div>
  );
}