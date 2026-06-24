import React from 'react';
import GenericPage from '../components/GenericPage';
import { Lightbulb, Globe2, Target, ShieldCheck, ArrowRight } from 'lucide-react';

const AboutUs = () => {
  return (
    <>
      <GenericPage title="About Us">
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Story: Why We Built Authentik</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>In today’s market, brands face two major challenges:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Counterfeit products damaging trust and revenue</li>
              <li>Over-dependence on marketplaces limiting direct customer relationships</li>
            </ul>
            <p>We saw brands losing control over their products, visibility into where products go, and access to their own customers. So we built Authentik. A platform that doesn’t just authenticate products — but helps brands protect, track and grow through every unit they sell.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Lightbulb size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>What We Do</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Authentik transforms every product into a secure, verifiable asset, a trackable unit across markets, a direct customer touchpoint, and a source of real-time data.
            </p>
            <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} /> Your product becomes intelligent.</div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Globe2 size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Our Vision</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              We envision a world where every product is uniquely identifiable, counterfeits are instantly detectable, brands have complete visibility, and customers can trust what they buy.
            </p>
            <div style={{ color: '#a855f7', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} /> The infrastructure for trust.</div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Target size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Our Mission</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              To empower brands with control and intelligence. We help brands protect their products, track movement, build direct relationships, and make data-driven decisions.
            </p>
            <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} /> Control and Intelligence.</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Built for Real-World Execution</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>Backed by Recomm Innovations Private Limited, we focus on scalable, practical solutions.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><ShieldCheck color="var(--accent-color)" size={20} /> Easy to start</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><ShieldCheck color="var(--accent-color)" size={20} /> Fast to deploy</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><ShieldCheck color="var(--accent-color)" size={20} /> Built to scale</span>
          </div>
        </div>
      </GenericPage>
    </>
  );
};

export default AboutUs;
