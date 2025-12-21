import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentPlace } from "../utils/helper";
import API_BASE_URL from "../config/api";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  let animationId = useRef(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", true);
      await videoRef.current.play();

      scanFrame();
    } catch (error) {
      console.error("Camera error:", error);
      alert("Cannot access camera. Please check permissions.");
      setScanning(false);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(animationId.current);

    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  async function scanFrame() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, canvas.width, canvas.height);
    console.log("______code", code);
    if (code) {
      console.log("QR detected:", code.data);

      stopCamera();
      setScanning(false);

      const place = await getCurrentPlace();

      const res = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          qrCode: code.data,
          place,
        }),
      });

      const data = await res.json();
      console.log("_____Data", data);
      navigate(`/result/${data.status}`, {
        state: data.data, // 👈 send ALL backend data
      });

      return;
    }

    animationId.current = requestAnimationFrame(scanFrame);
  }

  useEffect(() => {
    if (scanning) {
      startCamera();
    }

    return () => stopCamera();
  }, [scanning]);

  return (
    <div className="min-h-screen bg-white font-['-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','Helvetica','Arial','sans-serif']">
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate("/profile")}
          className="w-8 h-8 flex flex-col justify-center space-y-1"
        >
          <div className="w-6 h-0.5 bg-[#1a1a1a]"></div>
          <div className="w-6 h-0.5 bg-[#1a1a1a]"></div>
          <div className="w-6 h-0.5 bg-[#1a1a1a]"></div>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="pt-12 px-6">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">
            Authentick
          </h1>
          <p className="text-[#6b6b6b] text-[14px]">
            Be Smart, Choose Authentick Products
          </p>
        </div>

        {/* Horizontal Line */}
        <div className="h-px bg-[#d1d1d6] w-full my-6"></div>

        {/* Report Section */}
        <div className="mb-8">
          <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-4">
            Report on Counterfeiting Products in India
          </h2>

          <div className="mb-6">
            <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-3">
              ASPA-CRISIL Report :
            </h3>
            <p className="text-[15px] text-[#1a1a1a] mb-4 leading-relaxed">
              The counterfeit goods trade in India was valued at ₹2.6 trillion,
              with consumer unawareness playing a major role.
            </p>
          </div>

          {/* Statistics */}
          <div className="space-y-3 mb-6">
            <p className="text-[15px] text-[#1a1a1a]">
              <span className="font-semibold">25-30%</span> of the market in
              India is counterfeit
            </p>

            <p className="text-[15px] text-[#1a1a1a]">
              Nearly <span className="font-semibold">27%</span> of consumers
              were unaware that the product was counterfeit at the time of
              purchase
            </p>
          </div>

          {/* Top Segments */}
          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-3">
              Top Segmets:
            </h3>
            <div className="space-y-2 pl-4">
              <p className="text-[15px] text-[#1a1a1a]">
                Apparel <span className="font-semibold">(31%)</span>
              </p>
              <p className="text-[15px] text-[#1a1a1a]">
                FMCG <span className="font-semibold">(28%)</span>
              </p>
              <p className="text-[15px] text-[#1a1a1a]">
                Automotives <span className="font-semibold">(25%)</span>
              </p>
              <p className="text-[15px] text-[#1a1a1a]">
                Pharmaceuticals <span className="font-semibold">(20%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Line */}
        <div className="h-px bg-[#d1d1d6] w-full my-6"></div>
      </div>

      {/* QR Scanner Section - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#d1d1d6]">
        {!scanning ? (
          <div className="p-6 text-center">
            <button
              onClick={() => setScanning(true)}
              className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#2c2c2e] active:bg-[#000] transition-colors duration-200 w-full max-w-[300px] mx-auto block"
            >
              Scan QR Code
            </button>
          </div>
        ) : (
          <div className="p-4">
            {/* Camera View - Takes over bottom section */}
            <div className="relative rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-4">
              <video
                ref={videoRef}
                className="w-full h-[300px] object-cover"
                autoPlay
                playsInline
              />
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[220px] h-[220px] border-2 border-white/50 rounded-[16px] relative">
                  {/* Corner borders */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br"></div>
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="text-center">
              <p className="text-[#1a1a1a] text-[16px] font-medium mb-2">
                Scanning...
              </p>

              <button
                onClick={() => {
                  stopCamera();
                  setScanning(false);
                }}
                className="bg-white text-[#ff3b30] border border-[#ff3b30] px-6 py-3 rounded-[10px] text-[15px] font-medium shadow-[0_2px_8px_rgba(255,59,48,0.15)] hover:bg-[#fff5f5] active:bg-[#ffe5e5] transition-all duration-200"
              >
                Stop Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
