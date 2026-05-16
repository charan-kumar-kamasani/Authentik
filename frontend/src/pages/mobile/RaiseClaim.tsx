import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MobileHeader from '../../components/MobileHeader';
import { updateWarrantyClaim } from '../../config/api';
import { AlertCircle, Camera, Upload, Trash2, CheckCircle2, ChevronDown, X } from 'lucide-react';

const ISSUE_OPTIONS = [
  "Not Working / Functional Issue",
  "Performance Issue",
  "Physical Damage / Defect",
  "Power / Electrical Issue",
  "Part / Component Issue",
  "Missing / Incorrect Item",
  "Installation / Setup Issue",
  "Previous Service Issue",
  "Warranty / Documentation Issue",
  "Other"
];

export default function RaiseClaim() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const claim = state?.claim;

  const [issue, setIssue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!issue) return alert('Please select an issue');
    if (!description) return alert('Please provide a description');

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      // Upload images to Cloudinary
      const uploadedUrls: string[] = [];
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dx4i1w3uf';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      for (const img of images) {
        const formData = new FormData();
        formData.append('file', img.file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      }

      await updateWarrantyClaim(id, {
        issue,
        claimDescription: description,
        claimImages: uploadedUrls,
        status: 'Sent' // Reset status to Sent for new claim details
      }, token);

      alert('Claim submitted successfully!');
      navigate('/warranty');
    } catch (err) {
      console.error('Error submitting claim:', err);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="Raise Claim" onLeftClick={() => navigate(-1)} />
      
      <div className="px-6 py-6">
        <div className="bg-blue-50 rounded-2xl p-4 mb-8 flex gap-3 border border-blue-100">
           <AlertCircle className="text-blue-600 shrink-0" size={20} />
           <p className="text-[13px] font-bold text-blue-800 leading-tight">
             Please provide accurate details about the issue to help us resolve it quickly.
           </p>
        </div>

        <div className="space-y-6">
          {/* Issue Selection */}
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">Issue Type *</label>
            <button
              onClick={() => setShowOptions(true)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <span className={issue ? 'text-slate-800' : 'text-slate-400 font-medium'}>
                {issue || 'Select an issue'}
              </span>
              <ChevronDown className={`text-slate-400 transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} size={20} />
            </button>
          </div>

          {/* Custom Selection Modal (Bottom Sheet) */}
          {showOptions && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" 
                onClick={() => setShowOptions(false)} 
              />
              
              {/* Sheet */}
              <div className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <h3 className="text-[18px] font-black text-slate-800 tracking-tight">Select Issue</h3>
                  <button onClick={() => setShowOptions(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="overflow-y-auto py-2 px-4">
                  {ISSUE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setIssue(opt);
                        setShowOptions(false);
                      }}
                      className={`w-full px-5 py-4 my-1 rounded-2xl flex items-center justify-between transition-all group ${
                        issue === opt 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className={`text-[15px] font-bold ${issue === opt ? 'translate-x-1' : ''} transition-transform`}>
                        {opt}
                      </span>
                      {issue === opt && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                          <CheckCircle2 className="text-white" size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-4 shrink-0" /> {/* Safe area / padding */}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about the problem..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[140px] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3 ml-1">Upload Images (Max 3)</label>
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 group">
                  <img src={img.preview} alt="issue" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="text-white" size={20} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 transition-all active:scale-95">
                  <Camera size={24} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Add</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
                </label>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full mt-12 py-5 rounded-[24px] font-black text-[17px] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
            submitting ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-blue-200'
          }`}
        >
          {submitting ? (
             <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />
          ) : (
            <>
              <CheckCircle2 size={20} />
              Submit Claim
            </>
          )}
        </button>
      </div>
    </div>
  );
}
