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

  const { productName, place, scannedAt, expiryDate, productId } = state;

  const scannedDate = scannedAt
    ? new Date(scannedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "10/Oct/2024";

  const scannedTime = scannedAt
    ? new Date(scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "06:45 PM";

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
              Amul Pure Ghee
            </h2>

            {/* Product Details */}
            <div className="mb-6">
              <div className="space-y-2">
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Brand:</span> {productName}
                </p>
                {/* <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Net Weight:</span> 1 ltr
                </p> */}
                {/* <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Mfd Date:</span> {expiryDate}
                </p> */}
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Exp Date:</span> {expiryDate}
                </p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-4">Additional Details:</h3>
              <div className="space-y-4 pl-4">
                <div className="text-[14px] text-[#1a1a1a] leading-relaxed">
                  <p>- Pantene shampoos contain ingredients like water for hydration, sodium lauryl sulfate and cocamidopropyl betaine for cleansing and ther; dimethicone for smoothness and shine, thenol</p>
                  <p className="pl-4">(Pro-Vitamin B5) for strengthening and citric acid for pH balance, along with preservatives like sodium benzoate and ethylisothiazolinone</p>
                  <p>to maintain product stability.</p>
                </div>
                <div className="text-[14px] text-[#1a1a1a] leading-relaxed">
                  <p>- Pantene shampoos contain ingredients like water for hydration, sodium lauryl sulfate and cocamidopropyl betaine for cleansing and ther; dimethicone for smoothness and shine, thenol</p>
                  <p className="pl-4">(Pro-Vitamin B5) for strengthening and citric acid for pH balance, along with preservatives like sodium benzoate and ethylisothiazolinone</p>
                  <p>to maintain product stability.</p>
                </div>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Green Authentic Box */}
            <div className="p-4 bg-[#34C759] rounded-lg">
              <p className="text-white text-[16px] font-semibold text-center">✓ AUTHENTIC PRODUCT</p>
            </div>
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

            {/* Product Title */}
            <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-6 text-center">
              Amul Pure Ghee
            </h2>

            {/* Product Details */}
            <div className="mb-6">
              <div className="space-y-2">
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Brand:</span> Amul
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Net Weight:</span> 1 ltr
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Mfd Date:</span> 10/24
                </p>
                <p className="text-[16px] text-[#1a1a1a]">
                  <span className="font-semibold">Exp Date:</span> 05/25
                </p>
                <p className="text-[15px] text-[#1a1a1a]">Date: {scannedDate}</p>
                <p className="text-[15px] text-[#1a1a1a]">Time: {scannedTime}</p>
                <p className="text-[15px] text-[#1a1a1a]">Place: {place || "Mumbai, Maharastra, India"}</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-4">Additional Details:</h3>
              <div className="space-y-4 pl-4">
                <div className="text-[14px] text-[#1a1a1a] leading-relaxed">
                  <p>- Pantene shampoos contain ingredients like water for hydration, sodium lauryl sulfate and cocamidopropyl betaine for cleansing and ther; dimethicone for smoothness and shine, thenol</p>
                  <p className="pl-4">(Pro-Vitamin B5) for strengthening and citric acid for pH balance, along with preservatives like sodium benzoate and ethylisothiazolinone</p>
                  <p>to maintain product stability.</p>
                </div>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Fake Product Section */}
            <div className="text-center mb-8">
              <h2 className="text-[24px] font-bold text-[#FF3B30] mb-4">Fake Product</h2>
              <p className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
                The scanned product is a Counterfeit or its not a registered product with Authentick
              </p>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-[#FF3B30]/10 border-l-4 border-[#FF3B30] rounded-r">
              <p className="text-[15px] text-[#1a1a1a]">
                Millions like you are unknowingly put at risk by consuming or using counterfeit products.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mb-6">
              <p className="text-[16px] font-semibold text-[#1a1a1a] text-center">
                Help us protect others. Report this product now
              </p>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Fit & Review */}
            <div className="text-center mb-8">
              <h3 className="text-[20px] font-semibold text-[#1a1a1a] mb-2">Fit</h3>
              <button
                onClick={reportProduct}
                className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#2c2c2e] active:bg-[#000] transition-colors duration-200 w-full max-w-[300px]"
              >
                Click to Review
              </button>
            </div>
          </>
        )}

        {/* ================= ALREADY USED ================= */}
        {status === "ALREADY_USED" && (
          <>
            {/* Re used heading */}
            <div className="text-center mb-4">
              <p className="text-[14px] text-[#6b6b6b]">Re-used</p>
            </div>

            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">Authentick</h1>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

            {/* Warning Message */}
            <div className="mb-6">
              <p className="text-[18px] font-semibold text-[#1a1a1a] mb-4">
                Product has already been scanned once before
              </p>
              <div className="p-4 bg-[#FF9500]/10 border-l-4 border-[#FF9500] rounded-r mb-4">
                <p className="text-[16px] font-bold text-[#FF9500]">Do not Purchase</p>
              </div>
            </div>

            {/* Scan Details */}
            <div className="mb-6">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-3">Product was scanned by:</h3>
              <div className="space-y-2 pl-4">
                <p className="text-[15px] text-[#1a1a1a]">User: XXXXX XX144</p>
                <p className="text-[15px] text-[#1a1a1a]">Product: Amul Pure Ghee</p>
                <p className="text-[15px] text-[#1a1a1a]">Date: {scannedDate}</p>
                <p className="text-[15px] text-[#1a1a1a]">Time: {scannedTime}</p>
                <p className="text-[15px] text-[#1a1a1a]">Place: {place || "Mumbai, Maharastra, India"}</p>
              </div>
            </div>

            {/* Possibilities */}
            <div className="mb-6">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-3">Possibilities:</h3>
              <div className="space-y-3 pl-4">
                <p className="text-[14px] text-[#1a1a1a]">
                  You have a product which was scanned on other device.
                </p>
                <p className="text-[14px] text-[#1a1a1a]">
                  Counterfeit QR code to sell you a fake product.
                </p>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

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