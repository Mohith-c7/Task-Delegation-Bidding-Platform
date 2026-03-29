import React from 'react';
import './PartnerSection.css';

const imgLogo = "https://www.figma.com/api/mcp/asset/c10bf6ca-9c8d-4252-906e-1ef7b29e6b26";
const imgLogo1 = "https://www.figma.com/api/mcp/asset/ff5003f4-f5be-4442-ad6f-45ee51b9d4ec";
const imgLogo2 = "https://www.figma.com/api/mcp/asset/98460184-d9cc-4e14-b150-9637ed18e740";
const imgLogo3 = "https://www.figma.com/api/mcp/asset/5380dfac-9c9a-4947-9558-b861461a53d0";
const imgLogo4 = "https://www.figma.com/api/mcp/asset/38e1b0e6-695b-4e04-a56c-0299f18a6546";
const imgLogo5 = "https://www.figma.com/api/mcp/asset/f5e7d934-eb50-4ebe-a566-9fcd11709255";
const imgLogo6 = "https://www.figma.com/api/mcp/asset/124eb9c3-7ed8-4abe-95e9-f4c5ba096edf";
const imgLogo7 = "https://www.figma.com/api/mcp/asset/424d9547-c3bd-4c1c-a1f2-10e784044f90";
const imgLogo8 = "https://www.figma.com/api/mcp/asset/3ac36344-3ede-4892-86e1-104b3adc244f";
const imgLogo9 = "https://www.figma.com/api/mcp/asset/b9fb118f-3779-40df-9bc0-2951a40f7ce0";

function PartnerSection() {
  return (
    <section className="partner-section">
      <div className="partner-logos">
        <img src={imgLogo} alt="Partner logo" />
        <img src={imgLogo1} alt="Partner logo" />
        <img src={imgLogo2} alt="Partner logo" />
        <img src={imgLogo3} alt="Partner logo" />
        <img src={imgLogo4} alt="Partner logo" />
        <img src={imgLogo5} alt="Partner logo" />
        <img src={imgLogo6} alt="Partner logo" />
        <img src={imgLogo7} alt="Partner logo" />
        <img src={imgLogo8} alt="Partner logo" />
        <img src={imgLogo9} alt="Partner logo" />
        <div className="gradient-left"></div>
        <div className="gradient-right"></div>
      </div>
    </section>
  );
}

export default PartnerSection;
