import React from 'react';
import { Lock, Server, Globe, Clock } from 'lucide-react';

const securityFeatures = [
  {
    icon: <Lock size={22} />,
    title: 'End-to-End Encryption',
    desc: 'All consumer data is encrypted in transit and at rest. Your brand data never leaves secure infrastructure.'
  },
  {
    icon: <Server size={22} />,
    title: 'SOC 2 Compliant Infrastructure',
    desc: 'Enterprise-grade security controls, audit logging, and compliance frameworks built from the ground up.'
  },
  {
    icon: <Globe size={22} />,
    title: 'GDPR-Ready Data Handling',
    desc: 'Privacy-first architecture with consent management, data portability, and right-to-delete compliance.'
  },
  {
    icon: <Clock size={22} />,
    title: '99.9% Uptime SLA',
    desc: 'Globally distributed infrastructure ensures your connected products are always available, everywhere.'
  }
];

const SecuritySection = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>Security</span>
          </div>
          <h2>Enterprise Security. <span className="text-gradient">Built In.</span></h2>
          <p>
            Your brand's reputation depends on trust. Authentiks is built with
            security at every layer.
          </p>
        </div>

        <div className="security-grid">
          {securityFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}
            >
              <div className="icon-box">
                {feature.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
