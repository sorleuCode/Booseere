// components/HeroSection.js
import React, { useState, useEffect } from 'react';
import './Herosection.css';

function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="home">
      {/* Background Elements */}
      <div className="hero-background">
        <div className="hero-shape shape-1"></div>
        <div className="hero-shape shape-2"></div>
        <div className="hero-shape shape-3"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>MOTTO : "UNITING FOR A BETTER MORROW"</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-title">
            BOOSEERE MULTIPURPOSE{' '}
            <span className="rotating-words">
              {words.map((word, index) => (
                <span
                  key={word}
                  className={`word ${index === currentWord ? 'active' : ''}`}
                >
                  {word}
                </span>
              ))}
            </span>
            <br />
            <span className="gradient-text">CICS LIMITED</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Join our cooperative forum where members contribute, accept loans, and support 
            one another. Together, we create a safety net that ensures no one faces 
            life's challenges alone.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => scrollToSection('aboutus')}>
              Learn More
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">90+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">#1000000+</div>
              <div className="stat-label">Total Contributions</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">750+</div>
              <div className="stat-label">Lives Impacted</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h4>Biweekly Contributions</h4>
              <p>Flexible plans from #3,500</p>
            </div>
          </div>

          <div className="visual-card card-2">
            <div className="card-icon">🤝</div>
            <div className="card-content">
              <h4>Community Support</h4>
              <p>Help when you need it</p>
            </div>
          </div>

          <div className="visual-card card-3">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h4>Growing Together</h4>
              <p>Collective prosperity</p>
            </div>
          </div>

          <div className="visual-circle"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll to explore</span>
      </div> */}
    </section>
  );
}

export default HeroSection;