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
          background: theme === 'dark' ? 'rgba(15, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '0.75rem',
          minWidth: '220px',
          boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
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
                padding: '0.6rem 0.75rem',
                borderRadius: '10px',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseOver={e => {
                e.target.style.background = 'var(--accent-gradient-subtle)';
                e.target.style.color = 'var(--accent-primary)';
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

/* ---- Navigation Data ---- */
const navSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Connected Products', path: '/solutions/anti-counterfeit' },
      { label: 'Consumer Intelligence', path: '/solutions/consumer-loyalty' },
      { label: 'Digital Experiences', path: '/solutions/digital-warranty' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Brand Protection', path: '/solutions/anti-counterfeit' },
      { label: 'Consumer Engagement', path: '/solutions/consumer-loyalty' },
      { label: 'Warranty Activation', path: '/solutions/digital-warranty' },
      { label: 'First-Party Data', path: '/solutions/track-and-trace' },
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
  const [scrolled, setScrolled] = useState(false);
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

  // Track scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '95%',
        maxWidth: '1200px',
        padding: '0.6rem 1.25rem',
        background: scrolled
          ? (theme === 'dark' ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.85)')
          : (theme === 'dark' ? 'rgba(10, 10, 15, 0.4)' : 'rgba(255, 255, 255, 0.4)'),
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '9999px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: scrolled
          ? (theme === 'dark' ? '0 4px 32px rgba(0, 0, 0, 0.4)' : '0 4px 32px rgba(0, 0, 0, 0.06)')
          : 'none'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/logo.svg"
            alt="Authentiks Logo"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain'
            }}
          />
          <span className="header-logo-text" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.02em'
          }}>
            <span style={{ color: '#1a3a8f' }}>Authen</span>
            <span style={{ color: '#3b8ced' }}>tiks</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ gap: '1.75rem', alignItems: 'center' }} className="desktop-nav">
          <DropdownMenu
            title="Platform"
            theme={theme}
            links={navSections[0].links}
          />
          <DropdownMenu
            title="Solutions"
            theme={theme}
            links={navSections[1].links}
          />
          <DropdownMenu
            title="Industries"
            theme={theme}
            links={navSections[2].links}
          />
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
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              padding: '0.45rem',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/contact-us"
            className="btn btn-primary header-cta-btn"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            Request Demo
          </Link>

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
      <div
        className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <nav className={`mobile-nav-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.125rem'
          }}>
            <span style={{ color: '#1a3a8f' }}>Authen</span>
            <span style={{ color: '#3b8ced' }}>tiks</span>
          </span>
          <button
            className="mobile-nav-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

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

        <div className="mobile-nav-divider" style={{ marginTop: 'auto' }} />
        <Link
          to="/contact-us"
          className="btn btn-primary"
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.875rem',
            fontSize: '0.95rem',
            textAlign: 'center'
          }}
          onClick={() => setMobileOpen(false)}
        >
          Request Demo
        </Link>
      </nav>
    </>
  );
};

export default Header;
