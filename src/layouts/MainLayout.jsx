import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import "./MainLayout.css";

function MainLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (

        <div className="layout">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Page */}
            <div
                className={
                    sidebarOpen
                        ? "page-wrapper"
                        : "page-wrapper expanded"
                }
            >

                {/* Header */}
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main Content */}
                <main className="page-container">
                    <Outlet />
                </main>

            </div>

        </div>

    );

}

export default MainLayout;