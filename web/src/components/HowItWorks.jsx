import React from 'react';
import { ShieldCheck, UserCheck, FileCheck, BookOpen, Gift, Heart, BarChart3, ShoppingCart, Infinity } from 'lucide-react';

const steps = [
  { icon: <ShieldCheck size={20} />, title: 'Authenticate', desc: 'Instant product verification builds consumer trust' },
  { icon: <UserCheck size={20} />, title: 'Register Consumer', desc: 'Capture first-party consumer profile and preferences' },
  { icon: <FileCheck size={20} />, title: 'Activate Warranty', desc: 'Seamless digital warranty registration' },
  { icon: <BookOpen size={20} />, title: 'Deliver Product Info', desc: 'Rich product content and usage guidance' },
  { icon: <Gift size={20} />, title: 'Rewards', desc: 'Personalized offers and incentives' },
  { icon: <Heart size={20} />, title: 'Loyalty', desc: 'Points, tiers, and exclusive experiences' },
  { icon: <BarChart3 size={20} />, title: 'Consumer Insights', desc: 'Behavioral data and engagement analytics' },
  { icon: <ShoppingCart size={20} />, title: 'Repeat Purchase', desc: 'Data-driven re-engagement and cross-sell' },
  { icon: <Infinity size={20} />, title: 'Lifetime Relationship', desc: 'From one-time buyer to brand advocate' },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section" style={{ padding: '7rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>How It Works</span>
          </div>
          <h2>Every Scan Creates <span className="text-gradient">Business Value.</span></h2>
          <p>
            A single consumer interaction unlocks an entire lifecycle of engagement,
            data collection, and revenue generation.
          </p>
        </div>

        <div className="journey-flow">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="journey-step">
                <div className="step-icon">
                  {step.icon}
                </div>
                <div>
                  <div className="step-text" style={{ color: 'var(--text-primary)' }}>{step.title}</div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.15rem'
                  }}>
                    {step.desc}
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="journey-connector" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
