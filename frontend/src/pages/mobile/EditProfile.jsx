import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../assets/v2/profile/Group (2).svg";
import { getProfile, updateProfile } from "../../config/api";
import MobileHeader from "../../components/MobileHeader";

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    gender: "",
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
          ageGroup: data.ageGroup || "", // e.g., "20-24"
          gender: data.gender || "", // e.g., "male"
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [navigate]);

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
      await updateProfile(formData, token);
      alert("Profile updated successfully!");
      navigate(-1);
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Custom Radio Button
  const RadioOption = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-[#0F4160]' : 'border-[#BBB]'}`}>
        {checked ? (
          <div className="w-3 h-3 rounded-full bg-[#0F4160]"></div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
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
      <span className="text-[#666] text-[15px] font-bold whitespace-nowrap">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <MobileHeader onLeftClick={() => navigate(-1)} />

      {/* User Avatar Section */}
      <div className="mt-8 mb-8 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full bg-[#0E5CAB] flex items-center justify-center mb-3 shadow-md relative">
          <div className="w-24 h-24 rounded-full bg-[#0E5CAB] flex items-center justify-center">
            <img src={UserAvatar} alt="Profile" className="w-14 h-14 object-contain" />
          </div>
        </div>
        <button className="bg-[#0D4E96] text-white px-8 py-2 rounded-[20px] font-bold text-[14px] shadow-[0_4px_15px_rgba(13,78,150,0.3)]">
          Edit Image
        </button>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm px-6 space-y-6">

        {/* Full Name */}
        <div>
          <label className="block text-[#0D4E96] font-bold text-[16px] mb-2">Full Name</label>
          <div className="bg-white rounded-[30px] px-6 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full outline-none text-[#333] font-medium placeholder-transparent" /* Placeholder simplified */
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>



        {/* Age Group */}
        <div>
          <label className="block text-[#0D4E96] font-bold text-[16px] mb-3">Age Group</label>
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
          <label className="block text-[#0D4E96] font-bold text-[16px] mb-3">Gender</label>
          <div className="flex flex-wrap gap-4">
            <RadioOption label="Male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
            <RadioOption label="Female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
            <RadioOption label="Cant Share" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-12 w-full px-6 mb-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#1B3A6B] text-white font-bold py-4 rounded-[30px] shadow-[0_10px_25px_rgba(27,58,107,0.4)] text-[20px] hover:bg-[#152e55] transition-colors"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

    </div>
  );
}
