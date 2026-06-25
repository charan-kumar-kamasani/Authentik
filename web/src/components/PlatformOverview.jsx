import React from 'react';
import { Link2, UserPlus, Shield, Sparkles, Heart, ShoppingBag } from 'lucide-react';

const capabilities = [
  {
    icon: <Link2 size={22} />,
    title: 'Build Direct Consumer Relationships',
    desc: 'Turn every product into a direct communication channel. No intermediaries, no middlemen.'
  },
  {
    icon: <UserPlus size={22} />,
    title: 'Collect First-Party Consumer Data',
    desc: 'Capture consumer profiles, preferences, and behavior at the point of product interaction.'
  },
  {
    icon: <Shield size={22} />,
    title: 'Protect Against Counterfeits',
    desc: 'Give consumers instant product verification. Eliminate fakes before they erode your brand.'
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Activate Digital Warranties',
    desc: 'Replace paper warranties with seamless digital registration that drives engagement.'
  },
  {
    icon: <Heart size={22} />,
    title: 'Deliver Personalized Experiences',
    desc: 'Product content, loyalty rewards, and tailored communications — all through the product itself.'
  },
  {
    icon: <ShoppingBag size={22} />,
    title: 'Drive Repeat Purchases',
    desc: 'Convert one-time buyers into lifetime customers with data-driven post-purchase journeys.'
  }
];

const PlatformOverview = () => {
  return (
    <section className="section" style={{ padding: '7rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>The Platform</span>
          </div>
          <h2>One Platform. Every Product. <span className="text-gradient">Every Consumer.</span></h2>
          <p>
            Authentiks creates a digital layer between your brand and every consumer
            who interacts with your products — turning transactions into relationships.
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div className="icon-box">
                {cap.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>{cap.title}</h3>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.7,
                margin: 0
              }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformOverview;
