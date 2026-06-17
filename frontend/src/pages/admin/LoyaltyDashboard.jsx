import React, { useState, useEffect } from 'react';
import { Sparkles, IndianRupee, Gift, Users, Award, TrendingUp, Clock } from 'lucide-react';
import API_BASE_URL from '../../config/api';

export default function LoyaltyDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/loyalty/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.stats);
      setRecentTransactions(data.recentTransactions);
      setTopEarners(data.topPointsEarners);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={32} />
          Cashbacks & Loyalty
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage and monitor reward programs and user loyalty.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cashback */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <IndianRupee size={80} />
          </div>
          <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-2">Total Cashback Disbursed</h3>
          <div className="text-4xl font-black mb-1">₹{stats?.totalCashbackDisbursed?.toLocaleString()}</div>
          <div className="text-sm text-blue-100">Out of ₹{stats?.totalCashbackFund?.toLocaleString()} total fund</div>
        </div>

        {/* Total Points */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Gift size={80} />
          </div>
          <h3 className="text-purple-100 font-medium text-sm uppercase tracking-wider mb-2">Total Loyalty Points</h3>
          <div className="text-4xl font-black mb-1">{stats?.totalPointsDisbursed?.toLocaleString()} pts</div>
          <div className="text-sm text-purple-100">Out of {stats?.totalPointsFund?.toLocaleString()} points fund</div>
        </div>

        {/* Active Schemes */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp size={80} />
          </div>
          <h3 className="text-emerald-100 font-medium text-sm uppercase tracking-wider mb-2">Active Reward Schemes</h3>
          <div className="text-4xl font-black mb-1">{stats?.activeSchemes}</div>
          <div className="text-sm text-emerald-100">Currently active across batches</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} />
              Recent Reward Transactions
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTransactions.map(tx => (
              <div key={tx._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.currency === 'POINTS' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                  {tx.currency === 'POINTS' ? <Gift size={20} /> : <IndianRupee size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {tx.userId?.name || tx.userId?.mobile || 'Unknown User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{tx.description}</p>
                </div>
                <div className={`text-right font-bold ${tx.currency === 'POINTS' ? 'text-purple-600' : 'text-green-600'}`}>
                  +{tx.amount} {tx.currency === 'POINTS' ? 'pts' : '₹'}
                  <div className="text-[10px] text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-500">No recent transactions.</div>
            )}
          </div>
        </div>

        {/* Top Earners Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              Top Earners
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {topEarners.map((user, idx) => (
              <div key={user._id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0
                  ${idx === 0 ? 'bg-amber-100 text-amber-600' : 
                    idx === 1 ? 'bg-slate-200 text-slate-600' : 
                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{user.name || user.mobile}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email || 'No email'}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-purple-600 text-sm">{user.loyaltyPoints?.toLocaleString()} pts</div>
                </div>
              </div>
            ))}
            {topEarners.length === 0 && (
              <div className="text-center text-slate-500 py-4">No top earners yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
