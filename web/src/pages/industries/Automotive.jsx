import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Wrench, MapPin, CheckCircle, Package, Shield, Settings } from 'lucide-react';

const Automotive = () => {
    return (
        <GenericPage title="Automotive & Spare Parts" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Eradicate counterfeit spare parts that endanger lives. Empower mechanics to verify components instantly while activating digital warranties and tracking gray market diversion.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/auto_part_scan.png" 
                        alt="Mechanic scanning a turbocharger part" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Secure the Aftermarket</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Shield size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Industrial-Grade Tags</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Our non-clonable QR codes and invisible laser etchings withstand high heat, grease, and extreme environments under the hood.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Wrench size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Mechanic Loyalty</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Reward mechanics for scanning genuine parts. Build a direct relationship with the installers who recommend your brand to end consumers.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Settings size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Digital Warranties</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Eliminate paper receipts. The scan activates an immutable, blockchain-backed warranty tied directly to the vehicle's VIN or the consumer's wallet.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <MapPin size={32} color="#ec4899" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Gray Market Detection</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Track parts intended for one region that are sold in another. Our AI flags geographical anomalies to protect your authorized dealer network.</p>
                    </div>

                </div>
            </div>

        </GenericPage>
    );
};

export default Automotive;
