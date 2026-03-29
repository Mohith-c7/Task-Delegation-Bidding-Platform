import React from 'react';
import './FaqSection.css';

function FaqSection() {
  const faqs = [
    {
      question: "Can DataWise's AI solutions be business systems?",
      answer: "Yes, integration is a key strength of our AI solutions. DataWise's AI platform is designed for flexibility and can be integrated with a wide range of existing business systems."
    },
    {
      question: "What types of AI services does DataWise offer?",
      answer: "Absolutely, our services are scalable and designed to accommodate and process large amounts of data efficiently."
    },
    {
      question: "What customer support do you offer for your AI solutions?",
      answer: "Our services can benefit various industries, including healthcare, finance, retail, entertainment, and many more, wherever AI can be leveraged."
    },
    {
      question: "Can your AI help improve my website's conversion rate?",
      answer: "We pride ourselves on our service's adaptability, user-centric design, and our continual commitment to pushing the boundaries of AI technology."
    },
    {
      question: "Can your AI identify areas for A/B testing and personalization?",
      answer: "We offer a range of support services from online resources, live chat support, to dedicated account representatives for enterprise customers."
    },
    {
      question: "How can your AI help improve my website's SEO ranking?",
      answer: "Yes, our platform allows for custom model training with your proprietary datasets."
    }
  ];

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-heading">
          <div className="eyebrow-tag">FAQ</div>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="faq-subtitle">Explore to learn more about how DataWise can empower your business with AI-driven solutions.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">
                <p>{faq.question}</p>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
