import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Gift, Star, Users, TrendingUp, Smartphone, Award, Zap, ShieldCheck } from 'lucide-react';

const ConsumerLoyalty = () => {
    return (
        <GenericPage title="Gamified Consumer Loyalty" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Turn every product scan into a magical brand moment. Reward consumers for purchasing genuine products, capture critical zero-party data, and increase repeat purchases by up to 40% with our gamified engine.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '0.5rem', borderRadius: '40px', maxWidth: '300px' }}>
                        <img 
                            src="/assets/loyalty_mobile_app.png" 
                            alt="Authentik Rewards Mobile App showing a spin wheel" 
                            style={{ width: '100%', height: 'auto', borderRadius: '32px', display: 'block' }} 
                        />
                    </div>
                    
                    <div style={{ maxWidth: '400px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Build a Direct-to-Consumer Engine overnight.</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Stop relying solely on retailers for customer data. Our scan-and-win modules let you build your own CRM organically.</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Zap size={20} color="var(--accent-color)" />
                                <span>Deploy in days, not months</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Zap size={20} color="var(--accent-color)" />
                                <span>No app downloads required for users</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Zap size={20} color="var(--accent-color)" />
                                <span>Integrates with your existing CRM</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Loyalty that Actually Works</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Star size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Gamified Engagement</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Move beyond boring points systems. Let users play digital scratch cards, spin-the-wheel, and unlock mystery boxes right in their browser after scanning.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Gift size={32} color="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Dynamic Reward Engine</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Configure instant cashback via UPI, Amazon vouchers, brand discount codes, or physical merch. Adjust reward probabilities in real-time based on campaign goals.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Users size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Referral Multipliers</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Turn your best customers into influencers. Issue unique referral links inside the loyalty portal that grant bonus points to both parties upon successful purchase verification.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <TrendingUp size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Deep Analytics</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Track redemption rates, geographic engagement heatmaps, and customer lifetime value. Know exactly which marketing campaigns are driving actual offline sales.</p>
                    </div>

                </div>
            </div>

            {/* How It Works Flow */}
            <div className="glass-card" style={{ marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>The Seamless User Journey</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[
                        { step: '01', title: 'Purchase & Scan', desc: 'The consumer buys your product and scans the secure QR code using any standard smartphone camera. No app download is required.', icon: <Smartphone size={24} color="var(--accent-color)" /> },
                        { step: '02', title: 'Verify & Register', desc: 'The system instantly authenticates the product. The user is prompted to enter their phone number and verify via OTP to claim their reward.', icon: <ShieldCheck size={24} color="var(--accent-color)" /> },
                        { step: '03', title: 'Play to Win', desc: 'The user is presented with a highly branded, interactive gamification screen (e.g., a digital scratch card) revealing their prize.', icon: <Gift size={24} color="var(--accent-color)" /> },
                        { step: '04', title: 'Redeem & Repeat', desc: `Rewards are instantly deposited to the user's digital wallet or sent via SMS. They are incentivized to buy again to increase their loyalty tier.`, icon: <Award size={24} color="var(--accent-color)" /> }
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

export default ConsumerLoyalty;
