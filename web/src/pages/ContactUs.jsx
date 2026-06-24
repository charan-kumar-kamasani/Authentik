import React from 'react';
import GenericPage from '../components/GenericPage';
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

const ContactUs = () => {
  return (
    <GenericPage title="Let's Secure Your Brand's Future">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* Left Form */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tell us about your brand</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Fields marked with * are mandatory.</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Full Name *</label>
                <input type="text" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input type="tel" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="+91 12345 67890" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Work Email</label>
                <input type="email" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="name@brand.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Company Name</label>
                <input type="text" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="Google Inc." />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Tell us what you need</label>
              <textarea rows="4" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', resize: 'vertical' }} placeholder="Product volume, timeline, specific pain points..."></textarea>
            </div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', width: '100%' }}>Send Inquiry</button>
          </form>
        </div>

        {/* Right Info */}
        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Connect with Experts</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We're here to help you secure your brand.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Mail size={20} />
             </div>
             <div>
               <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>Email Inquiry</div>
               <div style={{ fontWeight: 600 }}>support@authentiks.in</div>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Phone size={20} />
             </div>
             <div>
               <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>WhatsApp Tech</div>
               <div style={{ fontWeight: 600 }}>+91 93425 01819</div>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <MapPin size={20} />
             </div>
             <div>
               <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>Our HQ</div>
               <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Recomm Innovations Pvt. Ltd.<br/>Chennai, TN 600102</div>
             </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '1rem' }}>Why Brands Choose Us</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent-color)" /> Personalized demo within 24 hours</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent-color)" /> Volume-based pricing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent-color)" /> Instant dashboard onboarding</li>
            </ul>
          </div>
        </div>

      </div>
    </GenericPage>
  );
};

export default ContactUs;
