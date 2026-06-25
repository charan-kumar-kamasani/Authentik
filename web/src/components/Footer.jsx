import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', marginBottom: '0.5rem' }}>
              <img
                src="/logo.svg"
                alt="Authentiks"
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '-0.02em'
              }}>
                <span style={{ color: '#1a3a8f' }}>Authen</span>
                <span style={{ color: '#3b8ced' }}>tiks</span>
              </span>
            </Link>
            <p>The Consumer Layer for Physical Products. Transform every product into a lasting consumer relationship.</p>
          </div>

          {/* Platform */}
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/solutions/anti-counterfeit">Connected Products</Link>
            <Link to="/solutions/consumer-loyalty">Consumer Intelligence</Link>
            <Link to="/solutions/digital-warranty">Digital Experiences</Link>
            <Link to="/technology">Technology</Link>
          </div>

          {/* Solutions */}
          <div className="footer-col">
            <h4>Solutions</h4>
            <Link to="/solutions/anti-counterfeit">Brand Protection</Link>
            <Link to="/solutions/consumer-loyalty">Consumer Engagement</Link>
            <Link to="/solutions/digital-warranty">Warranty Activation</Link>
            <Link to="/solutions/track-and-trace">First-Party Data</Link>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="/resources/blog">Blog</Link>
            <Link to="/resources/case-studies">Case Studies</Link>
            <Link to="/resources/faqs">FAQs</Link>
            <Link to="/resources/media">Media & Press</Link>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about-us">About Us</Link>
            <Link to="/contact-us">Contact</Link>
            <Link to="/live-demo">Live Demo</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Authentiks. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-conditions">Terms</Link>
            <Link to="/security-policy">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
