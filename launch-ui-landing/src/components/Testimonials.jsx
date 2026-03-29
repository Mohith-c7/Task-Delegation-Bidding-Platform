import React from 'react';
import './Testimonials.css';

const testimonials = [
  { name: "Zara Qadir", handle: "@fab3304", text: "Playing around with @launchui suddenly made me feeling inspired to launch that side project." },
  { name: "Fabrizio Fernandez", handle: "@fab3304", text: "Testing out @launchui's responsive design. That's the template we've all been waiting for. My mobile-first heart is doing a happy dance." },
  { name: "Felix Beaumont", handle: "@felixbs", text: "Digging into @launchui. Those shadows are giving me serious design envy." },
  { name: "Olivia Blackwood", handle: "@olivia1992", text: "@launchui is not messing around with its component library game." },
  { name: "Esme Rothschild", handle: "@EsmeRothArt", text: "@launchui is siiiiick. That globe graphic though. Making me feel like I'm building websites for a sci-fi movie." },
  { name: "Darius Flynn", handle: "@flynnn", text: "Exploring @launchui's sleek UI. It's like a dark mode enthusiast's playground." }
];

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            Loved by designers and<br />
            developers across the planet
          </h2>
          <p className="testimonials-description">
            Here's what people are saying about Launch UI
          </p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonials-row">
            {testimonials.slice(0, 4).map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar"></div>
                  <div className="testimonial-info">
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <p className="testimonial-handle">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
          <div className="testimonials-row">
            {testimonials.slice(4, 6).map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar"></div>
                  <div className="testimonial-info">
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <p className="testimonial-handle">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
          <div className="testimonials-fade-left"></div>
          <div className="testimonials-fade-right"></div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
