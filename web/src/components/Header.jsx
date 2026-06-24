import React, { useState, useEffect } from 'react';
import { ArrowRight, Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const DropdownMenu = ({ title, links, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem',
        color: 'var(--text-secondary)', 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        cursor: 'pointer',
        transition: 'color 0.2s',
        padding: '0.5rem 0'
      }}
      onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        {title} <ChevronDown size={14} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: theme === 'dark' ? 'rgba(15, 15, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1rem',
          minWidth: '220px',
          boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1001
        }}>
          {links.map((link, i) => (
            <Link 
              key={i} 
              to={link.path}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.background = 'rgba(128,128,128,0.1)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---- Mobile Nav Data ---- */
const navSections = [
  {
    title: 'Solutions',
    links: [
      { label: 'Anti-Counterfeiting', path: '/solutions/anti-counterfeit' },
      { label: 'Track & Trace', path: '/solutions/track-and-trace' },
      { label: 'Digital Warranty', path: '/solutions/digital-warranty' },
      { label: 'Consumer Loyalty', path: '/solutions/consumer-loyalty' },
      { label: 'Channel Loyalty', path: '/solutions/channel-loyalty' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Pharmaceuticals', path: '/industries/pharmaceuticals' },
      { label: 'FMCG & Retail', path: '/industries/fmcg' },
      { label: 'Automotive', path: '/industries/automotive' },
      { label: 'Apparel & Fashion', path: '/industries/fashion' },
    ],
  },
  {
    title: null, // standalone links
    links: [
      { label: 'Technology', path: '/technology' },
      { label: 'Live Demo', path: '/live-demo' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', path: '/resources/blog' },
      { label: 'Case Studies', path: '/resources/case-studies' },
      { label: 'FAQs', path: '/resources/faqs' },
      { label: 'Media & Press', path: '/resources/media' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about-us' },
      { label: 'Contact', path: '/contact-us' },
    ],
  },
];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header style={{ 
        position: 'fixed', 
        top: '1.5rem', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 1000,
        width: '95%',
        maxWidth: '1200px',
        padding: '0.65rem 1.25rem',
        background: theme === 'dark' ? 'rgba(5, 5, 5, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '9999px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme === 'dark' ? '0 4px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 4px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <img 
            src="/logo.png" 
            alt="Authentik Logo" 
            style={{ 
              width: '32px', 
              height: '32px', 
              objectFit: 'contain'
            }} 
          />
          <span className="header-logo-text" style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 600, 
            fontSize: '1.125rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)'
          }}>
            Authentik
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ gap: '2rem', alignItems: 'center' }} className="desktop-nav">
          
          <DropdownMenu 
            title="Solutions" 
            theme={theme}
            links={navSections[0].links} 
          />
          
          <DropdownMenu 
            title="Industries" 
            theme={theme}
            links={navSections[1].links} 
          />
          <Link to="/technology" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Technology</Link>
          <Link to="/live-demo" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Live Demo</Link>
          
          <DropdownMenu 
            title="Resources" 
            theme={theme}
            links={navSections[3].links} 
          />

          <DropdownMenu 
            title="Company" 
            theme={theme}
            links={navSections[4].links} 
          />

        </nav>

        {/* Actions */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a href="/login" className="btn btn-primary header-login-btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Login
          </a>

          {/* Mobile Hamburger */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ---- Mobile Navigation ---- */}
      {/* Overlay backdrop */}
      <div 
        className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-out panel */}
      <nav className={`mobile-nav-panel ${mobileOpen ? 'open' : ''}`}>
        {/* Panel header */}
        <div className="mobile-nav-header">
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 600, 
            fontSize: '1.125rem',
            color: 'var(--text-primary)'
          }}>
            Menu
          </span>
          <button 
            className="mobile-nav-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav sections */}
        {navSections.map((section, idx) => (
          <div key={idx}>
            {idx > 0 && <div className="mobile-nav-divider" />}
            <div className="mobile-nav-section">
              {section.title && (
                <div className="mobile-nav-section-title">{section.title}</div>
              )}
              {section.links.map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div className="mobile-nav-divider" style={{ marginTop: 'auto' }} />
        <a 
          href="/login" 
          className="btn btn-primary" 
          style={{ 
            width: '100%', 
            marginTop: '0.5rem',
            padding: '0.875rem',
            fontSize: '0.95rem',
            textAlign: 'center'
          }}
        >
          Login
        </a>
      </nav>
    </>
  );
};

export default Header;
