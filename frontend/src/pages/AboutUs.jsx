import { useNavigate } from "react-router-dom";
import Logo from "../assets/Authentiks.png";
import NotificationIcon from "../assets/icon_notification.png";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#1B2B49]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="p-2">
           <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10">
        <h1 className="text-[#0F4160] text-[22px] font-bold mb-6">About Us</h1>
        
        <div className="text-[#1B2B49] text-[15px] leading-relaxed space-y-6">
            <p>
                Authentiks is a product authenticity and traceability platform that helps brands protect their products, businesses verify every unit at the source and buyers confidently confirm what they purchase through secure, unique QR-based verification.
            </p>

            <div>
                <h3 className="font-bold text-[16px] mb-1">Trust-First:</h3>
                <p>
                    Authentiks exists to fight counterfeit products by enabling brands to authenticate every item and empowering buyers to instantly verify genuineness with a simple scan.
                </p>
            </div>

            <div>
                <h3 className="font-bold text-[16px] mb-1">Enterprise / Premium:</h3>
                <p>
                    Authentiks is a secure authentication infrastructure that allows manufacturers to generate, control, and activate unique QR codes while giving consumers real-time proof of product authenticity.
                </p>
            </div>

            <div>
                <h3 className="font-bold text-[16px] mb-1">Vision-Led:</h3>
                <p>
                    Authentiks is built to create a world where trust is embedded into every product, using technology that connects manufacturers, quality teams, and consumers through transparent verification.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
