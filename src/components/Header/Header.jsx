import "./Header.css";

import {
  FaBars,
  FaSearch,
  FaBell,
  FaMoon,
  FaCog,
  FaExpandArrowsAlt
} from "react-icons/fa";

function Header({
  sidebarOpen,
  setSidebarOpen
}) {

  return (

    <header className={`header ${sidebarOpen ? "" : "full"}`}>

      {/* Left */}

      <div className="header-left">

        {/* Mobile Menu */}

        <button
          className="mobile-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>

        <div className="title">

          <h2>Project Monitoring Dashboard</h2>

          <p>Monitor all ministry projects</p>

        </div>

      </div>

      {/* Right */}

      <div className="header-right">

        <div className="search-box">

          <FaSearch className="search-icon"/>

          <input
            type="text"
            placeholder="Search project..."
          />

        </div>

        <button className="icon-btn">

          <FaExpandArrowsAlt/>

        </button>

        <button className="icon-btn">

          <FaMoon/>

        </button>

        <button className="icon-btn">

          <FaCog/>

        </button>

        <button className="icon-btn notification">

          <FaBell/>

          <span className="badge">5</span>

        </button>

        <div className="profile">

          <img
            src="https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-ird/2024/12/680c37683c46414db51c88065c904269.jpg"
            alt="Anando Image"
          />

          <div>

            <h4>Anando Biswas</h4>

            <small>Administrator</small>

          </div>

        </div>

      </div>

    </header>

  );

}
export default Header;