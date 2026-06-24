import React from 'react';
import GenericPage from '../../components/GenericPage';
import { ShieldCheck, Fingerprint, Search, Lock, Activity, Globe, Cpu, Database } from 'lucide-react';

const AntiCounterfeit = () => {
    return (
        <GenericPage title="AI-Powered Anti-Counterfeiting" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Protect your brand equity and consumer trust with military-grade, non-clonable QR codes. Detect and eliminate fake products instantly across your global supply chain using real-time AI threat mapping.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/anti_counterfeit_dash.png" 
                        alt="Authentik Dashboard showing real-time threat map" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Enterprise-Grade Protection</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Lock size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Non-Clonable QR Tags</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Our patented dual-layer QR codes use physical unclonable function (PUF) technology. Even if a counterfeiter copies the pattern, our AI detects the missing physical fingerprint.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Globe size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Global Heatmaps</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Visualize exactly where fake scans are originating worldwide. Our real-time dashboard pinpoints illicit manufacturing hubs and distribution bottlenecks.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Cpu size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>AI Anomaly Detection</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Machine learning algorithms analyze scan velocity, IP addresses, and GPS data to automatically flag suspicious batch movements before they reach shelves.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Fingerprint size={32} color="#ec4899" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Instant Consumer Verification</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Empower your customers to verify authenticity in milliseconds with a native smartphone camera. No app download required, maximizing engagement rates.</p>
                    </div>

                </div>
            </div>

            {/* How It Works Flow */}
            <div className="glass-card" style={{ marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>How the Workflow Operates</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[
                        { step: '01', title: 'Secure Tagging at Source', desc: 'Cryptographically secure QR codes are printed directly on your product packaging during manufacturing. Each item receives a unique digital twin.', icon: <Database size={24} color="var(--accent-color)" /> },
                        { step: '02', title: 'Supply Chain Activation', desc: 'As products move through distribution, authorized partners scan bulk cartons to activate the items and update the chain of custody.', icon: <Activity size={24} color="var(--accent-color)" /> },
                        { step: '03', title: 'Consumer Authentication', desc: `The end consumer scans the product. The system checks the digital twin's status. If a duplicate is detected, the consumer is warned and the incident is logged.`, icon: <ShieldCheck size={24} color="var(--accent-color)" /> },
                        { step: '04', title: 'Actionable Intelligence', desc: 'Your brand protection team receives instant alerts of counterfeit clusters, enabling targeted legal action and supply chain optimization.', icon: <Search size={24} color="var(--accent-color)" /> }
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

            {/* ROI Metrics */}
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Proven Business Impact</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>87%</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Reduction in Counterfeiting within 6 months</div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>10x</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Higher consumer engagement vs legacy holograms</div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#8b5cf6', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>$4M+</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Revenue recovered by a single client in Y1</div>
                    </div>
                </div>
            </div>

        </GenericPage>
    );
};

export default AntiCounterfeit;
