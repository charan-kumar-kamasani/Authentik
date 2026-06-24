import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Route, Map, Box, Activity, AlertTriangle, Layers, Navigation, Network } from 'lucide-react';

const TrackAndTrace = () => {
    return (
        <GenericPage title="Supply Chain Track & Trace" narrow={false}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Achieve unprecedented visibility across your entire logistics network. Trace products from the manufacturing floor to the consumer's hands, stop gray-market diversion, and execute surgical recalls with surgical precision.
                </p>
                <div className="glass-card" style={{ padding: '0.5rem', display: 'inline-block', borderRadius: '32px' }}>
                    <img 
                        src="/assets/track_trace_map.png" 
                        alt="Authentik Track and Trace Global Map Dashboard" 
                        style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '24px', display: 'block' }} 
                    />
                </div>
            </div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Total Visibility Architecture</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Layers size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Granular Serialization</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Assign unique cryptographic identities to individual items, cartons, and pallets. Create parent-child aggregation hierarchies for rapid bulk scanning at warehouses.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <AlertTriangle size={32} color="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Diversion Alerts</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Ensure products stay in their intended markets. Set geofences for specific SKUs. If a product meant for Europe is scanned in Asia, the system triggers an immediate alert.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Activity size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Surgical Recalls</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Eliminate the nightmare of blind mass recalls. Instantly identify the exact location of affected batches—whether in transit, at a retailer, or with a consumer—and notify them directly.</p>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                <Network size={32} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>ERP Integration</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Connects seamlessly with SAP, Oracle, and Microsoft Dynamics via our secure API. Synchronize production data, dispatch orders, and inventory states automatically.</p>
                    </div>

                </div>
            </div>

            {/* How It Works Flow */}
            <div className="glass-card" style={{ marginBottom: '6rem', padding: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>The Journey of a Serialized Product</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[
                        { step: '01', title: 'Commissioning', desc: 'At the factory, items are tagged and aggregated into cartons and pallets. The data is uploaded to the Authentik cloud ledger.', icon: <Box size={24} color="var(--accent-color)" /> },
                        { step: '02', title: 'Transit Logging', desc: 'As goods move through customs and regional distribution centers, handlers scan the parent pallet code to update the location of all nested items.', icon: <Navigation size={24} color="var(--accent-color)" /> },
                        { step: '03', title: 'Retail De-aggregation', desc: 'When goods reach the retail shelf, the carton is opened (de-aggregated). The individual items are now active for consumer purchase.', icon: <Map size={24} color="var(--accent-color)" /> },
                        { step: '04', title: 'End-of-Life', desc: 'A consumer scans the product, transferring ownership and marking the item as "Sold". If the item is scanned again at a different store, it flags as suspicious.', icon: <Route size={24} color="var(--accent-color)" /> }
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

export default TrackAndTrace;
