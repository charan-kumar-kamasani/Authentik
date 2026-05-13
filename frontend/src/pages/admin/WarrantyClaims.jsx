import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import { getAllWarrantyClaims, updateWarrantyClaimStatus } from '../../config/api';

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [viewImage, setViewImage] = useState(null);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await getAllWarrantyClaims(token, statusFilter);
      setClaims(data);
    } catch (err) {
      console.error('Failed to fetch warranty claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

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

  const statusIcon = (status) => {
    if (status === 'Approved') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'Rejected') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-amber-500" />;
  };

  const statusBadge = (status) => {
    const colors = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.Pending}`}>
        {statusIcon(status)}
        {status}
      </span>
    );
  };

  const pendingCount = claims.filter(c => c.status === 'Pending').length;
  const approvedCount = claims.filter(c => c.status === 'Approved').length;
  const rejectedCount = claims.filter(c => c.status === 'Rejected').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Warranty Claims</h1>
            <p className="text-sm text-slate-500 font-medium">Manage and review warranty claims submitted by customers</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{claims.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-amber-200 transition-all" onClick={() => setStatusFilter(statusFilter === 'Pending' ? '' : 'Pending')}>
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-200 transition-all" onClick={() => setStatusFilter(statusFilter === 'Approved' ? '' : 'Approved')}>
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-red-200 transition-all" onClick={() => setStatusFilter(statusFilter === 'Rejected' ? '' : 'Rejected')}>
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter */}
      {statusFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtered by:</span>
          {statusBadge(statusFilter)}
          <button onClick={() => setStatusFilter('')} className="text-xs text-blue-600 hover:underline font-medium ml-2">Clear filter</button>
        </div>
      )}

      {/* Claims List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No warranty claims found</h3>
          <p className="text-sm text-slate-400 mt-1">Claims will appear here when customers submit them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Claim Header */}
              <button
                onClick={() => setExpandedId(expandedId === claim._id ? null : claim._id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{claim.productName || 'Unknown Product'}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 font-medium">
                        {claim.userId?.name || claim.userId?.mobile || 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {statusBadge(claim.status)}
                  {expandedId === claim._id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === claim._id && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                  {/* Purchase Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {claim.purchaseDate ? new Date(claim.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Source</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{claim.purchaseSource || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller Name</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{claim.sellerName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Warranty Info */}
                  {claim.warrantyInfo && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Warranty Terms</p>
                      <div className="flex gap-4 text-sm text-emerald-800 font-medium">
                        {claim.warrantyInfo.warrantyType && <span>{claim.warrantyInfo.warrantyType}</span>}
                        {claim.warrantyInfo.duration && (
                          <span>• {claim.warrantyInfo.duration} {claim.warrantyInfo.durationUnit || 'months'}</span>
                        )}
                      </div>
                      {claim.warrantyInfo.description && (
                        <p className="text-xs text-emerald-700 mt-1">{claim.warrantyInfo.description}</p>
                      )}
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{claim.userId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{claim.userId?.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QR Code</p>
                      <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5 truncate">{claim.qrCode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Invoice Images */}
                  {claim.invoiceImages && claim.invoiceImages.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Images</p>
                      <div className="flex gap-3">
                        {claim.invoiceImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setViewImage(img)}
                            className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                          >
                            <img src={img} alt={`Invoice ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ExternalLink size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes + Actions (only for Pending) */}
                  {claim.status === 'Pending' && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Notes (Optional)</label>
                        <textarea
                          value={expandedId === claim._id ? adminNotes : ''}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes about this claim..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(claim._id, 'Approved')}
                          disabled={actionLoading === claim._id}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {actionLoading === claim._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(claim._id, 'Rejected')}
                          disabled={actionLoading === claim._id}
                          className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          {actionLoading === claim._id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show admin notes if already reviewed */}
                  {claim.status !== 'Pending' && claim.adminNotes && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Notes</p>
                      <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">{claim.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {viewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setViewImage(null)}>
          <button
            onClick={() => setViewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          <img src={viewImage} alt="Invoice" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
