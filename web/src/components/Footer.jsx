import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '3rem 0', 
      borderTop: '1px solid var(--glass-border)',
      marginTop: '4rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Authentik Systems. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>Privacy</Link>
          <Link to="/terms-conditions" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>Terms</Link>
          <Link to="/contact-us" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
