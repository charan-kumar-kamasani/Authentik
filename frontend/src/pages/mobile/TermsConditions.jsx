import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6 bg-white/50 backdrop-blur-sm border-b-2 border-[#E8F4F9]">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D4E96" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1 className="text-[24px] font-black tracking-tight">
          <span className="bg-gradient-to-r from-[#0D4E96] to-[#1e3a5f] bg-clip-text text-transparent">Authen</span><span className="bg-gradient-to-r from-[#2CA4D6] to-[#1a5fa8] bg-clip-text text-transparent">tiks</span>
        </h1>
        <button className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all" onClick={() => navigate('/notifications')}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D4E96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
             <path d="M13.73 21a2 2 0 0 1-3.46 0" />
           </svg>
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10 overflow-y-auto no-scrollbar">
        <h1 className="text-[#0D4E96] text-[24px] font-black mb-6 mt-4 uppercase tracking-tighter">Terms & Conditions</h1>
        
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(13,78,150,0.12)] border-2 border-white text-[#1e3a5f] text-[14px] leading-relaxed space-y-6">
            <div>
                <p className="font-bold text-[#0D4E96]">Effective Date: [1/4/2026]</p>
                <p className="mt-2">These Terms & Conditions (“Terms”) govern your use of Authentiks, a product of Recomm Innovations Private Limited (“Company”, “we”, “our”, “us”). By accessing or using our website, platform, or services, you agree to these Terms.</p>
            </div>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">1. DEFINITIONS</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>“Platform”</strong> refers to Authentiks website, dashboard, and services</li>
                    <li><strong>“User” / “Client”</strong> refers to any individual or business using Authentiks</li>
                    <li><strong>“End User”</strong> refers to customers who scan QR codes</li>
                </ul>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">2. SERVICES PROVIDED</h2>
                <p>Authentiks provides unique QR code generation, physical label printing, product authentication system, data analytics, and customer engagement tools.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">3. USER ELIGIBILITY</h2>
                <p>Must be at least 18 years old and use the platform for lawful purposes only.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">4. PRICING & PAYMENTS</h2>
                <p>Subscription plans (Starter, Growth, Enterprise) and QR code charges. All payments must be made in advance. Failure to pay may result in suspension of services.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">5. FREE TRIAL / PROMOTIONAL OFFERS</h2>
                <p>Authentiks may offer limited-time free trials. We reserve the right to modify or withdraw offers at any time.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">6. ACCOUNT RESPONSIBILITY</h2>
                <p>You are responsible for maintaining account confidentiality and all activities under your account.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">7. ACCEPTABLE USE</h2>
                <p>No illegal or fraudulent activities, misuse of QR codes, or reverse engineering of the platform.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">8. QR CODE USAGE & LIABILITY</h2>
                <p>Clients are responsible for proper application of QR labels. Authentiks is not liable for misuse after delivery (labeling, damage, duplication outside system).</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">9. DATA & ANALYTICS</h2>
                <p>Data from scans is provided for insights. Authentiks does not guarantee 100% accuracy of analytics.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">10. INTELLECTUAL PROPERTY</h2>
                <p>All platform technology belongs to Authentiks. Users may not copy or resell our technology.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">11. LIMITATION OF LIABILITY</h2>
                <p>Total liability is limited to the amount paid by you in the last billing cycle. No liability for indirect or consequential losses.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">12. TERMINATION</h2>
                <p>We may suspend or terminate accounts for violations or overdue payments.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">13. REFUNDS & CANCELLATIONS</h2>
                <p>Subscription fees are generally non-refundable. QR code orders cannot be canceled once processed.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">14. THIRD-PARTY SERVICES</h2>
                <p>We are not responsible for third-party service failures (hosting, payments, logistics).</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">15. MODIFICATIONS TO TERMS</h2>
                <p>We reserve the right to update Terms at any time.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">16. GOVERNING LAW & JURISDICTION</h2>
                <p>Governed by Indian laws. Jurisdiction: Courts of Chennai, Tamil Nadu.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">17. CONTACT INFORMATION</h2>
                <p>Email: support@authentiks.in<br/>Company: Recomm Innovations Private Limited<br/>Location: Chennai, Tamil Nadu, India</p>
            </section>

            <div className="pt-6 border-t border-[#E8F4F9] text-center">
                <p className="italic font-bold text-[#0D4E96]">By using Authentiks, you agree to operate with integrity while we ensure your products remain trusted and intelligent.</p>
            </div>
        </div>
      </div>
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}
