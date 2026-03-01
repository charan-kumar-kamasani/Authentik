import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";

export default function AboutUs() {
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
        <h1
          className="text-[24px] font-black tracking-tight"
        >
          <span className="bg-gradient-to-r from-[#0D4E96] to-[#1e3a5f] bg-clip-text text-transparent">Authen</span><span className="bg-gradient-to-r from-[#2CA4D6] to-[#1a5fa8] bg-clip-text text-transparent">tiks</span>
        </h1>
        <button className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all" onClick={() => navigate('/notifications')}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D4E96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
             <path d="M13.73 21a2 2 0 0 1-3.46 0" />
           </svg>
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10">
        <h1 className="text-[#0D4E96] text-[24px] font-black mb-3 mt-4">About Us</h1>
        <p className="text-[#2CA4D6] text-[16px] font-bold mb-6 italic">Protecting Brands. Powering Trust. Unlocking Intelligence.</p>
        
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(13,78,150,0.12)] border-2 border-white text-[#1e3a5f] text-[14px] leading-relaxed space-y-5">
            <p className="font-semibold text-[15px]">
                Authentiks is a SaaS-powered product authentication and consumer intelligence platform built to help brands eliminate counterfeits, build trust, and unlock real-time consumer insights.
            </p>

            <p className="font-medium">
                We believe every product sold should be verifiable, traceable, and connected. In a world flooded with fake goods and disconnected supply chains, brands need more than just labels—they need intelligence.
            </p>

            <p className="font-medium">
                Authentiks transforms ordinary QR codes into secure, unique digital identities for every product. When scanned, these codes verify authenticity, detect duplication and provide brands with actionable data including location, demographics, scan behavior, and counterfeit alerts.
            </p>

            {/* Our Vision */}
            <div className="bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] rounded-[18px] p-5 border-l-4 border-[#0D4E96]">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Our Vision</h3>
                <p className="font-medium">
                    To build India's most trusted product authentication and consumer intelligence SaaS platform, helping brands scale securely while building lasting consumer trust.
                </p>
            </div>

            {/* Our Mission */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[18px] p-5 border-l-4 border-[#2CA4D6]">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Our Mission</h3>
                <p className="font-medium">
                    To build a world where authenticity is verified instantly and consumers never have to question whether a product is real.
                </p>
            </div>

            {/* Our Values */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[18px] p-5">
                <h3 className="font-black text-[17px] mb-3 text-[#0D4E96]">Our Values</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Trust First:</h4>
                        <p className="font-medium text-[13px]">Trust is at the core of everything we do—for brands, consumers, and partners.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Integrity by Design:</h4>
                        <p className="font-medium text-[13px]">We build systems that are secure, transparent and impossible to manipulate.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Consumer Empowerment:</h4>
                        <p className="font-medium text-[13px]">We give consumers the power to verify authenticity in seconds, with a simple scan.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Brand Protection:</h4>
                        <p className="font-medium text-[13px]">We respect and protect the effort, craftsmanship, and reputation behind every genuine product.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Simplicity at Scale:</h4>
                        <p className="font-medium text-[13px]">Complex problems deserve simple solutions that work reliably across millions of products.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Innovation with Purpose:</h4>
                        <p className="font-medium text-[13px]">We use technology to solve real problems—not for hype, but for impact.</p>
                    </div>
                </div>
            </div>

            {/* Why Authentiks Exists */}
            <div>
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Why Authentiks Exists</h3>
                <p className="font-bold text-[15px] mb-2">Counterfeiting is a multi-billion-dollar global problem.</p>
                <p className="font-medium mb-3">Brands lose revenue. Consumers lose trust.</p>
                <p className="font-medium mb-2">Authentiks bridges that gap by:</p>
                <ul className="list-disc pl-5 space-y-1 font-medium">
                    <li>Protecting brand integrity</li>
                    <li>Creating direct digital touchpoints with consumers</li>
                    <li>Delivering real-time market intelligence</li>
                    <li>Converting products into measurable assets</li>
                </ul>
                <p className="font-bold mt-3 text-[#0D4E96]">We don't just authenticate products. We empower brands with visibility.</p>
            </div>

            {/* Built for Scale */}
            <div className="bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] rounded-[18px] p-5">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Built for Scale</h3>
                <p className="font-medium mb-3">
                    Authentiks operates on a cloud-based SaaS model, offering subscription-based access to authentication tools, analytics dashboards and scalable QR deployment across industries.
                </p>
                <p className="font-medium">
                    From emerging brands to enterprise manufacturers, our technology grows with you.
                </p>
            </div>

            {/* The Future */}
            <div className="bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-[18px] p-5 text-white">
                <h3 className="font-black text-[17px] mb-2">The Future</h3>
                <p className="font-medium mb-3">
                    As commerce evolves, product transparency will no longer be optional—it will be expected.
                </p>
                <p className="font-bold">
                    Authentiks is building the infrastructure that makes trust measurable.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
