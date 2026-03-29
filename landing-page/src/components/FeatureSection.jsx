import React from 'react';
import './FeatureSection.css';

const imgVector1 = "https://www.figma.com/api/mcp/asset/8bffe44a-c7e9-4d19-b9af-a821b81ccfe3";
const imgVector2 = "https://www.figma.com/api/mcp/asset/6f6b3554-9c3a-4fd5-a04f-08166fd994dc";
const imgVector3 = "https://www.figma.com/api/mcp/asset/afd5ff87-a618-42f8-848a-b1e45ed62a62";
const imgVector4 = "https://www.figma.com/api/mcp/asset/31c61a79-e76c-4db1-8b27-a4f7b9de5884";

function FeatureSection() {
  const features = [
    {
      icon: imgVector1,
      title: "Advanced Data Analytics",
      description: "Predictive analytics to gain actionable insights and forecast future trends."
    },
    {
      icon: imgVector2,
      title: "Operations with Automation",
      description: "Enhance your operational efficiency with our AI-driven automated workflows."
    },
    {
      icon: imgVector3,
      title: "Unlock Insights with NLP",
      description: "Language processing to extract meaningful unstructured data."
    },
    {
      icon: imgVector4,
      title: "Custom AI for Your Needs",
      description: "Collaborate with our team of AI experts to build and deploy bespoke models."
    }
  ];

  return (
    <section className="feature-section">
      <div className="feature-container">
        <div className="feature-heading">
          <div className="eyebrow-tag">SOLUTIONS</div>
          <h2 className="section-title centered">Revolutionize Your Business with Our AI-Powered Features</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <img src={feature.icon} alt="" />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
