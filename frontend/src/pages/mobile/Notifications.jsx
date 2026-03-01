import { useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <MobileHeader onBackClick={() => navigate(-1)} />
      
      {/* Content Container */}
      <div className="px-6 pt-6 pb-10">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center gap-4 pt-24">
          {/* Gradient Bell Icon */}
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] flex items-center justify-center shadow-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="url(#bellGradient)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-12 h-12"
              >
                <defs>
                  <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0D4E96" />
                    <stop offset="100%" stopColor="#2CA4D6" />
                  </linearGradient>
                </defs>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            
            {/* Decorative Elements */}
            <div 
              className="absolute w-3 h-3 bg-[#2CA4D6] rounded-full opacity-30"
              style={{
                top: '10%',
                left: '-20%',
                animation: 'pulse 2s infinite'
              }}
            />
            <div 
              className="absolute w-2 h-2 bg-[#0D4E96] rounded-full opacity-30"
              style={{
                top: '30%',
                right: '-15%',
                animation: 'pulse 2s infinite',
                animationDelay: '0.5s'
              }}
            />
            <div 
              className="absolute w-2.5 h-2.5 bg-[#1a5fa8] rounded-full opacity-30"
              style={{
                bottom: '20%',
                left: '-10%',
                animation: 'pulse 2s infinite',
                animationDelay: '1s'
              }}
            />
          </div>

          {/* Empty State Text */}
          <div className="text-center">
            <h2 className="text-[#0D4E96] font-black text-[20px] mb-2">
              No Notifications
            </h2>
            <p className="text-gray-600 text-[14px] max-w-[280px]">
              You're all caught up! We'll notify you when something important happens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
