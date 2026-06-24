import React from 'react';
import GenericPage from '../../components/GenericPage';
import { TrendingUp, Shield, Users } from 'lucide-react';

const CaseStudies = () => {
    return (
        <GenericPage title="Customer Success Stories" narrow={false}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
                    See how enterprise leaders across pharmaceuticals, FMCG, and luxury fashion are using Authentik to secure their supply chains and drive massive ROI.
                </p>
            </div>

            {/* Global Pharma Case Study */}
            <div className="glass-card" style={{ marginBottom: '4rem', padding: '3rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ color: 'var(--accent-color)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>Pharmaceuticals</div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Top 10 Global Pharma Brand Eliminates Gray Market Diversion</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                            Facing immense revenue loss from distributors selling discounted regional drugs into premium markets, this pharmaceutical giant deployed Authentik's serialized QR codes across 40 million units.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-display)' }}>$12M</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Revenue Recovered (Y1)</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-display)' }}>100%</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Visibility of Supply Chain</div>
                            </div>
                        </div>
                        <button className="btn btn-primary">Download Full PDF</button>
                    </div>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80" alt="Pharma Factory" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>
            </div>

            {/* CPG Loyalty Case Study */}
            <div className="glass-card" style={{ marginBottom: '4rem', padding: '3rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ color: '#8b5cf6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>FMCG / Retail</div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>National Beverage Brand Acquires 2.5M First-Party Profiles</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                            A major beverage company used Authentik to replace their legacy sticker-based loyalty program. By printing unique QR codes under the cap, they turned every product into an interactive scratch-to-win game.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6', fontFamily: 'var(--font-display)' }}>42%</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Scan & Engagement Rate</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ec4899', fontFamily: 'var(--font-display)' }}>2.5M</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>New User Profiles Captured</div>
                            </div>
                        </div>
                        <button className="btn btn-primary">Download Full PDF</button>
                    </div>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <img src="https://images.unsplash.com/photo-1556767576-5ec41e3239ea?auto=format&fit=crop&w=600&q=80" alt="Consumer Retail" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>
            </div>

        </GenericPage>
    );
};

export default CaseStudies;
