import { useParams, useNavigate, useLocation } from "react-router-dom";
import authenticStamp from "../../assets/status_valid.png";
import fakeStamp from "../../assets/status_fake.png";
import duplicateStamp from "../../assets/status_duplicate.png";
import ResultCard from "../../components/ResultCard";

function ResultContent({
  status,
  data,
}: {
  status: string | undefined;
  data: any;
}) {
  const innerNavigate = useNavigate();

  const maskPhone = (value?: string | number): string => {
    if (!value) return "Unknown";

    const str = value.toString();

    if (str.length < 6) return str;

    return `${str.slice(0, 3)}xxxx${str.slice(-3)}`;
  };

  // Helper to render Genuine UI
  if (status === "ORIGINAL") {
    return (
      <ResultCard
        color="#0B610A"
        icon={authenticStamp}
        title={
          data.productName ||
          (data.productId && data.productId.productName) ||
          "Unknown Product"
        }
        buttonText="Click to Review"
        iconSize="w-40 h-40"
        imageContainerClassName=""
      >
        <div className="text-sm leading-relaxed space-y-1 font-medium opacity-95">
          <p>
            <span className="font-bold">Brand:</span>{" "}
            {data.brand || (data.productId && data.productId.brand) || "-"}
          </p>
          {/* <p><span className="font-bold">Net Weight:</span> {data.quantity || (data.productId && data.productId.quantity) || '-'}</p> */}
          <p>
            <span className="font-bold">Batch No:</span>{" "}
            {data.batchNo || (data.productId && data.productId.batchNo) || "-"}
          </p>
          <p>
            <span className="font-bold">Mfd Date:</span>{" "}
            {data.manufactureDate ||
              (data.productId && data.productId.manufactureDate) ||
              "-"}
          </p>
          <p>
            <span className="font-bold">Exp Date:</span>{" "}
            {data.expiryDate ||
              (data.productId && data.productId.expiryDate) ||
              "-"}
          </p>
        </div>

        <div className="mt-4">
          <p className="font-bold text-white text-sm mb-1">
            Additional Details:
          </p>
          <p className="text-[11px] text-white/80 leading-snug">
            Pantene shampoos contain ingredients like water for hydration,
            sodium lauryl sulfate and cocamidopropyl betaine for cleansing and
            ther, dimethicone for smoothness and shine.
          </p>
          <div className="w-full flex justify-center mt-2 cursor-pointer opacity-70">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </ResultCard>
    );
  }

  // Helper to render Fake UI
  if (status === "FAKE") {
    return (
      <ResultCard
        color="#E30211"
        icon={fakeStamp}
        title="Fake Product"
        buttonText="Click to Report"
        iconSize="w-48 h-32"
      >
        <div className="pt-4 text-center">
          <p className="text-white font-bold text-[15px] mb-4 leading-snug">
            The scanned product is a Counterfeit or its not a registered product
            with Authentiks
          </p>
          <p className="text-white font-bold text-[15px] mb-6 leading-snug">
            Millions like you are unknowingly put at risk by consuming or using
            counterfeit products.
          </p>
          <p className="text-white text-sm font-semibold mb-2">
            Help us protect others <br /> Report this product now
          </p>
        </div>
      </ResultCard>
    );
  }

  // Helper to render Inactive UI (richer, matches other result screens)
  if (status === "INACTIVE") {
    const productName =
      data?.productName || data?.product?.productName || "Unknown Product";
    const brand = data?.product?.brand || data?.brand || "-";
    const batchNo = data?.product?.batchNo || data?.batchNo || "-";

    const handleContact = () => {
      const subject = encodeURIComponent(`Inactive QR Code: ${productName}`);
      const body = encodeURIComponent(
        `I scanned the QR code (${data?.qrCode || ""}) and it returned as INACTIVE.\n\nProduct: ${productName}\nBrand: ${brand}\nBatch: ${batchNo}\n\nPlease assist.`,
      );
      window.location.href = `mailto:support@authentick.com?subject=${subject}&body=${body}`;
    };

    return (
      <ResultCard
        color="#6B7280"
        icon={duplicateStamp}
        title={productName}
        buttonText="Contact Support"
        iconSize="w-40 h-40"
        onButtonClick={handleContact}
      >
        <div className="pt-4 text-center">
          <p className="text-white font-bold text-[15px] mb-2 leading-snug">
            This QR code has been deactivated and cannot be used to verify the
            product.
          </p>

          <p className="text-white text-sm mb-4">
            If you purchased this recently or believe this is an error, contact
            the vendor or Authentiks support for help.
          </p>

          <div className="text-left bg-white/10 rounded-md p-3 mt-3">
            <p className="text-white font-semibold text-sm">Product</p>
            <p className="text-white text-sm mb-2">{productName}</p>

            <div className="grid grid-cols-2 gap-2 text-white text-sm">
              <div>
                <div className="font-bold text-xs">Brand</div>
                <div className="text-xs">{brand}</div>
              </div>
              <div>
                <div className="font-bold text-xs">Batch</div>
                <div className="text-xs">{batchNo}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => innerNavigate("/scan")}
              className="text-white underline text-sm"
            >
              Scan Again
            </button>

            <button
              onClick={() => innerNavigate("/home")}
              className="text-white/80 text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </ResultCard>
    );
  }

  // Helper to render Already Scanned UI
  if (
    status === "FAKE" ||
    status === "ALREADY_SCANNED" ||
    status === "ALREADY_USED"
  ) {
    return (
      <ResultCard
        color="#DFB408"
        icon={duplicateStamp}
        title="Already Scanned"
        buttonText="Click to Report"
        iconSize="w-32 h-32"
      >
        <div className="text-left">
          <p className="text-white/90 mb-3 text-sm font-medium">
            Product was scanned by:
          </p>

          <div className="grid grid-cols-[80px_1fr] gap-y-1 mb-6 text-sm font-medium">
            <span className="text-white font-bold">User:</span>
            <span className="text-white overflow-hidden text-ellipsis">
              {maskPhone(data.originalScan?.scannedBy)}
            </span>

            <span className="text-white font-bold">Product:</span>
            <span className="text-white">
              {data.productName ||
                (data.productId && data.productId.productName) ||
                "Unknown Product"}
            </span>

            <span className="text-white font-bold">Brand:</span>
            <span className="text-white">
              {data.brand || (data.productId && data.productId.brand) || "-"}
            </span>

            <span className="text-white font-bold">Batch:</span>
            <span className="text-white">
              {data.batchNo ||
                (data.productId && data.productId.batchNo) ||
                "-"}
            </span>

            <span className="text-white font-bold">Mfd Date:</span>
            <span className="text-white">
              {data.manufactureDate ||
                (data.productId && data.productId.manufactureDate) ||
                "-"}
            </span>

            <span className="text-white font-bold">Exp Date:</span>
            <span className="text-white">
              {data.expiryDate ||
                (data.productId && data.productId.expiryDate) ||
                "-"}
            </span>

            <span className="text-white font-bold">Scanned On:</span>
            <span className="text-white">
              {data.originalScan?.scannedAt
                ? new Date(data.originalScan.scannedAt).toLocaleString()
                : data.scannedAt
                  ? new Date(data.scannedAt).toLocaleString()
                  : "-"}
            </span>

            <span className="text-white font-bold">Place:</span>
            <span className="text-white leading-tight">
              {data.originalScan?.place || data.place || "-"}
            </span>
          </div>

          <p className="font-bold text-white mb-1 text-sm">Possibilities:</p>
          <p className="text-white/90 text-[13px] mb-2 leading-tight">
            You have a product which was scanned on other device.
          </p>
          <p className="text-white/90 text-[13px] leading-tight">
            Counterfeit QR code to sell you a fake product.
          </p>
        </div>
      </ResultCard>
    );
  }

  return null;
}

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Safety: direct URL access / refresh
  if (!state && !status) {
    // Only checking !state might be strict if doing dev testing, but fine for prod
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

  // Define data object defensively
  const data = state || {};

  // Determine theme color based on status
  const getThemeColor = () => {
    switch (status) {
      case "ORIGINAL":
        return "#0B610A";
      case "FAKE":
        return "#E30211";
      case "DUPLICATE":
      case "ALREADY_SCANNED":
      case "ALREADY_USED":
        return "#DFB408";
      default:
        return "#FFFFFF";
    }
  };

  const themeColor = getThemeColor();

  return (
    <div
      className="min-h-screen font-sans flex flex-col items-center relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, #FFFFFF 17%, ${themeColor} 35%)`,
      }}
    >
      {/* Background Overlay for better text readability if needed, or just let the gradient be */}

      {/* Header */}
      <div className="w-full flex items-center p-4 sticky top-0 z-10 bg-transparent">
        <button
          onClick={() => navigate("/home")}
          className="p-2 text-[#0F4160]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F4160]">
            Authen<span className="text-[#32ADD8]">tiks</span>
          </h1>
        </div>
      </div>

      <div className="w-full max-w-sm px-6 pt-4 pb-24 z-10">
        <ResultContent status={status} data={data} />
      </div>
    </div>
  );
}
