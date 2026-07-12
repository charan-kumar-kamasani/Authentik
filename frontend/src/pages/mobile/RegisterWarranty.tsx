import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileHeader from '../../components/MobileHeader';
import { submitWarrantyClaim } from '../../config/api';
import { Calendar, Camera, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterWarranty() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state?.data;

  const [purchaseDate, setPurchaseDate] = useState('');
  const [images, setImages] = useState<{ file?: File; preview: string }[]>([]);
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
      if (!token || !data) return;

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
          const uploadData = await res.json();
          if (uploadData.secure_url) {
            finalUrls.push(uploadData.secure_url);
          }
        }
      }

      await submitWarrantyClaim({
        productId: data.productId?._id || data.productId,
        qrCode: data.qrCode,
        productName: data.productName || data.productId?.productName,
        brandId: data.brandId || data.productId?.brandId,
        invoiceImages: finalUrls,
        purchaseDate: purchaseDate,
        warrantyInfo: data.warranty || null,
      }, token);

      alert('Warranty registered successfully!');
      navigate('/warranty');
    } catch (err: any) {
      console.error('Error registering warranty:', err);
      alert(err.message || 'Failed to register warranty. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="Register Warranty" onLeftClick={() => navigate(-1)} />
      
      <div className="px-6 py-6">
        <div className="bg-emerald-50 rounded-2xl p-4 mb-8 flex gap-3 border border-emerald-100">
           <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
           <div className="space-y-1">
             <p className="text-[13px] font-black text-emerald-800 leading-tight">Warranty Registration</p>
             <p className="text-[12px] font-bold text-emerald-700/70">Please provide your purchase details and invoice proof to activate your warranty.</p>
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
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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
          className={`w-full mt-12 py-5 rounded-[24px] font-black text-[17px] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
            submitting ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-emerald-200'
          }`}
        >
          {submitting ? (
             <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />
          ) : (
            <>
              <CheckCircle2 size={20} />
              Register Warranty
            </>
          )}
        </button>
      </div>
    </div>
  );
}
