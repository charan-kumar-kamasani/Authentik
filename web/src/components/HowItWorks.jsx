import React from 'react';
import { FileText, UserCheck, Settings, Package, Truck, CheckCircle } from 'lucide-react';

const steps = [
  { icon: <FileText size={20} />, title: "1. Order Created", desc: "Creator drafts the initial order (Pending)." },
  { icon: <UserCheck size={20} />, title: "2. Authorized", desc: "Authorizer approves the order details." },
  { icon: <Settings size={20} />, title: "3. Processing", desc: "QRs generated (Inactive state)." },
  { icon: <Package size={20} />, title: "4. Dispatching", desc: "Super Admin prepares for shipment." },
  { icon: <Truck size={20} />, title: "5. Dispatched", desc: "In transit with tracking info." },
  { icon: <CheckCircle size={20} />, title: "6. Received", desc: "Marked received. QRs Activated." },
];

const HowItWorks = () => {
  return (
    <section style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in-up">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>The <span className="text-gradient">6-Step</span> Security Workflow</h2>
          <p style={{ color: 'var(--text-secondary)' }}>A bulletproof process ensuring total control from creation to final receipt.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {steps.map((step, idx) => (
            <div key={idx} className={`fade-in-up delay-${(idx % 3) + 1}`} style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'var(--glass-blur)',
              position: 'relative'
            }}>
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-color)',
                marginBottom: '1rem'
              }}>
                {step.icon}
              </div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{step.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
