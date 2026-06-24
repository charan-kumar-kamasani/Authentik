import React from 'react';
import GenericPage from '../components/GenericPage';
import { Factory, Sparkles, Shirt, Pill, Monitor, Wine, Rocket, ArrowRight } from 'lucide-react';

const industriesData = [
  {
      icon: Factory, title: "FMCG", sub: "High Volume. Low Visibility. High Risk.",
      challenges: ["Difficult to track product movement", "Counterfeits in local markets", "No direct connection with customers"],
      solutions: ["Unique QR for every unit", "Track scan locations across regions", "Engage customers through product scans", "Smart packaging for FMCG"],
      highlight: "Turn high-volume sales into actionable insights"
  },
  {
      icon: Sparkles, title: "Cosmetics & Personal Care", sub: "Trust is Everything",
      challenges: ["Fake products damage brand reputation", "Customers unsure about authenticity", "Heavy dependency on marketplaces"],
      solutions: ["Instant cosmetic product verification", "Build customer confidence", "Drive traffic to your own platform", "Fake cosmetics prevention"],
      highlight: "Protect your brand and build loyalty"
  },
  {
      icon: Shirt, title: "Apparel & Fashion", sub: "Brand Value at Risk",
      challenges: ["Fake fashion products in the market", "Luxury product authentication needs", "Limited visibility post-sale"],
      solutions: ["Unique identity for each product", "Post-purchase engagement via apparel qr authentication", "Customer data collection"],
      highlight: "Extend your brand experience beyond purchase"
  },
  {
      icon: Pill, title: "Pharma & Healthcare", sub: "Safety and Authenticity Are Critical",
      challenges: ["Fake medicines pose serious risks", "Strict compliance and traceability needs", "Limited end-user verification"],
      solutions: ["Unit-level authentication", "Batch tracking and monitoring", "Customer-level verification"],
      highlight: "Ensure safety and compliance at scale"
  },
  {
      icon: Monitor, title: "Electronics & Consumer Goods", sub: "High Value. High Counterfeit Risk.",
      challenges: ["Fake or refurbished products sold as new", "Electronic product authentication needs", "Fake electronics prevention"],
      solutions: ["Secure product verification", "Link QR to warranty registration", "Track product journey"],
      highlight: "Protect revenue and customer trust"
  },
  {
      icon: Wine, title: "Alcohol & Premium Products", sub: "Regulated and High-Risk Market",
      challenges: ["Counterfeit products in circulation", "Strict compliance requirements", "Need for track-and-trace"],
      solutions: ["Secure labeling with scratch layer", "Track distribution channels", "Detect anomalies quickly"],
      highlight: "Bring transparency to a regulated industry"
  },
  {
      icon: Rocket, title: "D2C & Startup Brands", sub: "Growth Without Dependency",
      challenges: ["Heavy reliance on marketplaces", "High commission margins", "No direct customer relationship"],
      solutions: ["Drive customers to your own website", "Offer coupons and rewards via scan", "Build your own customer database"],
      highlight: "Turn products into your marketing channel",
  }
];

const Industries = () => {
  return (
    <>
      {/* Header and Layout Handled by GenericPage or we can build custom */}
      <GenericPage title="Industry Solutions">
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '3rem', textAlign: 'center' }}>
          If you sell physical products, Authentik is built for you. We provide specialized anti-counterfeit solutions tailored to your unique challenges.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {industriesData.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div key={i} className="glass-card fade-in-up" style={{ display: 'flex', flexDirection: 'column', animationDelay: `${(i % 3) * 0.1}s` }}>
                <div style={{ 
                  width: '56px', height: '56px', 
                  borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.5rem', color: 'var(--accent-color)'
                }}>
                  <Icon size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{ind.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--accent-color)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  {ind.sub}
                </p>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Challenges</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ind.challenges.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#ef4444' }}>•</span> {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>How Authentik Helps</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ind.solutions.map((s, j) => (
                        <li key={j} style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#10b981' }}>✓</span> {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', color: 'var(--accent-color)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={16} /> {ind.highlight}
                </div>
              </div>
            );
          })}
        </div>
      </GenericPage>
    </>
  );
};

export default Industries;
