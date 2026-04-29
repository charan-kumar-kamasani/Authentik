import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";
import MobileHeader from "../../components/MobileHeader";
import { useConfirm } from "../../components/ConfirmModal";

export default function OTP() {
  const { state } = useLocation();
  const nav = useNavigate();
  const confirmModal = useConfirm();
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
      await confirmModal({ title: 'Required', description: "Please enter the 4-digit OTP", cancelText: null });
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
        await confirmModal({ title: 'Invalid OTP', description: "Invalid OTP. Please try again.", cancelText: null });
        setOtp("");
      }
    } catch (error) {
      console.error("Login failed:", error);
      await confirmModal({ title: 'Error', description: "Login failed due to network error.", cancelText: null });
    } finally {
      setLoading(false);
    }
  }

  const resendOtp = async () => {
    if (!state?.mobile) {
      await confirmModal({ title: 'Error', description: 'Missing mobile number', cancelText: null });
      return;
    }
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
        await confirmModal({ title: 'Success', description: data.message || 'OTP resent', cancelText: null });
      } else {
        await confirmModal({ title: 'Error', description: data.message || 'Failed to resend OTP', cancelText: null });
      }
    } catch (err) {
      console.error('resend otp error', err);
      await confirmModal({ title: 'Error', description: 'Network error while resending OTP', cancelText: null });
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
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <MobileHeader onBackClick={() => nav(-1)} />
      
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
          {/* Title */}
          <h2 className="text-[20px] font-black text-[#0D4E96] mb-1 leading-snug">Enter Verification Code</h2>
          <p className="text-gray-600 text-[13px] mb-8 font-semibold">
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
            className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold py-4 rounded-[30px] text-[16px] shadow-[0_8px_24px_rgba(13,78,150,0.35)] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
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
          <div className="text-[#0D4E96] text-[13px] font-semibold">
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
