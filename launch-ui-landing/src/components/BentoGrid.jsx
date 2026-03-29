import React from 'react';
import './BentoGrid.css';

const imgGlows2 = "https://www.figma.com/api/mcp/asset/6fb0f9c6-123a-432b-bd8d-30d9c770a55e";
const imgGlobe = "https://www.figma.com/api/mcp/asset/5c88ce78-180f-4556-a591-1af1f592ed42";
const imgEllipse1 = "https://www.figma.com/api/mcp/asset/7f925c26-ce1d-4b68-82b7-77c0066fda10";
const imgEllipse2 = "https://www.figma.com/api/mcp/asset/cf3f20fa-314e-47f3-9b40-28e95a18eeb8";
const imgGlows3 = "https://www.figma.com/api/mcp/asset/0fecc003-127c-4d57-8d8e-97fdf345bb96";
const imgVector17 = "https://www.figma.com/api/mcp/asset/8ebf95ed-2dfe-47a8-b4d6-886d1ae35a95";
const imgGlows4 = "https://www.figma.com/api/mcp/asset/6894ebd8-1350-4e32-9375-697db49858da";
const imgGlows5 = "https://www.figma.com/api/mcp/asset/6e4fa519-c88c-4772-9c2d-4102e45bfb93";

function BentoGrid() {
  return (
    <section className="bento-grid">
      <div className="bento-container">
        <h2 className="bento-title">AlphaV Model Hub</h2>
        
        <div className="bento-row-1">
          <div className="bento-tile bento-tile-large">
            <div className="tile-content">
              <h3 className="tile-title">100+ sections and components</h3>
              <p className="tile-description">
                Placeholder for metrics — reasoning accuracy, molecular generalization, synthesis rate.
              </p>
            </div>
            <div className="tile-illustration globe-illustration">
              <div className="globe-glows">
                <img src={imgGlows2} alt="" />
              </div>
              <div className="globe-container">
                <img src={imgGlobe} alt="" className="globe" />
              </div>
              <div className="ellipse-1">
                <img src={imgEllipse1} alt="" />
              </div>
              <div className="ellipse-2">
                <img src={imgEllipse2} alt="" />
              </div>
            </div>
          </div>
          
          <div className="bento-tile">
            <div className="tile-content">
              <h3 className="tile-title">AlphaV-518M</h3>
              <p className="tile-description">
                Placeholder for metrics — reasoning accuracy, molecular generalization, synthesis rate.
              </p>
            </div>
            <div className="tile-illustration ripple-illustration">
              <div className="ripple-glows">
                <img src={imgGlows3} alt="" />
              </div>
              <div className="ripple-circles">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`ripple-circle ripple-${i + 1}`}></div>
                ))}
                <div className="ripple-center">
                  <div className="ripple-icon">
                    <img src={imgVector17} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-row-2">
          <div className="bento-tile">
            <div className="tile-content">
              <h3 className="tile-title">AlphaV-760M</h3>
              <p className="tile-description">
                Placeholder for metrics — reasoning accuracy, molecular generalization, synthesis rate.
              </p>
            </div>
            <div className="tile-illustration tiles-illustration">
              <div className="tiles-glows">
                <img src={imgGlows4} alt="" />
              </div>
              <div className="tiles-grid">
                <div className="tile-icon tile-figma"></div>
                <div className="tile-icon tile-react active"></div>
                <div className="tile-icon tile-tailwind active"></div>
                <div className="tile-icon tile-typescript active"></div>
                <div className="tile-icon tile-shadcn active"></div>
              </div>
            </div>
          </div>
          
          <div className="bento-tile bento-tile-square">
            <div className="tile-content">
              <h3 className="tile-title">AlphaV-1.5B</h3>
              <p className="tile-description">
                Placeholder for metrics — reasoning accuracy, molecular generalization, synthesis rate.
              </p>
            </div>
            <div className="tile-illustration chat-illustration">
              <div className="chat-glows">
                <img src={imgGlows5} alt="" />
              </div>
              <div className="chat-messages">
                <div className="chat-message chat-left">
                  <span>We need to update this heading before launch</span>
                </div>
                <div className="chat-badge chat-badge-left">Sofia G.</div>
                <div className="chat-message chat-right">
                  <span>Let me quickly jump into Sanity and fix it</span>
                </div>
                <div className="chat-message chat-right-small">
                  <span>Done!</span>
                </div>
                <div className="chat-badge chat-badge-right">Erik D.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
