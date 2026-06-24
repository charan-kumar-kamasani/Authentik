import React from 'react';
import { Layers, QrCode, Mail, Shield, CheckCircle, Truck } from 'lucide-react';

const featureData = [
  {
    icon: <Shield size={24} color="#10b981" />,
    title: 'Role-Based Workflow',
    desc: 'Distinct roles for Creators, Authorizers, and Super Admins. No single point of failure in your supply chain.'
  },
  {
    icon: <QrCode size={24} color="#3b82f6" />,
    title: 'Inactive-by-Default QRs',
    desc: 'Generated QR codes remain inactive until the final recipient officially marks the order as "Received".'
  },
  {
    icon: <Mail size={24} color="#a855f7" />,
    title: 'Automated Notifications',
    desc: 'Beautiful HTML emails automatically dispatched to stakeholders at every status transition.'
  },
  {
    icon: <Layers size={24} color="#f59e0b" />,
    title: '6-Step Tracking',
    desc: 'Pending → Authorized → Processing → Dispatching → Dispatched → Received. Total visibility.'
  },
  {
    icon: <Truck size={24} color="#ef4444" />,
    title: 'Dispatch Management',
    desc: 'Track courier names, tracking numbers, and dispatch notes directly within the centralized dashboard.'
  },
  {
    icon: <CheckCircle size={24} color="#14b8a6" />,
    title: 'Full Audit Trail',
    desc: 'A complete, timestamped history of all status changes, tracking exactly who made each transition.'
  }
];

const Features = () => {
  return (
    <section id="features" style={{ padding: '6rem 0' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in-up">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything you need. <span className="text-gradient">Nothing you don't.</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>A perfectly streamlined toolkit for managing complex product orders.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {featureData.map((feature, idx) => (
            <div 
              key={idx} 
              className={`glass-card fade-in-up delay-${(idx % 3) + 1}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
