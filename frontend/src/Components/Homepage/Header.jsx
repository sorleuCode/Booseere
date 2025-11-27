import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header-wrapper ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-inner">
        <div className="header-logo">Booseere</div>

        <nav className={`header-nav ${menuOpen ? "header-nav-active" : ""}`}>
           <Link className="header-link" to="/">Home</Link>
           <a className="header-link" href="/#aboutus">About Us</a>
           <Link className="header-link" to="/public-members">Members</Link>
           <Link className="header-link" to="/constitution">Law</Link>
           <a className="header-link" href="/#benefits">Benefits</a>
           <a className="header-link" href="/#contact">Contact</a>
         </nav>

        <div
          className={`header-toggle ${menuOpen ? "header-toggle-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="header-toggle-icon">
            <svg viewBox="0 0 100 100" width="40" height="40">
              <path
                className="toggle-circle"
                d="M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80"
                strokeWidth="6"
                fill="none"
              />
            </svg>
            <div className="toggle-lines">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
