import React, { useState } from "react";
import { HelpCircle, ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-white/10 ${className}`}>
    {children}
  </h3>
);

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className={`glass-effect p-6 md:p-8 rounded-2xl border mb-6 transition-all duration-300 cursor-pointer ${isOpen ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/20'}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h4 className="text-lg font-black text-white tracking-tight">{question}</h4>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-indigo-500 text-white rotate-180' : 'bg-white/5 text-gray-400'}`}>
                    <ChevronDown size={20} />
                </div>
            </div>
            
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-6 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="text-gray-400 font-bold leading-relaxed space-y-4 whitespace-pre-line pt-2 border-t border-white/5">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function WebFAQs() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-24 md:pt-36 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 left-1/2 -translate-x-1/2 opacity-20" />
                
                <div className="container mx-auto text-center relative z-10 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8 hero-slide-enter">
                        <HelpCircle size={14} /> Documentation & Support
                    </div>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-2xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-10 leading-relaxed">
                        Everything you need to know about how Authentiks works, security, pricing, and getting started.
                    </p>

                    <div className="hero-slide-enter-delay flex flex-col items-center">
                        <button 
                            onClick={() => setContactOpen(true)}
                            className="bg-white/5 border border-white/10 text-white rounded-full px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            Still have questions? Let's Talk
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FAQ SECTIONS ═══════════════ */}
            <section className="py-20 px-6 relative">
                <div className="container mx-auto max-w-4xl relative z-10">
                    
                    {/* SECTION 1: GETTING STARTED */}
                    <div className="mb-20">
                        <SectionTitle>1. Getting Started</SectionTitle>
                        <FaqItem 
                            question="❓ What is Authentiks?" 
                            answer={<>Authentiks is a product intelligence platform that gives every unit a unique identity through QR codes — helping brands:<br/><br/>• Prevent counterfeits<br/>• Track product movement<br/>• Engage customers<br/>• Gain real-time insights</>} 
                        />
                        <FaqItem 
                            question="❓ How do I start using Authentiks?" 
                            answer={<>Getting started is simple:<br/>1. Choose a plan<br/>2. Share your product (SKU) details<br/>3. Order QR codes<br/>4. Receive printed labels at your location<br/>5. Apply them to your products<br/><br/><span className="text-indigo-400 font-black italic">👉 No technical integration required.</span></>} 
                        />
                        <FaqItem 
                            question="❓ How long does it take to go live?" 
                            answer={<>Most brands go live within a few days after placing their QR order.<br/><br/><span className="text-indigo-400 font-black italic">👉 Fast, simple onboarding.</span></>} 
                        />
                    </div>

                    {/* SECTION 2: AUTHENTICATION & SECURITY */}
                    <div className="mb-20">
                        <SectionTitle>2. Authentication & Security</SectionTitle>
                        <FaqItem 
                            question="❓ Can QR codes be copied or duplicated?" 
                            answer={<>Yes — like any QR, they can be visually copied.<br/><br/><span className="text-indigo-400 font-black italic">👉 But here's the difference:</span><br/><br/>Authentiks detects:<br/>• Multiple scans<br/>• Unusual scan patterns<br/>• Suspicious locations<br/><br/><span className="text-red-400 font-black">🚨 Duplicate or fake activity is instantly flagged in your dashboard.</span></>} 
                        />
                        <FaqItem 
                            question="❓ What happens if the same QR is scanned multiple times?" 
                            answer={<>First scan → marked as authentic<br/>Repeated scans → marked as suspicious<br/><br/><span className="text-indigo-400 font-black italic">👉 This helps you identify counterfeit or misuse.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Is every QR code unique?" 
                            answer={<>Yes.<br/><br/>Even within the same SKU, every product unit gets a completely unique QR code.<br/><br/><span className="text-indigo-400 font-black italic">👉 This enables unit-level tracking and authentication.</span></>} 
                        />
                        <FaqItem 
                            question="❓ How secure is the system?" 
                            answer={<>Authentiks uses:<br/>• Unique code generation per product<br/>• Backend validation on every scan<br/>• Real-time monitoring for anomalies<br/><br/><span className="text-indigo-400 font-black italic">👉 Every scan is verified and tracked.</span></>} 
                        />
                    </div>

                    {/* SECTION 3: QR CODES & OPERATIONS */}
                    <div className="mb-20">
                        <SectionTitle>3. QR Codes & Operations</SectionTitle>
                        <FaqItem 
                            question="❓ Do you provide physical QR labels?" 
                            answer={<>Yes.<br/><br/>We:<br/>• Generate QR codes<br/>• Print them<br/>• Deliver them to your location<br/><br/><span className="text-indigo-400 font-black italic">👉 Ready to use — no extra setup needed.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Do you offer scratch-protected labels?" 
                            answer={<>Yes, Scratch layers are added for enhanced security.<br/><br/><span className="text-indigo-400 font-black italic">👉 Useful for high-value or sensitive products.</span></>} 
                        />
                        <FaqItem 
                            question="❓ What is the cost of QR labels?" 
                            answer={<>QR label pricing depends on quantity:<br/><br/>• Starts from ₹3 per label<br/>• Goes down to ₹1 for higher volumes<br/><br/><span className="text-indigo-400 font-black italic">👉 Scales with your production.</span></>} 
                        />
                    </div>

                    {/* SECTION 4: DATA & ANALYTICS */}
                    <div className="mb-20">
                        <SectionTitle>4. Data & Analytics</SectionTitle>
                        <FaqItem 
                            question="❓ What kind of data will I get?" 
                            answer={<>You get:<br/>• Scan locations (geo tracking)<br/>• Authentic vs duplicate scans<br/>• Customer engagement<br/>• Product performance<br/><br/><span className="text-indigo-400 font-black italic">👉 Actionable insights in real time.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Can I export my data?" 
                            answer={<>Yes. You can export your data in formats like Excel for further analysis.</>} 
                        />
                        <FaqItem 
                            question="❓ Do you provide real-time alerts?" 
                            answer={<>Yes.<br/><br/>You’ll receive alerts for:<br/>• Suspicious scans<br/>• High-risk locations<br/>• Unusual activity<br/><br/><span className="text-indigo-400 font-black italic">👉 Helps you act quickly.</span></>} 
                        />
                    </div>

                    {/* SECTION 5: CUSTOMER ENGAGEMENT */}
                    <div className="mb-20">
                        <SectionTitle>5. Customer Engagement</SectionTitle>
                        <FaqItem 
                            question="❓ What happens when a customer scans the QR?" 
                            answer={<>You can:<br/>• Show authentication result<br/>• Redirect to your website<br/>• Offer coupons or rewards<br/>• Capture customer details (optional)<br/><br/><span className="text-indigo-400 font-black italic">👉 Turn every scan into engagement.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Can I drive customers to my website?" 
                            answer={<>Yes.<br/><br/>You can redirect users to your own platform — helping you:<br/>• Reduce dependency on marketplaces<br/>• Increase direct sales</>} 
                        />
                        <FaqItem 
                            question="❓ Can I collect customer data?" 
                            answer={<>Yes (optional and consent-based).<br/><br/>You can collect:<br/>• Phone number<br/>• Name<br/>• Basic demographics<br/><br/><span className="text-indigo-400 font-black italic">👉 Build your own customer database.</span></>} 
                        />
                    </div>

                    {/* SECTION 6: PRICING & PLANS */}
                    <div className="mb-20">
                        <SectionTitle>6. Pricing & Plans</SectionTitle>
                        <FaqItem 
                            question="❓ What plans do you offer?" 
                            answer={<>Starter – ₹5,000/month<br/>Growth – ₹10,000/month<br/>Enterprise – ₹20,000/month<br/><br/><span className="text-indigo-400 font-black italic">👉 Plans scale with your business needs.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Do you offer free trials?" 
                            answer={<>Yes. You get 90 days of premium features to experience the platform fully.</>} 
                        />
                        <FaqItem 
                            question="❓ What are QR credits in annual plans?" 
                            answer={<>If you choose annual billing, you get QR credits:<br/>• Starter → ₹10,000 credits<br/>• Growth → ₹20,000 credits<br/>• Enterprise → ₹40,000 credits<br/><br/><span className="text-indigo-400 font-black italic">👉 These can be used to order QR labels.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Are there any hidden charges?" 
                            answer={<>No. You only pay:<br/>1. Subscription fee<br/>2. QR label cost (based on quantity)</>} 
                        />
                    </div>

                    {/* SECTION 7: SCALABILITY */}
                    <div className="mb-20">
                        <SectionTitle>7. Scalability</SectionTitle>
                        <FaqItem 
                            question="❓ Can Authentiks handle large-scale production?" 
                            answer={<>Yes.<br/>The platform is built to handle:<br/>• High-volume QR generation<br/>• Multiple SKUs<br/>• Batch-level tracking<br/><br/><span className="text-indigo-400 font-black italic">👉 Suitable for startups to enterprises.</span></>} 
                        />
                        <FaqItem 
                            question="❓ Can I track multiple products and batches?" 
                            answer={<>Yes.<br/>You can manage:<br/>• Multiple SKUs<br/>• Different batches<br/>• Product-level performance</>} 
                        />
                    </div>

                    {/* FINAL SUPPORT SECTION */}
                    <div className="mb-10 text-center glass-effect p-12 rounded-[3rem] border border-white/5">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">What if I need help?</h3>
                        <p className="text-gray-400 font-bold mb-6">We provide:<br/>• Dedicated support<br/>• Onboarding assistance<br/>• Ongoing guidance</p>
                        <p className="text-indigo-400 font-black italic flex items-center justify-center gap-2"><ArrowRight size={18} /> You’re never on your own.</p>
                    </div>

                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-t from-indigo-900/10 to-transparent">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                        Still Have Questions? Let’s Talk.
                    </h2>
                    <br/>
                    <button
                        onClick={() => setContactOpen(true)}
                        className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                    >
                        Start Your 90-Day Free Trial
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}
