import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Star, EyeOff, Smartphone, Award, Repeat, Lock } from 'lucide-react';

const Fashion = () => {
    return (
        <GenericPage title="Apparel & Luxury Fashion" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Protect brand equity with invisible cryptographic signatures and NFC technology. Prove authenticity, offer Digital Product Passports, and unlock exclusive post-purchase experiences.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/track_trace_map.png" 
                        alt="Luxury Supply Chain Tracking" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Elevate the Brand Experience</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <EyeOff size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Invisible Signatures</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Maintain your aesthetic. Our AI-generated cryptographic watermarks can be woven into fabric or embedded in packaging without altering the design.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Star size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Digital Product Passports (DPP)</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Comply with upcoming EU regulations by providing consumers with a complete digital history of the garment's origin, materials, and carbon footprint.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Award size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Certificates of Authenticity</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Upon scanning, customers receive an NFT-backed digital certificate proving ownership, protecting the secondary resale market value of your pieces.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Repeat size={32} color="#ec4899" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Circular Economy Enablement</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Facilitate repairs, recycling, and verified resale by allowing authenticators to instantly verify the item's history with a simple tap.</p>
                    </div>

                </div>
            </div>

        </GenericPage>
    );
};

export default Fashion;
