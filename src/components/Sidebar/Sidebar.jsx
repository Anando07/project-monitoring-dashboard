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
  FaUserShield
} from "react-icons/fa";

const menus = [
  { name: "Dashboard", icon: <FaHome />, active: true },
  { name: "Projects", icon: <FaFolder /> },
  { name: "Programs", icon: <FaTasks /> },
  { name: "Finance", icon: <FaMoneyBillWave /> },
  { name: "Reports", icon: <FaChartBar /> },
  { name: "Physical Progress", icon: <FaClipboardList /> },
  { name: "Financial Progress", icon: <FaMoneyBillWave /> },
  { name: "Documents", icon: <FaFileAlt /> },
  { name: "Map View", icon: <FaMapMarkedAlt /> },
  { name: "Notifications", icon: <FaBell /> },
  { name: "Users", icon: <FaUsers /> },
  { name: "Database", icon: <FaDatabase /> },
  { name: "Role Management", icon: <FaUserShield /> },
  { name: "Settings", icon: <FaCog /> }
];

function Sidebar({ open, setSidebarOpen }) {
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

        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!open)}
        >
          <FaBars />
        </button>

      </div>

      <div className="menu">

        {menus.map((item, index) => (

          <div
            key={index}
            className={`item ${item.active ? "active" : ""}`}
          >
            {item.icon}

            {open && <span>{item.name}</span>}

          </div>

        ))}

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