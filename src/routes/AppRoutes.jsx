import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";


import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects/Projects";
import Director from "../pages/Projects/Director";
import Finance from "../pages/Projects/Finance";
import FinancialProgress from "../pages/Projects/FinancialProgress";
import PhysicalProgress from "../pages/Projects/PhysicalProgress";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Users from "../pages/AdminPannel/Users";
import Passcode from "../pages/AdminPannel/Passcode";
import Ministry from "../pages/AdminPannel/Ministry";
import Directorate from "../pages/AdminPannel/Directorate";
import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Layout Shell for both Public and Protected Pages */}
      <Route path="/" element={<MainLayout />}>
        {/* PUBLIC HOME PAGE: Unauthenticated visitors can view Dashboard */}
        <Route index element={<Dashboard />} />

        {/* PROTECTED ROUTES: Requires logged-in session */}
        <Route element={<ProtectedRoute />}>
          {/* Project Management */}
          <Route path="projects/create" element={<Projects />} />
          <Route path="projects/finance" element={<Finance />} />
          <Route path="projects/director" element={<Director />} />
          <Route path="projects/financial/progress" element={<FinancialProgress />} />
          <Route path="projects/physical/progress" element={<PhysicalProgress />} />
          <Route path="projects/achievement" element={<Projects />} />
          <Route path="projects/location" element={<Projects />} />

          {/* System Reports & Settings */}
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

          {/* Admin Panel */}
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/password" element={<Passcode />} />
          <Route path="admin/ministry" element={<Ministry />} />
          <Route path="admin/directorate" element={<Directorate />} />
        </Route>
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;