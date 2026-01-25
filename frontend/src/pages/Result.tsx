import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Safety: direct URL access / refresh
  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="mb-4 text-gray-600">Invalid scan session</p>
        <button
          onClick={() => navigate("/home")}
          className="bg-black text-white px-6 py-3 rounded"
        >
          Scan Again
        </button>
      </div>
    );
  }

  const { productName, brand, batchNo, manufactureDate, expiryDate, place, scannedAt, originalScan } = state;

  const scannedDate = scannedAt
    ? new Date(scannedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const scannedTime = scannedAt
    ? new Date(scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "-";

  function goHome() {
    navigate("/home");
  }

  function reportProduct() {
    alert("Product reported!");
  }

  return (
    <div className="min-h-screen bg-white font-['-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','Helvetica','Arial','sans-serif']">
      {/* Time */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 text-black text-[14px] font-medium z-50">
        10:10 AM
      </div>

      <div className="pt-12 px-6 pb-24">
        {/* ================= ORIGINAL ================= */}
        {status === "ORIGINAL" && (
          <>
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">Authentick</h1>
            </div>

            {/* Product Title */}
            <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-6 text-center">
              {productName || "Product"}
            </h2>

            {/* Product Details */}
            <div className="mb-6">
              <div className="space-y-2">
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Brand:</span> {brand || "-"}
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Batch No:</span> {batchNo || "-"}
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Mfd Date:</span> {manufactureDate || "-"}
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Exp Date:</span> {expiryDate || "-"}
                </p>
                <p className="text-[16px] text-[#1a1a1a] mt-4 pt-4 border-t border-gray-100">
                  <span className="font-semibold block text-sm text-gray-500 mb-1">Scanned at:</span>
                  {scannedDate} {scannedTime} <br/>
                  <span className="text-sm text-gray-500">{place}</span>
                </p>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Green Authentic Box */}
            <div className="p-4 bg-[#34C759] rounded-lg">
              <p className="text-white text-[16px] font-semibold text-center">✓ GENUINE PRODUCT</p>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-4">
               You are the first person to scan this product.
            </p>
          </>
        )}

        {/* ================= FAKE ================= */}
        {status === "FAKE" && (
          <>
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">Authentick</h1>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Fake Product Section */}
            <div className="text-center mb-8">
              <h2 className="text-[24px] font-bold text-[#FF3B30] mb-4">Counterfeit Detected</h2>
              <p className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
                This QR Code is not recognized in our database.
              </p>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-[#FF3B30]/10 border-l-4 border-[#FF3B30] rounded-r">
              <p className="text-[15px] text-[#1a1a1a]">
                High risk of counterfeit. Do not consume or use.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mb-6">
              <p className="text-[16px] font-semibold text-[#1a1a1a] text-center">
                Help us protect others. Report this product now
              </p>
            </div>

            {/* Report Button */}
            <div className="text-center mb-4">
              <button
                onClick={reportProduct}
                className="bg-[#FF3B30] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#FF453A] active:bg-[#D70015] transition-colors duration-200 w-full max-w-[300px]"
              >
                Click to Report
              </button>
            </div>
          </>
        )}

        {/* ================= ALREADY USED ================= */}
        {status === "ALREADY_USED" && (
          <>
            {/* Re used heading */}
            <div className="text-center mb-4">
              <p className="text-[14px] text-[#6b6b6b]">Already Scanned</p>
            </div>

            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">Authentick</h1>
            </div>

            {/* Product Title */}
            <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-6 text-center">
              {productName || "Product"}
            </h2>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Warning Message */}
            <div className="mb-6">
              <p className="text-[18px] font-semibold text-[#1a1a1a] mb-4">
                This product has already been scanned!
              </p>
              <div className="p-4 bg-[#FF9500]/10 border-l-4 border-[#FF9500] rounded-r mb-4">
                <p className="text-[16px] font-bold text-[#FF9500]">Potential Re-use or Duplicate</p>
              </div>
            </div>

            {/* First Scan Details (History) */}
            {originalScan && (
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wide mb-3">Original Scan History</h3>
                  <div className="space-y-2">
                    <p className="text-[15px] text-[#1a1a1a] flex justify-between">
                        <span className="text-gray-500">Scanned By:</span>
                        <span className="font-medium">{originalScan.scannedBy}</span>
                    </p>
                    <p className="text-[15px] text-[#1a1a1a] flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">{new Date(originalScan.scannedAt).toLocaleDateString()}</span>
                    </p>
                    <p className="text-[15px] text-[#1a1a1a] flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{new Date(originalScan.scannedAt).toLocaleTimeString()}</span>
                    </p>
                     <p className="text-[15px] text-[#1a1a1a] flex justify-between">
                        <span className="text-gray-500">Place:</span>
                        <span className="font-medium">{originalScan.place || "Unknown"}</span>
                    </p>
                  </div>
                </div>
            )}
            
            {!originalScan && <p className="text-sm text-gray-400 italic mb-4">History unavailable</p>}

            {/* Possibilities */}
            <div className="mb-6">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-3">Possibilities:</h3>
              <div className="space-y-3 pl-4 list-disc">
                 <li className="text-[14px] text-[#1a1a1a]">You scanned this before.</li>
                 <li className="text-[14px] text-[#1a1a1a]">Someone else used this product.</li>
                 <li className="text-[14px] text-[#1a1a1a]">Duplicate QR Code (Counterfeit).</li>
              </div>
            </div>

            {/* Report Button */}
            <div className="text-center mb-4">
              <button
                onClick={reportProduct}
                className="bg-[#FF3B30] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#FF453A] active:bg-[#D70015] transition-colors duration-200 w-full max-w-[300px]"
              >
                Click to Report
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom Button - Scan Another Product */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#d1d1d6] p-6">
        <button
          onClick={goHome}
          className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#2c2c2e] active:bg-[#000] transition-colors duration-200 w-full max-w-[300px] mx-auto block"
        >
          Scan Another Product
        </button>
      </div>
    </div>
  );
}