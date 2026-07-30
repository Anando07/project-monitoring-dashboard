import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
    return (
        <div className="dashboard-container">

            <h1>Dashboard</h1>

            <p>Welcome to Project Monitoring Dashboard</p>

            <div className="demo-grid">

                <div className="demo-card">
                    <h3>Total Projects</h3>
                    <span>120</span>
                </div>

                <div className="demo-card">
                    <h3>Running Projects</h3>
                    <span>45</span>
                </div>

                <div className="demo-card">
                    <h3>Completed Projects</h3>
                    <span>65</span>
                </div>

                <div className="demo-card">
                    <h3>Budget</h3>
                    <span>৳ 25 Crore</span>
                </div>

                <div className="demo-card large">
                    <h3>Project Progress Chart</h3>

                    <div className="chart-placeholder">
                        Chart Area
                    </div>
                </div>

                <div className="demo-card large">
                    <h3>Financial Overview</h3>

                    <div className="chart-placeholder">
                        Financial Chart
                    </div>
                </div>

                <div className="demo-card full">
                    <h3>Recent Activities</h3>

                    <table>

                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Status</th>
                                <th>Progress</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr>
                                <td>Road Development</td>
                                <td>Running</td>
                                <td>70%</td>
                            </tr>

                            <tr>
                                <td>Bridge Construction</td>
                                <td>Completed</td>
                                <td>100%</td>
                            </tr>

                        </tbody>

                    </table>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;