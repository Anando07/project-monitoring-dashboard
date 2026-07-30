import React from "react";
import { Routes, Route } from "react-router-dom";


import MainLayout from "../layouts/MainLayout";


import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";


const AppRoutes = () => {


    return (

        <Routes>


            <Route 
                path="/" 
                element={<MainLayout />}
            >


                <Route 
                    index 
                    element={<Dashboard />}
                />


                <Route 
                    path="projects"
                    element={<Projects />}
                />


                <Route 
                    path="reports"
                    element={<Reports />}
                />


                <Route 
                    path="settings"
                    element={<Settings />}
                />


            </Route>


        </Routes>

    );


};


export default AppRoutes;