import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import MobileHeader from '../../components/MobileHeader';
import { Wallet as WalletIcon, ArrowDownLeft, Gift, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <MobileHeader
        title="My Wallet"
        onLeftClick={() => navigate(-1)}
      />

      <div className="flex-1 px-4 py-6 flex flex-col max-w-md mx-auto w-full">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#0D4E96] to-[#1E3A8A] rounded-3xl p-6 shadow-[0_20px_40px_rgba(13,78,150,0.15)] relative overflow-hidden mb-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2CA4D6]/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
              <WalletIcon size={24} className="text-cyan-300" />
            </div>
            <p className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-widest">Available Balance</p>
            <h2 className="text-white text-[42px] font-black tracking-tight drop-shadow-md">
              <span className="text-cyan-300 text-[28px] mr-1 inline-block align-top mt-2 font-bold">₹</span>
              {balance.toLocaleString('en-IN')}
            </h2>
            <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wide">Active</span>
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
              <p className="text-[14px] text-slate-500 font-medium">Scan eligible Authentik QR codes to earn lucky cashback rewards.</p>
              <button 
                onClick={() => navigate('/scan')}
                className="mt-6 bg-[#0D4E96] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
              >
                Scan Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 border border-emerald-100">
                    <ArrowDownLeft size={24} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-slate-800 truncate">
                      {tx.type === 'cashback_earned' ? 'Lucky Scan Cashback' : tx.type}
                    </h4>
                    <p className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                      {tx.orderId?.brand ? `${tx.orderId.brand} • ` : ''}{tx.scanId?.productName || 'Product'}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[16px] font-black text-emerald-600 tracking-tight">
                      +₹{tx.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
