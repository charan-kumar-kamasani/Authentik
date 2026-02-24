import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import API_BASE_URL from "../../config/api";
import { useLoading } from '../../context/LoadingContext';
import MobileHeader from "../../components/MobileHeader";

export default function Scan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'granted', 'denied', 'pending'
  const coordsRef = useRef(null);
  const [locationCoords, setLocationCoords] = useState(null);
  const navigate = useNavigate();
  const { setLoading: setGlobalLoading } = useLoading();
  let animationId = useRef(null);

  // Request location permission first when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        coordsRef.current = coords;
        setLocationCoords(coords);
        setLocationPermission('granted');
      },
      (error) => {
        console.warn("Location access needed for scanning:", error);
        setLocationPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);


  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animationId.current);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationId.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      console.log("QR detected:", code.data);
      stopCamera();
      setScanning(false);
      setGlobalLoading(true);

      try {
        // Check location permission before proceeding
        if (!coordsRef.current) {
          alert("Location is required for scanning. Please enable location permissions.");
          setGlobalLoading(false);
          setScanning(true);
          startCamera();
          return;
        }

        const storedToken = localStorage.getItem("token");
        const authHeader = storedToken
          ? (storedToken.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`)
          : null;

        // 1. Lightweight Check
        const checkResRaw = await fetch(`${API_BASE_URL}/scan/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({ qrCode: code.data }),
        });

        const checkData = await checkResRaw.json();

        // If product is INACTIVE, we stop here (as per previous logic)
        // if (checkData.status === "INACTIVE") {
        //   setGlobalLoading(false);
        //   navigate(`/result/INACTIVE`, { state: { message: checkData.message } });
        //   return;
        // }

        // For FAKE or FOUND, we proceed to POST /scan to record the scan history
        console.log("Final scan request with QR:", code.data);
        const scanResRaw = await fetch(`${API_BASE_URL}/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({
            qrCode: code.data,
            latitude: coordsRef.current?.latitude || null,
            longitude: coordsRef.current?.longitude || null,
          }),
        });

        if (!scanResRaw.ok) {
          const err = await scanResRaw.json();
          throw new Error(err.error || "Scan failed");
        }

        const res = await scanResRaw.json();
        const finalStatus = res.status;

        setGlobalLoading(false);
        navigate(`/result/${finalStatus}`, { state: res.data });
      } catch (err) {
        console.error("Scan error:", err);
        setGlobalLoading(false);
        navigate(`/result/ERROR`, { state: { message: "Scan failed. Please try again." } });
      }
      return;
    }

    animationId.current = requestAnimationFrame(scanFrame);
  }, [navigate, stopCamera, scanning, setGlobalLoading]);

  useEffect(() => {
    let ignore = false;

    async function initCamera() {
      if (!scanning) return;

      // Wait for location permission before even attempting to start the camera
      if (locationPermission === 'pending') {
        console.log("Waiting for location permission...");
        return;
      }

      if (locationPermission === 'denied') {
        // We handle the denied state in the UI overlay
        return;
      }

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
  }, [navigate, scanFrame, scanning, stopCamera, locationPermission]);

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {/* Top Header - Transparent/White Gradient */}
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

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

      {/* Location Requirements Overlays */}
      {locationPermission === 'pending' && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 border-4 border-[#2CA4D6] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#333] font-bold">Checking Location Permission...</p>
          <p className="text-gray-500 text-sm mt-2">Please allow location access to start scanning.</p>
        </div>
      )}

      {locationPermission === 'denied' && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📍</span>
          </div>
          <h2 className="text-[24px] font-bold text-[#333] mb-2">Location Required</h2>
          <p className="text-gray-600 mb-8">
            Authentik requires location access to verify product authenticity and protect against counterfeit items.
            Scanning is disabled without location data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2CA4D6] text-white font-bold py-4 rounded-[20px] shadow-lg"
          >
            Allow Location & Retry
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 text-[#2CA4D6] font-bold"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
