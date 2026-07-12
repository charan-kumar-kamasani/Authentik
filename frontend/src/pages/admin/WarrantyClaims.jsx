import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  ExternalLink, X, Send, Loader, Eye, MessageCircle, Search,
  AlertCircle, Camera, User, Phone, MapPin, Hash, Calendar, Shield,
  ArrowRight, CheckCircle2, History, MessageSquare, Clipboard, Package
} from 'lucide-react';
import { getAllWarrantyClaims, updateWarrantyClaimStatus } from '../../config/api';

/* ═══════════ SUB-COMPONENTS ═══════════ */
function StatCard({ label, value, color, icon: Icon, onClick, active }) {
  const c = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-100' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', ring: 'ring-indigo-100' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-100' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'ring-emerald-100' },
    red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', ring: 'ring-red-100' },
    slate: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', ring: 'ring-slate-100' },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border transition-all duration-300 cursor-pointer group active:scale-95 ${active ? `${c.border} ${c.ring} ring-4 shadow-lg shadow-slate-200/50` : 'border-slate-200/60 hover:shadow-md'
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} className={c.text} strokeWidth={2.5} />
        </div>
        {active && <div className={`w-2 h-2 rounded-full ${c.text.replace('text', 'bg')}`} />}
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black ${c.text} tracking-tight mt-1`}>{value}</p>
    </div>
  );
}

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get('search') || '');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [viewImage, setViewImage] = useState(null);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  const role = user.role || '';
  const canUpdate = ['authorizer', 'creator'].includes(role.toLowerCase());

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await getAllWarrantyClaims(token, '');
      setClaims(data);

      // Auto-expand claim for specific order if orderId is in URL
      const queryOrderId = new URLSearchParams(window.location.search).get('orderId');
      if (queryOrderId && data && data.length > 0) {
        const matchingClaim = data.find(c => {
          const cOrderId = c.productId?.orderId?._id || c.productId?.orderId;
          return cOrderId && cOrderId.toString() === queryOrderId.toString();
        });
        if (matchingClaim) {
          setExpandedId(matchingClaim._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch warranty claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    if (expandedId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`claim-row-${expandedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [expandedId]);

  const handleStatusUpdate = async (claimId, newStatus) => {
    setActionLoading(claimId);
    try {
      await updateWarrantyClaimStatus(claimId, { status: newStatus, adminNotes }, token);
      await fetchClaims();
      setAdminNotes('');
      setExpandedId(null);
    } catch (err) {
      alert(err.message || 'Failed to update claim status');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status) => {
    const displayStatus = status === 'Sent' ? 'Registered' : status;
    const config = {
      Registered: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send },
      Sent: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: AlertCircle },
      Processing: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Loader },
      Reviewing: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Eye },
      Contacted: { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: MessageSquare },
      Resolved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
      Rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
    }[displayStatus] || { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: Clock };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${config.color}`}>
        <Icon size={12} className={displayStatus === 'Processing' ? 'animate-spin' : ''} strokeWidth={3} />
        {displayStatus}
      </span>
    );
  };

  const filteredClaims = claims.filter(c => {
    // 1. Text Search Filter
    const matchesSearch = 
      c.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.qrCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userId?.mobile?.includes(searchQuery);

    if (!matchesSearch) return false;

    // 2. Status Tab Filter
    if (statusFilter === 'Registered') {
      return c.status === 'Registered' || c.status === 'Sent';
    }
    if (statusFilter === 'Sent') {
      return c.status === 'Sent';
    }
    if (statusFilter === 'Processing') {
      return ['Processing', 'Reviewing', 'Contacted'].includes(c.status);
    }
    if (statusFilter === 'Resolved') {
      return c.status === 'Resolved';
    }
    if (statusFilter === 'Rejected') {
      return c.status === 'Rejected';
    }

    return true; // "Total" tab
  });

  const stats = {
    total: claims.length,
    registered: claims.filter(c => c.status === 'Registered' || c.status === 'Sent').length,
    sent: claims.filter(c => c.status === 'Sent').length,
    processing: claims.filter(c => ['Processing', 'Reviewing', 'Contacted'].includes(c.status)).length,
    resolved: claims.filter(c => c.status === 'Resolved').length,
    rejected: claims.filter(c => c.status === 'Rejected').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Warranty</h1>
              <p className="text-sm text-slate-500 font-medium">Customer support & lifecycle management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search QR, Product, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all w-72 shadow-sm"
              />
            </div>
            <button
              onClick={fetchClaims}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
            >
              <History size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} color="slate" icon={Clipboard} onClick={() => setStatusFilter('')} active={statusFilter === ''} />
        <StatCard label="Registered" value={stats.registered} color="blue" icon={Send} onClick={() => setStatusFilter('Registered')} active={statusFilter === 'Registered'} />
        <StatCard label="Sent" value={stats.sent} color="indigo" icon={AlertCircle} onClick={() => setStatusFilter('Sent')} active={statusFilter === 'Sent'} />
        <StatCard label="In Progress" value={stats.processing} color="amber" icon={Loader} onClick={() => setStatusFilter('Processing')} active={statusFilter === 'Processing'} />
        <StatCard label="Resolved" value={stats.resolved} color="emerald" icon={CheckCircle2} onClick={() => setStatusFilter('Resolved')} active={statusFilter === 'Resolved'} />
        <StatCard label="Rejected" value={stats.rejected} color="red" icon={XCircle} onClick={() => setStatusFilter('Rejected')} active={statusFilter === 'Rejected'} />
      </div>

      {/* ─── Claims Table ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-700">No Claims Found</h3>
          <p className="text-slate-400 font-medium mt-2">Adjust your filters or search query to find more results.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Date</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">QR Code</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <React.Fragment key={claim._id}>
                  <tr id={`claim-row-${claim._id}`} className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${expandedId === claim._id ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {claim.productId?.productImage ? (
                            <img src={claim.productId.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} className="text-slate-300" />
                          )}
                        </div>
                        <span className="text-sm font-black text-slate-800 truncate max-w-[180px]">{claim.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-slate-700">{claim.userId?.name || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{claim.userId?.mobile || ''}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-600">
                      {claim.purchaseDate ? new Date(claim.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-black font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">#{claim.qrCode?.slice(-8)}</span>
                    </td>
                    <td className="px-4 py-4">{statusBadge(claim.status)}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === claim._id ? null : claim._id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${expandedId === claim._id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      >
                        {expandedId === claim._id ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedId === claim._id && (
                    <tr><td colSpan={6} className="p-0">
                      <div className="border-t border-slate-100 bg-slate-50/40 p-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left Column: Core Info */}
                          <div className="space-y-6">
                            {/* Customer Info Section */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={12} /> Customer Information
                              </h4>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-0.5">Full Name</p>
                                  <p className="text-sm font-black text-slate-800">{claim.userId?.name || 'Not provided'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-0.5">Mobile Number</p>
                                  <p className="text-sm font-black text-slate-800">{claim.userId?.mobile || 'Not provided'}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-xs font-bold text-slate-400 mb-0.5">Location</p>
                                  <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-blue-500" />
                                    {claim.userId?.city ? `${claim.userId.city}, ${claim.userId.state}` : 'Unknown Location'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Product & Warranty Terms */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield size={12} /> Product & Warranty Details
                              </h4>
                              <div className="grid grid-cols-2 gap-6 mb-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-0.5">Purchase Date</p>
                                  <p className="text-sm font-black text-slate-800">
                                    {claim.purchaseDate ? new Date(claim.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-0.5">QR Identifier</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-slate-800 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate max-w-[120px]">
                                      {claim.qrCode}
                                    </p>
                                    <button onClick={() => navigator.clipboard.writeText(claim.qrCode)} className="text-slate-400 hover:text-blue-600"><Clipboard size={14} /></button>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Applied Warranty Terms</p>
                                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{claim.warrantyInfo?.warrantyType || 'Standard'}</span>
                                </div>
                                <p className="text-lg font-black text-emerald-900 leading-none">
                                  {claim.warrantyInfo?.duration} {claim.warrantyInfo?.durationUnit || 'months'} Coverage
                                </p>
                                <p className="text-xs font-bold text-emerald-700/70 mt-2 leading-relaxed">
                                  {claim.warrantyInfo?.description || 'Full coverage for manufacturing defects and functional failures.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Issue & Proof */}
                          <div className="space-y-6">
                            {/* Issue details added earlier */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0 opacity-40" />
                              <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <AlertCircle size={12} /> Claim Assessment
                                </h4>
                                <div className="mb-4">
                                  <p className="text-xs font-bold text-slate-400 mb-1">Issue Reported</p>
                                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-black uppercase tracking-wide border border-orange-200">
                                    {claim.issue || 'General Malfunction'}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-1">Detailed Description</p>
                                  <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                    "{claim.claimDescription || 'No description provided by the customer.'}"
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Evidence Images */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Camera size={12} /> Supporting Evidence
                              </h4>
                              <div className="space-y-4">
                                {/* Invoice Images */}
                                {claim.invoiceImages?.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-500 mb-2">Invoice / Purchase Proof</p>
                                    <div className="flex gap-2.5">
                                      {claim.invoiceImages.map((img, i) => (
                                        <button key={i} onClick={() => setViewImage(img)} className="w-16 h-16 rounded-xl border-2 border-slate-100 overflow-hidden hover:border-emerald-500 transition-all">
                                          <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Product Condition Images */}
                                {claim.claimImages?.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-500 mb-2">Product Images</p>
                                    <div className="flex gap-2.5">
                                      {claim.claimImages.map((img, i) => (
                                        <button key={i} onClick={() => setViewImage(img)} className="w-16 h-16 rounded-xl border-2 border-slate-100 overflow-hidden hover:border-emerald-500 transition-all">
                                          <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(!claim.invoiceImages?.length && !claim.claimImages?.length) && (
                                  <p className="text-xs text-slate-400 italic py-4">No evidence images provided</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ─── Actions Section ─── */}
                        <div className="pt-8 border-t border-slate-200">
                          {/* Full Audit Trail for Super Admins / Admins */}
                          {['superadmin', 'admin'].includes(role.toLowerCase()) && (
                            <div className="mb-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <History size={12} /> Full Governance Audit Trail
                              </h4>
                              <div className="space-y-0 ml-2 border-l-2 border-slate-100 pl-6">
                                {/* Fallback for legacy claims without statusHistory */}
                                {(claim.statusHistory?.length > 0 ? claim.statusHistory : [
                                  { status: 'Registered', changedAt: claim.createdAt, notes: 'Claim registered in system' }
                                ]).map((event, idx, arr) => (
                                  <div key={idx} className="relative pb-6 last:pb-0">
                                    {/* Dot */}
                                    <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ${idx === arr.length - 1 ? 'bg-emerald-500 ring-emerald-50' : 'bg-slate-300 ring-slate-50'
                                      }`} />

                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <p className="text-[13px] font-black text-slate-800 leading-tight">
                                          {event.status}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1">
                                          {event.notes || `Claim moved to ${event.status}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                            {event.changedBy?.name?.[0] || 'S'}
                                          </div>
                                          <span className="text-[10px] font-black text-slate-400">
                                            {event.changedBy?.name || 'System'} • {new Date(event.changedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>
                                      {idx === 0 && <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Registration</span>}
                                      {idx === arr.length - 1 && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Latest</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!['Resolved', 'Rejected'].includes(claim.status) ? (
                            canUpdate ? (
                              <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Remarks</label>
                                    <textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes for internal tracking or customer response..."
                                      rows={3}
                                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none shadow-inner"
                                    />
                                  </div>
                                </div>
                                <div className="lg:w-80 space-y-4 shrink-0">
                                  <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Lifecycle Status</label>
                                    <div className="relative">
                                      <select
                                        id={`status-${claim._id}`}
                                        className="w-full appearance-none px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                                        defaultValue={claim.status}
                                      >
                                        <option value="Registered" disabled>New Request (Registered)</option>
                                        <option value="Sent" disabled>Sent</option>
                                        <option value="Processing">Processing / Inspection</option>
                                        <option value="Reviewing">Under Expert Review</option>
                                        <option value="Contacted">Customer Contacted</option>
                                        <option value="Resolved">✓ Resolve Claim</option>
                                        <option value="Rejected">✗ Reject Claim</option>
                                      </select>
                                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleStatusUpdate(claim._id, document.getElementById(`status-${claim._id}`).value)}
                                    disabled={actionLoading === claim._id}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
                                  >
                                    {actionLoading === claim._id ? <Loader size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {actionLoading === claim._id ? 'Updating...' : 'Commit Status Update'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                  <Eye size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight leading-none">View Only Mode</p>
                                  <p className="text-[11px] font-bold text-slate-400 mt-1">Status updates are restricted to brand creators and authorizers.</p>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="flex items-start gap-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${claim.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {claim.status === 'Resolved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-black text-slate-800 text-sm uppercase tracking-wide">Final Resolution</h5>
                                  <span className="text-[10px] text-slate-400">• Reviewed on {new Date(claim.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                  "{claim.adminNotes || 'No specific resolution notes provided.'}"
                                </p>
                              </div>
                              <button onClick={() => setExpandedId(null)} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest underline decoration-2 underline-offset-4">Close View</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Image Lightbox ─── */}
      {viewImage && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setViewImage(null)} />
          <button
            onClick={() => setViewImage(null)}
            className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <X size={24} className="text-white" />
          </button>
          <img src={viewImage} alt="Preview" className="relative z-10 max-w-full max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white/10 ring-1 ring-white/20 object-contain" />
        </div>
      )}
    </div>
  );
}
