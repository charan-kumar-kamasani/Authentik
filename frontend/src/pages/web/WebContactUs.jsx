import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, ShieldCheck, ChevronRight, MessageSquare, Calendar, Shield, Linkedin, Cloud, Lock, Network, Database, Activity, Target, Loader2 } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import API_BASE_URL from "../../config/api";

export default function WebContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    country: '',
    requirements: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.requirements.trim()) {
      setErrorMsg('Name, email, and requirements are required');
      return;
    }

    // Phone validation if provided
    if (form.phone.trim()) {
      const phoneClean = form.phone.replace(/[^0-9]/g, '');
      if (phoneClean.length !== 10 && phoneClean.length !== 12) {
        setErrorMsg('Please enter a valid phone number');
        return;
      }
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Append role and country to requirements if provided, as the backend might only save requirements
      let fullRequirements = form.requirements;
      if (form.role) fullRequirements = `[Role: ${form.role}] ` + fullRequirements;
      if (form.country) fullRequirements = `[Country: ${form.country}] ` + fullRequirements;

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        requirements: fullRequirements,
        source: 'contact-page'
      };

      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorText = 'Something went wrong';
        try {
          const data = await res.json();
          errorText = data.message || errorText;
        } catch (err) {
          errorText = `Server Error (${res.status})`;
        }
        throw new Error(errorText);
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', phone: '', company: '', role: '', country: '', requirements: '' });
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <WebHeader />

      {/* Hero & Form Section */}
      <section className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column - Hero Text */}
          <div className="pt-8">
            <h3 className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-4">Contact Us</h3>
            <h1 className="text-4xl md:text-[52px] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Let's Talk
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-xl">
              We're here to help you transform your physical products into intelligent digital assets.
            </p>

            <div className="space-y-12">
               <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Get in Touch</h3>
                  <p className="text-slate-600 mb-8 max-w-md">
                    Ready to see Authentiks in action? Have questions about our platform? We'd love to hear from you.
                    Fill out the form, and our team will get back to you within 24 hours.
                  </p>
               </div>

               <div>
                  <h3 className="font-bold text-slate-900 mb-1">General Inquiries</h3>
                  <p className="text-slate-600 text-sm">info@authentiks.in</p>
               </div>

               <div>
                  <h3 className="font-bold text-slate-900 mb-1">Support</h3>
                  <p className="text-slate-600 text-sm">support@authentiks.in</p>
               </div>

               <div>
                  <h3 className="font-bold text-slate-900 mb-4">Locations</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><MapPin size={16} className="text-blue-600"/> India (Headquarters)</h4>
                      <p className="text-slate-600 text-sm pl-6 mt-1">Hyderabad, Telangana</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><MapPin size={16} className="text-blue-600"/> UAE</h4>
                      <p className="text-slate-600 text-sm pl-6 mt-1">Dubai</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Right Column - Form */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send us a message</h3>
            <p className="text-sm text-slate-500 mb-8">Fill out the form and our team will get back to you shortly.</p>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
               {status === 'success' && (
                 <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                   <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                   <div>
                     <span className="font-bold block">Message Sent!</span>
                     Our team will get back to you shortly.
                   </div>
                 </div>
               )}
               {status === 'error' && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                   <span className="font-bold">Error:</span> {errorMsg}
                 </div>
               )}
               {status !== 'success' && errorMsg && status !== 'error' && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                   {errorMsg}
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                     <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Work Email <span className="text-red-500">*</span></label>
                     <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your work email" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Company Name</label>
                     <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Enter your company name" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Phone Number</label>
                     <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Your Role</label>
                     <div className="relative">
                       <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 appearance-none">
                         <option value="">Select your role</option>
                         <option value="Founder / CEO">Founder / CEO</option>
                         <option value="Marketing Leader">Marketing Leader</option>
                         <option value="Operations / Supply Chain">Operations / Supply Chain</option>
                         <option value="IT / Technology">IT / Technology</option>
                         <option value="Other">Other</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-700">Country</label>
                     <div className="relative">
                       <select name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 appearance-none">
                         <option value="">Select your country</option>
                         <option value="India">India</option>
                         <option value="USA">USA</option>
                         <option value="UK">UK</option>
                         <option value="UAE">UAE</option>
                         <option value="Other">Other</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">How can we help you? <span className="text-red-500">*</span></label>
                  <textarea name="requirements" value={form.requirements} onChange={handleChange} rows="4" placeholder="Tell us about your requirements or any questions you have..." className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" required></textarea>
               </div>
               
               <p className="text-xs text-slate-500 flex items-center gap-2 pb-2">
                 <ShieldCheck size={14} className="text-blue-600"/> We respect your privacy. Your information is safe with us.
               </p>

               <button disabled={status === 'loading'} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
                  {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
               </button>
            </form>
          </div>
        </div>
      </section>



      <WebFooter />
    </div>
  );
}
