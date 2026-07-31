import React from "react";
import { Routes, Route } from "react-router-dom";


import MainLayout from "../layouts/MainLayout";


import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects/Projects";
import Director from "../pages/Projects/Director";
import Finance from "../pages/Projects/Finance";
import FinancialProgress from "../pages/Projects/FinancialProgress";
import PhysicalProgress from "../pages/Projects/PhysicalProgress";
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
                    path="/projects/create"
                    element={<Projects />}
                />

                <Route 
                    path="/projects/finance"
                    element={<Finance />}
                />

                <Route 
                    path="/projects/director"
                    element={<Director />}
                />

                <Route 
                    path="/projects/financial/progress"
                    element={<FinancialProgress />}
                />

                <Route 
                    path="/projects/physical/progress"
                    element={<PhysicalProgress />}
                />

                <Route 
                    path="/projects/achievement"
                    element={<Projects />}
                />

                <Route 
                    path="/projects/location"
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