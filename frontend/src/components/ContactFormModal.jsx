import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function ContactFormModal({ isOpen, onClose, planName = '' }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    requirements: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Name and phone are required');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: planName ? `pricing-${planName}` : 'modal' })
      });

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
        onClose();
        setStatus('idle');
        setForm({ name: '', email: '', phone: '', company: '', requirements: '' });
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-[#0f172a] rounded-[2rem] border border-white/10 w-full max-w-lg shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10">
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Thank You!</h3>
            <p className="text-gray-400 font-medium">Our team will contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Get Started</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">
              {planName ? `Inquiry regarding ${planName} plan` : 'Tell us about your needs and we\'ll get back to you'}
            </p>

            <div className="space-y-4">
              {/* Row 1: Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 93425 01819"
                    required
                    className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>
              {/* Row 2: Email + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="work@company.com"
                    className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Your company name"
                    className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>


              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Tell us about your brand protection needs, volume, timeline..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm resize-none"
                />
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Inquiry</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
