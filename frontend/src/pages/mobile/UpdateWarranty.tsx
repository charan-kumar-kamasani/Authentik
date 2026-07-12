import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MobileHeader from '../../components/MobileHeader';
import { updateWarrantyClaim } from '../../config/api';
import { Calendar, Camera, Trash2, CheckCircle2, ShieldCheck, History, AlertCircle } from 'lucide-react';

export default function UpdateWarranty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const claim = state?.claim;

  const [purchaseDate, setPurchaseDate] = useState(claim?.purchaseDate ? new Date(claim.purchaseDate).toISOString().split('T')[0] : '');
  const [images, setImages] = useState<{ file?: File; preview: string }[]>(
    claim?.invoiceImages?.map((url: string) => ({ preview: url })) || []
  );
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
    if (!purchaseDate) return alert('Please select a purchase date');
    if (images.length === 0) return alert('Please upload at least one invoice image');

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      // Upload new images to Cloudinary
      const finalUrls: string[] = [];
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dx4i1w3uf';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      for (const img of images) {
        if (img.file) {
          const formData = new FormData();
          formData.append('file', img.file);
          formData.append('upload_preset', uploadPreset);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.secure_url) finalUrls.push(data.secure_url);
        } else {
          finalUrls.push(img.preview); // Keep existing URL
        }
      }

      await updateWarrantyClaim(id, {
        purchaseDate,
        invoiceImages: finalUrls
      }, token);

      alert('Warranty details updated successfully!');
      navigate('/warranty');
    } catch (err) {
      console.error('Error updating warranty:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="Update Warranty" onLeftClick={() => navigate(-1)} />
      
      <div className="px-6 py-6">
        <div className="bg-[#EFF6FF] rounded-[16px] p-4 mb-8 flex gap-3 border border-[#DBEAFE]">
           <AlertCircle className="text-[#105DE4] shrink-0 mt-0.5" size={18} />
           <div className="space-y-1">
             <p className="text-[13px] font-bold text-[#0B1E36] leading-tight">Updating Registration</p>
             <p className="text-[12px] font-medium text-[#64748B]">Modify your purchase details or invoice proof.</p>
           </div>
        </div>

        <div className="space-y-6">
          {/* Purchase Date */}
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">Purchase Date *</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={purchaseDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#105DE4] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Invoice Upload */}
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3 ml-1">Invoice / Bill Images *</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 group">
                  <img src={img.preview} alt="invoice" className="w-full h-full object-cover" />
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
            <p className="text-[11px] font-bold text-slate-400 mt-3 px-1 leading-relaxed">
              Upload clear photos of your purchase bill or invoice. Images only (PNG, JPG).
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full mt-12 py-4 rounded-[12px] font-bold text-[15px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            submitting ? 'bg-slate-100 text-slate-400' : 'bg-[#105DE4] text-white'
          }`}
        >
          {submitting ? (
             <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />
          ) : (
            <>
              <History size={20} />
              Update Warranty
            </>
          )}
        </button>
      </div>
    </div>
  );
}
