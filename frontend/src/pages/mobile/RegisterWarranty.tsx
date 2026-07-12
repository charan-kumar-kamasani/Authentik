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
        <div className="bg-[#EFF6FF] rounded-[16px] p-4 mb-8 flex gap-3 border border-[#DBEAFE]">
           <ShieldCheck className="text-[#105DE4] shrink-0 mt-0.5" size={20} />
           <div className="space-y-1">
             <p className="text-[13px] font-bold text-[#0B1E36] leading-tight">Warranty Registration</p>
             <p className="text-[12px] font-medium text-[#64748B]">Please provide your purchase details and invoice proof to activate your warranty.</p>
           </div>
        </div>

        {/* Product Details Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 mb-6 flex gap-3 items-center">
           <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
              <img src={data?.productImage || data?.productId?.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} alt="Product" className="w-full h-full object-cover mix-blend-multiply" />
           </div>
           <div className="flex-1 min-w-0">
             <h3 className="text-[#0B1E36] text-[14px] font-bold leading-tight truncate">{data?.productName || data?.productId?.productName || 'Verified Product'}</h3>
             <p className="text-slate-500 text-[11px] font-medium mt-0.5">SN: {data?.qrCode?.slice(-8).toUpperCase()}</p>
             {(data?.warranty || data?.productId?.warranty) && (
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-md">
                   <ShieldCheck size={12} className="text-[#105DE4]" />
                   <span className="text-[#105DE4] text-[10px] font-bold uppercase">
                     {(data?.warranty?.duration || data?.productId?.warranty?.duration)} {(data?.warranty?.durationUnit || data?.productId?.warranty?.durationUnit)} Warranty
                   </span>
                </div>
             )}
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
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-[12px] text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#105DE4] focus:bg-white transition-all"
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
              <CheckCircle2 size={20} />
              Register Warranty
            </>
          )}
        </button>
      </div>
    </div>
  );
}
