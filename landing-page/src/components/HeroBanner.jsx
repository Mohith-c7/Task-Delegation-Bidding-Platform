import React from 'react';
import './HeroBanner.css';

const imgImgLibImageCoverBusiness = "https://www.figma.com/api/mcp/asset/e106dc9b-cf34-4501-a681-fe6b0c91220a";
const imgImgLibImageCoverBusiness1 = "https://www.figma.com/api/mcp/asset/5853862a-ac29-40f3-8e7e-494df01ca8fa";
const imgImgLibImageCoverBusiness2 = "https://www.figma.com/api/mcp/asset/f7a85dc1-ac66-40af-8c3d-56ec6e3a0035";
const imgImgLibImageCoverBusiness4 = "https://www.figma.com/api/mcp/asset/af0b1e33-20b2-419f-9800-4b459b4cdef2";
const imgImgLibImageCoverBusiness5 = "https://www.figma.com/api/mcp/asset/d349a065-d912-4b61-9d22-68f171606fcf";
const imgImgLibImageCoverBusiness6 = "https://www.figma.com/api/mcp/asset/66955430-c982-44d3-a7f7-c5dfcfddc14b";
const imgImgLibImageCoverBusiness7 = "https://www.figma.com/api/mcp/asset/29b872b7-8cfd-41b6-8efb-78cca4e26665";
const imgImgLibImageCoverBusiness8 = "https://www.figma.com/api/mcp/asset/d76b2dfd-c70f-4dda-a23a-799ea3f25992";

function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Unleash the Power of Data</h1>
            <div className="hero-description">
              <p>Step into the future with our state-of-the-art AI solutions. Unleash the potential of machine learning to innovate, optimize, and transform your business processes.</p>
            </div>
          </div>
          <div className="hero-buttons">
            <button className="btn-primary">Start Your Free Trial</button>
            <button className="btn-outline">Learn more</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-grid">
            <div className="image-item" style={{gridColumn: 2, gridRow: 1}}>
              <img src={imgImgLibImageCoverBusiness4} alt="" />
            </div>
            <div className="image-item" style={{gridColumn: 3, gridRow: 1}}>
              <img src={imgImgLibImageCoverBusiness5} alt="" />
            </div>
            <div className="image-item" style={{gridColumn: 2, gridRow: 2}}>
              <img src={imgImgLibImageCoverBusiness6} alt="" />
            </div>
            <div className="image-item icon-item" style={{gridColumn: 1, gridRow: 2}}>
              <div className="icon-placeholder"></div>
            </div>
            <div className="image-item" style={{gridColumn: 3, gridRow: 2}}>
              <img src={imgImgLibImageCoverBusiness7} alt="" />
            </div>
            <div className="image-item" style={{gridColumn: 2, gridRow: 3}}>
              <img src={imgImgLibImageCoverBusiness} alt="" />
            </div>
            <div className="image-item" style={{gridColumn: 1, gridRow: 3}}>
              <img src={imgImgLibImageCoverBusiness2} alt="" />
            </div>
            <div className="image-item" style={{gridColumn: 3, gridRow: 3}}>
              <img src={imgImgLibImageCoverBusiness8} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
