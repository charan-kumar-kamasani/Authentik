import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{ 
      padding: '8rem 0 6rem', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <div className="container">
        
        <div className="fade-in-up" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={16} color="var(--accent-color)" />
          <span>The new standard for secure product distribution</span>
        </div>

        <h1 className="fade-in-up delay-1" style={{ 
          fontSize: 'clamp(3rem, 6vw, 5rem)', 
          maxWidth: '900px',
          margin: '0 auto 1.5rem',
        }}>
          Control your supply chain with <span className="text-gradient">intelligent QR workflows.</span>
        </h1>
        
        <p className="fade-in-up delay-2" style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 3rem',
          lineHeight: 1.8
        }}>
          Authentik provides end-to-end QR code lifecycle management. Track every order from authorization to final receipt with unmatched security and beautiful design.
        </p>
        
        <div className="fade-in-up delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/login" className="btn btn-primary">
            Get Started <ArrowRight size={18} />
          </a>
          <a href="#features" className="btn btn-glass">
            View Features
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;
