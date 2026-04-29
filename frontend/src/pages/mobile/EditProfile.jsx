import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../assets/v2/profile/Group (2).svg";
import { getProfile, updateProfile } from "../../config/api";
import MobileHeader from "../../components/MobileHeader";
import { useConfirm } from "../../components/ConfirmModal";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your-cloud-name";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your-preset";

export default function EditProfile() {
  const navigate = useNavigate();
  const confirmModal = useConfirm();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    gender: "",
    profileImage: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const data = await getProfile(token);
        setFormData({
          name: data.name || "",
          ageGroup: data.ageGroup || "", // e.g., "20-24"
          gender: data.gender || "", // e.g., "male"
          profileImage: data.profileImage || null,
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      if (img.width !== img.height) {
        await confirmModal({ title: 'Aspect Ratio', description: "Please upload a square image (1:1 aspect ratio).", cancelText: null });
        e.target.value = "";
        return;
      }

      setUploadingImage(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formDataUpload,
          }
        );

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        // Store the Cloudinary URL in formData
        setFormData((prev) => ({ ...prev, profileImage: data.secure_url }));
        await confirmModal({ title: 'Success', description: "Image uploaded successfully!", cancelText: null });
      } catch (error) {
        console.error("Image upload error:", error);
        await confirmModal({ title: 'Error', description: "Failed to upload image. Please try again.", cancelText: null });
      } finally {
        setUploadingImage(false);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleChange = (e) => {
    // If e has target, normal input. If direct value (from custom radio), handle differently maybe?
    // Actually standard radio inputs work fine.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    try {
      // Only send necessary fields to backend
      const dataToSave = {
        name: formData.name,
        ageGroup: formData.ageGroup,
        gender: formData.gender,
      };

      // Include profileImage only if it was updated
      if (formData.profileImage) {
        dataToSave.profileImage = formData.profileImage;
      }

      await updateProfile(dataToSave, token);

      // Reset profile prompt tracking since user completed their profile
      if (formData.name) {
        localStorage.removeItem("profilePromptLastDismissed");
        localStorage.removeItem("profilePromptDismissCount");
      }

      await confirmModal({ title: 'Success', description: "Profile updated successfully!", cancelText: null });
      navigate(-1);
    } catch (error) {
      await confirmModal({ title: 'Error', description: "Failed to update profile.", cancelText: null });
    } finally {
      setLoading(false);
    }
  };

  // Custom Radio Button
  const RadioOption = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-[#0D4E96] shadow-[0_0_8px_rgba(13,78,150,0.3)]' : 'border-[#BBB]'}`}>
        {checked ? (
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6]"></div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-[#E8F4F9]"></div>
        )}
      </div>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span className="text-[#1e3a5f] text-[15px] font-bold whitespace-nowrap group-hover:text-[#0D4E96] transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <MobileHeader onLeftClick={() => navigate(-1)} />

      {/* User Avatar Section */}
      <div className="mt-8 mb-8 flex flex-col items-center">
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center mb-4">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] flex items-center justify-center shadow-[0_8px_24px_rgba(13,78,150,0.3)] p-[3px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img src={UserAvatar} alt="Profile" className="w-14 h-14 object-contain" />
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white px-10 py-2.5 rounded-[25px] font-black text-[14px] shadow-[0_6px_20px_rgba(13,78,150,0.35)] hover:shadow-[0_8px_24px_rgba(13,78,150,0.45)] active:scale-95 transition-all disabled:opacity-50"
        >
          {uploadingImage ? "Uploading..." : "Edit Image"}
        </button>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm px-6 space-y-6">

        {/* Full Name */}
        <div>
          <label className="block text-[#0D4E96] font-black text-[16px] mb-2">Full Name</label>
          <div className="bg-white rounded-[30px] px-6 py-3 shadow-[0_4px_16px_rgba(13,78,150,0.1)] border-2 border-[#E8F4F9] focus-within:border-[#2CA4D6] focus-within:shadow-[0_4px_20px_rgba(44,164,214,0.2)] transition-all">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full outline-none text-[#1e3a5f] font-semibold placeholder:text-[#BBB]"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>



        {/* Age Group */}
        <div>
          <label className="block text-[#0D4E96] font-black text-[16px] mb-3">Age Group</label>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <RadioOption label="1 - 12 Years" name="ageGroup" value="1-12" checked={formData.ageGroup === '1-12'} onChange={handleChange} />
            <RadioOption label="13 - 19 Years" name="ageGroup" value="13-19" checked={formData.ageGroup === '13-19'} onChange={handleChange} />
            <RadioOption label="20 - 24 Years" name="ageGroup" value="20-24" checked={formData.ageGroup === '20-24'} onChange={handleChange} />
            <RadioOption label="25 - 34 Years" name="ageGroup" value="25-34" checked={formData.ageGroup === '25-34'} onChange={handleChange} />
            <RadioOption label="35 - 44 Years" name="ageGroup" value="35-44" checked={formData.ageGroup === '35-44'} onChange={handleChange} />
            <RadioOption label="45+ Years" name="ageGroup" value="45+" checked={formData.ageGroup === '45+'} onChange={handleChange} />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[#0D4E96] font-black text-[16px] mb-3">Gender</label>
          <div className="flex flex-wrap gap-4">
            <RadioOption label="Male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
            <RadioOption label="Female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
            <RadioOption label="Cant Share" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-12 w-full px-6 mb-16">
        <button
          onClick={handleSave}
          disabled={loading || uploadingImage}
          className="w-full bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] text-white font-black py-4 rounded-[30px] shadow-[0_12px_32px_rgba(13,78,150,0.35)] hover:shadow-[0_16px_40px_rgba(13,78,150,0.45)] text-[18px] active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <span className="relative">{loading ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-shimmer {
            animation: shimmer 3s infinite linear;
          }
        `}
      </style>

    </div>
  );
}
