import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

// Assets
import authenticIcon from "../../assets/logo.svg";
import warningIcon from "../../assets/v2/home/header/warning.svg"; // Triangle
import fakeIcon from "../../assets/v2/home/header/dangerous.svg"; // Red X

import MobileHeader from "../../components/MobileHeader";

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const validStatuses = ["ORIGINAL", "ALREADY_USED", "ALREADY_SCANNED", "DUPLICATE", "FAKE", "INACTIVE"];
  const shouldRedirect = !state || !validStatuses.includes(status ?? "");

  useEffect(() => {
    if (shouldRedirect) navigate("/scan", { replace: true });
  }, [shouldRedirect, navigate]);

  if (shouldRedirect) return null;

  const data = state as any;

  if (status === "ORIGINAL") return <ResultAuthentic data={data} />;
  if (status === "ALREADY_USED" || status === "ALREADY_SCANNED" || status === "DUPLICATE") return <ResultRepeat data={data} />;
  if (status === "FAKE") return <ResultFake data={data} />;
  if (status === "INACTIVE") return <ResultInactive data={data} />;

  return null;
}

const handleNotificationClick = () => {
  // Placeholder for notification click
  console.log("Notification clicked");
};

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

function ResultAuthentic({ data }: { data: any }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Determine colors
  const productName = data.productName || data.productId?.productName || "Product Info";

  // Check for image in data, then data.productId, then data.images array
  const productImage = data.productImage || data.productId?.productImage || (data.images && data.images.length > 0 ? data.images[0] : null);
  console.log("______product image", productImage, data)

  const companyName = data.companyName || data.company || data.manufacturer || data.brand || data.productId?.brand || "-";

  const coreFieldsMap: Record<string, string> = {
    brand: "Brand",
    category: "Category",
    batchNo: "Batch #",
    scannedAt: "Verified On",
    manufactureDate: "Mfd on",
    expiryDate: "Exp on",
    calculatedExpiryDate: "Calculated Exp",
  };

  const knownKeys = new Set([
    "productName", "brand", "category", "batchNo", "scannedAt", "manufactureDate", "expiryDate",
    "description", "productInfo", "images", "productImage", "productStats", "_id", "productId", "brandId",
    "originalScan", "qrCode", "status", "companyName", "company", "manufacturer", "dynamicFields", "variants"
  ]);

  // Combine all fields into a single list
  const allFields: { label: string; value: any }[] = [];

  Object.entries(coreFieldsMap).forEach(([key, label]) => {
    const val = data[key] || data.productId?.[key];
    if (val) {
      let displayVal = val;
      if (key === "scannedAt" || key === "createdAt") {
        displayVal = new Date(val).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        });
      }
      allFields.push({ label, value: displayVal });
    }
  });

  // 1a. Mfd On (Month/Year)
  const mfdOn = data.mfdOn || data.productId?.mfdOn;
  if (mfdOn && mfdOn.month && mfdOn.year) {
    allFields.push({ label: "Mfd Month/Year", value: `${mfdOn.month}/${mfdOn.year}` });
  }

  // 1b. Best Before
  const bestBefore = data.bestBefore || data.productId?.bestBefore;
  if (bestBefore && bestBefore.value && bestBefore.unit) {
    allFields.push({ label: "Best Before", value: `${bestBefore.value} ${bestBefore.unit}` });
  }

  // 2. Variants
  const variants = data.variants || data.productId?.variants;
  if (variants && Array.isArray(variants)) {
    variants.forEach((v: any) => {
      allFields.push({ label: v.variantName, value: v.value });
    });
  }

  // 3. Description
  const description = data.description || data.productId?.description;
  if (description) {
    allFields.push({ label: "Description", value: description });
  }

  // 4. Dynamic Fields
  const dynamicFields = data.dynamicFields || data.productId?.dynamicFields;
  if (dynamicFields) {
    Object.entries(dynamicFields).forEach(([k, v]) => {
      allFields.push({ label: k, value: String(v) });
    });
  }

  // 5. Any other top-level fields not already covered
  Object.entries(data).forEach(([k, v]) => {
    if (knownKeys.has(k)) return;
    if (coreFieldsMap[k]) return;
    if (v === null || v === undefined || typeof v === "object") return;

    const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
    allFields.push({ label, value: String(v) });
  });

  const displayedFields = showAll ? allFields : allFields.slice(0, 6);
  const hasMore = allFields.length > 6;

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
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
          {/* Product Image & Name Section */}
          <div className="bg-white pb-6 flex flex-col items-center relative gap-3">
            <div className="w-full bg-[#1F2642] py-2 text-center">
              <h3 className="text-white font-bold text-[20px]">
                {productName}
              </h3>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-2xl border-4 border-white shadow-indigo-200/50">
                {productImage ? (
                  <img src={productImage} alt={data.productName} className="w-full h-[60%] object-cover transform transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    {/* Assuming 'Package' icon is available or needs to be imported/defined */}
                    {/* <Package size={80} className="text-slate-300 stroke-[1.5]" /> */}
                    <span className="text-slate-300 text-xl">No Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-3">
              {displayedFields.map((field, idx) => (
                <DetailBox key={idx} label={field.label} value={field.value} />
              ))}
            </div>

            {/* Show More/Less Button for Grid */}
            {hasMore && (
              <div className="w-full flex justify-center mt-4 mb-2">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="bg-[#F0F7FF] text-[#0D4E96] px-6 py-2 rounded-full font-bold text-[14px] border border-[#0D4E96]/20 shadow-sm flex items-center gap-2"
                >
                  {showAll ? "Less Technical Info" : "More Technical Info"}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}

            {/* More Info Anchor/Button for Additional Details */}
            <div className="w-full flex justify-center mt-6">
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-[#0D4E96] font-bold text-[16px] underline decoration-2 underline-offset-4 flex items-center gap-1 hover:text-[#2CA4D6] transition-colors"
              >
                {showMore ? "Hide Additional Info" : "More Product Information"}
                <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {showMore && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-[#F2F2F2] p-5 rounded-[20px] shadow-sm space-y-4 border border-gray-200/50">
                  {/* Priority: Product Info / About */}
                  {data.productInfo && (
                    <div className="">
                      <p className="text-[#333] text-[12px] font-bold uppercase tracking-wider opacity-60 mb-1">About Product</p>
                      <p className="text-[#444] text-[15px] font-medium whitespace-pre-wrap leading-relaxed">
                        {data.productInfo}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <p className="text-[#333] text-[12px] font-bold uppercase tracking-wider opacity-60 mb-1">Company</p>
                    <p className="text-[#444] text-[15px] font-bold text-[#0D4E96]">{companyName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Button */}
        <button className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(14,92,171,0.3)] mt-4">
          Review Product
        </button>
      </div>
    </div>
  );
}


function ResultRepeat({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
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
            {data.originalScan?.scannedBy && data.originalScan.scannedBy !== 'Unknown' && (
              <div>
                <p className="text-[#6E6D6B] text-[12px] font-bold">
                  Scanned Account No:
                </p>
                <p className="text-[#6E6D6B] text-[14px] font-bold">
                  {maskPhone(data.originalScan.scannedBy)}
                </p>
              </div>
            )}
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

          <button
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "FAKE",
                productName: data.productName || data.productId?.productName,
                brand: data.brand || data.productId?.brand,
                productId: data.productId?._id || data.productId || null,
                brandId: data.brandId || data.productId?.brandId || null,
                scanStatus: "FAKE"
              }
            })}
            className="w-full bg-[#FFA808] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(255,168,8,0.4)] hover:bg-[#e59410] transition-colors"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultFake({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
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

          <button
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "COUNTERFEIT",
                productName: data.productName,
                brand: data.brand,
                productId: data.productId || null,
                brandId: data.brandId || null,
                scanStatus: data.status || "ALREADY_USED"
              }
            })}
            className="w-full bg-[#E30211] text-white font-bold text-[20px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(227,2,17,0.4)] hover:bg-[#c9020f] transition-colors"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-[#259DCF] rounded-[16px] p-3 shadow-lg text-left">
      <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white text-[14px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function ResultInactive({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Inactive Card */}
        <div className="bg-[#444444] rounded-[16px] shadow-[0_10px_20px_rgba(68,68,68,0.3)] text-center text-white flex flex-col items-center gap-3 pb-6">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img
                src={fakeIcon}
                alt="Inactive"
                className="w-[64px] h-[64px] opacity-50 grayscale"
              />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              INACTIVE QR CODE
            </h2>
          </div>
          <div className="px-6 w-full">
            <p className="text-[14px] font-medium leading-tight opacity-95">
              This QR code has been recorded but is currently not active in our system.
            </p>
          </div>
        </div>

        {/* Display product info even if inactive */}
        <div className="bg-white rounded-b-[16px] shadow-sm p-4 pt-6">
          <div className="bg-[#F8F8F8] rounded-[16px] p-4 border border-gray-200 mb-6">
            <h3 className="text-[#333] font-bold text-[16px] mb-3 text-left">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Product</span>
                <span className="text-gray-900 font-bold">{data.productName || data.productId?.productName || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Brand</span>
                <span className="text-gray-900 font-bold">{data.brand || data.productId?.brand || 'N/A'}</span>
              </div>
              {(data.batchNo || data.productId?.batchNo) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Batch #</span>
                  <span className="text-gray-900 font-bold">{data.batchNo || data.productId?.batchNo}</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-[#333] font-bold text-[18px] mb-2 text-left">
            What does this mean?
          </h3>
          <p className="text-[#666] text-[14px] leading-relaxed text-left mb-6">
            A product might be marked as inactive if it's still in the warehouse, awaiting market release, or has been recalled.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="w-full bg-[#0D4E96] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(13,78,150,0.3)]"
          >
            Scan Another Product
          </button>
        </div>
      </div>
    </div>
  );
}

const maskPhone = (phone: any) => {
  if (!phone) return 'N/A';
  const str = phone.toString();
  if (str.length <= 5) return str;
  const first3 = str.slice(0, 3);
  const last2 = str.slice(-2);
  const mid = '*'.repeat(str.length - 5);
  return `${first3}${mid}${last2}`;
};
