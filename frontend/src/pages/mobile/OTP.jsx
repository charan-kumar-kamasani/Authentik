import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";

export default function OTP() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRef = useRef(null);

  // When virtual keyboard opens, many mobile browsers change the visualViewport height.
  useEffect(() => {
    const vv = window.visualViewport;
    const handler = () => {
      if (document.activeElement === inputRef.current) {
        setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      }
    };

    if (vv && vv.addEventListener) {
      vv.addEventListener('resize', handler);
      return () => vv.removeEventListener('resize', handler);
    }

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleOtpChange = (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 6) {
      setOtp(val);
    }
  };

  async function login() {
    if (otp.length !== 4) {
      alert("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: state?.mobile, otp }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        nav("/home");
      } else {
        alert("Invalid OTP. Please try again.");
        setOtp("");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed due to network error.");
    } finally {
      setLoading(false);
    }
  }

  const resendOtp = async () => {
    if (!state?.mobile) return alert('Missing mobile number');
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "91", mobile: state.mobile })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendCooldown(30); // 30s cooldown
        alert(data.message || 'OTP resent');
      } else {
        alert(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('resend otp error', err);
      alert('Network error while resending OTP');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
        <div className="w-full max-w-sm bg-white rounded-[40px] p-6 pt-10 pb-10 shadow-xl text-center relative mx-4">
          {/* Title */}
          <h2 className="text-[22px] font-bold text-[#0D4E96] mb-1 leading-snug">Enter Confirmation Code</h2>
          <p className="text-[#888] text-[12px] mb-8 font-medium tracking-wide">
            We’ve sent a SMS to +91{state?.mobile || '----------'}
          </p>

          {/* OTP Input */}
          <div className="relative mb-6">
            <div className="bg-white border border-gray-200 rounded-[12px] flex items-center justify-center h-[55px] shadow-sm px-4">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                ref={inputRef}
                onFocus={() => {
                  inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                placeholder="Enter OTP received through SMS"
                className="w-full outline-none text-[#333] text-[15px] text-center placeholder:text-gray-400 placeholder:italic bg-transparent font-medium tracking-wide"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={loading}
            className={`
              w-[200px] mx-auto h-[50px] rounded-[30px] font-bold text-[18px] text-white shadow-md
               flex items-center justify-center gap-2 mb-6
              bg-[#0E5AA7] hover:bg-[#0b4d91] disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-300 ease-out
            `}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Login
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {/* Resend Link */}
          <div className="text-[#0D4E96] text-[13px] font-medium">
            Didn’t receive the code?{' '}
            {resendCooldown > 0 ? (
              <span className="font-bold">Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={resendOtp}
                disabled={resendLoading}
                className="font-bold ml-1 hover:underline"
              >
                {resendLoading ? 'Resending...' : 'Resend'}
              </button>
            )}
          </div>
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
