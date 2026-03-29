import React from 'react';
import './Logos.css';

const imgVector7 = "https://www.figma.com/api/mcp/asset/71d7e2d9-69e3-4b0f-99a6-f674c92b1cde";
const imgVector14 = "https://www.figma.com/api/mcp/asset/945b4fe8-38d3-46e1-a0a1-6eb8600ceb38";
const imgPath = "https://www.figma.com/api/mcp/asset/1731f210-a9ef-4c5e-bb58-ab59191d6f3d";

function Logos() {
  return (
    <section className="logos">
      <div className="logos-container">
        <p className="logos-title">Built with the best tools</p>
        <div className="logos-grid">
          <div className="logo-item">
            <div className="logo-icon">
              <img src={imgPath} alt="Figma" />
            </div>
            <span>Figma</span>
          </div>
          <div className="logo-item">
            <div className="logo-icon react-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(120 12 12)"/>
              </svg>
            </div>
            <span>React.js</span>
            <span className="version">18.3.1</span>
          </div>
          <div className="logo-item">
            <div className="logo-icon">
              <img src={imgVector14} alt="TypeScript" />
            </div>
            <span>Typescript</span>
            <span className="version">5.6.2</span>
          </div>
          <div className="logo-item">
            <div className="logo-icon shadcn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3 9L12 15L21 9L12 3Z" fill="currentColor"/>
                <path d="M3 15L12 21L21 15" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span>Shadcn</span>
            <span className="version">2.0.7</span>
          </div>
          <div className="logo-item">
            <div className="logo-icon">
              <img src={imgVector7} alt="Tailwind CSS" />
            </div>
            <span>Tailwind CSS</span>
            <span className="version">3.4.11</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Logos;
