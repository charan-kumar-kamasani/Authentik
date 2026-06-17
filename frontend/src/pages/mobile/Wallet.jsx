import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import MobileHeader from '../../components/MobileHeader';
import { Wallet as WalletIcon, ArrowDownLeft, Gift, Clock, Star, Sparkles } from 'lucide-react';

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      setLoading(true);
      // Fetch balance
      const balRes = await fetch(`${API_BASE_URL}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (balRes.ok) {
        const balData = await balRes.json();
        setBalance(balData.balance || 0);
        setLoyaltyPoints(balData.loyaltyPoints || 0);
      }

      // Fetch transactions
      const transRes = await fetch(`${API_BASE_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getTransactionLabel = (tx) => {
    switch (tx.type) {
      case 'cashback_earned': return 'Lucky Scan Cashback';
      case 'points_earned': return 'Loyalty Points Earned';
      case 'points_redeemed': return 'Points Redeemed';
      default: return tx.type;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <MobileHeader
        title="My Rewards"
        onLeftClick={() => navigate(-1)}
      />

      <div className="flex-1 px-4 py-6 flex flex-col max-w-md mx-auto w-full">
        
        {/* Dual Card Layout */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Cash Balance Card */}
          <div className="bg-gradient-to-br from-[#0D4E96] to-[#1E3A8A] rounded-2xl p-4 text-white shadow-[0_12px_30px_rgba(13,78,150,0.2)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-9 h-9 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
                <WalletIcon size={18} className="text-cyan-300" />
              </div>
              <p className="text-blue-200 font-bold text-[10px] uppercase tracking-widest mb-0.5">Cash Balance</p>
              <h2 className="text-white text-[28px] font-black tracking-tight leading-none">
                <span className="text-cyan-300 text-[18px] mr-0.5 inline-block align-top mt-1 font-bold">₹</span>
                {balance.toLocaleString('en-IN')}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>

          {/* Loyalty Points Card */}
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#DB2777] rounded-2xl p-4 text-white shadow-[0_12px_30px_rgba(124,58,237,0.2)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-9 h-9 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
                <Star size={18} className="text-amber-300" />
              </div>
              <p className="text-purple-200 font-bold text-[10px] uppercase tracking-widest mb-0.5">Loyalty Points</p>
              <h2 className="text-white text-[28px] font-black tracking-tight leading-none">
                {loyaltyPoints.toLocaleString('en-IN')}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <Sparkles size={10} className="text-amber-300" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wide">Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Recent Transactions</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock size={16} className="text-[#0D4E96]" />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center pb-20">
              <div className="animate-spin w-8 h-8 border-4 border-[#0D4E96] border-t-transparent rounded-full"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center pb-20 text-center px-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Gift size={32} className="text-slate-300" />
              </div>
              <h3 className="text-[18px] font-bold text-slate-700 mb-2">No Transactions Yet</h3>
              <p className="text-[14px] text-slate-500 font-medium">Scan eligible Authentik QR codes to earn cashback rewards & loyalty points.</p>
              <button 
                onClick={() => navigate('/scan')}
                className="mt-6 bg-[#0D4E96] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
              >
                Scan Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isPoints = tx.currency === 'POINTS';
                return (
                  <div key={tx._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all active:scale-[0.98]">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPoints ? 'bg-purple-50 border border-purple-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                      {isPoints ? (
                        <Star size={22} className="text-purple-500" />
                      ) : (
                        <ArrowDownLeft size={22} className="text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-bold text-slate-800 truncate">
                        {getTransactionLabel(tx)}
                      </h4>
                      <p className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                        {tx.orderId?.brand ? `${tx.orderId.brand} • ` : ''}{tx.scanId?.productName || 'Product'}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[16px] font-black tracking-tight ${isPoints ? 'text-purple-600' : 'text-emerald-600'}`}>
                        {isPoints ? `+${tx.amount} pts` : `+₹${tx.amount}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
