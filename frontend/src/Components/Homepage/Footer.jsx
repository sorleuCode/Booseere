// components/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Main Content */}
        <div className="footer-content">
          
          {/* Brand */}
          <div className="footer-brand">
            <h3 className="footer-logo">Booseere Multipurpose</h3>
            <p className="footer-inspire">
              Building stronger communities through unity, trust, and collective prosperity. 
              Together, we rise above challenges and create lasting impact.
            </p>
            <p className="footer-tagline">Uniting for a Better Tomorrow</p>
            <p className="footer-motto">CICS Limited</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/members">Members</a>
            <a href="/contact">Contact</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; 2024 Booseere Multipurpose CICS. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;