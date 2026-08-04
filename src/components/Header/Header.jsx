import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth"
import "./Header.css";

// Lucide Icons (Public Portal)
import { LogIn, Info, PhoneCall, Building2 } from "lucide-react";

// React Icons (Admin Dashboard)
import {
  FaBars,
  FaSearch,
  FaBell,
  FaMoon,
  FaCog,
  FaExpandArrowsAlt
} from "react-icons/fa";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  /* =========================================================
     1. AUTHENTICATED ADMIN DASHBOARD HEADER
     ========================================================= */
  if (isAuthenticated) {
    return (
      <header className="dash-header">
        <div className="dash-header-left">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <FaBars />
          </button>

          <div className="dash-title">
            <h2>Project Monitoring Dashboard</h2>
            <p>Internal Resources Division | Ministry of Finance</p>
          </div>
        </div>

        <div className="dash-header-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search project..." />
          </div>

          <button type="button" className="icon-btn" title="Expand Screen">
            <FaExpandArrowsAlt />
          </button>

          <button type="button" className="icon-btn" title="Dark Mode">
            <FaMoon />
          </button>

          <button type="button" className="icon-btn" title="Settings">
            <FaCog />
          </button>

          <button type="button" className="icon-btn notification" title="Notifications">
            <FaBell />
            <span className="badge">5</span>
          </button>

          <div className="profile-card">
            <img
              src={
                user?.profileImages?.[0] ||
                "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-ird/2024/12/680c37683c46414db51c88065c904269.jpg"
              }
              alt={user?.name || "Official User"}
            />
            <div className="profile-info">
              <h4>{user?.name || "Anando Biswas"}</h4>
              <small>{user?.role || "Administrator"}</small>
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* =========================================================
     2. PUBLIC GUEST PORTAL HEADER
     ========================================================= */
  return (
    <header className="public-header-wrapper">
      {/* Top National Banner Strip */}
      <div className="national-banner">
        <span>Government of the People's Republic of Bangladesh</span>
        <span className="bn-title">জাতীয় উন্নয়ন প্রকল্প পর্যবেক্ষণ পোর্টাল</span>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-white px-3 py-2 border-bottom shadow-sm">
        <div className="container-fluid p-0">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg"
              alt="BD Govt Emblem"
              width="40"
              height="40"
            />
            <div>
              <div className="fw-bold text-dark lh-sm fs-6">Project Management Portal</div>
              <div className="text-muted extra-small">Internal Resources Division | Ministry of Finance</div>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#publicNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-3 my-2 my-lg-0">
              <li className="nav-item">
                <Link className="nav-link fw-medium small text-dark" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium small text-secondary d-flex align-items-center gap-1" href="#about">
                  <Info size={15} /> About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium small text-secondary d-flex align-items-center gap-1" href="#ministries">
                  <Building2 size={15} /> Ministries
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium small text-secondary d-flex align-items-center gap-1" href="#contact">
                  <PhoneCall size={15} /> Contact
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 ms-lg-3 pt-2 pt-lg-0 border-top border-lg-0">
              <Link to="/login" className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 shadow-sm">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}