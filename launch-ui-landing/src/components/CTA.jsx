import React from 'react';
import './CTA.css';

const imgEllipse3 = "https://www.figma.com/api/mcp/asset/a734606f-ec29-41c9-9d32-c62a134c51ca";
const imgEllipse4 = "https://www.figma.com/api/mcp/asset/c91237d8-9ca2-4ef0-878e-72b36fbf0e83";

function CTA() {
  return (
    <section className="cta">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">Start building</h2>
          <div className="cta-buttons">
            <button className="cta-btn-primary">Get started</button>
            <button className="cta-btn-secondary">Github</button>
          </div>
        </div>
        <div className="cta-glows">
          <div className="cta-glow-1">
            <img src={imgEllipse3} alt="" />
          </div>
          <div className="cta-glow-2">
            <img src={imgEllipse4} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;
