import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png"; // Checker exact name
import NotificationIcon from "../../assets/icon_notification.png";
import UserAvatar from "../../assets/profile/user_avatar.png";
import { getProfile, updateProfile } from "../../config/api";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const data = await getProfile(token);
        setFormData({
          name: data.name || "",
          dob: data.dob || "",
          gender: data.gender || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    
    setLoading(true);
    try {
        await updateProfile(formData, token);
        alert("Profile updated successfully!");
        navigate(-1);
    } catch (error) {
        alert("Failed to update profile.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F8] to-[#0F4160] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#214B80]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="p-2">
           <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Picture */}
      <div className="mt-4 mb-8 relative">
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg flex items-center justify-center">
            {/* Using a placeholder if user_avatar is not what we think it is, but user said rename assets/profile so I assume it's there */}
            <img src={UserAvatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <button className="absolute top-2 right-2 bg-[#32ADD8] text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm px-6 space-y-4">
        <div className="bg-white rounded-full px-4 py-3 shadow-md">
            <input 
                type="text" 
                name="name"
                placeholder="Name" 
                className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic"
                value={formData.name}
                onChange={handleChange}
            />
        </div>
         <div className="bg-white rounded-full px-4 py-3 shadow-md">
            <input 
                type="text" 
                name="dob"
                placeholder="DOB - DD/MM/YYYY" 
                className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic"
                value={formData.dob}
                onChange={handleChange}
            />
        </div>

        <div className="relative">
             <div className="bg-white rounded-full px-4 py-3 shadow-md flex items-center justify-between">
                <select 
                    name="gender" 
                    className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic appearance-none bg-transparent"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="" disabled selected>Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <svg className="w-5 h-5 text-[#32ADD8] pointer-events-none absolute right-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
            </div>
        </div>

        <div className="relative">
            <div className="bg-white rounded-full px-4 py-3 shadow-md flex items-center justify-between">
                <select 
                    name="country" 
                    className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic appearance-none bg-transparent"
                    value={formData.country}
                    onChange={handleChange}
                >
                    <option value="" disabled selected>Country</option>
                    <option value="India">India</option>
                </select>
                 <svg className="w-5 h-5 text-[#32ADD8] pointer-events-none absolute right-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
            </div>
        </div>
        
         <div className="relative">
            <div className="bg-white rounded-full px-4 py-3 shadow-md flex items-center justify-between">
                <select 
                    name="state" 
                    className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic appearance-none bg-transparent"
                    value={formData.state}
                    onChange={handleChange}
                >
                    <option value="" disabled selected>State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                </select>
                 <svg className="w-5 h-5 text-[#32ADD8] pointer-events-none absolute right-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
            </div>
        </div>

          <div className="bg-white rounded-full px-4 py-3 shadow-md">
            <input 
                type="text" 
                name="city"
                placeholder="City" 
                className="w-full outline-none text-[#0F4160] placeholder-[#32ADD8] font-medium italic"
                value={formData.city}
                onChange={handleChange}
            />
        </div>

      </div>

      <div className="mt-8 w-full px-6">
        <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#2B99C4] text-white font-bold py-4 rounded-full shadow-lg text-xl hover:bg-[#2587ad] transition-colors disabled:opacity-70"
        >
            {loading ? "Saving..." : "Save"}
        </button>
      </div>

    </div>
  );
}
