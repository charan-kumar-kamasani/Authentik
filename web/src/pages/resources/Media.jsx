import React from 'react';
import GenericPage from '../../components/GenericPage';

const Media = () => {
    return (
        <GenericPage title="Press & Media Mentions" narrow={false}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
                    Authentik is making headlines as the leading innovator in supply chain security and AI-driven brand protection.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[
                    { outlet: "TechCrunch", title: "Authentik Raises $25M Series B to Eradicate Counterfeit Drugs", date: "Nov 2023", logo: "TC" },
                    { outlet: "Forbes", title: "How AI is Finally Fixing The Global Supply Chain Crisis", date: "Oct 2023", logo: "F" },
                    { outlet: "Vogue Business", title: "Luxury Brands Turn to Invisible Digital Signatures to Fight Fakes", date: "Aug 2023", logo: "VB" },
                    { outlet: "Supply Chain Dive", title: "Why Legacy Holograms Are Dead: The Rise of Cryptographic Tags", date: "Jul 2023", logo: "SCD" },
                ].map((item, i) => (
                    <div key={i} className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ 
                            width: '60px', height: '60px', 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '12px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {item.logo}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', flex: 1, lineHeight: 1.4 }}>"{item.title}"</h3>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.outlet}</span> • {item.date}
                        </div>
                    </div>
                ))}
            </div>

            {/* Press Kit Download */}
            <div className="glass-card" style={{ marginTop: '5rem', padding: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 5, 5, 0.5))' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Media Assets</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Need logos, executive headshots, or product mockups for your story? Download our official press kit.
                </p>
                <button className="btn btn-secondary">Download Press Kit (.ZIP)</button>
            </div>

        </GenericPage>
    );
};

export default Media;
