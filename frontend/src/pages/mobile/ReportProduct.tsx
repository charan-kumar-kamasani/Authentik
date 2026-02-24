import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ReportProduct() {
    const location = useLocation();
    const navigate = useNavigate();
    const { qrCode } = location.state || {};

    const [productName, setProductName] = useState("");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        // Get location automatically
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
            },
            (err) => {
                console.error("Location error:", err);
                setError("Location access is required to report a product.");
            }
        );
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (files.length < 3 && images.length + files.length < 3) {
            alert("Please select at least 3 images.");
        }

        // In a real app, upload to Cloudinary and get URLs
        // For now, we'll convert to base64 or placeholders as per the current profile logic
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length < 3) {
            setError("At least 3 images are required.");
            return;
        }
        if (!coords) {
            setError("Location is required.");
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
                    productName,
                    brand,
                    images,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    qrCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "Profile incomplete") {
                    alert(data.message);
                    navigate("/profile"); // Redirect to profile to update details
                    return;
                }
                throw new Error(data.message || data.error || "Failed to submit report");
            }

            alert("Report submitted successfully!");
            navigate("/home");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
            <MobileHeader
                title="Report Product"
                onLeftClick={() => navigate(-1)}
                rightIcon={<div className="w-10" />}
            />

            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 space-y-6">
                <div className="bg-white p-6 rounded-[20px] shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            required
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D4E96]"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                        <input
                            type="text"
                            required
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D4E96]"
                            placeholder="Enter brand name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Images (Min 3)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0D4E96] file:text-white hover:file:bg-[#0a3d7a]"
                        />
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {images.map((img, i) => (
                                <img key={i} src={img} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                            ))}
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E30211] text-white font-bold py-4 rounded-[30px] shadow-lg disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Report"}
                </button>
            </form>
        </div>
    );
}
