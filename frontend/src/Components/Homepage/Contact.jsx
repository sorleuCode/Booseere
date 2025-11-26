// components/ContactSection.js
import React, { useState } from 'react';
import './Contact.css';

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    setFormStatus('success');
    setTimeout(() => {
      setFormStatus('');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 Unity Street', 'Community Plaza, CA 90210', 'United States'],
      color: '#667eea'
    },
    {
      icon: '📧',
      title: 'Email Us',
      details: ['info@unitycooperative.org', 'support@unitycooperative.org'],
      color: '#764ba2'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543', 'Mon-Fri: 9AM - 6PM'],
      color: '#f093fb'
    }
  ];


  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        
        {/* Section Header */}
        <div className="contact-header">
          <h2 className="section-title">
            Let's Start a <span className="gradient-text">Conversation</span>
          </h2>
          <p className="section-subtitle">
            Have questions? We're here to help and guide you through joining our cooperative community.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="info-card">
              <div className="info-icon" style={{ background: info.color }}>
                {info.icon}
              </div>
              <h3 className="info-title">{info.title}</h3>
              <div className="info-details">
                {info.details.map((detail, idx) => (
                  <p key={idx}>{detail}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Contact Grid */}
        <div className="contact-grid">
          
          {/* Contact Form */}
          <div className="form-wrapper">
            <h3 className="form-title">Send Us a Message</h3>
            <p className="form-description">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="support">Request Support</option>
                    <option value="general">General Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                Send Message
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10L18 2L10 18L8 11L2 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {formStatus === 'success' && (
                <div className="form-success">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>

          {/* Additional Info Sidebar */}
        

        </div>

      </div>
    </section>
  );
}

export default ContactSection;