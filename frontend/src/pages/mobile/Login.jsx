import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";
import indianIcon from "../../assets/v2/login/indian_icon.png";

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
    <div className="min-h-screen font-sans flex flex-col items-center justify-between py-6 px-4 bg-[linear-gradient(180deg,_#FFFFFF_0%,_#E6F4FA_25%,_#0D4E96_100%)]">

      {/* Top Section */}
      <div className="w-full flex flex-col items-center flex-grow justify-center pb-10">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="w-[80px] h-[80px] flex items-center justify-center">
              <img src={logo} alt="Authentiks Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#0D4E96] leading-none mb-1">
            Authentiks
          </h1>
          <p className="text-[#555] text-[14px] font-semibold italic">
            You Buy it, We Verify it
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-[40px] p-6 pt-10 pb-8 shadow-xl text-center relative mx-4">

          <h2 className="text-[22px] font-bold text-[#0D4E96] mb-1">Welcome to Authentiks</h2>
          <p className="text-[#888] text-[13px] mb-8 font-medium">
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
            {/* Input shadow effect/styling could be added here if needed to match exact shadow styles */}
          </div>

          {/* Get OTP Button */}
          <button
            onClick={() => mobile.length === 10 && sendOtp()}
            disabled={mobile.length !== 10 || loading}
            className={`
              w-[200px] mx-auto h-[50px] rounded-[30px] font-bold text-[18px] text-white shadow-md
              flex items-center justify-center gap-2
              ${mobile.length === 10
                ? 'bg-[#0E5AA7] hover:bg-[#0b4d91]'
                : 'bg-[#0E5AA7] opacity-80'
              }
              transition-all duration-300 ease-out
            `}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Get OTP
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 mt-6 font-medium">
            secure login * we never share your data * end-to-end encrypted
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-6 pb-4">
        <p className="text-white text-[11px] font-medium leading-tight opacity-90">
          By continuing you agree to Authentiks<br />
          <span className="font-bold">Policies, Terms & Conditions</span>
        </p>
      </div>
    </div>
  );
}