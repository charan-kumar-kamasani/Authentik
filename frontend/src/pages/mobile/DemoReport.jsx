import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";
import warningIcon from "../../assets/v2/home/header/warning.svg";
import fakeIcon from "../../assets/v2/home/header/dangerous.svg";

const THEMES = {
  COUNTERFEIT: {
    bgColor: "#E30211",
    shadow: "rgba(227,2,17,0.35)",
    icon: fakeIcon,
    title: "Counterfeit Report",
    subtitle: "Help us fight Counterfeits",
    noteColor: "text-[#E30211]",
    minImgColor: "text-[#E30211]",
    btnClass: "bg-[#E30211] hover:bg-[#c9020f] shadow-[0_8px_20px_rgba(227,2,17,0.4)]",
    ringClass: "focus:ring-[#E30211]",
    selectedBorder: "border-[#E30211]",
  },
  FAKE: {
    bgColor: "#FFA808",
    shadow: "rgba(255,168,8,0.35)",
    icon: warningIcon,
    title: "Duplicate Report",
    subtitle: "Help us fight fraudulent",
    noteColor: "text-[#FFA808]",
    minImgColor: "text-[#FFA808]",
    btnClass: "bg-[#FFA808] hover:bg-[#e59410] shadow-[0_8px_20px_rgba(255,168,8,0.4)]",
    ringClass: "focus:ring-[#FFA808]",
    selectedBorder: "border-[#FFA808]",
  },
};

export default function DemoReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { qrCode, reportType: passedType, productName: passedName, brand } =
    (location.state || {}) ;

  const reportType = passedType === "FAKE" ? "FAKE" : "COUNTERFEIT";
  const theme = THEMES[reportType];

  const [productName, setProductName] = useState(passedName || "");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Static images for demo
  const [imagePreviews, setImagePreviews] = useState(Array(6).fill(""));

  const handleFileChange = (e, idx) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviews(prev => {
        const next = [...prev];
        next[idx] = url;
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[24px] font-bold text-[#333] mb-2">Report Submitted!</h2>
        <p className="text-gray-600 mb-8 max-w-sm">
          Thank you for reporting this issue. This is a static demo, but in the real app, our team would review your report immediately.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-[#0D4E96] text-white font-bold text-[16px] py-4 rounded-[30px] shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <MobileHeader
        title="Authentiks"
        onLeftClick={() => navigate(-1)}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md flex flex-col">
        {/* Coloured Banner */}
        <div
          className="mx-4 mt-4 rounded-[16px] overflow-hidden"
          style={{ boxShadow: `0 8px 20px ${theme.shadow}` }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: theme.bgColor }}
          >
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src={theme.icon} alt="icon" className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white font-bold text-[16px] leading-tight">{theme.title}</p>
              <p className="text-white/85 text-[12px]">{theme.subtitle}</p>
            </div>
          </div>
          <div className="bg-[#333333] px-4 py-2 text-center">
            <p className="text-white font-bold text-[13px] tracking-wide uppercase">
              Please Provide Accurate Details
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 pt-5 pb-28 space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={`w-full p-3 bg-[#EBEBEB] rounded-[12px] text-[#333] text-sm focus:outline-none focus:ring-2 ${theme.ringClass}`}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Describe the Issue
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 bg-[#EBEBEB] rounded-[12px] text-[#333] text-sm resize-none focus:outline-none focus:ring-2 ${theme.ringClass}`}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Upload Product Photos <span className="text-red-500">*</span>
            </label>
            <p className={`text-[11px] font-semibold mb-3 ${theme.minImgColor}`}>
              Minimum 3 clear images
            </p>

            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className={[
                    "relative w-full aspect-square rounded-[14px] flex items-center justify-center overflow-hidden",
                    preview
                      ? `border-2 ${theme.selectedBorder}`
                      : "bg-[#EBEBEB] border-2 border-transparent cursor-pointer",
                  ].join(" ")}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt={`img-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                           setImagePreviews(prev => {
                             const next = [...prev];
                             next[idx] = "";
                             return next;
                           });
                        }}
                        className="absolute top-1 right-1 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 1l8 8M9 1l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className={`text-[11px] font-semibold text-center ${theme.noteColor}`}>
            Note: False complaints may lead to account suspension
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold text-[17px] py-4 rounded-[30px] transition-colors ${theme.btnClass} disabled:opacity-50`}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}
