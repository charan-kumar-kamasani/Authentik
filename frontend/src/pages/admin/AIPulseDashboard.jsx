import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  RefreshCcw, 
  Package, 
  MapPin, 
  AlertTriangle, 
  ArrowRight,
  Download,
  BarChart3,
  Lightbulb,
  Target,
  ShieldAlert,
  BrainCircuit,
  Activity
} from 'lucide-react';

export default function AIPulseDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('adminRole') || '';

  const superAdminData = {
    title: "Global Platform Intelligence",
    date: "📅 Week: 15–21 April 2026",
    status: "+18% Platform Growth",
    summaryPrefix: "The platform saw an ",
    summaryBold: "18% increase",
    summarySuffix: " in global scan volume this week. 5 new enterprise brands were onboarded. Counterfeit detection rates dropped slightly, indicating healthier supply chains across major clients.",
    metrics: [
      { label: "Platform Scans", value: "245,300", trend: "+18%", isPositive: true, icon: Activity, color: "blue" },
      { label: "Active Brands", value: "142", trend: "+5", isPositive: true, icon: Users, color: "indigo" },
      { label: "Global Repeat Rate", value: "24%", trend: "+2%", isPositive: true, icon: RefreshCcw, color: "orange" },
      { label: "Top Brand", value: "Authentik Core", icon: Package, color: "fuchsia", noTrend: true },
      { label: "Top Region", value: "South Asia", icon: MapPin, color: "emerald", noTrend: true },
    ],
    insights: [
      { text: "South Asia contributed 45% of total global scans.", color: "blue" },
      { text: "“Authentik Core” remains the top performing brand, driving 12% of traffic.", color: "indigo" },
      { text: "Overall platform engagement grew by 18%.", color: "emerald" },
      { text: "Global repeat engagement improved to 24%.", color: "orange" }
    ],
    recommendations: [
      { title: "Platform Scaling", desc: "Provision additional database shards in the Asia-Pacific region to handle the 45% load concentration.", icon: TrendingUp, color: "emerald", bg: "emerald" },
      { title: "Market Expansion", desc: "Focus enterprise sales efforts on North America, which showed a 12% organic traffic increase.", icon: Target, color: "amber", bg: "amber" },
      { title: "Feature Adoption", desc: "Push the new 'Coupons Engine' to legacy brands to improve their retention metrics.", icon: RefreshCcw, color: "blue", bg: "blue" }
    ],
    alerts: [
      { text: "API rate limits were briefly hit by 3 enterprise clients.", icon: AlertTriangle, color: "red" },
      { text: "Slight increase in latency observed in US-East during peak hours.", icon: TrendingUp, color: "orange", flip: true }
    ]
  };

  const authorizerData = {
    title: "Weekly Intelligence Report",
    date: "📅 Week: 15–21 April 2026",
    status: "+14% Growth",
    summaryPrefix: "Your brand experienced a ",
    summaryBold: "14% increase",
    summarySuffix: " in engagement this week, primarily driven by strong performance in Chennai and high traction for “Panther – Neon Blue”. However, repeat interactions declined, indicating an opportunity to improve customer retention.",
    metrics: [
      { label: "Total Scans", value: "12,540", trend: "+14%", isPositive: true, icon: Activity, color: "blue" },
      { label: "Unique Users", value: "9,200", trend: "+10%", isPositive: true, icon: Users, color: "indigo" },
      { label: "Repeat Rate", value: "18%", trend: "-5%", isPositive: false, icon: RefreshCcw, color: "orange" },
      { label: "Top Product", value: "Panther Neon", icon: Package, color: "fuchsia", noTrend: true },
      { label: "Top City", value: "Chennai", icon: MapPin, color: "emerald", noTrend: true },
    ],
    insights: [
      { text: "Chennai contributed 42% of total scans.", color: "blue" },
      { text: "“Panther – Neon Blue” generated 58% of overall engagement.", color: "indigo" },
      { text: "Weekend activity showed a massive 25% spike.", color: "emerald" },
      { text: "Repeat engagement declined compared to last week.", color: "orange" }
    ],
    recommendations: [
      { title: "Growth Opportunity", desc: "Increase inventory and run targeted promotions for “Panther – Neon Blue” while demand is peaking.", icon: TrendingUp, color: "emerald", bg: "emerald" },
      { title: "Market Focus", desc: "Expand localized marketing efforts in Bangalore. Data indicates emerging demand mirroring early Chennai trends.", icon: Target, color: "amber", bg: "amber" },
      { title: "Retention Fix", desc: "Introduce post-scan coupons or loyalty rewards immediately to reverse the 5% decline in repeat scans.", icon: RefreshCcw, color: "red", bg: "red" }
    ],
    alerts: [
      { text: "Unusual scan activity detected across multiple IP locations.", icon: AlertTriangle, color: "red" },
      { text: "Low repeat engagement trend identified.", icon: TrendingUp, color: "orange", flip: true }
    ]
  };

  const data = role === 'superadmin' ? superAdminData : authorizerData;

  const handlePrint = () => {
    window.print();
  };

  const handleAnalytics = () => {
    navigate('/admin/reports');
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles size={14} className="animate-pulse" /> AI Generated Insights
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 mb-2">
              AI Pulse
            </h1>
            <p className="text-indigo-200/80 font-medium text-lg">{data.title}</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
              {data.date}
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-emerald-500/20">
              <TrendingUp size={16} /> {data.status}
            </div>
          </div>
        </div>
      </div>

      {/* ── METRICS (Section 1) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.metrics.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-black text-slate-800 truncate">{stat.value}</h3>
                {!stat.noTrend && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          {/* ── EXECUTIVE SUMMARY (Section 2) ── */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <BrainCircuit size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Executive Summary</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
              {data.summaryPrefix}<strong className="text-emerald-600 font-black">{data.summaryBold}</strong>{data.summarySuffix}
            </p>
          </div>

          {/* ── AI RECOMMENDATIONS (Section 4) ── */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Lightbulb size={20} className="fill-indigo-600 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800">What You Should Do Next</h2>
            </div>
            
            <div className="grid gap-4">
              {data.recommendations.map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <div key={i} className={`flex gap-4 bg-${rec.bg}-50/50 border border-${rec.bg}-100 p-5 rounded-2xl relative overflow-hidden group hover:bg-${rec.bg}-50 transition-colors`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${rec.bg}-500 rounded-l-2xl`} />
                    <div className={`w-12 h-12 rounded-xl bg-white border border-${rec.bg}-100 shadow-sm flex items-center justify-center text-${rec.color}-600 shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-${rec.bg}-900 mb-1 text-sm uppercase tracking-wide`}>{rec.title}</h3>
                      <p className="text-slate-600 text-sm font-medium">{rec.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── KEY INSIGHTS (Section 3) ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <BarChart3 size={14} /> Key Insights
            </h3>
            <ul className="space-y-4">
              {data.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${insight.color}-500 mt-2 shrink-0`} />
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{insight.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── ALERTS (Section 5) ── */}
          <div className="bg-red-50/30 rounded-3xl p-6 border border-red-100 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
              <ShieldAlert size={14} /> Alerts & Risks
            </h3>
            <div className="space-y-3">
              {data.alerts.map((alert, i) => {
                const Icon = alert.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-3 border border-red-100 shadow-sm flex gap-3 items-start">
                    <Icon size={16} className={`text-${alert.color}-500 shrink-0 mt-0.5 ${alert.flip ? 'rotate-180' : ''}`} />
                    <p className="text-xs font-bold text-slate-700">{alert.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CTA (Section 6) ── */}
          <div className="space-y-3 pt-2">
            <button 
              onClick={handleAnalytics}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              View Detailed Analytics <ArrowRight size={16} />
            </button>
            <button 
              onClick={handlePrint}
              className="w-full py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Download Report (PDF) <Download size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
