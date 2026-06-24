import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Handshake, BarChart3, Wallet, Target, CreditCard, ShieldCheck } from 'lucide-react';

const ChannelLoyalty = () => {
    return (
        <GenericPage title="Channel & Retailer Loyalty" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Incentivize your retailers, distributors, and channel partners to push your products harder. Build a thriving, fraud-resistant B2B loyalty ecosystem that drives measurable sales uplift.
                </p>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>B2B Growth Engine</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Handshake size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Verified Partner Onboarding</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Onboard retailers and distributors seamlessly via QR. Build a verified database of your secondary and tertiary sales networks with geo-tagged profiles and KYC integration.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Wallet size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Flexible Reward Logic</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Configure points or cashback per SKU, per region, or per partner tier. Run time-bound multiplier campaigns to accelerate slow-moving inventory.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <ShieldCheck size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Anti-Fraud Controls</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Stop reward leakage. Our system prevents double-scanning, geofence spoofing, and ghost retailer claims, ensuring your budget actually drives sales.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <CreditCard size={32} color="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Instant Payouts</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Keep partners motivated with instant gratification. Seamless integrations with UPI, NEFT, and digital wallets allow retailers to encash points instantly directly to their bank.</p>
                    </div>

                </div>
            </div>

            {/* Benefits Grid */}
            <div className="glass-card" style={{ textAlign: 'center', marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Why Brands Upgrade to Authentik B2B</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>35% Sales Uplift</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Brands using channel loyalty see measurable growth in partner-driven sales within 3 months.</p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>100% Budget Efficiency</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>QR-based scans eliminate duplicate claims and ghost retailers from your reward budget.</p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Deep ERP Integration</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Connect with SAP, Tally, and custom ERPs to sync inventory, billing, and reward data effortlessly.</p>
                    </div>
                </div>
            </div>

        </GenericPage>
    );
};

export default ChannelLoyalty;
