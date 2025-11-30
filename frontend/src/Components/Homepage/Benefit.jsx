// components/BenefitsSection.js
import React, { useState } from 'react';
import './Benefit.css';

function BenefitsSection() {
  const [activeTab, setActiveTab] = useState(0);

  const benefits = [
    {
      icon: '🏥',
      title: 'Unique Loan Program',
      description: ' We offer a unique loan program where the amount you save with usis multiplied by 3 to determine your loan amount',
      stat: '85%',
      statLabel: 'of requests approved',
      color: '#667eea'
    },
    {
      icon: '📅',
      title: 'Long-Term Loan',
      description: 'Our long-term loan has a flexible repayment period of up to 12 months.',
      stat: '#1000000+',
      statLabel: 'in loan aid',
      color: '#764ba2'
    },
    {
      icon: '⏳',
      title: 'Basiri, A Short-Term Loan',
      description: ' Introducing Basiri, our short-term loan option, where collections are made every 15 days and repayment is due at the next meeting, with no interest charges.',
      stat: '750+',
      statLabel: 'families helped',
      color: '#f093fb'
    },
    {
      icon: '💼',
      title: 'Interest-Free Loan',
      description: ' We provide interest-free financial support to help members grow without the burden of additional costs.',
      stat: '#2000000+',
      statLabel: 'in business loans',
      color: '#667eea'
    },
 
    {
      icon: '🚨',
      title: 'Crisis Response',
      description: 'Immediate assistance for natural disasters, accidents, or sudden emergencies.',
      stat: '24-48hrs',
      statLabel: 'response time',
      color: '#f093fb'
    }
  ];


  return (
    <section className="benefits-section" id="benefits">
      <div className="benefits-container">
        
        {/* Section Header */}
        <div className="benefits-header">
          <span className="section-tag">Member Benefits</span>
          <h2 className="benefits-title">
            Why Join Our <span className="highlight-text">Cooperative</span>
          </h2>
          <p className="benefits-subtitle">
            Experience comprehensive support designed to protect you and your family 
            during life's most challenging moments.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`benefit-card ${activeTab === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab(index)}
            >
              <div className="benefit-icon" style={{ background: benefit.color }}>
                {benefit.icon}
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
              <div className="benefit-stat">
                <div className="stat-number" style={{ color: benefit.color }}>
                  {benefit.stat}
                </div>
                <div className="stat-label">{benefit.statLabel}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Membership Tiers */}
    

        {/* Additional Benefits Banner */}
        <div className="extra-benefits">
          <h3 className="extra-title">Plus, All Members Get</h3>
          <div className="extra-grid">
            <div className="extra-item">
              <div className="extra-icon">📱</div>
              <span>Mobile App Access</span>
            </div>
            <div className="extra-item">
              <div className="extra-icon">🔔</div>
              <span>Real-Time Notifications</span>
            </div>
            <div className="extra-item">
              <div className="extra-icon">📊</div>
              <span>Financial Dashboard</span>
            </div>
            <div className="extra-item">
              <div className="extra-icon">🎉</div>
              <span>Exclusive Events</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default BenefitsSection;