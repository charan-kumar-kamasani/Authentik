import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

import warningIcon from "../../assets/v2/home/header/warning.svg";
import fakeIcon from "../../assets/v2/home/header/dangerous.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dx4i1w3uf";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

const MAX_IMAGES = 6;
const MIN_IMAGES = 3;

// ─── Theme config ─────────────────────────────────────────────────────────────
const THEMES = {
  COUNTERFEIT: {
    bgColor: "#E30211",
    shadow: "rgba(227,2,17,0.35)",
    icon: fakeIcon,
    title: "Counterfeit Report",
    subtitle: "Help us fight Counterfeits",
    noteColor: "text-[#E30211]",
    minImgColor: "text-[#E30211]",
    btnClass: "bg-[#E30211] hover:bg-[#c9020f] shadow-[0_8px_20px_rgba(227,2,17,0.4)]",
    ringClass: "focus:ring-[#E30211]",
    selectedBorder: "border-[#E30211]",
  },
  FAKE: {
    bgColor: "#FFA808",
    shadow: "rgba(255,168,8,0.35)",
    icon: warningIcon,
    title: "Duplicate Report",
    subtitle: "Help us fight fraudulent",
    noteColor: "text-[#FFA808]",
    minImgColor: "text-[#FFA808]",
    btnClass: "bg-[#FFA808] hover:bg-[#e59410] shadow-[0_8px_20px_rgba(255,168,8,0.4)]",
    ringClass: "focus:ring-[#FFA808]",
    selectedBorder: "border-[#FFA808]",
  },
};

export default function ReportProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const { qrCode, reportType: passedType, productName: passedName, brand } =
    (location.state as any) || {};

  // Default to COUNTERFEIT if nothing passed
  const reportType: "COUNTERFEIT" | "FAKE" =
    passedType === "FAKE" ? "FAKE" : "COUNTERFEIT";
  const theme = THEMES[reportType];

  const [productName, setProductName] = useState(passedName || "");
  const [description, setDescription] = useState("");
  
  // We keep track of max 6 slots. Items are either plain strings (urls) or empty
  const [images, setImages] = useState<string[]>(Array(MAX_IMAGES).fill(""));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(MAX_IMAGES).fill(""));
  
  // We can track multiple uploading states now
  const [uploadingIndices, setUploadingIndices] = useState<boolean[]>(Array(MAX_IMAGES).fill(false));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {}
    );
  }, []);

  const handleSlotClick = () => {
    // If not all slots are filled, trigger file input to pick multiple files
    const allFilled = images.every((img) => img !== "");
    if (!allFilled && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleMultipleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Find all currently empty slots that are NOT uploading
    const emptySlotIndices = images
      .map((img, idx) => (img === "" && !uploadingIndices[idx] ? idx : -1))
      .filter((idx) => idx !== -1);

    if (emptySlotIndices.length === 0) {
      setError("You have reached the maximum number of images.");
      return;
    }

    // Only take as many files as we have empty slots
    const filesToUpload = files.slice(0, emptySlotIndices.length);
    const assignedIndices = filesToUpload.map((_, i) => emptySlotIndices[i]);

    // Set local previews and uploading states
    setImagePreviews((prev) => {
      const next = [...prev];
      filesToUpload.forEach((file, i) => {
        next[assignedIndices[i]] = URL.createObjectURL(file);
      });
      return next;
    });

    setUploadingIndices((prev) => {
        const next = [...prev];
        assignedIndices.forEach(idx => {
            next[idx] = true;
        });
        return next;
    });

    setError("");

    // Upload them in parallel
    await Promise.all(
        filesToUpload.map(async (file, i) => {
            const slotIdx = assignedIndices[i];
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: "POST", body: formData }
                );
                const data = await res.json();

                if (!data.secure_url) throw new Error("Upload failed");

                // Save secure URL
                setImages((prev) => {
                    const next = [...prev];
                    next[slotIdx] = data.secure_url;
                    return next;
                });
            } catch (err) {
                console.error("Image upload failed:", err);
                // Clear preview on failure
                setImagePreviews((prev) => {
                    const next = [...prev];
                    next[slotIdx] = "";
                    return next;
                });
                setError(prev => prev ? prev + "\nFailed to upload an image." : "Failed to upload an image.");
            } finally {
                // Remove loading state for this slot
                setUploadingIndices((prev) => {
                    const next = [...prev];
                    next[slotIdx] = false;
                    return next;
                });
            }
        })
    );

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => { const n = [...prev]; n[idx] = ""; return n; });
    setImagePreviews((prev) => { const n = [...prev]; n[idx] = ""; return n; });
  };

  const uploadedCount = images.filter(Boolean).length;
  const anyUploading = uploadingIndices.some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (uploadedCount < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} product images.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/scan/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: productName.trim(),
          brand: brand || "",
          description: description.trim(),
          reportType,
          images: images.filter(Boolean),
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          qrCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Profile incomplete") {
          alert(data.message);
          navigate("/edit-profile");
          return;
        }
        throw new Error(data.message || data.error || "Failed to submit report");
      }

      alert("Complaint submitted successfully! Our team will investigate.");
      navigate("/my-reports");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <MobileHeader
        title="Authentiks"
        onLeftClick={() => navigate(-1)}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md flex flex-col">
        {/* ── Coloured Banner ── */}
        <div
          className="mx-4 mt-4 rounded-[16px] overflow-hidden"
          style={{ boxShadow: `0 8px 20px ${theme.shadow}` }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: theme.bgColor }}
          >
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src={theme.icon} alt="icon" className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white font-bold text-[16px] leading-tight">{theme.title}</p>
              <p className="text-white/85 text-[12px]">{theme.subtitle}</p>
            </div>
          </div>
          <div className="bg-[#333333] px-4 py-2 text-center">
            <p className="text-white font-bold text-[13px] tracking-wide uppercase">
              Please Provide Accurate Details
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-4 pt-5 pb-28 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={`w-full p-3 bg-[#EBEBEB] rounded-[12px] text-[#333] text-sm focus:outline-none focus:ring-2 ${theme.ringClass}`}
            />
          </div>

          {/* Describe the Issue */}
          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Describe the Issue
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 bg-[#EBEBEB] rounded-[12px] text-[#333] text-sm resize-none focus:outline-none focus:ring-2 ${theme.ringClass}`}
            />
          </div>

          {/* Image Grid */}
          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1">
              Upload Product Photos <span className="text-red-500">*</span>
            </label>
            <p className={`text-[11px] font-semibold mb-3 ${theme.minImgColor}`}>
              Minimum {MIN_IMAGES} clear images
            </p>

            {/* Hidden Input for multiple file selection */}
            <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleMultipleFileChange}
            />

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
                const hasImageOrPreview = !!imagePreviews[idx] || !!images[idx];
                const isLoading = uploadingIndices[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                        if (!hasImageOrPreview && !isLoading) {
                            handleSlotClick();
                        }
                    }}
                    className={[
                      "relative w-full aspect-square rounded-[14px] flex items-center justify-center overflow-hidden",
                      hasImageOrPreview
                        ? `border-2 ${theme.selectedBorder}`
                        : "bg-[#EBEBEB] border-2 border-transparent cursor-pointer",
                    ].join(" ")}
                  >
                    {hasImageOrPreview ? (
                      <>
                        <img
                          src={imagePreviews[idx] || images[idx]}
                          alt={`img-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            </div>
                        )}
                        {!isLoading && (
                            <button
                                type="button"
                                onClick={(ev) => { ev.stopPropagation(); removeImage(idx); }}
                                className="absolute top-1 right-1 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1 1l8 8M9 1l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                            </button>
                        )}
                      </>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
            {uploadedCount > 0 && (
              <p className="mt-2 text-[11px] text-gray-500 text-right">
                {uploadedCount}/{MAX_IMAGES} uploaded
                {uploadedCount < MIN_IMAGES && (
                  <span className={`ml-1 font-semibold ${theme.noteColor}`}>
                    ({MIN_IMAGES - uploadedCount} more needed)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-[12px] font-medium text-center bg-red-50 p-3 rounded-xl whitespace-pre-wrap">
              {error}
            </p>
          )}

          {/* Note */}
          <p className={`text-[11px] font-semibold text-center ${theme.noteColor}`}>
            Note: False complaints may lead to account suspension
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || anyUploading}
            className={`w-full text-white font-bold text-[17px] py-4 rounded-[30px] transition-colors ${theme.btnClass} disabled:opacity-50`}
          >
            {loading ? "Submitting..." : anyUploading ? "Uploading Images..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}
