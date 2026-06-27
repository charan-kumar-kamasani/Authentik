import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import indianIcon from "../../assets/v2/login/indian_icon.png";
import logo from "../../assets/logo.svg";
import { useConfirm } from "../../components/ConfirmModal";
import { ShieldCheck, Lock, User, Users, ChevronDown, MessageCircleMore, Award, Package, Gift } from "lucide-react";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmModal = useConfirm();
  const nav = useNavigate();
  const mobileInputRef = useRef(null);

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
    <div className="min-h-screen bg-white font-sans relative overflow-x-hidden flex flex-col items-center">
      
      {/* Top Header Background SVG */}
      <div className="absolute top-0 left-0 right-0 h-[280px] z-0 overflow-hidden bg-gradient-to-tr from-[#022A85] via-[#053BAE] to-[#106EEA]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full opacity-30">
          <path d="M0 100 Q 30 70 100 100 L 100 0 L 0 0 Z" fill="#0D57E2" />
          <path d="M0 100 C 40 50 80 80 100 40 L 100 0 L 0 0 Z" fill="#0b46bd" />
        </svg>
        {/* Deep curve at bottom */}
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute bottom-[-1px] left-0 w-full h-[120px]">
          <path fill="#ffffff" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,149.3C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        {/* Subtle Stars/Dots */}
        <div className="absolute inset-0">
          <div className="absolute top-[40px] left-[50px] w-1 h-1 bg-white rounded-full opacity-40 shadow-[0_0_8px_2px_#fff]"></div>
          <div className="absolute top-[80px] right-[80px] w-1 h-1 bg-white rounded-full opacity-50 shadow-[0_0_10px_2px_#fff]"></div>
          <div className="absolute top-[140px] left-[150px] w-1.5 h-1.5 bg-white rounded-full opacity-60 shadow-[0_0_12px_3px_#fff]"></div>
          <div className="absolute top-[180px] right-[120px] w-1 h-1 bg-white rounded-full opacity-30 shadow-[0_0_6px_1px_#fff]"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[400px] px-5 pt-8 flex flex-col items-center">
        
        {/* Header Logo & Tagline (Top Left aligned) */}
        <div className="flex items-start self-start mb-6">
          <div className="w-[30px] h-[34px] relative flex items-center justify-center mr-2">
             <img src={logo} alt="Shield" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col mt-[-2px]">
            <h1 className="text-white text-[22px] font-bold tracking-wide leading-tight">Authentiks</h1>
            <p className="text-blue-100/90 text-[10px] font-medium tracking-wide">Trusted. Verified. Protected.</p>
          </div>
        </div>

        {/* Orbiting Icons & Main Shield */}
        <div className="relative w-full flex justify-center items-center mt-[10px] mb-[20px] h-[220px]">
          
          {/* Faint Concentric Arcs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
             <div className="w-[180px] h-[180px] border-[1px] border-[#106EEA] rounded-full absolute"></div>
             <div className="w-[260px] h-[260px] border-[0.5px] border-[#106EEA] rounded-full absolute"></div>
          </div>

          {/* Orbiting Icons */}
          <div className="absolute top-[30px] left-[50px] w-8 h-8 rounded-full bg-white shadow-lg border border-gray-50 flex items-center justify-center z-10 text-[#106EEA]">
            <ShieldCheck className="w-[16px] h-[16px] stroke-[2.5]" />
          </div>
          <div className="absolute top-[40px] right-[50px] w-8 h-8 rounded-full bg-white shadow-lg border border-gray-50 flex items-center justify-center z-10 text-[#106EEA]">
            <Award className="w-[16px] h-[16px] stroke-[2.5]" />
          </div>
          <div className="absolute bottom-[30px] left-[35px] w-8 h-8 rounded-full bg-white shadow-lg border border-gray-50 flex items-center justify-center z-10 text-[#106EEA]">
            <Package className="w-[16px] h-[16px] stroke-[2.5]" />
          </div>
          <div className="absolute bottom-[40px] right-[40px] w-8 h-8 rounded-full bg-white shadow-lg border border-gray-50 flex items-center justify-center z-10 text-[#106EEA]">
            <Gift className="w-[16px] h-[16px] stroke-[2.5]" />
          </div>

          {/* Huge Central 3D Shield */}
          <div className="relative w-[160px] h-[180px] z-20 flex items-center justify-center mt-4">
            <img src={logo} alt="Authentiks Shield" className="w-[150px] h-auto object-contain drop-shadow-[0_15px_25px_rgba(16,110,234,0.4)]" />
          </div>
        </div>

        {/* Welcome Texts */}
        <h2 className="text-[26px] font-black text-[#1a1a1a] leading-tight text-center mb-1.5 tracking-tight">
          Welcome to <span className="text-[#106EEA]">Authentiks</span>
        </h2>
        <p className="text-gray-500 text-[14px] mb-8 text-center max-w-[300px] leading-[1.6]">
          Verify products, claim ownership, unlock rewards, and access your product passports.
        </p>

        {/* Form Container */}
        <div className="w-full flex flex-col">
          <label className="text-[#1a1a1a] font-bold text-[14px] mb-2.5 ml-1">Enter Mobile Number</label>
          
          {/* Input Field */}
          <div className="relative mb-3.5">
            <div className="bg-white border border-gray-300 rounded-[12px] flex items-center h-[56px] px-3 relative z-0 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#106EEA] focus-within:shadow-[0_0_0_3px_rgba(16,110,234,0.1)]">
              {/* Country Code with Chevron */}
              <div className="flex items-center gap-1.5">
                <img src={indianIcon} alt="India" className="w-[24px] h-[16px] object-cover rounded-[2px]" />
                <ChevronDown className="w-[14px] h-[14px] text-gray-700 stroke-[2.5]" />
                <span className="text-[#1a1a1a] font-bold text-[15px] ml-1">+91</span>
              </div>
              
              {/* Vertical Divider */}
              <div className="w-[1px] h-[24px] bg-gray-200 mx-3"></div>

              {/* Input */}
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) setMobile(val);
                }}
                ref={mobileInputRef}
                placeholder="Enter your mobile number"
                className="flex-1 w-full h-full outline-none text-[#1a1a1a] text-[15px] font-medium placeholder:text-gray-400 placeholder:font-normal bg-transparent"
              />
            </div>
          </div>
          
          {/* Security note with lock icon */}
          <div className="flex items-center gap-2 mb-6 text-gray-500 text-[12px] px-1">
            <div className="w-[20px] h-[20px] rounded-[6px] bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
               <Lock className="w-[12px] h-[12px] text-[#106EEA] stroke-[2.5]" />
            </div>
            <p>We'll send a One-Time Password (OTP) to verify your identity.</p>
          </div>

          {/* GENERATE OTP Button */}
          <button
            onClick={() => mobile.length === 10 && sendOtp()}
            disabled={mobile.length !== 10 || loading}
            className="w-full bg-[#105DE4] text-white font-bold py-[16px] rounded-[14px] text-[16px] shadow-[0_8px_20px_rgba(16,93,228,0.25)] hover:shadow-[0_10px_25px_rgba(16,93,228,0.3)] hover:bg-[#0E54D4] active:scale-[0.98] transition-all disabled:opacity-[0.7] disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-8"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <MessageCircleMore className="w-[22px] h-[22px] stroke-[2]" />
                <span className="tracking-[0.5px]">GENERATE OTP</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Feature Highlights Strip */}
        <div className="w-full bg-white rounded-[16px] py-4 px-2 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex justify-between mb-6">
          <div className="flex flex-col items-center gap-2 w-1/4">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-[#EBF2FC] bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-[18px] h-[18px] text-[#106EEA] stroke-[2]" />
            </div>
            <span className="text-[10px] text-center font-semibold text-gray-600 leading-[1.2]">Secure<br/>Login</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/4 border-l border-gray-100">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-[#EBF2FC] bg-white flex items-center justify-center shadow-sm">
              <Lock className="w-[18px] h-[18px] text-[#106EEA] stroke-[2]" />
            </div>
            <span className="text-[10px] text-center font-semibold text-gray-600 leading-[1.2]">Privacy<br/>Protected</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/4 border-l border-gray-100">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-[#EBF2FC] bg-white flex items-center justify-center shadow-sm">
              <User className="w-[18px] h-[18px] text-[#106EEA] stroke-[2]" />
            </div>
            <span className="text-[10px] text-center font-semibold text-gray-600 leading-[1.2]">No Password<br/>Required</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/4 border-l border-gray-100">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-[#EBF2FC] bg-white flex items-center justify-center shadow-sm">
              <Users className="w-[18px] h-[18px] text-[#106EEA] stroke-[2]" />
            </div>
            <span className="text-[10px] text-center font-semibold text-gray-600 leading-[1.2]">One Account<br/>For All Products</span>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-center gap-3 mb-8 px-2">
          <ShieldCheck className="w-[20px] h-[20px] text-[#106EEA] stroke-[2]" />
          <p className="text-[#555555] text-[12px] font-medium leading-relaxed">
            By continuing, you agree to our <a href="/terms-conditions" className="font-bold text-[#106EEA]">Terms of Use</a> and <a href="/privacy-policy" className="font-bold text-[#106EEA]">Privacy Policy</a>.
          </p>
        </div>

      </div>
    </div>
  );
}