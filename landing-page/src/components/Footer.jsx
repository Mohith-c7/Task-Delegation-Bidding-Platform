import React from 'react';
import './Footer.css';

const imgDataWise1 = "https://www.figma.com/api/mcp/asset/f06038f1-32ce-4dde-99ee-0c42838ed86b";
const imgVector9 = "https://www.figma.com/api/mcp/asset/d7b8935f-8cf1-4e7b-a4a6-fc9a89aae01d";
const imgLine = "https://www.figma.com/api/mcp/asset/a228ca6c-3251-44f6-ae3b-426a69f2361f";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-logo">
            <img src={imgDataWise1} alt="DataWise" className="footer-logo-text" />
            <div className="footer-logo-symbol">
              <img src={imgVector9} alt="" />
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">About</h4>
              <div className="footer-link-list">
                <a href="#" className="footer-link">Company Overview</a>
                <a href="#" className="footer-link">Careers</a>
                <a href="#" className="footer-link">Press & Media</a>
                <a href="#" className="footer-link">Testimonials</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Resources</h4>
              <div className="footer-link-list">
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Webinars & Events</a>
                <a href="#" className="footer-link">Case Studies</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Support & Contact</h4>
              <div className="footer-link-list">
                <a href="#" className="footer-link">Contact Us</a>
                <a href="#" className="footer-link">Technical Support</a>
                <a href="#" className="footer-link">Feedback</a>
                <a href="#" className="footer-link">Community Forum</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-divider">
          <img src={imgLine} alt="" />
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">©2023 NIMBUS · All rights reserved.</p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Term of use</a>
            <a href="#" className="footer-legal-link">Privacy policy</a>
            <a href="#" className="footer-legal-link">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
