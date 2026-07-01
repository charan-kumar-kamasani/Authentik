import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../config/api";
import { useConfirm } from "../../components/ConfirmModal";
import MobileNavbar from "../../components/MobileNavbar";
import { 
  ChevronLeft, 
  User, 
  Camera, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronDown, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  X,
  Circle,
  CheckCircle2
} from "lucide-react";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dx4i1w3uf";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export default function EditProfile() {
  const navigate = useNavigate();
  const confirmModal = useConfirm();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
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
          email: data.email || "",
          phone: data.mobile || data.phone || "",
          dob: data.dob || "",
          gender: data.gender || "",
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

        if (!response.ok) throw new Error("Image upload failed");
        
        const data = await response.json();
        setFormData((prev) => ({ ...prev, profileImage: data.secure_url }));
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
      };

      if (formData.profileImage) {
        dataToSave.profileImage = formData.profileImage;
      }

      await updateProfile(dataToSave, token);

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

  // Gender Selection Card
  const GenderCard = ({ value, label, iconColor, bgColor, icon: IconComponent }) => {
    const isSelected = formData.gender === value;
    return (
      <div 
        onClick={() => setFormData({ ...formData, gender: value })}
        className={`flex-1 relative rounded-xl border flex flex-col items-center justify-center py-4 cursor-pointer transition-all ${
          isSelected ? 'border-[#105DE4] bg-[#F0F5FF]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="absolute top-2 left-2">
          {isSelected ? (
            <CheckCircle2 size={18} className="text-[#105DE4] fill-white" />
          ) : (
            <Circle size={18} className="text-slate-300" />
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${bgColor}`}>
          <IconComponent size={24} className={iconColor} />
        </div>
        <span className="text-[12px] font-bold text-[#0B1E36]">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-[90px] relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#0B1E36] rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold text-[#0B1E36] tracking-tight">Edit Profile</h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="px-4 pt-4">
        {/* Top Profile Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6 border border-slate-100">
          <div className="flex gap-4 items-center">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[84px] h-[84px] bg-[#EBF2FF] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-[#105DE4]" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#105DE4] rounded-full flex items-center justify-center border-2 border-white shadow-md active:scale-95 transition-transform"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[#0B1E36] text-[20px] font-bold leading-tight truncate mb-1">
                {formData.name || "User"}
              </h2>
              <div className="inline-flex items-center gap-1 bg-[#F0F5FF] text-[#105DE4] px-2 py-0.5 rounded-[6px] mb-2">
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
              </div>
              <p className="text-[#64748B] text-[11px] font-medium leading-snug">
                Update your profile information<br/>to keep your account secure.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-[#0B1E36] text-[15px] font-bold mb-3 px-1">Personal Information</h3>
          
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[#64748B] text-[12px] font-medium mb-1.5 px-1">Full Name</label>
              <div className="flex items-center bg-white rounded-[12px] border border-slate-200 px-3 py-3 focus-within:border-[#105DE4] transition-colors">
                <User size={18} className="text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 outline-none text-[#0B1E36] text-[14px] font-medium placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[#64748B] text-[12px] font-medium mb-1.5 px-1">Email Address</label>
              <div className="flex items-center bg-white rounded-[12px] border border-slate-200 px-3 py-3 focus-within:border-[#105DE4] transition-colors">
                <Mail size={18} className="text-slate-400 shrink-0 mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 outline-none text-[#0B1E36] text-[14px] font-medium placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[#64748B] text-[12px] font-medium mb-1.5 px-1">Mobile Number</label>
              <div className="flex items-center bg-white rounded-[12px] border border-slate-200 px-3 py-3 focus-within:border-[#105DE4] transition-colors">
                <Phone size={18} className="text-slate-400 shrink-0 mr-3" />
                <div className="flex items-center gap-1 mr-3 shrink-0">
                  <span className="text-[#0B1E36] text-[14px] font-medium">+91</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                <div className="w-[1px] h-5 bg-slate-200 mr-3 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter mobile number"
                  value={formData.phone?.replace(/^\+91/, '')}
                  readOnly
                  className="flex-1 outline-none text-slate-400 text-[14px] font-medium bg-transparent"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[#64748B] text-[12px] font-medium mb-1.5 px-1">Date of Birth</label>
              <div className="flex items-center bg-white rounded-[12px] border border-slate-200 px-3 py-3 focus-within:border-[#105DE4] transition-colors">
                <Calendar size={18} className="text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  name="dob"
                  placeholder="DD MMM YYYY"
                  value={formData.dob}
                  onChange={handleChange}
                  className="flex-1 outline-none text-[#0B1E36] text-[14px] font-medium placeholder:font-normal placeholder:text-slate-400"
                />
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[#64748B] text-[12px] font-medium mb-1.5 px-1">Gender <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="flex gap-3">
                <GenderCard value="Male" label="Male" icon={User} iconColor="text-[#3B82F6]" bgColor="bg-[#DBEAFE]" />
                <GenderCard value="Female" label="Female" icon={User} iconColor="text-[#EC4899]" bgColor="bg-[#FCE7F3]" />
                <GenderCard value="Other" label="Prefer Not To Say" icon={User} iconColor="text-[#8B5CF6]" bgColor="bg-[#EDE9FE]" />
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-[12px] p-3 flex gap-3 mt-2">
              <ShieldCheck size={20} className="text-[#105DE4] shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[#0B1E36] text-[11px] leading-snug font-medium">
                This information helps brands provide more relevant product recommendations and offers. Your data is never shared without your consent.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-8">
          <button
            onClick={handleSave}
            disabled={loading || uploadingImage}
            className="w-full bg-[#105DE4] text-white font-bold py-3.5 rounded-[12px] text-[14px] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full bg-white text-[#105DE4] border border-[#105DE4] font-bold py-3.5 rounded-[12px] text-[14px] active:bg-blue-50 transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
        </div>
      </div>

      <MobileNavbar />
    </div>
  );
}
