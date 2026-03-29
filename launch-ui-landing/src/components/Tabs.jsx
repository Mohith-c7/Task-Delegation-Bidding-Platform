import React from 'react';
import './Tabs.css';

const imgGlows = "https://www.figma.com/api/mcp/asset/becbd072-c679-4341-a691-6dc0617d6858";
const imgImage = "https://www.figma.com/api/mcp/asset/8160e130-526b-4820-bc45-51fc2e277d12";

const tabs = [
  {
    title: "Choose your sections",
    description: "Choose among 100+ components to build a landing page suited to the needs of your product.",
    active: true
  },
  {
    title: "Add your content",
    description: "Fill the blanks with screenshots, videos, and other content featuring your product.",
    active: false
  },
  {
    title: "Customize",
    description: "Make design yours in no time by changing the variables that control colors, typography, and other styles.",
    active: false
  }
];

function Tabs() {
  return (
    <section className="tabs">
      <div className="tabs-container">
        <div className="tabs-content">
          <h2 className="tabs-title">Make the right impression</h2>
          <p className="tabs-description">
            Launch UI makes it easy to build an unforgetable website that resonates with professional design-centric audiences.
          </p>
        </div>
        <div className="tabs-layout">
          <div className="tabs-list">
            {tabs.map((tab, index) => (
              <div key={index} className={`tab-item ${tab.active ? 'active' : ''}`}>
                <div className="tab-icon"></div>
                <div className="tab-text">
                  <h3 className="tab-title">{tab.title}</h3>
                  <p className="tab-description">{tab.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="tabs-preview">
            <div className="preview-glows">
              <img src={imgGlows} alt="" />
            </div>
            <div className="preview-frame">
              <div className="preview-inner">
                <img src={imgImage} alt="Preview" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Tabs;
