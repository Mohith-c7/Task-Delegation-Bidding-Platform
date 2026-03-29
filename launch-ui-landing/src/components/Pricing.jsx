import React from 'react';
import './Pricing.css';

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "free",
    subtitle: "for everyone",
    description: "For everyone starting out on a website for their big idea",
    features: [
      "9 landing page sections",
      "36 components",
      "5 custom animations"
    ],
    cta: "Get started for free",
    popular: false
  },
  {
    name: "Pro",
    price: "$0",
    period: "one-time payment",
    subtitle: "plus local taxes",
    description: "For early-stage founders, solopreneurs and indie devs",
    features: [
      "66 landing page sections",
      "126 components",
      "16 illustrations",
      "15 custom animations"
    ],
    cta: "Get all-access",
    popular: true
  },
  {
    name: "Team",
    price: "$0",
    period: "one-time payment",
    subtitle: "plus local taxes",
    description: "For teams and agencies working on cool products together",
    features: [
      "All the templates, components and sections available for your entire team"
    ],
    cta: "Get all-access for your team",
    popular: false
  }
];

function Pricing() {
  return (
    <section className="pricing">
      <div className="pricing-container">
        <h2 className="pricing-title">Build your dream landing page, today.</h2>
        <p className="pricing-description">
          Get lifetime access to all the components. No recurring fees. Just simple, transparent pricing.
        </p>
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              <div className="pricing-header">
                <div className="plan-name-row">
                  {plan.popular && <div className="plan-icon"></div>}
                  <h3 className="plan-name">{plan.name}</h3>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              <div className="plan-price-row">
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{plan.price.replace('$', '')}</span>
                </div>
                <div className="plan-period">
                  <p className="period-main">{plan.period}</p>
                  <p className="period-sub">{plan.subtitle}</p>
                </div>
              </div>
              <button className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}>
                {plan.cta}
              </button>
              <p className="plan-note">Free and open-source forever</p>
              <div className="plan-divider"></div>
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.popular && <div className="pricing-glow"></div>}
              <div className="pricing-shine"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
