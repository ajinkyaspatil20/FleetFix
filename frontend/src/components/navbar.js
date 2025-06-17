import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/"><u>Fleet Fix ⛟</u></Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/nearby-garages">Garages</Link></li>
        <li><Link to="/vehicle-maintenance">Prediction</Link></li>
        <li><Link to="/vehicle-management">Maintain</Link></li>

        {/* Always show profile icon */}
        <li className="profile-dropdown">
          <div className="profile-icon" onClick={() => setDropdownOpen(!dropdownOpen)}>
            👤
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p>{user ? user.name : "Guest"}</p>
              {user ? (
                <button onClick={logout}>Logout</button>
              ) : (
                <Link to="/dashboard" className="login-btn">Dashboard</Link>
              )}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
