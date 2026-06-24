import React from 'react';
import GenericPage from '../../components/GenericPage';
import { ShoppingCart, QrCode, TrendingUp, Users, Target, Smartphone } from 'lucide-react';

const FMCG = () => {
    return (
        <GenericPage title="FMCG & Retail Solutions" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Turn every product scan into a direct consumer relationship. Protect high-volume consumer goods from counterfeiting while capturing zero-party data through gamified loyalty experiences.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/fmcg_scan.png" 
                        alt="Consumer scanning a QR code on premium chocolate" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>High-Volume Brand Protection</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <QrCode size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Low-Cost Serialization</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Deploy our secure tags at mass scale. Our printing partners integrate cryptographic QR codes directly into your existing packaging lines with zero disruption.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Smartphone size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Frictionless Scanning</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Consumers verify authenticity using their native phone camera—no app required. Ensure your brand is protected at the exact moment of consumption.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Users size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Zero-Party Data Capture</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Incentivize scans with rewards to build a massive first-party database. Understand exactly who is buying your products, when, and where.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Target size={32} color="#ec4899" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Cross-Selling Engine</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Use the post-scan experience to recommend complementary products, offer discount codes for future purchases, and drive direct-to-consumer sales.</p>
                    </div>

                </div>
            </div>

        </GenericPage>
    );
};

export default FMCG;
