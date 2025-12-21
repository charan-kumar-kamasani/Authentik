import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const nav = useNavigate();

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
          <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-2">Enter your mobile number</h2>
          <p className="text-[#6b6b6b] text-[14px] mb-8">You will receive a confirmation code</p>

          {/* Mobile Input */}
          <div className="mb-8">
            <div className="flex items-center border-b border-[#d1d1d6] pb-3">
              <span className="text-[#8e8e93] mr-2 text-[20px]">📱</span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9840098400"
                className="flex-1 outline-none text-[#1a1a1a] text-[18px] font-medium placeholder:text-[#c7c7cc] bg-transparent tracking-[0.5px]"
                maxLength={10}
                style={{ letterSpacing: "0.5px" }}
              />
            </div>
            {/* Underline - always visible */}
            <div className="h-[2px] bg-[#1a1a1a] rounded-full w-full mt-[2px]"></div>
          </div>

          {/* Generate OTP Button */}
          <button
            onClick={() => mobile.length === 10 && nav("/otp", { state: { mobile } })}
            disabled={mobile.length !== 10}
            className={`
              w-full py-4 rounded-[12px] font-medium text-[16px]
              ${mobile.length === 10 
                ? 'bg-[#1a1a1a] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-[#2c2c2e] active:bg-[#000] active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
                : 'bg-[#e5e5ea] text-[#aeaeb2] cursor-not-allowed'
              }
              transition-all duration-200
            `}
          >
            Generate OTP
          </button>

          {/* Terms and Conditions */}
          <p className="text-center text-[#8e8e93] text-[11px] mt-6 px-2 leading-[1.4] tracking-[0.2px]">
            By continuing you agree to Recomm Policies, Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
}