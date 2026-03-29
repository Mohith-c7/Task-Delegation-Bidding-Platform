import React from 'react';
import './ItemsGrid.css';

const items = [
  {
    title: "Accessibility first",
    description: "Fully WCAG 2.0 compliment, made with best a11y practices",
    icon: "scan-face"
  },
  {
    title: "Responsive design",
    description: "Looks and works great on any device and screen size",
    icon: "monitor"
  },
  {
    title: "Light and dark mode",
    description: "Seamless switching between color schemes, 6 themes included",
    icon: "eclipse"
  },
  {
    title: "Easy to customize",
    description: "Flexible options to match your product or brand",
    icon: "blocks"
  },
  {
    title: "Top-level performance",
    description: "Made for lightning-fast load times and smooth interactions",
    icon: "fast-forward"
  },
  {
    title: "Production ready",
    description: "Thoroughly tested and launch-prepared",
    icon: "rocket"
  },
  {
    title: "Made for localisation",
    description: "Easy to implement support for multiple languages and regions",
    icon: "languages"
  },
  {
    title: "CMS friendly",
    description: "Built to work with your any headless content management system",
    icon: "pen"
  }
];

function ItemsGrid() {
  return (
    <section className="items-grid">
      <div className="items-container">
        <h2 className="items-title">Revolutionizing Drug Synthesis</h2>
        <div className="items-list">
          {items.map((item, index) => (
            <div key={index} className="item-card">
              <div className="item-header">
                <div className="item-icon"></div>
                <h3 className="item-title">{item.title}</h3>
              </div>
              <p className="item-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ItemsGrid;
