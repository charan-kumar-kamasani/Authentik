import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function OTP() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      while (newOtp.length < 6) newOtp.push("");
      setOtp(newOtp);
      // Focus last input after paste
      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      // Add your resend OTP API call here
      console.log("Resending OTP to:", state.mobile);
    }
  };

  async function login() {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: state.mobile, otp: enteredOtp }),
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      nav("/home");
    } else {
      alert("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  }

  const formatMobile = (mobile) => {
    if (mobile.length === 10) {
      return `${mobile.slice(0, 3)}-${mobile.slice(3, 6)}-${mobile.slice(6)}`;
    }
    return mobile;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-['-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','Helvetica','Arial','sans-serif'] p-6 flex flex-col items-center justify-center relative">
     
      {/* Main Content */}
      <div className="w-full max-w-[375px]">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <h1 className="text-[24px] font-bold text-[#1a1a1a] mb-2 tracking-[-0.5px]">Authentick</h1>
          <p className="text-[#6b6b6b] text-[12px] tracking-[0.3px]">Empowering Brands, Securing Products</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
          {/* Title */}
          <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-3">Enter Confirmation Code</h2>
          <p className="text-[#6b6b6b] text-[14px] mb-8 leading-relaxed">
            We've sent a SMS with the code to{" "}
            <span className="text-[#1a1a1a] font-medium">9840098400</span>
          </p>

          {/* OTP Input Boxes */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-[48px] h-[56px] border border-[#d1d1d6] rounded-[12px] text-center text-[24px] font-semibold text-[#1a1a1a] bg-white focus:outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/20 transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {/* Dashed line below OTP boxes */}
            <div className="flex justify-center mt-4">
              <div className="w-full border-t border-dashed border-[#d1d1d6]"></div>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={otp.join("").length !== 6}
            className={`
              w-full py-4 rounded-[12px] font-medium text-[16px] mb-6
              ${otp.join("").length === 6
                ? 'bg-[#1a1a1a] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-[#2c2c2e] active:bg-[#000] active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                : 'bg-[#e5e5ea] text-[#aeaeb2] cursor-not-allowed'
              }
              transition-all duration-200
            `}
          >
            Login
          </button>

          {/* Resend OTP Section */}
          <div className="text-center">
            <p className="text-[#6b6b6b] text-[14px] mb-4">Didn't receive the OTP yet?</p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className={`
                text-[16px] font-medium tracking-[0.3px]
                ${canResend
                  ? 'text-[#1a1a1a] hover:text-[#2c2c2e] active:text-[#000]'
                  : 'text-[#aeaeb2] cursor-not-allowed'
                }
                transition-colors duration-200
              `}
            >
              RESEND OTP {!canResend && `(${timer}s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}