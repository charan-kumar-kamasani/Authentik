import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GenericPage from '../components/GenericPage';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

// Demo QR Images
import authenticImg from '../assets/demo_qrs/authentic.jpg';
import alertImg from '../assets/demo_qrs/alert.jpg';
import fraudImg from '../assets/demo_qrs/fraud.jpg';

// Map Focus Component
function MapFocus({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const mapMarkers = [
    { coords: [19.0760, 72.8777], type: 'AUTHENTIC', location: 'Mumbai, IN', time: 'Just now', device: 'iPhone 15 Pro', color: '#10b981', radius: 10 },
    { coords: [28.6139, 77.2090], type: 'SUSPICIOUS', location: 'Delhi, IN', time: '5m ago', device: 'Android 14', color: '#ef4444', radius: 12 },
    { coords: [12.9716, 77.5946], type: 'DUPLICATE', location: 'Bangalore, IN', time: '12m ago', device: 'iPhone 13', color: '#f59e0b', radius: 8 },
    { coords: [17.3850, 78.4867], type: 'AUTHENTIC', location: 'Hyderabad, IN', time: '15m ago', device: 'Pixel 8', color: '#10b981', radius: 9 },
    { coords: [22.5726, 88.3639], type: 'AUTHENTIC', location: 'Kolkata, IN', time: '20m ago', device: 'Samsung S24', color: '#10b981', radius: 7 },
    { coords: [13.0827, 80.2707], type: 'SUSPICIOUS', location: 'Chennai, IN', time: '25m ago', device: 'iPhone 12', color: '#ef4444', radius: 14 }
];

const LiveDemo = () => {
    const [selectedMapFilter, setSelectedMapFilter] = useState('ALL');

    const filteredMarkers = useMemo(() => {
        if (selectedMapFilter === 'ALL') return mapMarkers;
        return mapMarkers.filter(m => m.type === selectedMapFilter);
    }, [selectedMapFilter]);

    return (
        <>
            <GenericPage title="Live Interactive Demo">
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '3rem', textAlign: 'center' }}>
                    Experience the 6-step workflow firsthand. Below are example scans representing Genuine, Duplicate, and Fake detections.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    
                    {/* Genuine */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <div style={{ background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <img src={authenticImg} alt="Genuine QR" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Genuine</div>
                        </div>
                        <div style={{ padding: '1.5rem', flexGrow: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Genuine Product</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Experience the seamless verification and customer reward capture flow.</p>
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>
                                <CheckCircle2 size={14} /> First-time Scan
                            </div>
                        </div>
                    </div>

                    {/* Duplicate */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                        <div style={{ background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <img src={alertImg} alt="Duplicate QR" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duplicate</div>
                        </div>
                        <div style={{ padding: '1.5rem', flexGrow: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Duplicate Scan</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>See how we instantly warn consumers if a QR code has already been scanned previously.</p>
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                <AlertTriangle size={14} /> Already Verified
                            </div>
                        </div>
                    </div>

                    {/* Fake */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <img src={fraudImg} alt="Fake QR" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fake</div>
                        </div>
                        <div style={{ padding: '1.5rem', flexGrow: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Fake Product</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Scan this QR code to detect that it's unrecognized by the Authentik ledger.</p>
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444' }}>
                                <ShieldAlert size={14} /> Non-Authentik QR
                            </div>
                        </div>
                    </div>

                </div>

                {/* Map Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Real-Time Scan Intelligence</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Track every interaction across the globe.</p>
                </div>

                <div className="glass-card" style={{ padding: '1rem', height: '500px', overflow: 'hidden' }}>
                    <MapContainer 
                        center={[20.5937, 78.9629]} 
                        zoom={5} 
                        style={{ height: '100%', width: '100%', background: '#000', borderRadius: '1rem' }} 
                        scrollWheelZoom={false}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <MapFocus center={[20.5937, 78.9629]} zoom={5} />
                        
                        {filteredMarkers.map((marker, i) => (
                            <CircleMarker
                                key={i}
                                center={marker.coords}
                                radius={marker.radius}
                                pathOptions={{ 
                                    fillColor: marker.color, 
                                    color: 'white', 
                                    weight: 2, 
                                    fillOpacity: 0.8 
                                }}
                            >
                                <Popup>
                                    <div style={{ padding: '0.5rem', color: '#000' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: marker.color }}>{marker.type}</div>
                                        <div style={{ fontWeight: 'bold' }}>{marker.location}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{marker.time} • {marker.device}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>

            </GenericPage>
        </>
    );
};

export default LiveDemo;
