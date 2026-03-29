import React from 'react';
import './Hero.css';

const imgGlows = "https://www.figma.com/api/mcp/asset/becbd072-c679-4341-a691-6dc0617d6858";
const imgImage = "https://www.figma.com/api/mcp/asset/8160e130-526b-4820-bc45-51fc2e277d12";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>New version of Launch UI is out!</span>
            <a href="#" className="badge-link">Read more →</a>
          </div>
          <h1 className="hero-title">
            World's First<br />
            Quantum-Classical Hybrid LLMs
          </h1>
          <p className="hero-description">
            Q-VEDHA presents AlphaV : The Alpha Validation Engine for Drug Hypothesis and Acceleration
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Get started</button>
            <button className="btn-secondary">Github</button>
          </div>
        </div>
        
        <div className="hero-mockup">
          <div className="mockup-glows">
            <img src={imgGlows} alt="" />
          </div>
          <div className="mockup-frame">
            <div className="mockup-inner">
              <img src={imgImage} alt="Product mockup" />
            </div>
          </div>
          <div className="mockup-fade"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
