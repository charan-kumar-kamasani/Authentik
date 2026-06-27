import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share } from 'lucide-react';
import API_BASE_URL from '../../config/api';

export default function Recommendations() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!brandId) return;
      try {
        const storedToken = localStorage.getItem("token");
        const authHeader = storedToken ? (storedToken.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`) : null;
        
        const res = await fetch(`${API_BASE_URL}/scan/recommendations/${brandId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [brandId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Authentik Recommendations",
          text: `Check out these authentic products!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 sticky top-0 z-50 shadow-sm flex items-center justify-between rounded-b-2xl mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#0B1E36]">
          <ChevronLeft className="w-7 h-7" strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-extrabold text-[#0B1E36]">More from this Brand</h1>
        <button onClick={handleShare} className="p-1 -mr-1 text-[#0B1E36]">
          <Share className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105DE4]"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            No recommendations found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((item: any, index: number) => (
              <div key={item._id || index} className="bg-white rounded-[20px] p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                <div className="w-full h-[150px] bg-[#F8F9FA] rounded-[14px] p-2 flex items-center justify-center mb-4 relative">
                  <img src={item.productImage || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                  {item.ratingBadge && (
                    <div className="absolute -bottom-3 -right-3 bg-[#F3F6E8] text-[#4F5927] border-2 border-white text-[9.5px] font-extrabold px-1.5 py-1 rounded-full text-center leading-[1.1] shadow-sm flex items-center justify-center w-[46px] h-[46px] whitespace-pre-wrap break-words">
                      {item.ratingBadge}
                    </div>
                  )}
                </div>
                <h4 className="text-[13px] font-bold text-[#0B1E36] leading-snug mb-3 line-clamp-2 min-h-[36px]">{item.productName}</h4>
                <div className="flex items-baseline gap-2 mb-2 mt-auto">
                  <span className="text-[17px] font-extrabold text-[#0B1E36]">{item.mrp ? `₹${item.mrp}` : ''}</span>
                  {item.oldPrice && (
                    <span className="text-[13px] font-semibold text-[#829AB1] line-through">{item.oldPrice}</span>
                  )}
                </div>
                {item.discount && (
                  <div className="bg-[#E8F8F0] text-[#059669] text-[10px] font-extrabold px-2.5 py-1 rounded-[6px] w-max tracking-wide">
                    {item.discount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
