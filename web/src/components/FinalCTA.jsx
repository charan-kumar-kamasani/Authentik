import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="cta-section">
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '1.25rem'
          }}>
            Transform Every Product Into a{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Consumer Relationship.</span>
          </h2>
          <p style={{
            fontSize: '1.15rem',
            marginBottom: '2.5rem',
            maxWidth: '540px',
            margin: '0 auto 2.5rem'
          }}>
            Join the brands that are building the future of consumer engagement.
            The sale is just the beginning.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/contact-us"
              className="btn btn-large"
              style={{
                background: '#ffffff',
                color: '#1e1b4b',
                fontWeight: 700,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              Request Demo <ArrowRight size={18} />
            </Link>
            <Link
              to="/contact-us"
              className="btn btn-large"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(12px)'
              }}
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
