import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Network, Fingerprint, Lock, ShieldCheck, Database, Zap } from 'lucide-react';

const Technology = () => {
    return (
        <GenericPage title="Our Deep Tech Advantage" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    We do not rely on easily-cloned QR codes or legacy holograms. Authentik is powered by a proprietary stack of Invisible AI Signatures, Physical Unclonable Functions (PUF), and an immutable Blockchain Ledger.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" 
                        alt="Cybersecurity Technology Concept" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Tech Stack */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>The Tri-Layer Security Protocol</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    
                    {/* Layer 1 */}
                    <div className="glass-card tech-layer-card" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                    <Fingerprint size={32} color="var(--accent-color)" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem' }}>Layer 1: Invisible AI Signatures & PUF</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                A standard QR code is just data—it can be photocopied. Authentik utilizes Physical Unclonable Functions (PUF). During printing, microscopic, random variations occur in the ink distribution. Our AI maps these variations, creating a unique "fingerprint" for every single label.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Even if a counterfeiter uses a high-res scanner to copy the QR pattern, they cannot replicate the random microscopic ink scattering. When a smartphone scans the fake, the AI detects the missing fingerprint instantly.
                            </p>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <img src="/assets/tech_layer1.png" alt="Microscopic Ink Pattern" style={{ borderRadius: '16px', maxWidth: '100%' }} />
                        </div>
                    </div>

                    {/* Layer 2 */}
                    <div className="glass-card tech-layer-card reverse" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                    <Zap size={32} color="#3b82f6" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem' }}>Layer 2: Real-Time Anomaly Engine</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                The moment a product is scanned, our cloud-native machine learning engine analyzes dozens of data points in under 200 milliseconds. 
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                                <li><strong>Velocity Checks:</strong> Is this same serial number being scanned in London and Tokyo within 5 minutes? (Impossible velocity flag).</li>
                                <li><strong>Device Fingerprinting:</strong> Is the scan coming from a known emulator or click-farm device?</li>
                                <li><strong>Geographic Routing:</strong> Was this batch intended for Latin America but scanned in Europe? (Gray market flag).</li>
                            </ul>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <img src="/assets/tech_layer2.png" alt="Data Analytics" style={{ borderRadius: '16px', maxWidth: '100%' }} />
                        </div>
                    </div>

                    {/* Layer 3 */}
                    <div className="glass-card tech-layer-card" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                    <Database size={32} color="#8b5cf6" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem' }}>Layer 3: Immutable Blockchain Ledger</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                To ensure absolute chain-of-custody integrity, every state change—from manufacturing to consumer scan—is written to an enterprise-grade private blockchain ledger.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                This guarantees that historical scan data cannot be tampered with by bad actors within the supply chain, providing a legally defensible audit trail for regulatory bodies (like the FDA) and law enforcement.
                            </p>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <img src="/assets/tech_layer3.png" alt="Blockchain Tech" style={{ borderRadius: '16px', maxWidth: '100%' }} />
                        </div>
                    </div>

                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Experience the Tech</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Book a technical deep-dive with our engineering team to see the anomaly engine in action.</p>
                <a href="/live-demo" className="btn btn-primary">Schedule Demo</a>
            </div>

        </GenericPage>
    );
};

export default Technology;
