import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import logo from "../../assets/logo.svg";

export default function OTP() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 6) {
      setOtp(val);
    }
  };

  // Format OTP as 123-456 not strictly required by UI but good UX,
  // though screen shows just "6 Digit Code" placeholder in single input.

  async function login() {
    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP");
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

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-between py-10 px-6 relative">
      
      {/* Top Section */}
      <div className="w-full max-w-sm flex flex-col items-center pt-8">
        
        {/* Logo Section */}
        <div className="text-center mb-12">
           {/* Logo Icon */}
           <div className="flex justify-center mb-1">
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
          <h2 className="text-[20px] font-bold text-white mb-1.5 leading-snug">Enter Confirmation Code</h2>
          <p className="text-white text-[12px] mb-8 font-medium tracking-wide">
             We've sent a SMS with the code to {state?.mobile || '9840098400'}
          </p>

          {/* OTP Input */}
          <div className="relative mb-10 px-2">
            <div className="bg-white rounded-[16px] flex items-center justify-center px-4 h-[60px] shadow-inner">
              <input
                type="text" // using text to control pattern
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="6 Digit Code"
               className="w-full outline-none text-[#1F2937] text-[18px] text-center placeholder:text-[#ccc] placeholder:italic bg-transparent font-medium tracking-widest"
              />
            </div>
             {/* Resend Timer Text */}
             {/* Not explicitly shown in the screenshot for this state, but assumed functionality if needed. 
                 If to match EXACT screenshot, we hide timer unless it's in a different state.
                 Screenshot just shows input field. I will omit timer visual to be "exact".
             */}
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={loading}
            className={`
              w-[220px] mx-auto h-[55px] rounded-[30px] font-bold text-[18px] tracking-wide shadow-lg
              bg-[#2CA4D6] text-[#214B80] hover:bg-[#2591BD] disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-300 ease-out flex items-center justify-center
            `}
          >
            {loading ? (
               <div className="w-6 h-6 border-4 border-[#214B80] border-t-transparent rounded-full animate-spin"></div>
            ) : "Login"}
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
