import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  FaBars,
  FaHome,
  FaFolder,
  FaTasks,
  FaChartBar,
  FaMoneyBillWave,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaMapMarkedAlt,
  FaFileAlt,
  FaClipboardList,
  FaDatabase,
  FaUserShield,
  FaChevronDown,
  FaPlusCircle,
  FaUserTie,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBan,
  FaListAlt,
  FaUserCircle,
  FaKey,
  FaLandmark,
  FaSitemap,
  FaBuilding,
  FaCity
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Menu tree. Items with a `children` array render as an expandable   */
/*  group instead of a direct link. Add/remove children here only —    */
/*  the render logic below handles both flat and nested items.         */
/* ------------------------------------------------------------------ */
const menus = [
  { name: "Dashboard", icon: <FaHome />, path: "/" },
  {
    name: "Projects",
    icon: <FaFolder />,
    children: [
      { name: "Project", icon: <FaPlusCircle />, path: "/projects/create" },
      { name: "Finance", icon: <FaMoneyBillWave />, path: "/projects/finance" },
      { name: "Project Director", icon: <FaUserTie />, path: "/projects/director" },
      { name: "Financial Progress", icon: <FaMoneyBillWave />, path: "/projects/financial/progress" },
      { name: "Physical Progress", icon: <FaClipboardList />, path: "/projects/physical/progress" },
      { name: "Achievement", icon: <FaTrophy />, path: "/projects/achievement" },
      { name: "Location", icon: <FaMapMarkedAlt />, path: "/projects/location" }
    ]
  },

  {
    name: "Reports",
    icon: <FaChartBar />,
    children: [
      { name: "Passed Project", icon: <FaCheckCircle />, path: "/reports/passed" },
      { name: "Running Project", icon: <FaClock />, path: "/reports/running" },
      { name: "Completed", icon: <FaCheckCircle />, path: "/reports/completed" },
      { name: "Delayed", icon: <FaExclamationTriangle />, path: "/reports/delayed" },
      { name: "Cancelled", icon: <FaBan />, path: "/reports/cancelled" },
      { name: "All Projects Report", icon: <FaListAlt />, path: "/reports/all" }
    ]
  },
  { name: "Documents", icon: <FaFileAlt />, path: "/documents" },
  { name: "Map View", icon: <FaMapMarkedAlt />, path: "/map" },
  { name: "Notifications", icon: <FaBell />, path: "/notifications" },
  { name: "Database", icon: <FaDatabase />, path: "/database" },
  {
    name: "Office Management",
    icon: <FaSitemap />,
    children: [
      { name: "Ministry/Division", icon: <FaLandmark />, path: "/admin/ministry" },
      { name: "Directorate", icon: <FaBuilding />, path: "/admin/directorate" },
      { name: "Divisional Office", icon: <FaCity />, path: "/admin/divisional-office" }
    ]
  },
  {
    name: "Admin Panel",
    icon: <FaUserShield />,
    children: [
      { name: "Users", icon: <FaUsers />, path: "/admin/users" },
      { name: "Password", icon: <FaKey />, path: "/admin/password" },
      { name: "Role", icon: <FaUserShield />, path: "/admin/roles" }
    ]
  },
  {
    name: "Settings",
    icon: <FaCog />,
    children: [
      { name: "Profile", icon: <FaUserCircle />, path: "/settings/profile" },
      { name: "Password Reset", icon: <FaKey />, path: "/settings/password-reset" }
    ]
  }
];

function Sidebar({ open, setSidebarOpen }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  // Auto-expand whichever group contains the current route, so a page
  // refresh or direct link lands with the right submenu already open.
  useEffect(() => {
    const active = menus.find(
      (m) => m.children && m.children.some((c) => location.pathname.startsWith(c.path))
    );
    if (active) {
      setOpenGroups((prev) => ({ ...prev, [active.name]: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (name) => {
    // If the sidebar is collapsed, expand it first so the submenu is
    // actually visible, then open the group.
    if (!open) {
      setSidebarOpen(true);
      setOpenGroups((prev) => ({ ...prev, [name]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isGroupActive = (item) =>
    item.children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <aside className={`sidebar ${open ? "" : "mini"}`}>
      <div className="logo">
        <div className="logo-left">
          <div className="logoBox">PM</div>
          {open && (
            <div className="logoText">
              <h2>PMD</h2>
              <p>Project Monitoring</p>
            </div>
          )}
        </div>

        <button className="toggle-btn" onClick={() => setSidebarOpen(!open)}>
          <FaBars />
        </button>
      </div>

      <div className="menu">
        {menus.map((item, index) => {
          if (!item.children) {
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => (isActive ? "item active" : "item")}
              >
                {item.icon}
                {open && <span>{item.name}</span>}
              </NavLink>
            );
          }

          const expanded = open && !!openGroups[item.name];
          const groupActive = isGroupActive(item);

          return (
            <div key={index} className="menu-group">
              <button
                type="button"
                className={`item has-submenu ${groupActive ? "active" : ""}`}
                onClick={() => toggleGroup(item.name)}
                aria-expanded={expanded}
              >
                {item.icon}
                {open && <span>{item.name}</span>}
                {open && (
                  <FaChevronDown
                    className={`chevron ${expanded ? "rotated" : ""}`}
                  />
                )}
              </button>

              {expanded && (
                <div className="submenu">
                  {item.children.map((child, cIndex) => (
                    <NavLink
                      key={cIndex}
                      to={child.path}
                      className={({ isActive }) =>
                        isActive ? "submenu-item active" : "submenu-item"
                      }
                    >
                      {child.icon}
                      <span>{child.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bottom">
        <button className="logout-btn">
          <FaSignOutAlt />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
