import React from 'react';
import GenericPage from '../../components/GenericPage';
import { FileCheck, Smartphone, Clock, Database, UploadCloud, Bell, Shield } from 'lucide-react';

const DigitalWarranty = () => {
    return (
        <GenericPage title="Digital Warranty Management" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Eliminate paper warranty cards. Offer a seamless 1-click paperless warranty registration that boosts onboarding rates by up to 10x while effortlessly building a robust first-party database of your end users.
                </p>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Streamline Your Service</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Smartphone size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>1-Click Registration</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Consumers simply scan the product QR code, enter their phone number via OTP, and their warranty is active. No long forms, no app downloads, no friction.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <UploadCloud size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Paperless Claims</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Say goodbye to lost receipts. Consumers can initiate warranty claims digitally by uploading photos, and service centers can verify product status instantly.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Database size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>First-Party Data Mining</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Build your CRM organically. Every warranty registration gives you direct access to the actual person using your product, enabling highly targeted cross-selling.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Bell size={32} color="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Automated Reminders</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Send automated WhatsApp or SMS reminders to consumers when their warranty is about to expire, prompting them to purchase extended care packages.</p>
                    </div>

                </div>
            </div>

            {/* How It Works Flow */}
            <div className="glass-card" style={{ marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>The Digital Service Workflow</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[
                        { step: '01', title: 'Product Scan', desc: 'The consumer unboxes the product and scans the secure QR code using their camera.', icon: <Smartphone size={24} color="var(--accent-color)" /> },
                        { step: '02', title: 'Authentication', desc: 'The system verifies the product is genuine and checks if it has been registered before.', icon: <Shield size={24} color="var(--accent-color)" /> },
                        { step: '03', title: 'Data Capture', desc: 'The user enters their details or authenticates via Google/WhatsApp. The purchase date is logged automatically.', icon: <Database size={24} color="var(--accent-color)" /> },
                        { step: '04', title: 'Digital Certificate', desc: 'A digital warranty certificate is generated and stored in the cloud. The user receives a confirmation message with a link to their digital receipt.', icon: <FileCheck size={24} color="var(--accent-color)" /> }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ 
                                fontSize: '2rem', 
                                fontWeight: 700, 
                                fontFamily: 'var(--font-display)',
                                color: 'rgba(255,255,255,0.1)',
                                WebkitTextStroke: '1px var(--accent-color)'
                            }}>
                                {item.step}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    {item.icon}
                                    <h4 style={{ fontSize: '1.25rem' }}>{item.title}</h4>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </GenericPage>
    );
};

export default DigitalWarranty;
