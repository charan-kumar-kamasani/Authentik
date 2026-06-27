import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";
import phoneIllustration from "../../assets/v2/login/phone_illustration.png";
import { useConfirm } from "../../components/ConfirmModal";
import loadingService from "../../utils/loadingService";
import { ArrowLeft, RefreshCw, ShieldCheck, Lock } from "lucide-react";

export default function OTP() {
  const { state } = useLocation();
  const nav = useNavigate();
  const confirmModal = useConfirm();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  
  // Timers
  const [expireTime, setExpireTime] = useState(179); // 02:59
  const [resendCooldown, setResendCooldown] = useState(29); // 00:29
  const [resendLoading, setResendLoading] = useState(false);
  
  const inputRefs = useRef([]);

  // Ensure inputs scroll into view when virtual keyboard opens
  useEffect(() => {
    const vv = window.visualViewport;
    const handler = () => {
      const activeIdx = inputRefs.current.findIndex(r => r === document.activeElement);
      if (activeIdx !== -1) {
        setTimeout(() => inputRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      }
    };

    if (vv && vv.addEventListener) {
      vv.addEventListener('resize', handler);
      return () => vv.removeEventListener('resize', handler);
    }

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Timer countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setExpireTime(prev => (prev > 0 ? prev - 1 : 0));
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/[^0-9]/g, "");
    if (!val) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = val[val.length - 1]; // take the last digit typed
    setOtp(newOtp);
    
    // Auto-advance
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function login() {
    const otpCode = otp.join("");
    // We expect a 6 digit OTP as per design, however, if backend only requires 4, it will just pass the first 4 or fail. 
    // Usually it's better to allow whatever length the form is designed for.
    if (otpCode.length !== 6 && otpCode.length !== 4) {
      await confirmModal({ title: 'Required', description: "Please enter the complete OTP", cancelText: null });
      return;
    }

    loadingService.start();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: state?.mobile, otp: otpCode }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        
        // Smart Redirect Logic
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          nav(redirectPath);
        } else {
          nav("/home");
        }
      } else {
        await confirmModal({ title: 'Invalid OTP', description: "Invalid OTP. Please try again.", cancelText: null });
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Login failed:", error);
      await confirmModal({ title: 'Error', description: "Login failed due to network error.", cancelText: null });
    } finally {
      loadingService.stop();
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
        setResendCooldown(29); // reset resend timer
        setExpireTime(179); // reset expire timer
        await confirmModal({ title: 'Success', description: data.message || 'OTP resent successfully', cancelText: null });
        inputRefs.current[0]?.focus();
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

  const activeInputIndex = otp.findIndex(val => val === "") === -1 ? 3 : otp.findIndex(val => val === "");

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans relative flex flex-col items-center pb-6">
      
      {/* Header */}
      <div className="w-full max-w-[400px] flex items-start px-5 pt-8 mb-4 relative">
        <button onClick={() => nav(-1)} className="absolute left-4 top-8 p-1 text-[#102A43]">
          <ArrowLeft className="w-[24px] h-[24px]" />
        </button>
        <div className="w-full flex flex-col items-center mt-[-6px]">
          <div className="w-[36px] h-[40px] mb-1">
             <img src={logo} alt="Shield" className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(16,110,234,0.3)]" />
          </div>
          <h1 className="text-[#102A43] text-[22px] font-extrabold tracking-wide">
            Authen<span className="text-[#106EEA]">tiks</span>
          </h1>
          <p className="text-[#64748B] text-[11px] font-medium tracking-wide mt-[1px]">Trusted. Verified. Protected.</p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center px-6">
        
        {/* Pure CSS Phone Illustration (Main Wireframe Style) */}
        <div className="w-[220px] h-[160px] relative flex items-center justify-center mx-auto mb-6">
          {/* Faint Background Bubbles */}
          <div className="absolute top-[5%] right-[12%] w-[90px] h-[90px] rounded-full bg-[#F4F8FE] z-0"></div>
          <div className="absolute top-[35%] left-[8%] w-[45px] h-[45px] rounded-full bg-[#EEF4FF] z-0"></div>
          <div className="absolute top-[20%] left-[5%] w-[10px] h-[10px] rounded-full bg-[#E5EFFF] z-0"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[14px] h-[14px] rounded-full bg-[#EEF4FF] z-0"></div>

          {/* Phone Frame */}
          <div className="relative w-[80px] h-[140px] rounded-[22px] border-[2px] border-[#689DF0] bg-white z-10 overflow-hidden flex flex-col items-center">
            {/* Screen contents - faint lines */}
            <div className="w-[30px] h-[3px] bg-[#EEF4FF] rounded-full mt-8"></div>
            <div className="w-[45px] h-[3px] bg-[#EEF4FF] rounded-full mt-3"></div>
            <div className="w-[35px] h-[3px] bg-[#EEF4FF] rounded-full mt-3"></div>
            <div className="w-[40px] h-[3px] bg-[#EEF4FF] rounded-full mt-3"></div>
            
            {/* Notch */}
            <div className="absolute top-0 w-[36px] h-[8px] bg-[#689DF0] rounded-b-[6px]"></div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-t from-white via-white/90 to-transparent"></div>
          </div>

          {/* Overlapping OTP Card */}
          <div className="absolute top-[45%] transform -translate-y-1/2 w-[160px] h-[48px] bg-white rounded-[12px] shadow-[0_10px_30px_rgba(16,110,234,0.12)] z-20 flex items-center justify-center gap-2 border border-[#F4F8FE]">
            {[1, 2, 3].map(i => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#105DE4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5l-10 14M7 5l10 14" />
              </svg>
            ))}
            <div className="w-[14px] h-[3px] bg-[#105DE4] rounded-full ml-1 mt-[2px]"></div>
          </div>

          {/* Lock Icon Overlay (Solid Blue Circle, White Lock) */}
          <div className="absolute right-[12px] top-[45%] transform -translate-y-1/2 w-[28px] h-[28px] bg-[#105DE4] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(16,93,228,0.3)] z-30">
            <Lock className="w-[14px] h-[14px] text-white stroke-[2.5]" />
          </div>
        </div>

        {/* Welcome Texts */}
        <h2 className="text-[24px] font-bold text-[#0B1E36] leading-tight text-center mb-2">
          Verify Your Number
        </h2>
        <p className="text-[#5A7184] text-[14px] mb-8 text-center max-w-[300px] leading-[1.6]">
          We’ve sent a One-Time Password (OTP)<br/>
          to <span className="font-semibold text-[#106EEA]">+91 {state?.mobile || '----------'}</span>
        </p>

        {/* Form Container */}
        <div className="w-full flex flex-col">
          <label className="text-[#0B1E36] font-bold text-[13px] mb-3 ml-1 block">Enter 4-digit OTP</label>
          
          {/* OTP Input Boxes */}
          <div className="flex justify-between items-center mb-4 px-2">
            {[0, 1, 2, 3].map((index) => {
              const isActive = activeInputIndex === index;
              const hasValue = !!otp[index];
              return (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={`w-[60px] h-[65px] bg-white border ${
                    isActive || hasValue ? 'border-[#105DE4] text-[#105DE4]' : 'border-gray-200'
                  } rounded-[12px] text-center text-[28px] font-semibold outline-none transition-all focus:border-[#105DE4]`}
                />
              )
            })}
          </div>
          
          {/* Timer */}
          <div className="flex items-center gap-2 mb-6 text-[#5A7184] text-[13px] font-medium ml-1">
            <ShieldCheck className="w-[16px] h-[16px] text-[#105DE4] stroke-[2]" />
            <p>OTP will expire in <span className="text-[#105DE4] font-bold">{formatTime(expireTime)}</span></p>
          </div>

          {/* Action Button */}
          <button
            onClick={login}
            disabled={loading || otp.join("").length < 4}
            className="w-full bg-[#105DE4] hover:bg-[#0b4ed0] text-white font-bold h-[54px] rounded-[12px] text-[16px] shadow-[0_8px_24px_rgba(16,93,228,0.25)] active:scale-[0.98] transition-all disabled:opacity-90 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-8"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="tracking-[0.5px]">VERIFY OTP</span>
            )}
          </button>

          {/* Resend Link with Divider */}
          <div className="flex items-center justify-center gap-4 mb-5">
             <div className="h-[1px] bg-gray-100 flex-1"></div>
             <span className="text-gray-400 text-[13px] font-medium">Didn't receive the OTP?</span>
             <div className="h-[1px] bg-gray-100 flex-1"></div>
          </div>
          
          <div className="flex justify-center mb-8">
            {resendCooldown > 0 ? (
              <div className="flex items-center gap-1.5 text-[#105DE4] text-[14px] font-medium">
                <RefreshCw className="w-[14px] h-[14px] animate-spin-slow stroke-[2.5]" />
                Resend OTP in <span className="font-bold">{formatTime(resendCooldown)}</span>
              </div>
            ) : (
              <button
                onClick={resendOtp}
                disabled={resendLoading}
                className="flex items-center gap-1.5 font-bold text-[#105DE4] hover:underline text-[14px]"
              >
                <RefreshCw className="w-[14px] h-[14px] stroke-[2.5]" />
                {resendLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Secure & Private Banner */}
          <div className="w-full bg-[#F8FAFC] rounded-[16px] py-4 px-5 flex items-center gap-4 mb-8 relative overflow-hidden">
            <div className="w-[44px] h-[44px] bg-[#EBF3FC] rounded-full flex items-center justify-center z-10 flex-shrink-0">
               <ShieldCheck className="w-[22px] h-[22px] text-[#105DE4] stroke-[2]" />
            </div>
            <div className="flex flex-col z-10">
              <h3 className="text-[#0B1E36] font-bold text-[14px] mb-[2px]">Secure & Private</h3>
              <p className="text-[#5A7184] text-[12px] leading-[1.4] pr-4">Your information is protected with industry-standard encryption.</p>
            </div>
            {/* Watermark Lock */}
            <Lock className="w-[120px] h-[120px] text-[#E2E8F0] absolute -right-6 -bottom-8 stroke-[1]" />
          </div>
          
        </div>
      </div>
      
      {/* Spacer to push footer to bottom if needed */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="w-full max-w-[400px] flex items-start gap-2.5 px-6 mt-auto">
        <Lock className="w-[18px] h-[18px] text-[#5A7184] stroke-[1.5] flex-shrink-0 mt-[2px]" />
        <p className="text-[#5A7184] text-[13px] font-medium leading-[1.5]">
          By continuing, you agree to our <a href="/terms-conditions" className="font-bold text-[#105DE4] hover:underline">Terms of Use</a> and <a href="/privacy-policy" className="font-bold text-[#105DE4] hover:underline">Privacy Policy</a>.
        </p>
      </div>

    </div>
  );
}
