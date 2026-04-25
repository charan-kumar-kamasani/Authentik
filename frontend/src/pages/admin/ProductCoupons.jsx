import React, { useState, useEffect } from 'react';
import { getProductCoupons, getClaimedRewards } from '../../config/api';
import { Gift, Calendar, Hash, Tag, Package, XCircle, CheckCircle2, User, Star, MapPin, ChevronDown } from 'lucide-react';

export default function ProductCoupons() {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'claimed'
  
  const [coupons, setCoupons] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        
        const [couponsData, claimedData] = await Promise.all([
          getProductCoupons(token),
          getClaimedRewards(token)
        ]);

        setCoupons(couponsData);
        setClaimedRewards(claimedData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    if (includeTime) {
      opts.hour = '2-digit';
      opts.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('en-GB', opts);
  };

  const getClaimStatus = (reward) => {
    if (reward.isRedeemed) {
      return { label: 'Used', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    }
    
    let isExpired = false;
    if (reward.couponExpiry && new Date(reward.couponExpiry) < new Date()) {
      isExpired = true;
    } else if (reward.productCouponId && reward.productCouponId.expiryDate && new Date(reward.productCouponId.expiryDate) < new Date()) {
       isExpired = true;
    }

    if (isExpired) {
      return { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200' };
    }

    return { label: 'Unclaimed', color: 'bg-blue-50 text-blue-600 border-blue-200' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Campaign Card (mobile-friendly) ──
  const CampaignCard = ({ coupon }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Gift size={16} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-sm sm:text-base block truncate">{coupon.title || 'Untitled Campaign'}</span>
            <span className="font-mono font-black text-purple-700 text-xs block truncate">{coupon.code}</span>
            {coupon.description && <span className="text-[10px] text-slate-500 truncate block mt-0.5">{coupon.description}</span>}
          </div>
        </div>
        {coupon.isActive ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider shrink-0">
            <CheckCircle2 size={10}/> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider shrink-0">
            <XCircle size={10}/> Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Product</div>
          <div className="text-xs sm:text-sm font-bold text-slate-700 truncate">{coupon.productId ? coupon.productId.productName : 'N/A'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Batch: {coupon.productId ? coupon.productId.batchNo : 'N/A'}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Brand</div>
          <div className="text-xs sm:text-sm font-bold text-slate-700 truncate">{coupon.brandId ? coupon.brandId.brandName : 'N/A'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{coupon.generatedCount || 0} Coupons</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100">
        <Calendar size={12} className="text-slate-400"/>
        <span>Expires: {formatDate(coupon.expiryDate)}</span>
      </div>
    </div>
  );

  // ── Claimed Reward Card (mobile-friendly) ──
  const ClaimedCard = ({ reward }) => {
    const status = getClaimStatus(reward);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-800 text-sm block truncate">{reward.userId ? reward.userId.name : 'Unknown User'}</span>
              <span className="text-xs text-slate-500 truncate block">{reward.userId ? reward.userId.mobile || reward.userId.email : ''}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Coupon & Reward</div>
            <span className="text-[10px] font-bold text-slate-600 block truncate">{reward.couponTitle || 'REWARD'}</span>
            <span className="font-mono font-black text-blue-700 text-xs block truncate">{reward.couponCode}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Product</div>
            <div className="text-xs font-bold text-slate-700 truncate">{reward.productName || (reward.productId ? reward.productId.productName : 'N/A')}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Scanned: {formatDate(reward.createdAt)}
          </div>
          {reward.reviewRating ? (
            <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
              <Star size={11} className="text-amber-500 fill-amber-500"/>
              <span className="text-[11px] font-black text-amber-700">{reward.reviewRating}.0</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md">No Review</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Gift className="text-purple-600" size={24} />
            Coupons & Rewards
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Manage campaigns and track reward claims.</p>
        </div>
        
        {/* Toggle Tabs — mobile friendly */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-max border border-slate-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'campaigns' 
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package size={14} /> Campaigns
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'claimed' 
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={14} /> Claims
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
        /* CAMPAIGNS TAB — Card layout for mobile, table for desktop */
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2">
              <Gift size={16} className="text-slate-400" /> Promotional Campaigns
            </h3>
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {coupons.length} Campaigns
            </div>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
              No promotional campaigns generated yet.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {coupons.map((coupon) => (
                  <CampaignCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* CLAIMED TAB — Card layout for mobile */
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Users who gained coupons
            </h3>
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {claimedRewards.length} Claims
            </div>
          </div>

          {claimedRewards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
              No users have claimed coupons yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {claimedRewards.map((reward) => (
                <ClaimedCard key={reward._id} reward={reward} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
