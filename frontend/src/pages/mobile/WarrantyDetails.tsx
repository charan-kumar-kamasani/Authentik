import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Upload, ShieldCheck, ChevronRight, Phone, Mail } from 'lucide-react';
import { getMyWarrantyClaims } from '../../config/api';
import MobileNavbar from '../../components/MobileNavbar';

export default function WarrantyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // We fetch all claims to find the one we clicked on
        const res = await getMyWarrantyClaims(token);
        const found = res.find((claim: any) => claim._id === id);
        
        if (found) setItem(found);
      } catch (err) {
        console.error('Error fetching warranty details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#105DE4] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 pb-[80px]">
        <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm sticky top-0 z-[100]">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-[18px] font-black tracking-tight text-slate-800">Warranty Details</h1>
          <div className="w-10"></div>
        </div>
        <div className="p-6 text-center mt-20">
          <p className="text-slate-500 font-medium">Warranty not found.</p>
        </div>
        <MobileNavbar />
      </div>
    );
  }

  const purchaseDate = new Date(item.purchaseDate);
  const duration = item.warrantyInfo?.duration || 0;
  const unit = item.warrantyInfo?.durationUnit || 'years';
  
  const expiryDate = new Date(item.purchaseDate);
  if (unit === 'years') expiryDate.setFullYear(expiryDate.getFullYear() + duration);
  else expiryDate.setMonth(expiryDate.getMonth() + duration);

  const now = new Date();
  const totalDuration = expiryDate.getTime() - purchaseDate.getTime();
  const elapsed = now.getTime() - purchaseDate.getTime();
  const remaining = expiryDate.getTime() - now.getTime();
  
  const isExpired = remaining <= 0;
  
  let progressPercent = 100 - Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  if (isExpired) progressPercent = 0;

  const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const isDanger = progressPercent < 20;
  const barColor = isDanger ? 'bg-[#F97316]' : 'bg-[#22C55E]';
  const textColor = isDanger ? 'text-[#F97316]' : 'text-[#22C55E]';

  return (
    <div className="min-h-screen bg-slate-50 pb-[80px]">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm sticky top-0 z-[100]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-[18px] font-black tracking-tight text-slate-800">Warranty Details</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Product Info Card */}
        <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex gap-4 items-center">
            <div className="w-[72px] h-[72px] bg-slate-50 rounded-[10px] border border-slate-100 flex items-center justify-center p-2 shrink-0">
              <img 
                src={item.productId?.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} 
                alt={item.productName} 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0B1E36] leading-tight mb-1">{item.productName}</h2>
              <p className="text-[12px] font-medium text-[#64748B] mb-2">{item.productId?.brand || 'Verified Brand'}</p>
              <div className="inline-flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-100 text-[#0B1E36] px-2.5 py-1 rounded-[6px]">
                <ShieldCheck size={14} className="text-[#105DE4]" />
                <span className="text-[11px] font-bold tracking-wide">SN: {item.qrCode.slice(-10).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warranty Status Card */}
        <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-[15px] font-bold text-[#0B1E36]">Warranty Status</h3>
            <div className={`px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase shrink-0 ${
              isExpired ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#22C55E]'
            }`}>
              {isExpired ? 'Expired' : 'Active'}
            </div>
          </div>

          <div className="flex items-center justify-between mb-5 px-1">
            <div>
              <p className="text-[11px] text-[#64748B] font-medium mb-1">Purchased on</p>
              <p className="text-[13px] font-bold text-[#0B1E36]">{formatDate(purchaseDate)}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 mx-2" />
            <div className="text-right">
              <p className="text-[11px] text-[#64748B] font-medium mb-1">Expires on</p>
              <p className="text-[13px] font-bold text-[#0B1E36]">{formatDate(expiryDate)}</p>
            </div>
          </div>

          {!isExpired && (
            <div className="bg-slate-50 rounded-[12px] p-4 border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className={`text-[24px] font-bold leading-none ${textColor}`}>{daysLeft}</span>
                  <span className="text-[#0B1E36] text-[12px] font-bold ml-1.5">Days Left</span>
                </div>
                <span className={`text-[11px] font-bold ${textColor}`}>
                  {Math.round(progressPercent)}% Remaining
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden w-full">
                <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate(`/update-warranty/${item._id}`, { state: { claim: item } })}
            className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
              <Upload size={20} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold text-[#0B1E36] text-center">Update<br/>Warranty</span>
          </button>
          
          <button 
            onClick={() => navigate(`/raise-claim/${item._id}`, { state: { claim: item } })}
            className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#105DE4] border border-[#DBEAFE]">
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold text-[#0B1E36] text-center">Raise a<br/>Claim</span>
          </button>
        </div>

        {/* Support Section */}
        {(item.productId?.supportPhone || item.productId?.supportEmail) && (
          <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-2">
            <h3 className="text-[15px] font-bold text-[#0B1E36] mb-4">Customer Support</h3>
            
            <div className="space-y-3">
              {item.productId?.supportPhone && (
                <button className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F8FAFC] active:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#105DE4] flex items-center justify-center border border-slate-100 shadow-sm">
                      <Phone size={14} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-[#0B1E36]">Call Us</p>
                      <p className="text-[11px] text-[#64748B] font-medium mt-0.5">{item.productId.supportPhone}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              )}
              
              {item.productId?.supportEmail && (
                <button className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F8FAFC] active:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#105DE4] flex items-center justify-center border border-slate-100 shadow-sm">
                      <Mail size={14} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-[#0B1E36]">Email Support</p>
                      <p className="text-[11px] text-[#64748B] font-medium mt-0.5">{item.productId.supportEmail}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <MobileNavbar />
    </div>
  );
}
