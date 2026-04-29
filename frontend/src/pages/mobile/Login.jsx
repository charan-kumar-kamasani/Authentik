import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";
import indianIcon from "../../assets/v2/login/indian_icon.png";
import MobileHeader from "../../components/MobileHeader";
import { useConfirm } from "../../components/ConfirmModal";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmModal = useConfirm();
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
        await confirmModal({ title: 'Error', description: data.message || "Failed to send OTP. Please try again.", cancelText: null });
      }
    } catch (err) {
      console.error("send-otp error", err);
      await confirmModal({ title: 'Error', description: "Network error while sending OTP. Please try again.", cancelText: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <MobileHeader />
      
      {/* Content Container */}
      <div className="px-6 pt-6 pb-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] flex items-center justify-center shadow-lg">
              <img src={logo} alt="Authentiks Logo" className="w-[70px] h-[70px] object-contain" />
            </div>
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-[#0D4E96] leading-none mb-2">
            Authentiks
          </h1>
          <p className="text-gray-600 text-[14px] font-semibold">
            You Buy it, We Verify it
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-[30px] p-6 pt-6 pb-8 shadow-[0_4px_20px_rgba(13,78,150,0.12)] text-center">

          <h2 className="text-[20px] font-black text-[#0D4E96] mb-1">Welcome to Authentiks</h2>
          <p className="text-gray-600 text-[13px] mb-8 font-semibold">
            Secure login with OTP verification
          </p>

          {/* Mobile Input */}
          <div className="relative mb-8">
            <div className="bg-white border border-gray-200 rounded-[12px] flex items-center h-[55px] shadow-sm px-3 relative z-0">
              {/* Flag & Code */}
              <div className="flex items-center gap-2 pr-3 border-r border-gray-300 mr-3">
                <img src={indianIcon} alt="India" className="w-6 h-4 object-cover rounded-sm" />
                <span className="text-[#000] font-bold text-[15px]">+91</span>
              </div>

              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) setMobile(val);
                }}
                ref={mobileInputRef}
                onFocus={() => {
                  mobileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                placeholder="Enter Your Mobile Number"
                className="flex-1 outline-none text-[#333] text-[15px] placeholder:text-gray-400 placeholder:italic bg-transparent font-medium"
              />
            </div>
          </div>

          {/* Validation Message */}
          {mobile.length > 0 && mobile.length < 10 && (
            <p className="text-red-500 text-[11px] font-bold mt-1 ml-4 animate-pulse">
              * Please enter exactly 10 digits
            </p>
          )}

          {/* Get OTP Button */}
          <button
            onClick={() => mobile.length === 10 && sendOtp()}
            disabled={mobile.length !== 10 || loading}
            className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold py-4 rounded-[30px] text-[16px] shadow-[0_8px_24px_rgba(13,78,150,0.35)] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Get OTP
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
        
        {/* Footer */}
        <div className="text-center px-6 mt-8">
          <p className="text-gray-600 text-[11px] font-medium leading-tight">
            By continuing you agree to Authentiks<br />
            <span className="font-bold">Policies, Terms & Conditions</span>
          </p>
        </div>
      </div>
    </div>
  );
}