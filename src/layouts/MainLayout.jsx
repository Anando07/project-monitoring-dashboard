import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import "./MainLayout.css";

const MainLayout = () => {
    return (
        <div className="main-layout">

            <Sidebar />

            <div className="main-content">

                <Header />

                <main className="page-container">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default MainLayout;