import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PartnerSection from './components/PartnerSection';
import AboutUsSection from './components/AboutUsSection';
import FeatureSection from './components/FeatureSection';
import BlogSection from './components/BlogSection';
import TrialBanner from './components/TrialBanner';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="body">
        <HeroBanner />
        <PartnerSection />
        <AboutUsSection />
        <FeatureSection />
        <BlogSection />
        <TrialBanner />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
