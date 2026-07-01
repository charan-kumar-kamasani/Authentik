import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, ChevronRight, Clock, ShieldCheck } from "lucide-react";

// Inline WhatsApp SVG for exact matching
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="110" height="110" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 -mr-2 mt-1">
    <circle cx="70" cy="70" r="55" fill="#F4F7FF"/>
    {/* Decorative dots */}
    <circle cx="25" cy="50" r="1.5" fill="#105DE4"/>
    <circle cx="110" cy="40" r="2.5" fill="#105DE4"/>
    <circle cx="105" cy="100" r="1.5" fill="#105DE4"/>
    <circle cx="115" cy="75" r="2" fill="#105DE4"/>
    <circle cx="125" cy="85" r="1.5" fill="#4F8BFF"/>
    <path d="M110 50 L112 51 L111 53 Z" fill="#105DE4"/>
    <path d="M30 90 L33 88 L34 91 Z" fill="#4F8BFF"/>
    {/* Headset arc */}
    <path d="M40 75 C40 58.4315 53.4315 45 70 45 C86.5685 45 100 58.4315 100 75" stroke="#105DE4" strokeWidth="8" strokeLinecap="round"/>
    {/* Earpieces */}
    <rect x="34" y="65" width="12" height="32" rx="6" fill="#105DE4"/>
    <rect x="94" y="65" width="12" height="32" rx="6" fill="#105DE4"/>
    {/* Mic boom */}
    <path d="M100 90 C100 102 85 108 75 110" stroke="#105DE4" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="73" cy="110" r="3" fill="#105DE4"/>
    {/* Chat bubble */}
    <path d="M55 58 H85 C91.6274 58 97 63.3726 97 70 V82 C97 88.6274 91.6274 94 85 94 H73 L60 102 V94 C53.3726 94 48 88.6274 48 82 V70 C48 63.3726 53.3726 58 55 58 Z" fill="#4F8BFF"/>
    <circle cx="63" cy="76" r="3.5" fill="white"/>
    <circle cx="73" cy="76" r="3.5" fill="white"/>
    <circle cx="83" cy="76" r="3.5" fill="white"/>
  </svg>
);

const Support = () => {
  const navigate = useNavigate();

  const supportEmail = "support@authentiks.in";
  const supportPhone = "919342501819"; // Default phone
  const waNumber = "919342501819";

  return (
    <div className="h-screen max-h-[100dvh] bg-white font-sans flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-bold text-[#0B1E36] tracking-tight">Help & Support</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      <div className="px-5 pt-2 flex-1 flex flex-col justify-between pb-6">
        {/* Hero Section */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex-1 max-w-[55%]">
            <h2 className="text-[#0B1E36] text-[18px] font-extrabold leading-[1.2] mb-2">
              We're here to help you!
            </h2>
            <p className="text-slate-500 text-[12px] leading-[1.5] font-medium pr-1">
              Choose your preferred way to reach out. Our support team will get back to you as soon as possible.
            </p>
          </div>
          <HeadsetIcon />
        </div>

        <div className="flex-1 flex flex-col justify-evenly">
          {/* Contact Us Section */}
          <div>
            <h3 className="text-[#0B1E36] text-[15px] font-bold mb-3">Contact Us</h3>

            <div className="space-y-3">
              {/* WhatsApp Card */}
              <a 
                href={`https://wa.me/${waNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-[#F2FCF5] border border-[#E6F8EB] rounded-[16px] p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] bg-[#DFF7E5] text-[#25D366] rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <WhatsAppIcon />
                  </div>
                  <div className="flex-1 pr-2">
                    <h4 className="text-[#0B1E36] text-[14px] font-bold mb-0.5">WhatsApp</h4>
                    <p className="text-slate-500 text-[11px] leading-snug font-medium">
                      Chat with us on WhatsApp for quick support and instant answers.
                    </p>
                  </div>
                  <ChevronRight className="text-[#25D366] shrink-0" size={16} strokeWidth={2.5} />
                </div>
              </a>

              {/* Email Card */}
              <a 
                href={`mailto:${supportEmail}`} 
                className="block bg-[#F4F7FF] border border-[#EAF0FF] rounded-[16px] p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] bg-[#E3E9FF] rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Mail className="text-[#105DE4]" size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pr-2">
                    <h4 className="text-[#0B1E36] text-[14px] font-bold mb-0.5">Email Us</h4>
                    <p className="text-slate-500 text-[11px] leading-snug font-medium">
                      Send us an email and our team will respond as soon as possible.
                    </p>
                  </div>
                  <ChevronRight className="text-[#105DE4] shrink-0" size={16} strokeWidth={2.5} />
                </div>
              </a>
            </div>
          </div>

          {/* Divider with Shield */}
          <div className="my-4 relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative bg-white px-4">
              <div className="w-8 h-8 rounded-full bg-[#F4F7FF] flex items-center justify-center">
                <ShieldCheck className="text-[#105DE4]" size={16} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Satisfaction Section */}
          <div className="text-center shrink-0">
            <h3 className="text-[#0B1E36] text-[15px] font-bold mb-1">Your satisfaction is our priority</h3>
            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-4">
              We're committed to providing you with the best support experience.
            </p>

            {/* Support Hours */}
            <div className="bg-[#F8F9FE] rounded-[12px] p-3 flex items-center gap-3 text-left w-full mx-auto max-w-[340px]">
              <div className="w-9 h-9 bg-[#EDF1FF] rounded-full flex items-center justify-center shrink-0">
                <Clock className="text-[#105DE4]" size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[#0B1E36] text-[12px] font-bold mb-0.5">Support Hours</h4>
                <p className="text-slate-500 text-[11px] font-medium">Monday - Saturday, 9:00 AM to 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
