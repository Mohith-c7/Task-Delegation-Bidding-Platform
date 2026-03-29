import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Logos from './components/Logos';
import BentoGrid from './components/BentoGrid';
import ItemsGrid from './components/ItemsGrid';
import FeatureRising from './components/FeatureRising';
import Tabs from './components/Tabs';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Logos />
      <BentoGrid />
      <ItemsGrid />
      <FeatureRising />
      <Tabs />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
