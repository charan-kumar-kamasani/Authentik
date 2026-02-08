import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  
  const mobileInputRef = useRef(null);
  // Ensure input scrolls into view whenever the virtual keyboard opens.
  useEffect(() => {
    const vv = window.visualViewport;
    const handler = () => {
      if (document.activeElement === mobileInputRef.current) {
        setTimeout(() => mobileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      }
    };

    if (vv && vv.addEventListener) {
      vv.addEventListener('resize', handler);
      return () => vv.removeEventListener('resize', handler);
    }

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sendOtp = async () => {
    if (mobile.length !== 10) return;
  setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "91", mobile })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        nav("/otp", { state: { mobile } });
      } else {
        alert(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("send-otp error", err);
      alert("Network error while sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-between py-10 px-6">
      
      {/* Top Section */}
      <div className="w-full max-w-sm flex flex-col items-center pt-8">
        {/* Logo Section */}
        <div className="text-center mb-12">
           {/* Logo Icon */}
           <div className="flex justify-center mb-1">
             {/* Swapped inline SVG for logo image as requested */}
             <div className="w-[100px] h-[100px] flex items-center justify-center">
                 <img src={logo} alt="Authentiks Logo" className="w-[85px] h-auto object-contain" />
             </div>
           </div>
          <h1 className="text-[40px] font-bold tracking-tight text-[#214B80] leading-none mb-2">
            Authen<span className="text-[#2CA4D6]">tiks</span>
          </h1>
          <p className="text-[#2CA4D6] text-[15px] font-bold tracking-wide italic">
             You Buy it, We Verify it
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-[#214B80] rounded-[30px] p-6 pb-12 shadow-2xl text-center relative z-10">
          {/* Title */}
          <h2 className="text-[20px] font-bold text-white mb-1.5 leading-snug">Enter your mobile number</h2>
          <p className="text-white text-[12px] mb-8 font-medium tracking-wide">
            You will receive a confirmation code
          </p>

          {/* Mobile Input */}
          <div className="relative mb-10 px-2">
            <div className="bg-white rounded-[16px] flex items-center px-4 h-[60px] shadow-inner">
              <span className="text-gray-400 mr-2">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                     <line x1="12" y1="18" x2="12.01" y2="18"></line>
                 </svg>
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if(val.length <= 10) setMobile(val);
                }}
                ref={mobileInputRef}
                onFocus={() => {
                  // Try immediate + delayed scrolls so refocus moves the input again
                  mobileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => mobileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  setTimeout(() => mobileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 700);
                }}
                placeholder="10 digit mobile number"
               className="flex-1 outline-none text-[#1F2937] text-[17px] placeholder:text-[#ccc] placeholder:italic bg-transparent font-medium"
              />
            </div>
          </div>

          {/* Generate OTP Button */}
          <button
            onClick={() => mobile.length === 10 && sendOtp()}
            disabled={mobile.length !== 10 || loading}
            className={`
              w-[220px] mx-auto h-[55px] rounded-[30px] font-bold text-[18px] tracking-wide shadow-lg
              ${mobile.length === 10 
                ? 'bg-[#2CA4D6] text-[#214B80] hover:bg-[#2591BD]' 
                : 'bg-[#2CA4D6] text-[#214B80] opacity-90'
              }
              transition-all duration-300 ease-out flex items-center justify-center
            `}
          >
            {loading ? "Sending..." : "Generate OTP"}
          </button>
        </div>
      </div>

       {/* Terms and Conditions */}
       <div className="text-center px-8 mb-6">
        <p className="text-[#214B80] text-[12px] font-medium leading-tight">
          By continuing you agree to Authentiks<br/>
          <span className="font-bold">Policies, Terms & Conditions</span>
        </p>
      </div>
    </div>
  );
}