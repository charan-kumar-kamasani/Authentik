import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSkuIntelligence } from '../../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie
} from 'recharts';
import {
  Package, TrendingUp, ShieldCheck, ShieldAlert, Copy, 
  RefreshCw, MapPin, Layers, Info, Search
} from 'lucide-react';

const COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  slate: '#64748b'
};

function formatNum(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n?.toLocaleString?.() || '0';
}

function StatCard({ icon: Icon, label, value, color, description }) {
  const c = {
    blue:   { text: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
    green:  { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    red:    { text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
    purple: { text: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
    orange: { text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  }[color] || { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };

  return (
    <div className={`bg-white rounded-3xl border ${c.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center`}>
          <Icon size={24} className={c.text} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className={`text-2xl font-black ${c.text} tracking-tight`}>{value}</p>
        </div>
      </div>
      {description && <p className="text-xs font-medium text-slate-500">{description}</p>}
    </div>
  );
}

export default function SkuDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skuMetrics, setSkuMetrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (showLoader = true) => {
    if (!token) { navigate('/admin'); return; }
    if (showLoader) setLoading(true); else setRefreshing(true);
    try {
      const data = await getSkuIntelligence(token);
      setSkuMetrics(data.skuMetrics || []);
    } catch (err) {
      console.error('SKU Intelligence fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMetrics = skuMetrics.filter(m => 
    m.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.skuNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSkus = skuMetrics.length;
  const totalScans = skuMetrics.reduce((sum, m) => sum + m.totalScans, 0);
  const totalAuthentic = skuMetrics.reduce((sum, m) => sum + m.authentic, 0);
  const totalRisk = skuMetrics.reduce((sum, m) => sum + (m.suspicious + m.duplicate), 0);
  
  const topSkusByScan = [...skuMetrics].sort((a,b) => b.totalScans - a.totalScans).slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Loading SKU Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Layers className="text-blue-600" size={36} />
            SKU Intelligence
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-1 tracking-tight">Granular cross-batch performance tracking by Product SKU.</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => fetchData(false)} disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50">
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Tracked SKUs" value={totalSkus} color="blue" description="Total unique products in catalog" />
        <StatCard icon={TrendingUp} label="Lifetime Scans" value={formatNum(totalScans)} color="purple" description="Aggregated scans across all SKUs" />
        <StatCard icon={ShieldCheck} label="Authentic Volume" value={formatNum(totalAuthentic)} color="green" description="Genuine customer interactions" />
        <StatCard icon={ShieldAlert} label="Risk Exposure" value={formatNum(totalRisk)} color="red" description="Fake and duplicate attempts" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main SKU Table */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Info size={20} className="text-slate-400" />
                Performance Matrix
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time stats per catalog entry</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search SKU or Product Name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-8 py-5">Product Identity</th>
                  <th className="px-6 py-5 text-center">Lifetime Scans</th>
                  <th className="px-6 py-5 text-center">Auth Map</th>
                  <th className="px-6 py-5 text-center">Risk Intel</th>
                  <th className="px-6 py-5 text-center">Batches</th>
                  <th className="px-8 py-5 text-right">Regions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMetrics.length > 0 ? filteredMetrics.map((m, i) => {
                  const authPct = m.totalScans > 0 ? Math.round((m.authentic / m.totalScans) * 100) : 0;
                  const riskCount = m.suspicious + m.duplicate;
                  
                  return (
                    <tr key={i} className="hover:bg-blue-50/20 transition-colors duration-300">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-base leading-tight">{m.productName}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-max mt-1 tracking-widest uppercase shadow-sm border border-blue-100">
                            {Math.random() > 0.5 ? 'SKU' : 'REF'}: {m.skuNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-lg font-black text-slate-700">{formatNum(m.totalScans)}</span>
                      </td>
                      <td className="px-6 py-6 font-bold">
                        <div className="flex flex-col items-center gap-1.5 px-4">
                           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${authPct}%` }} />
                           </div>
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{authPct}% Authentic</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full font-black text-[10px] uppercase tracking-wider border border-red-100">
                          <ShieldAlert size={12} /> {riskCount} Alerts
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-700">{m.associatedBatches.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Batches</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-600 font-bold">
                          <MapPin size={14} className="text-blue-500" />
                          {m.regionsReached}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">No product data matches your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Charts */}
        <div className="space-y-8 flex flex-col">
          {/* Top SKUs by Volume */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20 flex-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Top Volume SKUs</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkusByScan} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="productName" 
                    type="category" 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
                            <p className="text-xs font-black uppercase tracking-tighter mb-1 text-slate-400">{payload[0].payload.skuNumber}</p>
                            <p className="text-sm font-black mb-1">{payload[0].payload.productName}</p>
                            <p className="text-lg font-black text-blue-400">{payload[0].value.toLocaleString()} Scans</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalScans" radius={[0, 8, 8, 0]} maxBarSize={30}>
                    {topSkusByScan.map((_, i) => (
                      <Cell key={i} fill={[COLORS.blue, COLORS.purple, COLORS.green, COLORS.orange, COLORS.red][i % 5]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 space-y-4">
              {topSkusByScan.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">{i+1}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 tracking-tight leading-none mb-1">{m.productName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.skuNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-800">{formatNum(m.totalScans)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/50">
            <h3 className="text-xl font-black tracking-tight mb-2">Health Distribution</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">System-wide SKU data health</p>
            
            <div className="flex items-center gap-10">
              <div className="w-36 h-36 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Authentic', value: totalAuthentic },
                          { name: 'Risk', value: totalRisk }
                        ]}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={10} dataKey="value" stroke="none"
                      >
                        <Cell fill={COLORS.green} />
                        <Cell fill={COLORS.red} />
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">{totalScans > 0 ? Math.round((totalAuthentic/totalScans)*100) : 0}%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Secure</span>
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy
                       </span>
                       <span className="text-sm font-black">{formatNum(totalAuthentic)}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${totalScans > 0 ? (totalAuthentic/totalScans)*100 : 0}%` }} />
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" /> Infected
                       </span>
                       <span className="text-sm font-black">{formatNum(totalRisk)}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500" style={{ width: `${totalScans > 0 ? (totalRisk/totalScans)*100 : 0}%` }} />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
