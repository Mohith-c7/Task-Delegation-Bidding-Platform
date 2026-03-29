import React from 'react';
import './Navbar.css';

const imgDataWise = "https://www.figma.com/api/mcp/asset/ce413855-35e6-4ece-b641-59b34794855b";
const imgVector6 = "https://www.figma.com/api/mcp/asset/69aed2de-ad71-49fb-968e-d6781ebab3b6";
const imgVector7 = "https://www.figma.com/api/mcp/asset/126523b8-4c71-4845-9e3d-42b082d62b18";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-main">
          <div className="navbar-left">
            <div className="logo">
              <img src={imgDataWise} alt="DataWise" className="logo-text" />
              <div className="logo-symbol">
                <img src={imgVector6} alt="" />
              </div>
            </div>
            <div className="nav-links">
              <button className="nav-link-dropdown">
                <span>Features</span>
                <img src={imgVector7} alt="" className="chevron" />
              </button>
              <button className="nav-link-dropdown">
                <span>Case Studies</span>
                <img src={imgVector7} alt="" className="chevron" />
              </button>
              <div className="nav-link">English</div>
              <div className="nav-link">Support</div>
            </div>
          </div>
          <div className="navbar-right">
            <button className="btn-demo">Get a demo</button>
            <button className="btn-trial">Start your free trial</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
