// components/AboutSection.js
import React from 'react';
import './Aboutus.css';

function Aboutus() {
  const storyImageRef = React.useRef(null);
  const values = [
    {
      icon: '🤝',
      title: 'Unity',
      description: 'We believe in the power of collective action and mutual support among members.'
    },
    {
      icon: '💪',
      title: 'Empowerment',
      description: 'We empower members to achieve financial stability through shared resources.'
    },
    {
      icon: '🎯',
      title: 'Transparency',
      description: 'Every contribution and disbursement is tracked with complete transparency.'
    },
    {
      icon: '❤️',
      title: 'Compassion',
      description: 'We support each other during life\'s most challenging moments with empathy.'
    }
  ];

  return (
    <section className="about-section" id="aboutus">
      <div className="about-container">
        
        {/* Section Header */}
        <div className="about-header">
          <span className="section-label">About Our Cooperative</span>
        
          <p className="section-subtitle">
            We are more than just a cooperative—we are a family committed to helping 
            each other thrive through shared contributions and collective strength.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="about-content">
          {/* Left Column - Story */}
          <div className="about-story">
            <div className="story-image" ref={storyImageRef}>
              <img
                src="/BOOSE.png"
                alt="Community gathering at Booseere Multipurpose Cooperative"
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.style.display = 'none';
                  if (storyImageRef.current) {
                    storyImageRef.current.classList.add('fallback');
                    storyImageRef.current.textContent = 'Community Gathering';
                  }
                }}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="image-overlay">
                <div className="overlay-stat">
                  <span className="stat-big">5+</span>
                  <span className="stat-small">Years of Impact</span>
                </div>
              </div>
            </div>

            <div className="story-content">
              <h3 className="story-title">Our Story</h3>
              <p className="story-text">
                Founded in 2022, Booseere Multipurpose began with a simple vision: to create 
                a safety net where community members could pool resources and support each 
                other during times of need. What started as a small group of 20 members 
                has grown into a thriving community of over 80+ active participants.
              </p>
              <p className="story-text">
                Through regular contributions, emergency funds, and mutual aid, we've helped 
                members overcome their setbacks, 
                and unexpected life challenges. Our strength lies in our unity.
              </p>

              <div className="story-stats">
                <div className="mini-stat">
                  <div className="mini-stat-icon">👥</div>
                  <div>
                    <div className="mini-stat-number">90+</div>
                    <div className="mini-stat-label">Members</div>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">💰</div>
                  <div>
                    <div className="mini-stat-number">#100000+</div>
                    <div className="mini-stat-label">Distributed</div>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">🎯</div>
                  <div>
                    <div className="mini-stat-number">750+</div>
                    <div className="mini-stat-label">Lives Helped</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mission & Values */}
          <div className="about-mission">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3 className="mission-title">Our Mission</h3>
              <p className="mission-text">
                To create a sustainable support system where members contribute regularly 
                and receive assistance when facing financial hardships, medical emergencies, 
                or unexpected life events.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">👁️</div>
              <h3 className="mission-title">Our Vision</h3>
              <p className="mission-text">
                A future where no member faces financial crisis alone, and where collective 
                prosperity uplifts entire communities through cooperative action and mutual support.
              </p>
            </div>

            <div className="values-grid">
              <h3 className="values-heading">Core Values</h3>
              <div className="values-list">
                {values.map((value, index) => (
                  <div key={index} className="value-item">
                    <div className="value-icon">{value.icon}</div>
                    <div className="value-content">
                      <h4 className="value-title">{value.title}</h4>
                      <p className="value-description">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
      
      
      

      </div>
    </section>
  );
}

export default Aboutus;