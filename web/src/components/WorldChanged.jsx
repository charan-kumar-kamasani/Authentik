import React from 'react';
import { Smartphone, FingerprintIcon, BarChart3 } from 'lucide-react';

const shifts = [
  {
    icon: <Smartphone size={28} />,
    number: '01',
    title: 'Consumers Expect Digital Experiences',
    desc: 'Every product interaction should be digital-first. Consumers want to scan, verify, register, and engage — not just buy.'
  },
  {
    icon: <FingerprintIcon size={28} />,
    title: 'First-Party Data Is Your Most Valuable Asset',
    number: '02',
    desc: 'Privacy regulations are eliminating third-party tracking. The brands that own their consumer data will win.'
  },
  {
    icon: <BarChart3 size={28} />,
    number: '03',
    title: 'Every Product Should Be A Digital Channel',
    desc: 'Your product is already in the consumer\'s hands. Make it a persistent, measurable marketing channel.'
  }
];

const WorldChanged = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>The Shift</span>
          </div>
          <h2>The Sale Is Just <span className="text-gradient">The Beginning.</span></h2>
          <p>
            The world has changed. The brands that treat every product as a consumer
            relationship — not a transaction — will define the next decade.
          </p>
        </div>

        <div className="world-changed-grid">
          {shifts.map((shift, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                textAlign: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em'
              }}>
                {shift.number}
              </div>
              <div className="icon-box" style={{ width: 56, height: 56, borderRadius: 16 }}>
                {shift.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>{shift.title}</h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                margin: 0
              }}>
                {shift.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldChanged;
