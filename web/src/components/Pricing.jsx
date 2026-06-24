import React from 'react';

const plans = [
  {
    name: "Starter",
    price: "$49",
    features: ["Up to 1,000 QRs/mo", "Basic Roles", "Email Notifications", "Standard Support"],
    recommended: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited QRs", "Advanced RBAC", "Custom API Access", "24/7 Dedicated Support"],
    recommended: true
  }
];

const Pricing = () => {
  return (
    <section style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in-up">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simple, <span className="text-gradient">transparent</span> pricing</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Scale your supply chain security without breaking the bank.</p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {plans.map((plan, idx) => (
            <div key={idx} className="glass-card fade-in-up delay-1" style={{
              width: '100%',
              maxWidth: '350px',
              border: plan.recommended ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--glass-border)',
              boxShadow: plan.recommended ? '0 0 30px rgba(16, 185, 129, 0.1)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {plan.recommended && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%',
                  background: 'var(--accent-color)', color: '#000',
                  textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold',
                  padding: '0.25rem 0'
                }}>RECOMMENDED</div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginTop: plan.recommended ? '1rem' : '0' }}>{plan.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', margin: '1rem 0' }}>
                {plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button className={plan.recommended ? "btn btn-primary" : "btn btn-glass"} style={{ width: '100%' }}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
