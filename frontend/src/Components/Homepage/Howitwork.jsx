// components/HowItWorksSection.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Howitwork.css';

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Join Our Community',
      description: 'Complete a simple registration process and become a member of our cooperative family. No complex paperwork required.',
      color: '#667eea'
    },
    {
      number: '02',
      title: 'Make Regular Contributions',
      description: 'Choose a contribution plan that works for you—starting from just $20 per month. Contributions are flexible and affordable.',
      color: '#764ba2'
    },
    {
      number: '03',
      title: 'Build Your Safety Net',
      description: 'Your contributions accumulate in a collective fund, creating a financial cushion for times of need.',
      color: '#f093fb'
    },
    {
      number: '04',
      title: 'Request Assistance',
      description: 'When facing emergencies or unexpected expenses, submit a request to access funds from the collective pool.',
      color: '#667eea'
    },
    {
      number: '05',
      title: 'Receive Quick Support',
      description: 'Approved requests are processed within 24–48 hours, ensuring you get help when you need it most.',
      color: '#764ba2'
    },
    {
      number: '06',
      title: 'Help Others Thrive',
      description: 'Continue contributing and supporting fellow members, strengthening the entire community.',
      color: '#f093fb'
    }
  ];

  const features = [
    {
      title: 'Secure & Transparent',
      description: 'All transactions are recorded and accessible to members'
    },
    {
      title: 'Real-Time Tracking',
      description: 'Monitor your contributions and fund status anytime'
    },
    {
      title: 'Fair Distribution',
      description: 'Funds distributed based on need and contribution history'
    },
    {
      title: 'Community Support',
      description: '24/7 member support and guidance available'
    }
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="how-it-works-container">

        {/* Section Header */}
        <div className="how-header">
          <h2 className="section-heading">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="section-description">
            Getting started is easy. Follow these simple steps to become part of 
            our supportive community and start building your financial safety net.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              
              <div className="step-number" style={{ background: step.color }}>
                {step.number}
              </div>

              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="step-connector"></div>
              )}
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="features-wrapper">
          <h3 className="features-heading">Why Our Process Works</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-content">
            <div className="info-text">
              <h4>Care to know about our Laws before you join?</h4>
            </div>
          </div>

          <Link to="/constitution" className="info-button">
            Our Laws
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default HowItWorksSection;
