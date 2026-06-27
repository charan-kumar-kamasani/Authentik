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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
      case 'Fulfilled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Received
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <Package size={12} /> Dispatched
          </span>
        );
      case 'Preparing for Dispatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <Box size={12} /> Preparing
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-[1700px] mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="animate-in slide-in-from-left duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3 flex items-center gap-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">QR Inventory</span>
            </h2>
            <p className="text-gray-500 font-bold text-lg max-w-2xl">
              Manage your company's physical QR stock and view request history.
            </p>
          </div>
          <div className="flex gap-3 animate-in slide-in-from-right duration-700">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.25rem] font-black text-sm hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Box className="w-5 h-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2">Available QRs</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tight">{stats.available.toLocaleString()}</h3>
                  <p className="text-sm text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Ready to be mapped
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <Layers size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2">Total QRs Bought</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tight">{stats.total.toLocaleString()}</h3>
                  <p className="text-sm text-indigo-600 font-medium mt-3 flex items-center gap-1.5">
                    <Activity size={14} /> Total allocated to company
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6">
                    <Package size={28} />
                  </div>
                  <p className="text-slate-500 font-bold mb-2">Used QRs</p>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tight">{stats.used.toLocaleString()}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-3 flex items-center gap-1.5">
                    Generated and mapped
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs & Table */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex px-6 pt-4 gap-8">
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Stock Request History
                  </button>
                  <button 
                    onClick={() => setActiveTab('usage')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'usage' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    QR Usage History
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      {activeTab === 'requests' ? (
                        <>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Requested Date</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Used Date</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity Used</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                          <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product & Brand</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'requests' ? (
                      requests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 px-6 text-center text-slate-400 font-medium">
                            No stock requests found.
                          </td>
                        </tr>
                      ) : (
                        requests.map(req => (
                          <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 text-sm font-semibold text-slate-700 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                                {req.quantity.toLocaleString()} QRs
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm font-bold text-slate-800">{req.requestedBy?.name || 'Unknown'}</div>
                              <div className="text-xs font-medium text-slate-500">{req.requestedBy?.email}</div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">{req.notes || '-'}</p>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(req.status)}
                                {req.status === 'Dispatched' && (
                                  <button
                                    onClick={() => handleReceiveRequest(req._id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-xs font-bold hover:shadow-md hover:-translate-y-0.5 transition-all shadow-emerald-500/20"
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
                          <td colSpan="4" className="py-12 px-6 text-center text-slate-400 font-medium">
                            No QR usage history found.
                          </td>
                        </tr>
                      ) : (
                        usage.map(u => {
                          const isExpanded = expandedUsage === u._id;
                          return (
                          <React.Fragment key={u._id}>
                            <tr 
                              className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                              onClick={() => setExpandedUsage(isExpanded ? null : u._id)}
                            >
                              <td className="py-4 px-6 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                                  {(u.qrGeneratedCount || u.quantity || 0).toLocaleString()} QRs
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  {u.orderId || u._id?.slice(-6)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-bold text-slate-800">{u.productName || 'Unknown'}</div>
                                    <div className="text-xs font-medium text-slate-500">{u.brand || '-'}</div>
                                  </div>
                                  <span className="text-slate-400 text-xs ml-4">
                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <td colSpan="4" className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company</div>
                                      <div className="text-sm font-semibold text-slate-800">{u.company?.companyName || u.companyId?.companyName || 'N/A'}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Details</div>
                                      <div className="text-sm font-semibold text-slate-800">{u.productName || 'N/A'}</div>
                                      <div className="text-xs text-slate-500">{u.brand || '-'}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                                      <div className="text-sm font-semibold text-slate-800">{u.status}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Creator</div>
                                      <div className="text-sm font-semibold text-slate-800">{u.createdBy?.name || 'N/A'}</div>
                                      <div className="text-xs text-slate-500">{u.createdBy?.email || ''}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Authorizer</div>
                                      <div className="text-sm font-semibold text-slate-800">
                                        {u.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.name || 'N/A'}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {u.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.email || ''}
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
