// components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

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
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/public-members">Members</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Booseere Multipurpose CICS. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;