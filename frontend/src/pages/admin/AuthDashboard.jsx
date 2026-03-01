import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats, getScanTrend, getDuplicateTrend,
  getHighRiskSkus, getBatchRisk, getGeoData, getGeoMarkers, getGeoAnomalies,
  getRecentActivity, getConsumerInsights, getProductPerformance,
} from '../../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Copy, TrendingUp,
  Activity, MapPin, Users, Eye, BarChart2, RefreshCw, ChevronDown,
  Package, Zap, Star, RotateCcw, Globe, Search as SearchIcon,
} from 'lucide-react';

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/* ═══════════ CONSTANTS ═══════════ */
const COLORS = {
  green: '#22c55e', red: '#ef4444', orange: '#f59e0b', blue: '#3b82f6',
  purple: '#8b5cf6', cyan: '#06b6d4', indigo: '#6366f1', pink: '#ec4899', teal: '#14b8a6',
};
const PIE_COLORS = [COLORS.green, COLORS.red, COLORS.orange, COLORS.blue];
const BAR_COLORS = ['#3b82f6', '#22c55e', '#fb923c', '#ef4444', '#8b5cf6', '#06b6d4'];
const RISK_BAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b'];

/* ═══════════ UTILITIES ═══════════ */
function formatNum(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n?.toLocaleString?.() || '0';
}

/* ═══════════ SUB-COMPONENTS ═══════════ */

function StatCard({ icon: Icon, label, value, color, renderValue }) {
  const c = {
    blue:   { text: 'text-blue-600',   iconBg: 'bg-blue-100',   ring: 'ring-blue-100' },
    green:  { text: 'text-emerald-600', iconBg: 'bg-emerald-100', ring: 'ring-emerald-100' },
    red:    { text: 'text-red-600',     iconBg: 'bg-red-100',     ring: 'ring-red-100' },
    orange: { text: 'text-amber-600',   iconBg: 'bg-amber-100',   ring: 'ring-amber-100' },
    purple: { text: 'text-purple-600',  iconBg: 'bg-purple-100',  ring: 'ring-purple-100' },
    cyan:   { text: 'text-cyan-600',    iconBg: 'bg-cyan-100',    ring: 'ring-cyan-100' },
    yellow: { text: 'text-yellow-600',  iconBg: 'bg-yellow-100',  ring: 'ring-yellow-100' },
  }[color] || { text: 'text-blue-600', iconBg: 'bg-blue-100', ring: 'ring-blue-100' };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center ring-4 ${c.ring} group-hover:scale-110 transition-transform`}>
          <Icon size={18} className={c.text} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      {renderValue ? renderValue(c) : (
        <p className={`text-3xl font-black ${c.text} tracking-tight`}>{formatNum(value)}</p>
      )}
    </div>
  );
}

function ChartCard({ title, children, className = '', headerRight }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl text-xs border border-slate-700">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function RiskBadge({ percent }) {
  const bg = percent >= 50 ? 'bg-red-100 text-red-700' : percent >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bg}`}>{percent}%</span>;
}

/* ═══ Leaflet helper ═══ */
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const lats = markers.map(m => m.lat).filter(Boolean);
      const lngs = markers.map(m => m.lng).filter(Boolean);
      if (lats.length && lngs.length) {
        map.fitBounds(
          [[Math.min(...lats) - 1, Math.min(...lngs) - 1], [Math.max(...lats) + 1, Math.max(...lngs) + 1]],
          { padding: [30, 30], maxZoom: 12 }
        );
      }
    }
  }, [markers, map]);
  return null;
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function AuthDashboard({ role: propRole }) {
  const navigate = useNavigate();
  const role = propRole || localStorage.getItem('adminRole') || '';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState('authentication');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  /* data buckets */
  const [stats, setStats]                   = useState({});
  const [scanTrend, setScanTrend]           = useState([]);
  const [duplicateTrend, setDuplicateTrend] = useState([]);
  const [highRiskSkus, setHighRiskSkus]     = useState([]);
  const [batchRisk, setBatchRisk]           = useState([]);
  const [geoData, setGeoData]               = useState([]);
  const [geoMarkers, setGeoMarkers]         = useState([]);
  const [geoAnomalies, setGeoAnomalies]     = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [consumerInsights, setConsumerInsights] = useState({});
  const [productPerf, setProductPerf]       = useState({});

  const fetchAll = useCallback(async (showLoader = true) => {
    if (!token) { navigate('/admin'); return; }
    if (showLoader) setLoading(true); else setRefreshing(true);
    try {
      const [s, trend, dup, risk, batch, geo, markers, anomalies, recent, consumers, products] =
        await Promise.all([
          getDashboardStats(token),
          getScanTrend(token, timeRange),
          getDuplicateTrend(token, timeRange),
          getHighRiskSkus(token, 5),
          getBatchRisk(token, 10),
          getGeoData(token),
          getGeoMarkers(token, 300),
          getGeoAnomalies(token),
          getRecentActivity(token, 10),
          getConsumerInsights(token),
          getProductPerformance(token, timeRange),
        ]);
      setStats(s); setScanTrend(trend); setDuplicateTrend(dup);
      setHighRiskSkus(risk); setBatchRisk(batch); setGeoData(geo);
      setGeoMarkers(markers); setGeoAnomalies(anomalies);
      setRecentActivity(recent); setConsumerInsights(consumers);
      setProductPerf(products);
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token, timeRange, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ─── derived ─── */
  const genuinePercent   = stats.totalScans > 0 ? Math.round((stats.authenticScans / stats.totalScans) * 100) : 0;
  const suspiciousPercent = stats.totalScans > 0 ? Math.round((stats.suspiciousScans / stats.totalScans) * 100) : 0;
  const donutData = [
    { name: 'Genuine', value: stats.authenticScans || 0 },
    { name: 'Suspicious', value: stats.suspiciousScans || 0 },
    { name: 'Duplicate', value: stats.duplicateAlerts || 0 },
  ].filter(d => d.value > 0);
  const trendBars = scanTrend.map(t => ({ date: t.date?.slice(5), Authentic: t.authentic, Suspicious: t.suspicious, Duplicate: t.duplicate }));
  const dupBars   = duplicateTrend.map(t => ({ date: t.date?.slice(5), Alerts: t.count }));

  /* geo helpers */
  const urbanKw = ['mumbai','delhi','bangalore','bengaluru','chennai','hyderabad','kolkata','pune','ahmedabad','jaipur','lucknow','surat','kanpur','nagpur','indore','thane','bhopal','patna','vadodara','ghaziabad','ludhiana','agra','nashik','faridabad','meerut','rajkot','varanasi','city','nagar','town'];
  const urbanScans = geoData.filter(g => urbanKw.some(k => (g.place || '').toLowerCase().includes(k))).reduce((s, g) => s + g.total, 0);
  const ruralScans = geoData.reduce((s, g) => s + g.total, 0) - urbanScans;
  const totalGeo   = urbanScans + ruralScans;
  const urbanPct   = totalGeo > 0 ? Math.round((urbanScans / totalGeo) * 100) : 0;
  const validMarkers  = geoMarkers.filter(m => m.lat && m.lng);
  const validGeoData  = geoData.filter(g => g.lat && g.lng);

  const tabs = [
    { key: 'authentication', label: 'Authentication', icon: ShieldCheck },
    { key: 'geo',            label: 'Geo Intelligence', icon: Globe },
    { key: 'consumers',      label: 'Consumer Insights', icon: Users },
    { key: 'products',       label: 'Product Performance', icon: Package },
  ];

  /* ─── loader ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="space-y-6">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time authentication analytics &amp; intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={timeRange} onChange={e => setTimeRange(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-slate-600 cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={() => fetchAll(false)} disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all disabled:opacity-50">
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/60 rounded-2xl p-1.5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === t.key ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
            }`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
                  TAB 1 — AUTHENTICATION
         ════════════════════════════════════════════ */}
      {activeTab === 'authentication' && (
        <div className="space-y-6">
          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Eye}         label="Total Scans"      value={stats.totalScans}      color="blue" />
            <StatCard icon={ShieldCheck} label="Authentic Scans"  value={stats.authenticScans}  color="green" />
            <StatCard icon={ShieldAlert} label="Suspicious Scans" value={stats.suspiciousScans} color="red" />
            <StatCard icon={Copy}        label="Duplicate Alerts" value={stats.duplicateAlerts} color="orange" />
          </div>

          {/* donut + trend */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard title="Authentic vs Suspicious Scans" className="xl:col-span-2">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* donut */}
                <div className="relative w-[200px] h-[200px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData.length ? donutData : [{ name: 'No Data', value: 1 }]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                        {donutData.length
                          ? donutData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)
                          : <Cell fill="#e2e8f0" />}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{genuinePercent}%</span>
                    <span className="text-xs font-bold text-slate-400">Genuine</span>
                  </div>
                </div>
                {/* legend */}
                <div className="flex flex-col gap-2 text-sm mr-4">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-600 font-medium">{genuinePercent}% Genuine</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-slate-600 font-medium">{suspiciousPercent}% Suspicious</span></div>
                </div>
                {/* bar */}
                <div className="flex-1 w-full min-w-0" style={{ minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendBars.slice(-14)} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Authentic"  fill={COLORS.green}  radius={[4,4,0,0]} maxBarSize={20} />
                      <Bar dataKey="Suspicious" fill={COLORS.orange} radius={[4,4,0,0]} maxBarSize={20} />
                      <Bar dataKey="Duplicate"  fill={COLORS.red}    radius={[4,4,0,0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>

            {/* high risk SKUs */}
            <ChartCard title="High Risk SKUs">
              <div className="space-y-4">
                {highRiskSkus.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No risk data available</p>}
                {highRiskSkus.map((sku, i) => {
                  const maxP = Math.max(...highRiskSkus.map(s => s.riskPercent), 1);
                  const w = Math.max((sku.riskPercent / maxP) * 100, 8);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4 text-right">{i + 1}</span>
                      <div className="flex-1 relative h-7 bg-slate-100 rounded-lg overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700"
                          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${RISK_BAR_COLORS[i % RISK_BAR_COLORS.length]}, ${RISK_BAR_COLORS[i % RISK_BAR_COLORS.length]}dd)` }} />
                        <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-white z-10 truncate pr-2" title={sku.productName}>{sku.productName?.slice(0, 20)}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">{sku.riskPercent}%</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          {/* duplicate alerts + batch risk */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard title="Already Scanned Alerts" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dupBars.slice(-20)} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Alerts" radius={[4,4,0,0]} maxBarSize={24}>
                    {dupBars.slice(-20).map((_, i) => <Cell key={i} fill={`hsl(${200+i*3},70%,${50+(i%3)*5}%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Batch Risk Analysis">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2.5 px-2 text-xs font-bold text-slate-400 uppercase">Batch</th>
                    <th className="text-center py-2.5 px-2 text-xs font-bold text-slate-400 uppercase">Risk&nbsp;%</th>
                    <th className="text-right py-2.5 px-2 text-xs font-bold text-slate-400 uppercase">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {batchRisk.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-400 text-xs">No batch risk data</td></tr>}
                  {batchRisk.slice(0,5).map((b,i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-semibold text-slate-700 text-xs">{b.batchNo}</td>
                      <td className="py-3 px-2 text-center"><RiskBadge percent={b.riskPercent} /></td>
                      <td className="py-3 px-2 text-right text-xs text-slate-500 truncate max-w-[100px]" title={b.region}>{b.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>

          {/* recent activity */}
          <ChartCard title="Recent Scan Activity" headerRight={<span className="text-xs text-slate-400">Last {recentActivity.length} scans</span>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Product','Brand','Status','Location','User','Time'].map(h => (
                      <th key={h} className={`${h==='Time'?'text-right':'text-left'} py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-xs">No recent activity</td></tr>}
                  {recentActivity.map((a,i) => {
                    const sc = { ORIGINAL:'bg-emerald-100 text-emerald-700', FAKE:'bg-red-100 text-red-700', ALREADY_USED:'bg-amber-100 text-amber-700', INACTIVE:'bg-slate-100 text-slate-600' };
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-700 text-xs">{a.productName}</td>
                        <td className="py-3 px-3 text-xs text-slate-600">{a.brand}</td>
                        <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${sc[a.status]||sc.INACTIVE}`}>{a.status?.replace('_',' ')}</span></td>
                        <td className="py-3 px-3 text-xs text-slate-500">{a.place}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{a.user}</td>
                        <td className="py-3 px-3 text-right text-xs text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}{' '}
                          {new Date(a.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {['superadmin','admin'].includes(role) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Activity}      label="Total Products" value={stats.totalProducts}  color="purple" />
              <StatCard icon={BarChart2}      label="Total Orders"   value={stats.totalOrders}   color="cyan" />
              <StatCard icon={Users}          label="Companies"      value={stats.totalCompanies} color="blue" />
              <StatCard icon={AlertTriangle}  label="Reports"        value={stats.totalReports}  color="red" />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
                  TAB 2 — GEO INTELLIGENCE
         ════════════════════════════════════════════ */}
      {activeTab === 'geo' && (
        <div className="space-y-6">
          {/* top location pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-600 mr-2">Top Locations</span>
            {geoData.slice(0,8).map((g,i) => (
              <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-default">
                <MapPin size={10} className="inline mr-1 -mt-0.5" />{g.place}
              </span>
            ))}
          </div>

          {/* map + side panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* interactive map */}
            <ChartCard title="Scan Heatmap" className="xl:col-span-2"
              headerRight={<span className="text-xs text-slate-400 flex items-center gap-1"><SearchIcon size={12}/> Zoom to explore</span>}>
              <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: 420 }}>
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height:'100%', width:'100%' }} scrollWheelZoom zoomControl>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {/* aggregated circles */}
                  {validGeoData.map((g,i) => {
                    const r = Math.min(Math.max(Math.sqrt(g.total)*3,6),40);
                    const hasRisk = g.suspicious > 0 || g.duplicate > 0;
                    const clr = hasRisk ? (g.suspicious > g.duplicate ? '#ef4444' : '#f59e0b') : '#22c55e';
                    return (
                      <CircleMarker key={`a${i}`} center={[g.lat,g.lng]} radius={r}
                        pathOptions={{ color:clr, fillColor:clr, fillOpacity:0.35, weight:2 }}>
                        <Popup><div className="text-xs font-sans">
                          <p className="font-bold text-sm mb-1">{g.place}</p>
                          <p>Total: <b>{g.total}</b></p>
                          <p className="text-emerald-600">Authentic: <b>{g.authentic}</b></p>
                          <p className="text-red-600">Suspicious: <b>{g.suspicious}</b></p>
                          <p className="text-amber-600">Duplicate: <b>{g.duplicate}</b></p>
                        </div></Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* individual markers */}
                  {validMarkers.map((m,i) => {
                    const dc = m.status==='ORIGINAL' ? '#22c55e' : m.status==='FAKE' ? '#ef4444' : '#f59e0b';
                    return (
                      <CircleMarker key={`m${i}`} center={[m.lat,m.lng]} radius={3}
                        pathOptions={{ color:dc, fillColor:dc, fillOpacity:0.7, weight:1 }}>
                        <Popup><div className="text-xs font-sans">
                          <p className="font-bold">{m.productName}</p>
                          <p>{m.place}</p>
                          <p className={m.status==='ORIGINAL'?'text-emerald-600':m.status==='FAKE'?'text-red-600':'text-amber-600'}>{m.status?.replace('_',' ')}</p>
                          <p className="text-slate-400">{new Date(m.createdAt).toLocaleDateString('en-IN')}</p>
                        </div></Popup>
                      </CircleMarker>
                    );
                  })}

                  <FitBounds markers={validGeoData.length ? validGeoData : validMarkers} />
                </MapContainer>
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Authentic</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Suspicious</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Duplicate</div>
                <span className="text-slate-400">Circle size = scan volume</span>
              </div>
            </ChartCard>

            {/* right panels */}
            <div className="space-y-6">
              {/* urban vs rural */}
              <ChartCard title="Urban vs Rural Reach">
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{name:'Urban',value:urbanScans||1},{name:'Rural',value:ruralScans||1}]}
                          cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} dataKey="value" stroke="none">
                          <Cell fill={COLORS.blue} /><Cell fill={COLORS.cyan} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-slate-800">{urbanPct}%</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-slate-600 font-semibold">Urban</span><span className="font-bold text-slate-800 ml-auto">{formatNum(urbanScans)}</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-cyan-500" /><span className="text-slate-600 font-semibold">Rural</span><span className="font-bold text-slate-800 ml-auto">{formatNum(ruralScans)}</span></div>
                  </div>
                </div>
              </ChartCard>

              {/* distributor anomalies */}
              <ChartCard title="Distributor Anomalies">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider mb-2"><span>Location</span><span>Anomaly</span></div>
                  {geoAnomalies.length === 0 && <p className="text-center py-6 text-slate-400">No anomalies detected</p>}
                  {geoAnomalies.slice(0,6).map((a,i) => {
                    const rl = a.anomalyScore >= 5 ? 'bg-red-500' : a.anomalyScore >= 2 ? 'bg-amber-500' : 'bg-emerald-500';
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={a.place}>{a.place}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${rl}`} />
                          <span className="font-bold text-slate-600">{a.fake}F / {a.duplicate}D</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High Risk</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</div>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* area-wise table + stacked bar */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Area-wise Scan Analysis">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Location</th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Total</th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Authentic</th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Suspicious</th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Duplicate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoData.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs">No geo data</td></tr>}
                    {geoData.slice(0,12).map((g,i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-700 text-xs flex items-center gap-2"><MapPin size={12} className="text-blue-500 flex-shrink-0" /> {g.place}</td>
                        <td className="py-3 px-3 text-center text-xs font-bold text-slate-700">{g.total}</td>
                        <td className="py-3 px-3 text-center text-xs text-emerald-600 font-semibold">{g.authentic}</td>
                        <td className="py-3 px-3 text-center text-xs text-red-600 font-semibold">{g.suspicious}</td>
                        <td className="py-3 px-3 text-center text-xs text-amber-600 font-semibold">{g.duplicate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>

            <ChartCard title="Scans by Region">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={geoData.slice(0,10)} layout="vertical" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="place" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="authentic"  name="Authentic"  fill={COLORS.green}  radius={[0,4,4,0]} maxBarSize={18} stackId="a" />
                  <Bar dataKey="suspicious" name="Suspicious" fill={COLORS.red}    radius={[0,4,4,0]} maxBarSize={18} stackId="a" />
                  <Bar dataKey="duplicate"  name="Duplicate"  fill={COLORS.orange} radius={[0,4,4,0]} maxBarSize={18} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
                  TAB 3 — CONSUMER INSIGHTS
         ════════════════════════════════════════════ */}
      {activeTab === 'consumers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Unique Consumers" value={consumerInsights.totalConsumers} color="blue" />
            <StatCard icon={RotateCcw} label="Repeat Users"     value={consumerInsights.repeatUsers}    color="green" />
            <StatCard icon={Zap}       label="Engagement Rate"  color="orange"
              renderValue={c => <p className={`text-3xl font-black ${c.text} tracking-tight`}>{consumerInsights.engagementRate || 0}%</p>} />
            <StatCard icon={Star} label="Avg. Rating" color="yellow"
              renderValue={() => (
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s<=4?'#f59e0b':'none'} className={s<=4?'text-amber-400':'text-slate-300'} />)}</div>
                  <span className="text-2xl font-black text-amber-600">4.5</span>
                </div>
              )} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* age-gender chart */}
            <ChartCard title="Age &amp; Gender Breakdown">
              {consumerInsights.ageGenderBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={consumerInsights.ageGenderBreakdown} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Male"   fill={COLORS.blue}   radius={[4,4,0,0]} maxBarSize={24} />
                    <Bar dataKey="Female" fill={COLORS.pink}   radius={[4,4,0,0]} maxBarSize={24} />
                    <Bar dataKey="Other"  fill={COLORS.purple}  radius={[4,4,0,0]} maxBarSize={24} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize:11 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : consumerInsights.ageGroups?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={consumerInsights.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Users" radius={[4,4,0,0]} maxBarSize={30}>
                      {consumerInsights.ageGroups.map((_,i) => <Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-slate-400 text-sm py-12">No age/gender data</p>}
            </ChartCard>

            {/* engagement actions */}
            <ChartCard title="Engagement Actions">
              <div className="space-y-5 mt-2">
                {[
                  { label:'Product Scans',      value:stats.totalScans||0,              icon:Eye,         color:COLORS.blue },
                  { label:'Repeat Scans',        value:consumerInsights.repeatUsers||0,  icon:RotateCcw,   color:COLORS.green },
                  { label:'Duplicate Checks',    value:stats.duplicateAlerts||0,         icon:Copy,        color:COLORS.orange },
                  { label:'Suspicious Reports',  value:stats.suspiciousScans||0,         icon:ShieldAlert, color:COLORS.red },
                ].map((item,i) => {
                  const mx = Math.max(stats.totalScans||1,1);
                  const w  = Math.max((item.value/mx)*100,5);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><item.icon size={14} style={{color:item.color}} /> {item.label}</span>
                        <span className="text-xs font-bold text-slate-700">{formatNum(item.value)}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${w}%`, background:item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* gender pie */}
            <ChartCard title="Gender Distribution">
              {consumerInsights.genders?.length > 0 ? (
                <div className="flex items-center gap-8">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={consumerInsights.genders} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="label" paddingAngle={3} stroke="none">
                          {consumerInsights.genders.map((_,i) => <Cell key={i} fill={[COLORS.blue,COLORS.pink,COLORS.purple,COLORS.teal][i%4]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {consumerInsights.genders.map((g,i) => {
                      const tot = consumerInsights.genders.reduce((s,x) => s+x.count,0);
                      const pct = tot > 0 ? Math.round((g.count/tot)*100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ background:[COLORS.blue,COLORS.pink,COLORS.purple,COLORS.teal][i%4] }} />
                          <span className="text-sm font-semibold text-slate-600">{g.label}</span>
                          <span className="text-sm font-bold text-slate-800">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : <p className="text-center text-slate-400 text-sm py-12">No gender data</p>}
            </ChartCard>

            {/* top regions */}
            <ChartCard title="Top Regions">
              <div className="space-y-3">
                {(consumerInsights.topStates?.length > 0 ? consumerInsights.topStates : consumerInsights.topCities || []).slice(0,8).map((c,i) => {
                  const arr = consumerInsights.topStates?.length > 0 ? consumerInsights.topStates : consumerInsights.topCities || [];
                  const mx  = Math.max(...arr.map(x=>x.count),1);
                  const w   = Math.max((c.count/mx)*100,10);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 w-24 truncate">{c.label}</span>
                      <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden">
                        <div className="h-full rounded-md transition-all duration-700"
                          style={{ width:`${w}%`, background:`linear-gradient(90deg,${BAR_COLORS[i%BAR_COLORS.length]},${BAR_COLORS[i%BAR_COLORS.length]}aa)` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">{c.count}</span>
                    </div>
                  );
                })}
                {(!consumerInsights.topStates?.length && !consumerInsights.topCities?.length) && (
                  <p className="text-center text-slate-400 text-sm py-12">No region data</p>
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
                  TAB 4 — PRODUCT PERFORMANCE
         ════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package}    label="Top SKU Scanned" color="blue"
              renderValue={() => <p className="text-lg font-black text-blue-600 truncate" title={productPerf.topSku}>{productPerf.topSku||'N/A'}</p>} />
            <StatCard icon={TrendingUp} label="Top SKU Scans" value={productPerf.topSkuScans} color="green" />
            <StatCard icon={Zap}        label="Batch Velocity" color="purple"
              renderValue={() => <p className="text-3xl font-black text-purple-600">{productPerf.avgBatchVelocity||0} <span className="text-sm font-bold text-slate-400">Days Avg.</span></p>} />
            <StatCard icon={Activity}   label="Total Products" value={stats.totalProducts} color="cyan" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* SKU performance */}
            <ChartCard title="SKU Performance">
              {productPerf.skuPerformance?.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={productPerf.skuPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="authentic"  name="Authentic"  fill={COLORS.green}  radius={[4,4,0,0]} maxBarSize={24} stackId="s" />
                    <Bar dataKey="suspicious" name="Suspicious" fill={COLORS.red}    radius={[4,4,0,0]} maxBarSize={24} stackId="s" />
                    <Bar dataKey="duplicate"  name="Duplicate"  fill={COLORS.orange} radius={[4,4,0,0]} maxBarSize={24} stackId="s" />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize:11 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-slate-400 text-sm py-16">No SKU performance data</p>}
            </ChartCard>

            {/* batch movement */}
            <ChartCard title="Batch Movement">
              {productPerf.batchMovement?.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} type="category" allowDuplicatedCategory={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    {productPerf.batchMovement.map((b,i) => (
                      <Line key={b.batch} data={b.data} dataKey="count" name={b.batch} type="monotone"
                        stroke={BAR_COLORS[i%BAR_COLORS.length]} strokeWidth={2}
                        dot={{ r:3, fill:BAR_COLORS[i%BAR_COLORS.length] }} connectNulls />
                    ))}
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize:11 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-slate-400 text-sm py-16">No batch movement data</p>}
            </ChartCard>
          </div>

          {/* SKU detail table */}
          <ChartCard title="Top SKU Details">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">#</th>
                    <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Product / SKU</th>
                    <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Total</th>
                    <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Auth</th>
                    <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Susp</th>
                    <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Dup</th>
                    <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {!productPerf.skuPerformance?.length && <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-xs">No data</td></tr>}
                  {productPerf.skuPerformance?.map((s,i) => {
                    const ar = s.total > 0 ? Math.round((s.authentic/s.total)*100) : 0;
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-xs text-slate-400">{i+1}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700 text-xs">{s.name}</td>
                        <td className="py-3 px-3 text-center text-xs font-bold text-slate-700">{s.total}</td>
                        <td className="py-3 px-3 text-center text-xs text-emerald-600 font-semibold">{s.authentic}</td>
                        <td className="py-3 px-3 text-center text-xs text-red-600 font-semibold">{s.suspicious}</td>
                        <td className="py-3 px-3 text-center text-xs text-amber-600 font-semibold">{s.duplicate}</td>
                        <td className="py-3 px-3 text-center"><RiskBadge percent={ar} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* funnel */}
          <ChartCard title="Scan-to-Verification Funnel">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg space-y-2">
                {[
                  { label:'Total Scans',       value:stats.totalScans||0,      color:'#3b82f6', pct:100 },
                  { label:'Authentic Verified', value:stats.authenticScans||0,  color:'#22c55e', pct: stats.totalScans > 0 ? Math.max((stats.authenticScans/stats.totalScans)*100,20) : 80 },
                  { label:'Suspicious Flagged', value:stats.suspiciousScans||0, color:'#ef4444', pct: stats.totalScans > 0 ? Math.max((stats.suspiciousScans/stats.totalScans)*100,15) : 40 },
                  { label:'Duplicate Alerts',   value:stats.duplicateAlerts||0, color:'#f59e0b', pct: stats.totalScans > 0 ? Math.max((stats.duplicateAlerts/stats.totalScans)*100,10) : 20 },
                ].map((step,i) => (
                  <div key={i} style={{ maxWidth:`${step.pct}%` }}>
                    <div className="h-10 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor:step.color+'22', borderLeft:`4px solid ${step.color}` }}>
                      <span className="text-xs font-bold" style={{ color:step.color }}>{step.label}</span>
                      <span className="text-xs font-black text-slate-700">{formatNum(step.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
