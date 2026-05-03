import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";

export default function Policies() {
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
        <h1 className="text-[#0D4E96] text-[24px] font-black mb-6 mt-4 uppercase tracking-tighter">Privacy Policy</h1>
        
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(13,78,150,0.12)] border-2 border-white text-[#1e3a5f] text-[14px] leading-relaxed space-y-6">
            <div>
                <p className="font-bold text-[#0D4E96]">Effective Date: [1/4/2026]</p>
                <p className="mt-2">Authentiks (“we”, “our”, “us”) is a product of Recomm Innovations Private Limited. We are committed to protecting your privacy and ensuring transparency in how your data is collected, used and safeguarded.</p>
            </div>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">1. INFORMATION WE COLLECT</h2>
                <p><strong>A. Brands / Businesses:</strong> Name, Brand name, Email, Phone, Billing details, SKU info.</p>
                <p className="mt-2"><strong>B. End Users (via QR Scans):</strong> Device type, Location (approximate), Scan time, Interaction data. Optional (with consent): Name, Phone, Demographics.</p>
                <p className="mt-2"><strong>C. Automatically Collected:</strong> IP address, Browser type, Device info.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">2. HOW WE USE YOUR INFORMATION</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Provide product authentication services</li>
                    <li>Manage QR codes and deliver analytics</li>
                    <li>Detect duplicate or suspicious scans</li>
                    <li>Communicate support and updates</li>
                </ul>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">3. DATA SHARING & DISCLOSURE</h2>
                <p>Shared only with service providers (hosting, analytics, delivery) or to comply with legal obligations. We do not sell your personal data.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">4. DATA SECURITY</h2>
                <p>We implement secure servers and controlled access measures to protect your data. No system is 100% secure.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">5. DATA RETENTION</h2>
                <p>Retained as long as necessary for service provision, legal compliance, and business operations.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">6. COOKIES & TRACKING</h2>
                <p>Used to improve experience and analyze performance. Control via browser settings.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">7. YOUR RIGHTS</h2>
                <p>Right to access, correct, or delete your data and withdraw consent.</p>
            </section>

            <section>
                <h2 className="font-black text-[16px] text-[#0D4E96] uppercase mb-2">8. CONTACT FOR PRIVACY REQUESTS</h2>
                <p>Email: support@authentiks.in<br/>Company: Recomm Innovations Private Limited<br/>Location: Chennai, Tamil Nadu, India</p>
            </section>

            <div className="pt-6 border-t border-[#E8F4F9] text-center">
                <p className="italic font-bold text-[#0D4E96]">At Authentiks, protecting your data is as important as protecting your products.</p>
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
