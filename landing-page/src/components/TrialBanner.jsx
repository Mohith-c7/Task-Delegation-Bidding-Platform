import React from 'react';
import './TrialBanner.css';

const imgImgLibImageCoverAbstract = "https://www.figma.com/api/mcp/asset/6e0dd93d-0bd8-4d60-bb5a-a935b01b6a42";
const imgVector8 = "https://www.figma.com/api/mcp/asset/6e7b6237-10c0-41fe-94c3-5f5000054e50";
const imgGroup2316 = "https://www.figma.com/api/mcp/asset/d52d934d-4ce5-48c9-adff-0622770432ca";

function TrialBanner() {
  return (
    <section className="trial-banner">
      <div className="trial-container">
        <div className="trial-content">
          <div className="trial-text">
            <h2 className="trial-title">Experience the Future of Business Analytics</h2>
            <p className="trial-description">Get hands-on with our advanced AI-driven features and see the difference for yourself. Start your free trial today.</p>
          </div>
          <div className="trial-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <img src={imgVector8} alt="" />
              </div>
              <p>Context-aware natural language search and discovery</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <img src={imgVector8} alt="" />
              </div>
              <p>Embark on a journey of data-driven decision-making</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <img src={imgVector8} alt="" />
              </div>
              <p>Single permission model for data + AI</p>
            </div>
          </div>
          <button className="btn-trial-large">Start your free trial</button>
        </div>
        <div className="trial-image">
          <div className="image-card">
            <img src={imgImgLibImageCoverAbstract} alt="" className="main-image" />
            <div className="metric-badge">
              <img src={imgGroup2316} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrialBanner;
