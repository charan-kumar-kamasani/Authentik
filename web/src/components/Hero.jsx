import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="section" style={{
      paddingTop: '8rem',
      paddingBottom: '4rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '90vh'
    }}>
      <div className="container">

        <div className="fade-in-up" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'var(--accent-gradient-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          marginBottom: '2rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--accent-primary)'
        }}>
          <span style={{ fontSize: '0.7rem' }}>✦</span>
          <span>The Consumer Layer for Physical Products</span>
        </div>

        <h1 className="fade-in-up delay-1" style={{
          maxWidth: '900px',
          margin: '0 auto 1.5rem',
        }}>
          Every Product You Sell Should{' '}
          <span className="text-gradient">Keep Working</span>
          {' '}For Your Brand.
        </h1>

        <p className="fade-in-up delay-2" style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 3rem',
          lineHeight: 1.7
        }}>
          Authentiks transforms every physical product into a persistent digital
          touchpoint — building direct consumer relationships, collecting first-party
          data, and driving lifetime value.
        </p>

        <div className="fade-in-up delay-3" style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/contact-us" className="btn btn-primary btn-large">
            Request Demo <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn btn-secondary btn-large">
            See How It Works
          </a>
        </div>


      </div>
    </section>
  );
};

export default Hero;
