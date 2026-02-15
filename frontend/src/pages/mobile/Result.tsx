import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Assets
import logo from "../../assets/logo.svg"; // Fallback or use standard logo
import authenticIcon from "../../assets/logo.svg";
import warningIcon from "../../assets/v2/home/header/warning.svg"; // Triangle
import fakeIcon from "../../assets/v2/home/header/dangerous.svg"; // Red X

import productImg from "../../assets/product_placeholder.png"; // Need a placeholder or real image
import MobileHeader from "../../components/MobileHeader";

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Safety: direct URL access handling
  if (!state && !status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <p className="mb-4 text-gray-600">Invalid scan session</p>
        <button
          onClick={() => navigate("/home")}
          className="bg-[#0D4E96] text-white px-6 py-3 rounded-full font-bold"
        >
          Scan Again
        </button>
      </div>
    );
  }

  const data = state || {};

  // Render based on status
  if (status === "ORIGINAL") {
    return <ResultAuthentic data={data} />;
  } else if (
    status === "ALREADY_USED" ||
    status === "ALREADY_SCANNED" ||
    status === "DUPLICATE"
  ) {
    return <ResultRepeat data={data} />;
  } else if (status === "FAKE") {
    return <ResultFake data={data} />;
  } else {
    // Fallback/Default
    return <ResultFake data={data} />;
  }
}

// --- Sub-Components ---

function Header({ title = "Authentiks", showBell = true }) {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm/50">
      <button onClick={() => navigate("/home")} className="text-[#0D4E96] p-1">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="text-[20px] font-bold text-[#0D4E96] tracking-tight">
        {title}
      </h1>
      {showBell ? (
        <button className="text-[#0D4E96] p-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#0D4E96"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
          </svg>
        </button>
      ) : (
        <div className="w-8"></div>
      )}
    </div>
  );
}

function ResultAuthentic({ data }) {
  // Determine colors
  const themeColor = "#2CA4D6"; // Blue
  const productName = data.productName || "Herbtox+";

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col  pb-24">
        {/* Status Card */}
        <div className="bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="bg-white rounded-full">
              <img
                src={authenticIcon}
                alt="Authentic"
                className="w-11 h-11 object-contain m-1"
              />
            </div>
            <div className="text-left">
              <h2 className="text-[18px] font-bold leading-tight">
                Authentic Product
              </h2>
              <p className="text-[12px] opacity-90 font-medium">
                This product has been verified as genuine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-b-[16px]">
          {/* Product Image & Name Section - Overlaps/Connects visually */}
          <div className="bg-white pb-6  flex flex-col items-center relative gap-3">
            <div className="w-full bg-[#1F2642] py-2 text-center">
              <h3 className="text-white font-bold text-[20px]">
                {productName}
              </h3>
            </div>
            <div className="relative w-32 h-32 mt-4">
              {/* Placeholder for Product Image */}
              <img
                src={
                  data.productStats ||
                  "https://placehold.co/200x200?text=Product"
                }
                alt={productName}
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <img
                src={authenticIcon}
                className="absolute bottom-0 right-0 w-8 h-8"
                alt="Verified"
              />
            </div>
          </div>

          <div className="p-2">
            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-3">
              <DetailBox label="Brand" value={data.brand || "Indian Essence"} />
              <DetailBox label="Category" value={data.category || "Pharma"} />
              <DetailBox label="Batch #" value={data.batchNo || "25SD3F"} />
              <DetailBox
                label="Verified On"
                value={
                  data.scannedAt
                    ? new Date(data.scannedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "20/Oct/2025"
                }
              />
              <DetailBox
                label="Mfd on"
                value={data.manufactureDate || "May 2025"}
              />
              <DetailBox label="Exp on" value={data.expiryDate || "May 2027"} />
            </div>

            {/* Additional Info */}
            <div className="">
              <h4 className="font-bold text-[#333] text-[18px] mb-2 mt-4">
                Additional Info:
              </h4>
              <div className="bg-[#F8F8F8] p-2 rounded-[16px] shadow-[2px_2px_1px_1px_rgba(1,1,1,0.1)]">
                <p className="text-[#666] text-[16px] mb-4">
                  {data.description ||
                    `${productName} is a carefully formulated herbal blood purifier syrup designed to support the body's natural detox process. Enriched with time-tested herbs.`}
                </p>

                <h4 className="font-bold text-[#333] text-[14px] mb-2">
                  Key Benefits
                </h4>
                <ul className="list-disc pl-5 text-[#6E6D6B] text-[16px]">
                  <li>Supports natural blood purification</li>
                  <li>Helps reduce toxins from the body</li>
                  <li>Promotes healthy, clear skin</li>
                  <li>Supports liver function and metabolism</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Review Button */}
        <button className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(14,92,171,0.3)] mt-2">
          Review Product
        </button>
      </div>
    </div>
  );
}

function ResultRepeat({ data }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Alert Card */}
        <div className="bg-[#FFA808] rounded-[16px] shadow-[0_10px_20px_rgba(255,168,8,0.3)] text-center text-white flex flex-col items-center gap-3">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <img src={warningIcon} alt="Warning" className="w-10 h-10" />
            </div>

            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              REPEAT SCAN ALERT
            </h2>
          </div>
          <div className="bg-[#444444] p-2 w-full">
            <p className="text-[13px] font-medium leading-tight mt-1 opacity-95">
              This product has already been scanned and verified earlier on
              another account
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-2 pt-4">
          {/* Details Section */}
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg text-center space-y-2 border border-gray-200">
            <div>
              <p className="text-[#6E6D6B] text-[12px] font-bold">
                Already Verified On:
              </p>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                {data.originalScan?.scannedAt
                  ? new Date(data.originalScan.scannedAt).toLocaleString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )
                  : "20/Oct/2025  08:30 PM (IST)"}
              </p>
            </div>
            <div>
              <p className="text-[#6E6D6B] text-[12px] font-bold">
                Scanned Account No:
              </p>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                {data.originalScan?.scannedBy
                  ? maskPhone(data.originalScan.scannedBy)
                  : "988XXXX144"}
              </p>
            </div>
            <div>
              <p className="text-[#6E6D6B] text-[12px] font-bold">
                Product Verification ID:
              </p>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                {data._id
                  ? data._id.slice(-12).toUpperCase()
                  : "SSG45SHHSB58SBH"}
              </p>
            </div>
          </div>

          {/* Info Text */}
          <div className="p-5  space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">
                Why you're seeing this?
              </h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>This product's digital ID has been used before</li>
                <li>Genuine products are typically verified once per unit</li>
                <li>Repeated scans can be a sign of tampering or misuse</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">
                What should you do?
              </h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>Avoid purchasing or using this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report CTA */}
        <div className="text-center mt-2">
          <p className="text-[#FFA808] font-bold text-[14px]">
            Help us protect others
          </p>
          <p className="text-[#FFA808] font-bold text-[14px] mb-3">
            Report this product now
          </p>

          <button className="w-full bg-[#FFA808] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(255,168,8,0.4)] hover:bg-[#e59410] transition-colors">
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultFake({ data }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
         <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Counterfeit Card - Matches Repeat Alert Card style */}
        <div className="bg-[#E30211] rounded-[16px] shadow-[0_10px_20px_rgba(227,2,17,0.3)] text-center text-white flex flex-col items-center gap-3">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img
                src={fakeIcon}
                alt="Counterfeit"
                className="w-[64px] h-[64px]"
              />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              COUNTERFEIT DETECTED
            </h2>
          </div>
          <div className="bg-[#444444] p-2 w-full">
            <p className="text-[14px] font-medium leading-tight  opacity-95">
              The scanned product is a Counterfeit or its not a registered
              product with Authentiks
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-2 pt-4">
          {/* Health Alert - Styled like Repeat's Details Section */}
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg space-y-2 border border-gray-200">
            <h3 className="text-[#6E6D6B] font-bold text-[18px] mb-2">
              Health & Safety Alert
            </h3>
            <p className="text-[#6E6D6B] text-[15px] leading-relaxed font-medium">
              Millions like you are unknowingly put at risk by consuming or
              using counterfeit products
            </p>
          </div>

          {/* Action Steps - Styled like Repeat's Info Text */}
          <div className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[16px] mb-2">
                What should you do?
              </h4>
              <ul className="list-disc pl-5 text-[#666] text-[14px] space-y-1.5 font-medium">
                <li>Do not use or consume this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report CTA */}
        <div className="text-center mt-4">
          <p className="text-[#E30211] font-bold text-[15px]">
            Help us protect others
          </p>
          <p className="text-[#E30211] font-bold text-[15px] mb-3">
            Report this product now
          </p>

          <button className="w-full bg-[#E30211] text-white font-bold text-[20px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(227,2,17,0.4)] hover:bg-[#c9020f] transition-colors">
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="bg-[#259DCF] rounded-[16px] p-3 shadow-lg text-left">
      <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white text-[14px] font-bold leading-tight">{value}</p>
    </div>
  );
}

const maskPhone = (value) => {
  if (!value) return "Unknown";
  const str = value.toString();
  if (str.length < 6) return str;
  return `${str.slice(0, 3)}xxxx${str.slice(-3)}`;
};
