// components/BenefitsSection.js
import React, { useState } from 'react';
import './Benefit.css';

function BenefitsSection() {
  const [activeTab, setActiveTab] = useState(0);

  const benefits = [
    {
      icon: '🏥',
      title: 'Emergency Medical Support',
      description: 'Access funds quickly for unexpected medical expenses, surgeries, or healthcare needs.',
      stat: '85%',
      statLabel: 'of requests approved',
      color: '#667eea'
    },
    {
      icon: '🎓',
      title: 'Education Assistance',
      description: 'Support for school fees, educational materials, and skill development programs.',
      stat: '$150K',
      statLabel: 'in education aid',
      color: '#764ba2'
    },
    {
      icon: '🏠',
      title: 'Housing Support',
      description: 'Help with rent, home repairs, or temporary accommodation during difficult times.',
      stat: '200+',
      statLabel: 'families helped',
      color: '#f093fb'
    },
    {
      icon: '💼',
      title: 'Business Capital',
      description: 'Small loans and grants to start or grow your business venture.',
      stat: '$80K',
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

  const membershipTiers = [
    {
      name: 'Basic',
      price: '$20',
      period: 'per month',
      description: 'Perfect for getting started',
      features: [
        'Emergency fund access up to $2,000',
        'Community support network',
        'Monthly updates and reports',
        'Basic voting rights',
        'Access to member events'
      ],
      popular: false,
      color: '#667eea'
    },
    {
      name: 'Standard',
      price: '$50',
      period: 'per month',
      description: 'Most popular choice',
      features: [
        'Emergency fund access up to $5,000',
        'Priority processing (24hrs)',
        'All Basic features included',
        'Full voting rights',
        'Discounted business loans',
        'Free financial counseling'
      ],
      popular: true,
      color: '#764ba2'
    },
    {
      name: 'Premium',
      price: '$100',
      period: 'per month',
      description: 'Maximum support and benefits',
      features: [
        'Emergency fund access up to $10,000',
        'Instant processing (12hrs)',
        'All Standard features included',
        'Leadership opportunities',
        'Investment opportunities',
        'Personal financial advisor',
        'Exclusive networking events'
      ],
      popular: false,
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