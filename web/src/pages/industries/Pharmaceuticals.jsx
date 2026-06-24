import React from 'react';
import GenericPage from '../../components/GenericPage';
import { ShieldCheck, Cross, FileText, Activity, AlertTriangle, Syringe, Database, Users } from 'lucide-react';

const Pharmaceuticals = () => {
    return (
        <GenericPage title="Pharma Track & Trace" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Secure your pharmaceutical supply chain with DSCSA and EU FMD compliant track-and-trace technology. Prevent fatal counterfeits, manage precise recalls, and ensure patient safety with end-to-end serialization.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/pharma_dashboard.png" 
                        alt="Pharmaceutical Dashboard showing pill bottle tracking" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Healthcare-Grade Compliance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <FileText size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>DSCSA & EU FMD Ready</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Out-of-the-box compliance with global serialization mandates. Automatically generate EPCIS reporting and maintain secure digital trails for FDA audits.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <AlertTriangle size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Surgical Recalls</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Identify affected batches instantly. Target recalls down to the specific pharmacy or patient, preventing widespread panic and massive financial losses.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Syringe size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Cold Chain Monitoring</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Integrate IoT sensors to track temperature excursions alongside serial numbers, ensuring vaccines and biologics remain viable upon delivery.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Users size={32} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Patient Engagement</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Allow patients to scan their medication to verify authenticity, view electronic leaflets (ePI), and set dosage reminders, improving adherence.</p>
                    </div>

                </div>
            </div>

            {/* How It Works Flow */}
            <div className="glass-card" style={{ marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>The Serialization Workflow</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[
                        { step: '01', title: 'Line-Level Aggregation', desc: 'Unique 2D DataMatrix codes are printed on individual blister packs or bottles and aggregated into secondary packaging (cartons/pallets).', icon: <Database size={24} color="var(--accent-color)" /> },
                        { step: '02', title: 'Supply Chain Interoperability', desc: 'As pallets move from manufacturer to wholesaler to dispenser, ownership is cryptographically transferred in our secure ledger.', icon: <Activity size={24} color="var(--accent-color)" /> },
                        { step: '03', title: 'Dispenser Verification', desc: `Pharmacists scan the unit before dispensing to verify it has not been flagged as recalled, stolen, or expired.`, icon: <ShieldCheck size={24} color="var(--accent-color)" /> }
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
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Impact on Pharma Operators</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>100%</div>
                        <div style={{ color: 'var(--text-secondary)' }}>DSCSA Compliance Readiness</div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>95%</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Faster Recall Execution</div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Zero</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Illicit diversions undetected</div>
                    </div>
                </div>
            </div>

        </GenericPage>
    );
};

export default Pharmaceuticals;
