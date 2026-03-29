import React from 'react';
import './AboutUsSection.css';

const imgVector5 = "https://www.figma.com/api/mcp/asset/c8f36124-047d-4493-8349-dcd9392b4475";

function AboutUsSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-top">
          <div className="section-heading">
            <div className="eyebrow-tag">ABOUT US</div>
            <h2 className="section-title">Empowering Innovation AI</h2>
          </div>
          <div className="about-description">
            <p>we are driven by the vision of transforming businesses with artificial intelligence. Founded in 2024, we have consistently pushed the boundaries of AI to offer smart, scalable, and intuitive solutions that drive growth and efficiency. </p>
            <p>Our team of expert data scientists, engineers, and strategists combines cutting-edge technology with deep industry knowledge to deliver custom AI solutions that cater to unique business challenges. </p>
          </div>
        </div>
        <div className="metrics">
          <div className="metric-item">
            <h3 className="metric-value">32+</h3>
            <p className="metric-label">Years in AI Innovation</p>
          </div>
          <div className="metric-item">
            <h3 className="metric-value">20</h3>
            <p className="metric-label">Clients Countries Worldwide</p>
          </div>
          <div className="metric-item">
            <h3 className="metric-value">4000+</h3>
            <p className="metric-label">Projects Successfully Implemented</p>
          </div>
        </div>
        <div className="read-more-link">
          <span className="link-text">Read more</span>
          <img src={imgVector5} alt="" className="arrow-icon" />
        </div>
      </div>
    </section>
  );
}

export default AboutUsSection;
