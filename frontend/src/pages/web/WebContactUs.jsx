import React, { useState } from "react";
import {
    Mail, MapPin, MessageSquare, ArrowRight, Phone, Building2, CheckCircle2,
    Send, Loader2, X, Users, Layers, ChevronRight
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import API_BASE_URL from "../../config/api";

const Glow = ({ color, className }) => (
    <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTag = ({ children, className = '' }) => (
    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${className}`}>
        {children}
    </div>
);

export default function WebContactUs() {
    const [form, setForm] = useState({
        name: '', phone: '', email: '', company: '', requirements: ''
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) {
            setErrorMsg('Name and phone are required');
            return;
        }

        // Phone validation: must be exactly 10 digits
        const phoneClean = form.phone.replace(/[^0-9]/g, '');
        if (phoneClean.length !== 10) {
            setErrorMsg('Please enter a valid 10-digit phone number');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            console.log(`[FormDebug] Submitting to: ${API_BASE_URL}/leads`);
            const res = await fetch(`${API_BASE_URL}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, source: 'contact-page' })
            });

            console.log(`[FormDebug] Response Status: ${res.status} ${res.statusText}`);

            if (!res.ok) {
                let errorText = 'Something went wrong';
                try {
                    const data = await res.json();
                    errorText = data.message || errorText;
                } catch (e) {
                    errorText = `Server Error (${res.status}): ${res.statusText || 'Unknown'}`;
                }
                throw new Error(errorText);
            }

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setForm({ name: '', phone: '', email: '', company: '', requirements: '' });
            }, 5000);
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <div className="relative pt-16 md:pt-24 pb-12 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="-bottom-32 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 hero-slide-enter">
                        <MessageSquare size={14} /> Contact Our Team
                    </div>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Let's Secure Your <span className="gradient-text">Brand's Future</span>
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-2xl mx-auto text-lg md:text-xl font-medium text-slate-400 mb-6 leading-relaxed">
                        Ready to eliminate counterfeits? Tell us about your brand and we'll craft a customized authentication strategy just for you.
                    </p>
                </div>
            </div>

            {/* ═══════════════ CONTACT GRID ═══════════════ */}
            <section className="pb-24 px-6 relative">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        
                        {/* LEFT: THE FORM (7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="glass-effect rounded-[2.5rem] border border-white/5 backdrop-blur-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
                                {/* Subtle internal glow */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                                
                                {status === 'success' ? (
                                    <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
                                            <CheckCircle2 size={48} className="text-emerald-400" />
                                        </div>
                                        <h3 className="text-4xl font-black text-white mb-4 tracking-tight">Request Received!</h3>
                                        <p className="text-slate-400 font-bold text-lg max-w-sm mx-auto">One of our authentication experts will contact you within 24 hours.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="relative z-10">
                                        <div className="mb-10">
                                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Tell us about your brand</h3>
                                            <p className="text-slate-500 font-bold">Fields marked with <span className="text-indigo-400">*</span> are mandatory.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={form.name}
                                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                            placeholder="John Doe"
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number *</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                                            <Phone size={18} />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={form.phone}
                                                            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                                            placeholder="+91 12345 67890"
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                                            <Mail size={18} />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={form.email}
                                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                            placeholder="name@brand.com"
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                                            <Building2 size={18} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={form.company}
                                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                                            placeholder="Google Inc."
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tell us what you need</label>
                                                <textarea
                                                    value={form.requirements}
                                                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                                    placeholder="Product volume, timeline, specific pain points (counterfeits, gray markets, etc.)"
                                                    rows={5}
                                                    className="w-full px-5 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-bold text-sm resize-none"
                                                />
                                            </div>

                                            {errorMsg && (
                                                <div className="text-red-400 text-xs font-black bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 animate-in slide-in-from-top-2">
                                                    Error: {errorMsg}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="w-full group relative overflow-hidden py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                                {status === 'loading' ? (
                                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                                ) : (
                                                    <><Send size={18} /> Send Inquiry</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: INFO SIDEBAR (5 cols) */}
                        <div className="lg:col-span-5 space-y-8">
                            
                            {/* Unified Contact Info */}
                            <div className="glass-effect rounded-[2.5rem] border border-white/5 p-8 md:p-10 relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <MessageSquare size={120} className="text-white" />
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">Connect with Experts</h4>
                                    <p className="text-slate-500 font-bold text-sm">We're here to help you secure your brand.</p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                            <Mail size={22} />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Email Inquiry</span>
                                            <a href="mailto:support@authentiks.in" className="text-white font-black hover:text-indigo-400 transition-colors text-lg">support@authentiks.in</a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                            <Phone size={22} />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">WhatsApp Tech</span>
                                            <a href="https://wa.me/919342501819" target="_blank" rel="noreferrer" className="text-white font-black hover:text-emerald-400 transition-colors text-lg">+91 93425 01819</a>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                            <MapPin size={22} />
                                        </div>
                                        <div className="max-w-[240px]">
                                            <span className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Our HQ</span>
                                            <p className="text-slate-300 font-bold text-sm leading-relaxed">Recomm Innovations Pvt. Ltd., VOC Nagar, Anna Nagar, Chennai, TN 600102</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Why Brands Choose Authentiks</h5>
                                    <ul className="space-y-4">
                                        {[
                                            "Personalized demo within 24 hours",
                                            "Volume-based production pricing",
                                            "End-to-end implementation guidance",
                                            "Instant dashboard onboarding"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                                </div>
                                                <span className="text-slate-300 font-bold text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                           
                        </div>

                    </div>
                </div>
            </section>

            <WebFooter />
        </div>
    );
}
