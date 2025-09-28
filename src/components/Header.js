import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="logo">Clinic Appointment & EHR</div>
      <nav>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/appointments">Appointments</Link></li>
          <li><Link to="/ehr">EHR</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
