import React from 'react';
import './FeatureRising.css';

const imgEllipse3 = "https://www.figma.com/api/mcp/asset/a734606f-ec29-41c9-9d32-c62a134c51ca";
const imgEllipse33 = "https://www.figma.com/api/mcp/asset/9855bd70-4e99-4f9b-a8f6-44ed4acf22f0";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/24b6fc2b-1edd-4ee1-9dc7-8534260798a0";
const imgEllipse32 = "https://www.figma.com/api/mcp/asset/eeabe8e5-1f72-444c-8948-23d6a0cee780";

function FeatureRising() {
  return (
    <section className="feature-rising">
      <div className="feature-rising-container">
        <div className="feature-rising-content">
          <h2 className="feature-rising-title">
            Q-Vedha's<br />
            Quantum AI Framework
          </h2>
          <p className="feature-rising-description">
            You can trust that all of the designs are taking the full advantage of newest Figma's features and that code is written following best practices out there.
          </p>
        </div>
        <div className="feature-rising-illustration">
          <div className="rising-glows">
            <img src={imgEllipse3} alt="" />
          </div>
          <div className="rising-layers">
            <img src={imgEllipse33} alt="" className="layer-1" />
            <img src={imgGroup5} alt="" className="layer-2" />
            <img src={imgEllipse32} alt="" className="layer-3" />
          </div>
          <div className="rising-fade"></div>
        </div>
      </div>
    </section>
  );
}

export default FeatureRising;
