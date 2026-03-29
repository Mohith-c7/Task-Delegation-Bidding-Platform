import React from 'react';
import './Navbar.css';

const imgVector15 = "https://www.figma.com/api/mcp/asset/24fe9853-f2c9-460b-8b19-204632479873";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="logo">
            <div className="logo-icon">
              <img src={imgVector15} alt="" />
            </div>
            <span className="logo-text">Q-Vedha</span>
          </div>
          <div className="nav-links">
            <a href="#technology" className="nav-link">Technology</a>
            <a href="#use-cases" className="nav-link">Use Cases</a>
            <a href="#documentation" className="nav-link">Documentation</a>
          </div>
        </div>
        <div className="navbar-right">
          <button className="btn-primary">Contact Us</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
