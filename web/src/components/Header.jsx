import React, { useState } from 'react';
import { ArrowRight, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
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
        <span style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 600, 
          fontSize: '1.125rem',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)'
        }}>
          Authentik
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        
        <DropdownMenu 
          title="Solutions" 
          theme={theme}
          links={[
            { label: 'Anti-Counterfeiting', path: '/solutions/anti-counterfeit' },
            { label: 'Track & Trace', path: '/solutions/track-and-trace' },
            { label: 'Digital Warranty', path: '/solutions/digital-warranty' },
            { label: 'Consumer Loyalty', path: '/solutions/consumer-loyalty' },
            { label: 'Channel Loyalty', path: '/solutions/channel-loyalty' },
          ]} 
        />
        
        <DropdownMenu 
          title="Industries" 
          theme={theme}
          links={[
            { label: 'Pharmaceuticals', path: '/industries/pharmaceuticals' },
            { label: 'FMCG & Retail', path: '/industries/fmcg' },
            { label: 'Automotive', path: '/industries/automotive' },
            { label: 'Apparel & Fashion', path: '/industries/fashion' },
          ]} 
        />
        <Link to="/technology" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Technology</Link>
        <Link to="/live-demo" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Live Demo</Link>
        
        <DropdownMenu 
          title="Resources" 
          theme={theme}
          links={[
            { label: 'Blog', path: '/resources/blog' },
            { label: 'Case Studies', path: '/resources/case-studies' },
            { label: 'FAQs', path: '/resources/faqs' },
            { label: 'Media & Press', path: '/resources/media' }
          ]} 
        />

        <DropdownMenu 
          title="Company" 
          theme={theme}
          links={[
            { label: 'About Us', path: '/about-us' },
            { label: 'Contact', path: '/contact-us' }
          ]} 
        />

      </nav>

      {/* Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        <a href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          Login
        </a>
      </div>
    </header>
  );
};

export default Header;
