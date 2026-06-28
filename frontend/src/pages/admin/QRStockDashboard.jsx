import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, XCircle, AlertCircle, Box, Layers, ShieldCheck, Activity } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import StockRequestModal from '../../components/StockRequestModal';

const QRStockDashboard = () => {
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0 });
  const [requests, setRequests] = useState([]);
  const [usage, setUsage] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [expandedUsage, setExpandedUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/stock-requests/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch requests list
      const requestsRes = await fetch(`${API_BASE_URL}/stock-requests`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
        cache: 'no-store'
      });
      if (requestsRes.ok) {
        const reqData = await requestsRes.json();
        setRequests(reqData);
      }

      // Fetch usage history
      const usageRes = await fetch(`${API_BASE_URL}/stock-requests/usage`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
        cache: 'no-store'
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (err) {
      console.error('Failed to load QR Stock Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReceiveRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to mark this package as received? This will add the QRs to your available inventory.")) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/stock-requests/${requestId}/receive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        await fetchDashboardData();
        alert("Stock request marked as received! QRs have been added to your inventory.");
      } else {
        alert(data.error || "Failed to receive stock request.");
      }
    } catch (err) {
      alert("An error occurred while updating the request.");
    }
  };

  const handlePayment = async (requestId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type: 'stock_request',
          stockRequestId: requestId,
          redirectUrl: `${window.location.origin}/admin/qr-inventory`
        })
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      alert('An error occurred while initiating payment.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
      case 'Fulfilled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle2 size={12} className="text-emerald-500" /> Received
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Package size={12} className="text-purple-500 animate-bounce" /> Dispatched
          </span>
        );
      case 'Preparing for Dispatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Box size={12} className="text-blue-500" /> Preparing
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <CheckCircle2 size={12} className="text-indigo-500" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <XCircle size={12} className="text-rose-500" /> Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Clock size={12} className="text-amber-500" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden p-4 md:p-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-[1700px] mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200/50 mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold text-blue-800 tracking-wide uppercase">Inventory Dashboard</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3 flex items-center gap-4">
              QR Stock Center
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
              Monitor your physical QR stock, track generation history, and seamlessly request new batches.
            </p>
          </div>
          <div className="flex gap-3 animate-in slide-in-from-right duration-700">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] text-white rounded-2xl font-black text-sm shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:bg-[position:right_center] active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2 group"
            >
              <Box className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Request QR Stock
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-100/80 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-200/50 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">Available QRs</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{stats.available.toLocaleString()}</h3>
                  <p className="text-sm text-emerald-600 font-bold mt-4 flex items-center gap-2 bg-emerald-50/80 inline-flex px-3 py-1.5 rounded-lg border border-emerald-100/50">
                    <CheckCircle2 size={16} className="animate-pulse" /> Ready to be mapped
                  </p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgb(79,70,229,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-indigo-100/80 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-indigo-200/50 group-hover:scale-110 transition-transform duration-300">
                    <Layers size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">Total QRs Bought</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{stats.total.toLocaleString()}</h3>
                  <p className="text-sm text-indigo-600 font-bold mt-4 flex items-center gap-2 bg-indigo-50/80 inline-flex px-3 py-1.5 rounded-lg border border-indigo-100/50">
                    <Activity size={16} /> Total allocated
                  </p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgb(100,116,139,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-slate-100/80 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 group-hover:scale-110 transition-transform duration-300">
                    <Package size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">Used QRs</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{stats.used.toLocaleString()}</h3>
                  <p className="text-sm text-slate-600 font-bold mt-4 flex items-center gap-2 bg-slate-100/80 inline-flex px-3 py-1.5 rounded-lg border border-slate-200/50">
                    Generated and mapped
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs & Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 mt-8">
              <div className="p-6 border-b border-slate-100/50 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                <div className="bg-slate-100/80 p-1.5 rounded-2xl inline-flex shadow-inner">
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${activeTab === 'requests' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    Stock Request History
                  </button>
                  <button 
                    onClick={() => setActiveTab('usage')}
                    className={`px-6 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${activeTab === 'usage' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    QR Usage History
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100/50">
                      {activeTab === 'requests' ? (
                        <>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap rounded-tl-xl">Requested Date</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right rounded-tr-xl">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap rounded-tl-xl">Used Date</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity Used</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">QR Serials</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tr-xl">Product & Brand</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeTab === 'requests' ? (
                      requests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 px-6 text-center text-slate-400 font-medium">
                            No stock requests found.
                          </td>
                        </tr>
                      ) : (
                        requests.map(req => (
                          <tr key={req._id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                            <td className="py-5 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 font-black text-sm border border-blue-500/20 shadow-sm">
                                {req.quantity.toLocaleString()} QRs
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-sm font-black text-slate-800">{req.requestedBy?.name || 'Unknown'}</div>
                              <div className="text-xs font-bold text-slate-400">{req.requestedBy?.email}</div>
                            </td>
                            <td className="py-5 px-6">
                              <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-xs">{req.notes || '-'}</p>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-3">
                                  {req.paymentStatus === 'paid' && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm uppercase tracking-widest">Paid</span>
                                  )}
                                  {req.paymentStatus !== 'paid' && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">₹{req.amount}</span>
                                  )}
                                  {getStatusBadge(req.status)}
                                </div>
                                
                                {req.paymentStatus !== 'paid' && req.amount > 0 && !['Rejected', 'Received', 'Dispatched', 'Fulfilled'].includes(req.status) && (
                                  <button
                                    onClick={() => handlePayment(req._id)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] text-white rounded-xl text-xs font-black shadow-[0_4px_15px_-3px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(79,70,229,0.5)] hover:bg-[position:right_center] hover:-translate-y-0.5 active:scale-95 transition-all w-32"
                                  >
                                    PAY NOW
                                  </button>
                                )}
                                
                                {req.status === 'Dispatched' && (
                                  <button
                                    onClick={() => handleReceiveRequest(req._id)}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-xs font-black shadow-[0_4px_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all"
                                  >
                                    Mark as Received
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      usage.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 px-6 text-center text-slate-400 font-medium">
                            No QR usage history found.
                          </td>
                        </tr>
                      ) : (
                        usage.map(u => {
                          const isExpanded = expandedUsage === u._id;
                          return (
                          <React.Fragment key={u._id}>
                            <tr 
                              className="hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group"
                              onClick={() => setExpandedUsage(isExpanded ? null : u._id)}
                            >
                              <td className="py-5 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">
                                {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-5 px-6">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 font-black text-sm border border-indigo-500/20 shadow-sm">
                                  {(u.qrGeneratedCount || u.quantity || 0).toLocaleString()} QRs
                                </span>
                              </td>
                              <td className="py-5 px-6">
                                {u.startSerialNumber && u.endSerialNumber ? (
                                  <div className="text-xs font-mono font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-sm">
                                    #{u.startSerialNumber} - #{u.endSerialNumber}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-300 font-bold">N/A</span>
                                )}
                              </td>
                              <td className="py-5 px-6">
                                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                  {u.orderId || u._id?.slice(-6)}
                                </span>
                              </td>
                              <td className="py-5 px-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-black text-slate-800">{u.productName || 'Unknown'}</div>
                                    <div className="text-xs font-bold text-slate-400">{u.brand || '-'}</div>
                                  </div>
                                  <span className="text-slate-400 text-xs ml-4 font-bold group-hover:text-indigo-500 transition-colors bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
                                    {isExpanded ? 'Hide' : 'View'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan="5" className="p-0 border-b border-slate-100">
                                  <div className="p-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                      <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company</div>
                                        <div className="text-sm font-black text-slate-800">{u.company?.companyName || u.companyId?.companyName || 'N/A'}</div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Details</div>
                                        <div className="text-sm font-black text-slate-800">{u.productName || 'N/A'}</div>
                                        <div className="text-xs font-bold text-slate-400">{u.brand || '-'}</div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</div>
                                        <div className="text-sm font-black text-slate-800">{u.status}</div>
                                      </div>
                                      {u.startSerialNumber && u.endSerialNumber && (
                                        <div className="col-span-full mt-2 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50 shadow-inner">
                                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Layers size={14} /> Assigned Serial Numbers
                                          </div>
                                          <div className="flex items-center space-x-4">
                                            <div className="flex items-center px-4 py-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm">
                                              <span className="text-slate-400 text-xs font-bold mr-3 uppercase tracking-wider">From</span>
                                              <span className="font-mono text-indigo-600 font-black text-sm">#{u.startSerialNumber}</span>
                                            </div>
                                            <div className="text-indigo-300 animate-pulse">→</div>
                                            <div className="flex items-center px-4 py-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm">
                                              <span className="text-slate-400 text-xs font-bold mr-3 uppercase tracking-wider">To</span>
                                              <span className="font-mono text-indigo-600 font-black text-sm">#{u.endSerialNumber}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Creator</div>
                                        <div className="text-sm font-black text-slate-800">{u.createdBy?.name || 'N/A'}</div>
                                        <div className="text-xs font-bold text-slate-400">{u.createdBy?.email || ''}</div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authorizer</div>
                                        <div className="text-sm font-black text-slate-800">
                                          {u.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">
                                          {u.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.email || ''}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )})
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <StockRequestModal 
          isOpen={showRequestModal} 
          onClose={() => {
            setShowRequestModal(false);
            fetchDashboardData();
          }} 
        />
      </div>
    </div>
  );
};

export default QRStockDashboard;
