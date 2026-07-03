import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import {
    CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight,
    ScanLine, Smartphone, Link, TrendingUp, Users, RefreshCw,
    ChevronLeft, MapPin, Activity, ShieldCheck, Lock, Globe2, Database, Sparkles
} from 'lucide-react';
import AnimatedCTA from '../../components/AnimatedCTA';

// Demo QR Images
import authenticImg from '../../assets/demo_qrs/authentic.jpg';
import alertImg from '../../assets/demo_qrs/alert.jpg';
import fraudImg from '../../assets/demo_qrs/fraud.jpg';
import liveDemoBanner from '../../assets/banners/live_emo.jpg';
import mobileLiveDemoBanner from '../../assets/banners/Mobile banner authentiks/Live Demo.jpg';

const Glow = ({ color, className }) => (
    <div className={`absolute blur-[120px] pointer-events-none rounded-full ${color} ${className}`} />
);

const FeatureTag = ({ children, className = '' }) => (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-md ${className}`}>
        {children}
    </div>
);

function MapFocus({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function WebLiveDemo() {
    const [contactOpen, setContactOpen] = useState(false);
    const [selectedMapFilter, setSelectedMapFilter] = useState('ALL');

    // REAL MAP DATA
    const mapMarkers = [
        { coords: [19.0760, 72.8777], type: 'AUTHENTIC', location: 'Mumbai, IN', time: 'Just now', device: 'iPhone 15 Pro', color: '#10b981', radius: 10 },
        { coords: [28.6139, 77.2090], type: 'SUSPICIOUS', location: 'Delhi, IN', time: '5m ago', device: 'Android 14', color: '#ef4444', radius: 12 },
        { coords: [12.9716, 77.5946], type: 'DUPLICATE', location: 'Bangalore, IN', time: '12m ago', device: 'iPhone 13', color: '#f59e0b', radius: 8 },
        { coords: [17.3850, 78.4867], type: 'AUTHENTIC', location: 'Hyderabad, IN', time: '15m ago', device: 'Pixel 8', color: '#10b981', radius: 9 },
        { coords: [22.5726, 88.3639], type: 'AUTHENTIC', location: 'Kolkata, IN', time: '20m ago', device: 'Samsung S24', color: '#10b981', radius: 7 },
        { coords: [13.0827, 80.2707], type: 'SUSPICIOUS', location: 'Chennai, IN', time: '25m ago', device: 'iPhone 12', color: '#ef4444', radius: 14 },
        { coords: [23.0225, 72.5714], type: 'DUPLICATE', location: 'Ahmedabad, IN', time: '30m ago', device: 'OnePlus 12', color: '#f59e0b', radius: 11 },
        { coords: [26.8467, 80.9462], type: 'AUTHENTIC', location: 'Lucknow, IN', time: '45m ago', device: 'Redmi Note 13', color: '#10b981', radius: 6 },
        { coords: [21.1702, 72.8311], type: 'SUSPICIOUS', location: 'Surat, IN', time: '1h ago', device: 'Vivo V30', color: '#ef4444', radius: 15 },
        { coords: [18.5204, 73.8567], type: 'SUSPICIOUS', location: 'Pune, IN', time: '2h ago', device: 'Realme GT', color: '#ef4444', radius: 13 },
    ];

    const filteredMarkers = useMemo(() => {
        if (selectedMapFilter === 'ALL') return mapMarkers;
        return mapMarkers.filter(m => m.type === selectedMapFilter);
    }, [selectedMapFilter]);

    return (
        <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden flex flex-col font-sans">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-4 md:px-6 flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712] z-0"></div>
                <Glow color="bg-indigo-600/30 w-[600px] h-[600px]" className="-top-40 -left-40" />
                <Glow color="bg-cyan-600/20 w-[500px] h-[500px]" className="bottom-0 right-0" />
                
                <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center">
                    <FeatureTag className="bg-white/5 text-white/90 border-white/10 cursor-default shadow-xl mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        Live Interactive Demo
                    </FeatureTag>

                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white text-center mb-6 tracking-tighter leading-[1.05]">
                        Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Intelligent</span> <br className="hidden md:block" /> Authentication.
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl text-center mb-12 font-medium leading-relaxed">
                        Scan the QR codes below to witness our platform instantly differentiate between genuine products, duplicates, and counterfeits in real-time.
                    </p>

                    {/* Desktop Banner inside a sleek frame */}
                    <div
                        onClick={() => setContactOpen(true)}
                        className="hidden md:flex relative w-full max-w-5xl mx-auto rounded-[2.5rem] p-3 bg-white/[0.02] border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.1)] group cursor-pointer hover:bg-white/[0.04] transition-all duration-500 hover:shadow-[0_0_80px_rgba(99,102,241,0.2)] hover:-translate-y-2"
                    >
                        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 w-full shadow-2xl border border-white/5">
                            <img
                                src={liveDemoBanner}
                                alt="Live Demo banner"
                                className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-12 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <span className="bg-white text-black px-8 py-4 rounded-full font-black tracking-widest uppercase text-xs flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    Request Custom Demo <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Banner & CTA */}
                    <div className="flex flex-col md:hidden relative w-full max-w-md mx-auto">
                        <div className="relative rounded-[2rem] overflow-hidden p-1.5 bg-white/[0.03] border border-white/10 shadow-2xl mb-8">
                            <img 
                                src={mobileLiveDemoBanner} 
                                alt="Live Demo Page banner" 
                                className="w-full h-auto rounded-[1.5rem]"
                            />
                        </div>
                        <AnimatedCTA 
                            onClick={() => setContactOpen(true)}
                            className="w-full mx-auto"
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════════ QR INTERACTIVE SHOWCASE ═══════════════ */}
            <section className="py-24 px-6 relative z-10 border-b border-white/5 bg-[#050B1A]">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <FeatureTag className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">The Showcase</FeatureTag>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">Try It Yourself</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Use your smartphone camera to scan these codes. Experience the exact journey your customers will have.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 items-stretch">
                        {/* 1. GENUINE PRODUCT */}
                        <div className="rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-emerald-500/20 relative flex flex-col group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] hover:bg-white/[0.04]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="h-80 overflow-hidden bg-[#020617] flex items-center justify-center relative p-6">
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
                                
                                <img
                                    src={authenticImg}
                                    alt="Genuine QR"
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-emerald-500/20 group-hover:scale-105 transition-transform duration-700 relative z-10"
                                />
                                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xl z-20 flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> Genuine
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow relative z-10 border-t border-white/5">
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">Genuine Product</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-grow">
                                    Experience seamless verification. See product specs, manufacturing details, and the customer reward capture flow.
                                </p>
                                
                                <div className="space-y-2 pt-6 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Outcome</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        Verified Authentic
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. DUPLICATE PRODUCT */}
                        <div className="rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-amber-500/20 relative flex flex-col group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(245,158,11,0.15)] hover:bg-white/[0.04]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="h-80 overflow-hidden bg-[#020617] flex items-center justify-center relative p-6">
                                <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors duration-500" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)]" />
                                
                                <img
                                    src={alertImg}
                                    alt="Duplicate QR"
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-500/20 group-hover:scale-105 transition-transform duration-700 relative z-10"
                                />
                                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xl z-20 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> Duplicate
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow relative z-10 border-t border-white/5">
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-amber-400 transition-colors">Duplicate Scan</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-grow">
                                    Watch how our system instantly alerts the consumer if a QR code has been scanned previously by someone else.
                                </p>
                                
                                <div className="space-y-2 pt-6 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Outcome</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                                        <AlertTriangle size={16} className="text-amber-400" />
                                        Warning: Already Scanned
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. FAKE PRODUCT */}
                        <div className="rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-rose-500/20 relative flex flex-col group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(244,63,94,0.15)] hover:bg-white/[0.04]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="h-80 overflow-hidden bg-[#020617] flex items-center justify-center relative p-6">
                                <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors duration-500" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0%,transparent_70%)]" />
                                
                                <img
                                    src={fraudImg}
                                    alt="Fake QR"
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-rose-500/20 group-hover:scale-105 transition-transform duration-700 relative z-10"
                                />
                                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-xl z-20 flex items-center gap-1.5">
                                    <ShieldAlert size={12} /> Counterfeit
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow relative z-10 border-t border-white/5">
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-rose-400 transition-colors">Fake Product</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-grow">
                                    Scan this unauthorized code to see how we block access and flag the attempt as a potential counterfeit operation.
                                </p>
                                
                                <div className="space-y-2 pt-6 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Outcome</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                                        <ShieldAlert size={16} className="text-rose-400" />
                                        Unrecognized QR
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ LIVE GLOBAL PULSE (MAP SECTION) ═══════════════ */}
            <section className="py-24 px-6 relative overflow-hidden bg-[#030712]">
                <Glow color="bg-cyan-600/10 w-[800px] h-[800px]" className="top-1/4 -right-64" />
                <Glow color="bg-indigo-600/10 w-[800px] h-[800px]" className="bottom-1/4 -left-64" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <FeatureTag className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 mb-4">
                                <Globe2 size={12} /> Live Pulse
                            </FeatureTag>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.05]">
                                Real-Time Intelligence
                            </h2>
                        </div>
                        <p className="text-slate-400 font-medium max-w-md text-sm md:text-base md:text-right">
                            Monitor global scanning activity as it happens. Our telemetry instantly flags anomalies, pinpointing potential supply chain risks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                        {/* Map Area */}
                        <div className="lg:col-span-9 bg-white/[0.02] rounded-[2.5rem] border border-white/10 relative overflow-hidden flex flex-col group shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 via-indigo-500/50 to-purple-500/50"></div>
                            
                            {/* Map Container */}
                            <div className="flex-1 relative bg-slate-900/50 z-0">
                                <MapContainer 
                                    center={[20.5937, 78.9629]} 
                                    zoom={5} 
                                    style={{ height: '100%', width: '100%', background: '#030712' }} 
                                    scrollWheelZoom={false}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; CARTO'
                                    />
                                    <MapFocus center={[20.5937, 78.9629]} zoom={5} />
                                    
                                    {filteredMarkers.map((marker, i) => (
                                        <CircleMarker
                                            key={i}
                                            center={marker.coords}
                                            radius={marker.radius}
                                            pathOptions={{ 
                                                fillColor: marker.color, 
                                                color: marker.color, 
                                                weight: 2, 
                                                fillOpacity: 0.4,
                                                opacity: 0.8
                                            }}
                                        >
                                            <Popup className="custom-popup border-0">
                                                <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 min-w-[160px] shadow-2xl backdrop-blur-xl">
                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: marker.color, color: marker.color }} />
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{marker.type}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white mb-1">{marker.location}</h4>
                                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Smartphone size={10} /> {marker.device}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-2">{marker.time}</p>
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>

                                {/* Legend Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 md:right-auto z-[1000] flex flex-wrap items-center gap-3 md:gap-6 bg-slate-950/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                                    {[
                                        { id: 'AUTHENTIC', label: 'Authentic', color: 'bg-emerald-500' },
                                        { id: 'SUSPICIOUS', label: 'Suspicious', color: 'bg-rose-500' },
                                        { id: 'DUPLICATE', label: 'Duplicate', color: 'bg-amber-500' }
                                    ].map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setSelectedMapFilter(prev => prev === item.id ? 'ALL' : item.id)}
                                            className={`flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${selectedMapFilter !== 'ALL' && selectedMapFilter !== item.id ? 'opacity-30' : 'opacity-100'}`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} style={{ color: item.color === 'bg-emerald-500' ? '#10b981' : item.color === 'bg-rose-500' ? '#f43f5e' : '#f59e0b' }} />
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${selectedMapFilter === item.id ? 'text-white' : 'text-slate-300'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                    <div className="hidden md:block border-l border-white/10 h-4 mx-2" />
                                    <button 
                                        onClick={() => setSelectedMapFilter('ALL')}
                                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ml-auto md:ml-0 ${selectedMapFilter === 'ALL' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-3 bg-white/[0.02] rounded-[2.5rem] border border-white/10 p-6 flex flex-col gap-6 h-full overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full"></div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Activity size={14} className="text-cyan-400" /> Live Feed
                                    </h3>
                                    <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </div>

                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                                    {[
                                        { l: 'Mumbai', s: 'Verified', d: 'iPhone 15', t: 'Just now', type: 'success' },
                                        { l: 'Delhi', s: 'Risk Flagged', d: 'Android', t: '5m ago', type: 'danger' },
                                        { l: 'Bangalore', s: 'Duplicate', d: 'iPhone 13', t: '12m ago', type: 'warning' },
                                        { l: 'Hyderabad', s: 'Verified', d: 'Pixel 8', t: '15m ago', type: 'success' },
                                        { l: 'Kolkata', s: 'Verified', d: 'Samsung', t: '20m ago', type: 'success' }
                                    ].map((event, i) => (
                                        <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-white flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${event.type === 'danger' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : event.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    {event.l}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{event.t}</span>
                                            </div>
                                            <div className="flex items-center justify-between pl-3.5">
                                                <span className={`text-[10px] font-medium ${event.type === 'danger' ? 'text-rose-400' : event.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{event.s}</span>
                                                <span className="text-[10px] text-slate-500">{event.d}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Network Status</h3>
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-400 font-medium">System Health</span>
                                        <span className="text-xs text-emerald-400 font-bold">99.9%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '99%' }}></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 font-medium">Global Scans (24h)</span>
                                        <span className="text-xs text-white font-bold tabular-nums">14,293</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ EXPERIENCE BREAKDOWN ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-[#050B1A] relative overflow-hidden">
                <Glow color="bg-purple-600/10 w-[800px] h-[800px]" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        
                        {/* Text Content */}
                        <div>
                            <FeatureTag className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-6">
                                <Sparkles size={12} /> The Anatomy
                            </FeatureTag>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                                The Post-Scan <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Experience</span>
                            </h2>
                            
                            <p className="text-slate-400 font-medium text-lg mb-10 leading-relaxed">
                                We don't just verify products; we transform a simple scan into a comprehensive, brand-building interaction that captures valuable consumer data.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: ShieldCheck, title: "Definitive Proof", desc: "Consumers see instant, cryptographically backed proof of authenticity with dynamic visuals that cannot be mocked.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { icon: Database, title: "Rich Data Fetching", desc: "Securely retrieve batch details, manufacturing dates, and specific attributes directly from your ERP via our ledger.", color: "text-blue-400", bg: "bg-blue-500/10" },
                                    { icon: Users, title: "Loyalty Integration", desc: "Present warranty registration or exclusive loyalty coupons post-verification to capture valuable zero-party data.", color: "text-purple-400", bg: "bg-purple-500/10" },
                                    { icon: Activity, title: "Instant Telemetry", desc: "Every scan beams location, device type, and timestamp back to your dashboard for supply chain visibility.", color: "text-amber-400", bg: "bg-amber-500/10" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02] group">
                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-base mb-1">{feature.title}</h4>
                                            <p className="text-slate-400 font-medium text-sm leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MOCKUP UI */}
                        <div className="relative mx-auto w-full max-w-sm perspective-1000">
                            {/* Decorative background blur */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 blur-[80px] rounded-[3rem] transform scale-90" />
                            
                            {/* Device Frame */}
                            <div className="bg-[#0f172a] rounded-[3rem] border-[8px] border-[#1e293b] overflow-hidden relative shadow-[0_20px_80px_rgba(0,0,0,0.8)] z-10 h-[700px] flex flex-col transform md:rotate-y-[-10deg] md:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                                
                                {/* Status bar */}
                                <div className="h-7 w-full bg-white px-6 flex justify-between items-center z-30 absolute top-0 left-0 right-0">
                                    <span className="text-[11px] text-black font-semibold tracking-wider">9:41</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-3.5 h-3.5 rounded-full border border-black/80 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black/80 rounded-full" /></div>
                                        <div className="w-3.5 h-3.5 rounded-full border border-black/80 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black/80 rounded-full" /></div>
                                    </div>
                                </div>

                                {/* App content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pt-7 pb-10 bg-[#F8FAFC]">
                                    
                                    {/* App Header */}
                                    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
                                        <div className="text-slate-800 bg-slate-100 p-1.5 rounded-full"><ChevronLeft size={16} /></div>
                                        <h4 className="text-slate-800 font-black text-xs uppercase tracking-widest">Verification Result</h4>
                                        <div className="w-8"></div>
                                    </div>

                                    {/* Success Banner */}
                                    <div className="m-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-center text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                                <ShieldCheck size={24} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <h2 className="text-[15px] font-black leading-tight tracking-tight">Authentic Product</h2>
                                                <p className="text-[11px] text-emerald-50 font-medium">Cryptographically verified</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Image & Title */}
                                    <div className="mx-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-1 mb-4">
                                        <div className="bg-slate-50 rounded-[1.5rem] p-4 flex flex-col items-center">
                                            <h3 className="text-slate-800 font-black text-lg mb-4 text-center leading-tight">ALPHALITE <br/><span className="text-slate-500">Panther Series</span></h3>
                                            <div className="relative w-40 h-40">
                                                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
                                                <img src="https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg" alt="product" className="w-full h-full object-contain relative z-10 drop-shadow-xl" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Grid */}
                                    <div className="px-4 space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Product Specifications</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { l: "Brand", v: "Alphalite" },
                                                    { l: "Batch #", v: "ALPHA-2478" },
                                                    { l: "Mfd on", v: "Feb 2026" },
                                                    { l: "Color", v: "Carbon Black" },
                                                    { l: "Size", v: "10 UK" },
                                                    { l: "MRP", v: "₹36,999.00" }
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider mb-0.5">{item.l}</p>
                                                        <p className="text-slate-800 text-[11px] font-bold">{item.v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-xl rounded-full"></div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Loyalty Reward</h4>
                                            <p className="text-lg font-black mb-1 relative z-10">Unlock 20% Off</p>
                                            <p className="text-[10px] text-slate-300 mb-4 relative z-10">Register this product to claim your warranty and next purchase discount.</p>
                                            <button className="w-full bg-white text-slate-900 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest relative z-10 hover:bg-slate-100 transition-colors">
                                                Claim Reward
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6 relative overflow-hidden bg-[#030712] border-t border-white/5">
                <Glow color="bg-indigo-600/20 w-[1000px] h-[1000px]" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                        The Technology <br className="md:hidden"/> Speaks for Itself.
                    </h2>
                    <p className="text-slate-400 font-medium mb-10 text-lg max-w-2xl mx-auto">
                        Ready to integrate Authentiks into your packaging lines? Empower your brand with real-time intelligence and unbreakable security.
                    </p>
                    <button
                        onClick={() => setContactOpen(true)}
                        className="px-10 py-5 bg-white text-slate-950 rounded-full font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:translate-y-0 text-sm inline-flex items-center gap-3"
                    >
                        Schedule a Demo
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}
