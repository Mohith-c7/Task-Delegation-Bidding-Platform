import React from 'react';
import './Footer.css';

const imgVector15 = "https://www.figma.com/api/mcp/asset/6e2b17a4-fa94-4339-9ff8-f3b06d81e5de";

const footerLinks = {
  product: [
    { name: "Changelog", href: "#" },
    { name: "Documentation", href: "#" }
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" }
  ],
  contact: [
    { name: "Github", href: "#" },
    { name: "Discord", href: "#" },
    { name: "Twitter", href: "#" }
  ]
};

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-icon">
                <img src={imgVector15} alt="" />
              </div>
              <span>Q-Vedha</span>
            </div>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-heading">Product</h4>
            {footerLinks.product.map((link, index) => (
              <a key={index} href={link.href} className="footer-link">{link.name}</a>
            ))}
          </div>
          
          <div className="footer-column">
            <h4 className="footer-heading">Company</h4>
            {footerLinks.company.map((link, index) => (
              <a key={index} href={link.href} className="footer-link">{link.name}</a>
            ))}
          </div>
          
          <div className="footer-column">
            <h4 className="footer-heading">Contact</h4>
            {footerLinks.contact.map((link, index) => (
              <a key={index} href={link.href} className="footer-link">{link.name}</a>
            ))}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">© 2024 Mikołaj Dobrucki. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
