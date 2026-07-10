import React, { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import API_BASE_URL from "../config/api";

export default function DemoModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10); // Remove non-numeric characters and limit to 10 max
      setPhoneError(""); // Clear error when typing
    }
    
    if (name === "email") {
      setEmailError(""); // Clear error when typing
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Phone number validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ""))) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        requirements: formData.message || "Requested a demo via the Book a Demo modal",
        source: 'demo-modal'
      };

      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorText = 'Something went wrong';
        try {
          const data = await res.json();
          errorText = data.message || errorText;
        } catch (err) {
          errorText = `Server Error (${res.status})`;
        }
        throw new Error(errorText);
      }

      setStatus("success");
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", company: "", message: "" });
        setPhoneError("");
        setEmailError("");
        setStatus("idle");
        onClose();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Request More Information</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                emailError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-blue-600 focus:border-blue-600"
              }`} 
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required 
              maxLength={10}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                phoneError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-blue-600 focus:border-blue-600"
              }`} 
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company (Optional)</label>
            <input 
              type="text" 
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message / Requirements</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-none" 
            ></textarea>
          </div>
          <div>
            <button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {status === "loading" && <Loader2 size={20} className="animate-spin" />}
              {status === "success" && <CheckCircle2 size={20} />}
              {status === "idle" && "Submit Request"}
              {status === "loading" && "Submitting..."}
              {status === "success" && "Sent Successfully!"}
              {status === "error" && "Try Again"}
            </button>
            {status === "error" && (
              <p className="text-red-500 text-sm text-center mt-2">{errorMsg}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
