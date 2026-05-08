import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

export default function DemoReport() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [submitted, setSubmitted] = useState(false);

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
          onClick={() => navigate('/')}
          className="w-full bg-[#0D4E96] text-white font-bold text-[16px] py-4 rounded-[30px] shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col">
      <MobileHeader
        title="Report Product"
        onLeftClick={() => navigate(-1)}
        rightIcon={<div className="w-10" />}
      />

      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-[#1F2642] text-[20px] font-black mb-1">Report an Issue</h2>
          <p className="text-gray-500 text-[13px] mb-6">Found a counterfeit or duplicate? Let us know.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Product Name</label>
              <input 
                type="text" 
                value={state?.productName || "Unknown"} 
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-500 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Issue Type</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-[#333] font-bold outline-none focus:border-[#2CA4D6]">
                <option>Counterfeit / Fake Product</option>
                <option>Duplicate QR Code</option>
                <option>Product Tampered</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description (Optional)</label>
              <textarea 
                rows="4" 
                placeholder="Tell us what's wrong with this product..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2CA4D6] resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setSubmitted(true)}
          className="w-full bg-[#E74C3C] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-lg mt-2 active:scale-95 transition-transform"
        >
          Submit Demo Report
        </button>
      </div>
    </div>
  );
}
