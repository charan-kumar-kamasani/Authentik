import React, { useState, useEffect } from 'react';
import { getProductCoupons, getClaimedRewards } from '../../config/api';
import { Gift, Calendar, Hash, Tag, Package, XCircle, CheckCircle2, User, Star, MapPin } from 'lucide-react';

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
        
        // Fetch conditionally based on tab could be better for scaling, but for now fetch both concurrently
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
    
    // Check expiry
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Gift className="text-purple-600" size={28} />
            Coupons & Rewards
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage promotional campaigns and track user reward claims.</p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-max border border-slate-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'campaigns' 
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Package size={16} /> Campaign List
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'claimed' 
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <User size={16} /> User Claims
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
        /* CAMPAIGNS TAB */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-700 flex items-center gap-2">
              <Gift size={18} className="text-slate-400" /> Promotional Campaigns Map
            </h3>
            <div className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {coupons.length} Active Campaigns
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Coupon Details</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Target Product & Batch</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No promotional campaigns generated yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-purple-700 text-base">{coupon.code}</span>
                          {coupon.description && <span className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{coupon.description}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Package className="text-orange-600" size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{coupon.productId ? coupon.productId.productName : 'N/A'}</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              Batch: {coupon.productId ? coupon.productId.batchNo : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.brandId ? (
                           <div className="flex items-center gap-1.5 p-1.5 px-3 bg-slate-100 rounded-lg w-max text-xs font-bold text-slate-600">
                            <Tag size={12} className="text-slate-400"/> {coupon.brandId.brandName}
                           </div>
                        ) : (
                           <span className="text-slate-400 italic text-sm">N/A</span>
                        )}
                        <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {coupon.generatedCount || 0} Coupons Inserted
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                           <Calendar size={14} className="text-slate-400"/> {formatDate(coupon.expiryDate)}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
                            <CheckCircle2 size={12}/> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider">
                            <XCircle size={12}/> Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CLAIMED TAB */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
           <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-700 flex items-center gap-2">
              <User size={18} className="text-slate-400" /> Users who gained coupons
            </h3>
            <div className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {claimedRewards.length} Claims
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Gained Coupon</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Product Scanned</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Review/Rating</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claimedRewards.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No users have claimed coupons yet.
                    </td>
                  </tr>
                ) : (
                  claimedRewards.map((reward) => {
                    const status = getClaimStatus(reward);
                    
                    return (
                      <tr key={reward._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{reward.userId ? reward.userId.name : 'Unknown User'}</span>
                            <span className="text-xs text-slate-500 mt-0.5">{reward.userId ? reward.userId.mobile || reward.userId.email : ''}</span>
                            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Scanned: {formatDate(reward.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block w-max">
                              {reward.couponCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm">{reward.productName || (reward.productId ? reward.productId.productName : 'N/A')}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5">Batch: {reward.productId ? reward.productId.batchNo : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                         {reward.reviewRating ? (
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                <Star size={12} className="text-amber-500 fill-amber-500"/>
                                <span className="text-xs font-black text-amber-700">{reward.reviewRating}.0</span>
                              </div>
                              {reward.reviewComment && (
                                <span className="text-xs italic text-slate-500 max-w-[150px] truncate">"{reward.reviewComment}"</span>
                              )}
                            </div>
                         ) : (
                           <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">No Review</span>
                         )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
