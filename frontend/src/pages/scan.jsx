import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { getCurrentPlace } from "../utils/helper";
import API_BASE_URL from "../config/api";

export default function Scan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
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
      navigate("/");
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

    if (code) {
      console.log("QR detected:", code.data);

      stopCamera();
      setScanning(false);
      setLoading(true);

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
      setLoading(false);
      navigate(`/result/${data.status}`, { state: data.data });
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
    <div className="min-h-screen bg-[#f5f5f7] font-['-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','Helvetica','Arial','sans-serif'] p-6 flex flex-col items-center justify-center relative">
      {/* Time */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-black font-medium text-[14px]">
        10:10 AM
      </div>

      <div className="w-full max-w-[400px]">
        <div className="relative rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-6">
          <video
            ref={videoRef}
            className="w-full h-[400px] object-cover"
            autoPlay
            playsInline
          />
          {/* Scanner overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[280px] h-[280px] border-2 border-white/50 rounded-[16px] relative">
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br"></div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="text-center">
          <p className="text-[#1a1a1a] text-[16px] font-medium mb-2">
            Scanning...
          </p>
          <p className="text-[#6b6b6b] text-[14px] mb-6">
            Position QR code within the frame
          </p>

          <button
            onClick={() => {
              stopCamera();
              navigate("/");
            }}
            className="bg-white text-[#ff3b30] border border-[#ff3b30] px-6 py-3 rounded-[10px] text-[15px] font-medium shadow-[0_2px_8px_rgba(255,59,48,0.15)] hover:bg-[#fff5f5] active:bg-[#ffe5e5] transition-all duration-200"
          >
            Stop Scan
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-gray-900 font-medium">Verifying Product...</p>
        </div>
      )}
    </div>
  );
}
