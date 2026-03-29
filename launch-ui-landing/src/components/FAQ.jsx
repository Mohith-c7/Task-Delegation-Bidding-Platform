import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  { question: "Is Launch UI easy to customise?", answer: "Yes, Launch UI is built with customization in mind." },
  { question: "Is Launch UI optimized for search engines?", answer: "Yes, all components follow SEO best practices." },
  { question: "How does Launch UI compare to no-code tools?", answer: "Launch UI gives you full control over your code." },
  { question: "Why not just coding a website yourself?", answer: "Launch UI saves you time with pre-built components." },
  { question: "Can I get a refund if I don't like it?", answer: "Yes, we offer a 30-day money-back guarantee." },
  { question: "What features will be added in the future?", answer: "We're constantly adding new components and features." }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq">
      <div className="faq-container">
        <h2 className="faq-title">Questions and Answers</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={`faq-icon ${openIndex === index ? 'open' : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                >
                  <path 
                    d="M4 6L8 10L12 6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
