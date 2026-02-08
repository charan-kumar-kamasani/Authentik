import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { getCurrentPlace } from "../../utils/helper";
import API_BASE_URL from "../../config/api";

export default function Scan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const navigate = useNavigate();
  let animationId = useRef(null);

  // Removed standalone startCamera function as it's now integrated into useEffect


  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animationId.current);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(async function scanFrameFn() {
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

      // pause camera and UI
      stopCamera();
      setScanning(false);

      // 1) Lightweight check to ensure QR exists and isActive
      try {
        const checkResRaw = await fetch(`${API_BASE_URL}/scan/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrCode: code.data }),
        });

        const checkData = await checkResRaw.json();

        // If QR is fake or inactive, immediately show result message and do not send full scan
        if (checkData.status === "FAKE") {
          navigate(`/result/FAKE`, { state: { qrCode: code.data } });
          return;
        }

        if (checkData.status === "FOUND" && !checkData.isActive) {
          navigate(`/result/INACTIVE`, {
            state: {
              qrCode: code.data,
              product: checkData.product,
              message: "This QR code is inactive.",
            },
          });
          return;
        }

        // Otherwise QR exists and isActive -> continue with location + scan POST
        // Get coordinates (latitude, longitude) and human-readable place
        const coords = await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve({ latitude: null, longitude: null });
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve({ latitude: null, longitude: null }),
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });

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
            latitude: coords.latitude,
            longitude: coords.longitude,
          }),
        });

        const data = await res.json();
        navigate(`/result/${data.status}`, { state: data.data });
        return;
      } catch (err) {
        console.error("Scan/check error:", err);
        // Fallback: show generic error result
        navigate(`/result/ERROR`, { state: { message: "Scan failed. Please try again." } });
        return;
      }
    }

    animationId.current = requestAnimationFrame(scanFrameFn);
  }, [navigate, stopCamera]);

  useEffect(() => {
    let ignore = false;

    async function initCamera() {
      if (!scanning) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera API not supported in this browser.");
        navigate("/");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        if (ignore || !videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        
        // Wait for metadata to be loaded before playing
        await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
                resolve();
            };
        });

        // Check again after await
        if (ignore || !videoRef.current) return;

        await videoRef.current.play().catch(e => {
            if (e.name === 'AbortError') {
                 // Ignore abort errors caused by cleanup
                 return;
            }
            throw e;
        });
        
        scanFrame();

      } catch (error) {
        if (!ignore) {
            console.error("Camera error:", error);
            alert(`Cannot access camera: ${error.name} - ${error.message}`);
            navigate("/");
        }
      }
    }

    initCamera();

    return () => {
      ignore = true;
      stopCamera();
    };
  }, [navigate, scanFrame, scanning, stopCamera]);

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {/* Top Header - Transparent/White Gradient */}
      <div className="flex items-center p-4 absolute top-0 left-0 right-0 z-20 bg-white shadow-sm">
        <button
          onClick={() => navigate("/home")}
          className="p-2 text-[#0F4160]"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
           <line x1="3" y1="12" x2="21" y2="12"></line>
           <line x1="3" y1="6" x2="21" y2="6"></line>
           <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-[26px] font-bold tracking-tight text-[#214B80]">
            Authen<span className="text-[#2CA4D6]">tiks</span>
          </h1>
        </div>
      </div>

      {/* Main Camera View - Full Screen */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {scanning ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Dark Overlay with Transparent Center Window */}
            <div className="absolute inset-0 z-10 bg-black/50">
               {/* Center clear hole is simulated by SVG or clip-path in more complex apps, 
                   but here we use borders. 
                   Actually to make the center transparent while sides are dark, simple CSS borders on a full-screen div won't work well 
                   unless we use a HUGE box shadow (common trick) or SVG mask.
                   Let's use the Box Shadow trick for the cleanest "Hole" effect. 
               */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-[30px] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden">
                  {/* Yellow Corners inside the clear area */}
                   {/* Top Left */}
                   <div className="absolute top-[20px] left-[20px] w-12 h-12 border-t-[6px] border-l-[6px] border-[#F2C94C] rounded-tl-[12px]"></div>
                   {/* Top Right */}
                   <div className="absolute top-[20px] right-[20px] w-12 h-12 border-t-[6px] border-r-[6px] border-[#F2C94C] rounded-tr-[12px]"></div>
                   {/* Bottom Left */}
                   <div className="absolute bottom-[20px] left-[20px] w-12 h-12 border-b-[6px] border-l-[6px] border-[#F2C94C] rounded-bl-[12px]"></div>
                   {/* Bottom Right */}
                   <div className="absolute bottom-[20px] right-[20px] w-12 h-12 border-b-[6px] border-r-[6px] border-[#F2C94C] rounded-br-[12px]"></div>
                  
                  {/* Scan Line Animation - Thicker and glowing */}
                  <div className="w-[90%] h-[4px] bg-[#F2C94C] absolute animate-scan shadow-[0_0_10px_#F2C94C] rounded-full"></div>
               </div>
            </div>
          </>
        ) : (
          <div className="text-white text-lg font-bold z-20">Processing Scan...</div>
        )}
      </div>
    </div>
  );
}
