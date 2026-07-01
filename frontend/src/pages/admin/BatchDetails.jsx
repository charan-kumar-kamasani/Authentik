import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, ArrowLeft, Download, AlertCircle, Search, FileText, Ban, X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  // Filtering state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  
  const [startSNFilter, setStartSNFilter] = useState('');
  const [endSNFilter, setEndSNFilter] = useState('');
  const [appliedStartSN, setAppliedStartSN] = useState('');
  const [appliedEndSN, setAppliedEndSN] = useState('');

  // Block Modal State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('lost');
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [blockSuccess, setBlockSuccess] = useState('');

  // Selection state
  const [selectedQrs, setSelectedQrs] = useState([]);
  const [expandedQr, setExpandedQr] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 250;

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchBatchDetails = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/admin/blank-qr-batches/${id}?page=${page}&limit=${limit}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (appliedSearch) url += `&search=${encodeURIComponent(appliedSearch)}`;
      
      if (appliedStartSN) url += `&startRange=${encodeURIComponent(appliedStartSN)}`;
      if (appliedEndSN) url += `&endRange=${encodeURIComponent(appliedEndSN)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (res.ok) {
        setBatch(data.batch);
        setQrs(data.qrs);
        setTotalPages(data.pages);
        // Clear selection on page/filter change
        setSelectedQrs([]);
      } else {
        setError(data.error || 'Failed to load batch details');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching details');
    } finally {
      setLoading(false);
    }
  }, [id, page, limit, token, statusFilter, appliedSearch, appliedStartSN, appliedEndSN]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchQuery);
    setAppliedStartSN(startSNFilter);
    setAppliedEndSN(endSNFilter);
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/admin/blank-qr-batches/${id}/download?format=${downloadFormat}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      
      if (res.ok && data.pdfBase64) {
        const link = document.createElement('a');
        const isZip = ['tiff', 'tif', 'cdr'].includes(data.format || downloadFormat);
        const ext = isZip ? 'zip' : 'pdf';
        const mimeType = isZip ? 'application/zip' : 'application/pdf';
        link.href = `data:${mimeType};base64,${data.pdfBase64}`;
        link.download = `blank_qrs_${(data.format || downloadFormat).toUpperCase()}_${batch.batchName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(data.error || 'Failed to download');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during download');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatSN = (num) => {
    const q = Math.floor(num / 50000) + 26;
    const r = num % 50000;
    let prefix = "";
    let temp = q;
    do {
      prefix = String.fromCharCode((temp % 26) + 65) + prefix;
      temp = Math.floor(temp / 26) - 1;
    } while (temp >= 0);
    return `${prefix}-${r.toString().padStart(5, '0')}`;
  };

  const parseSN = (str) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.toUpperCase().split('-');
    
    let prefix, numPart;
    if (parts.length === 1) {
      // Just a number provided, infer prefix from batch
      if (!batch) return null;
      prefix = formatSN(batch.startSerialNumber).split('-')[0];
      numPart = parseInt(parts[0], 10);
    } else if (parts.length === 2) {
      prefix = parts[0];
      numPart = parseInt(parts[1], 10);
    } else {
      return null;
    }
    
    if (isNaN(numPart)) return null;

    let q = 0;
    for (let i = 0; i < prefix.length; i++) {
      q = q * 26 + (prefix.charCodeAt(i) - 64);
    }
    q = q - 1;
    return q * 10000000 + numPart;
  };

  const handleBlockQrs = async (e) => {
    e.preventDefault();
    setBlockError('');
    setBlockSuccess('');

    if (selectedQrs.length === 0) {
      setBlockError('No QRs selected for blocking.');
      return;
    }

    setBlocking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blank-qr-batches/${id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrIds: selectedQrs,
          reason: blockReason
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBlockSuccess(data.message);
        fetchBatchDetails();
        setTimeout(() => {
          setShowBlockModal(false);
          setBlockSuccess('');
          setSelectedQrs([]);
        }, 2000);
      } else {
        setBlockError(data.error || 'Failed to block QRs');
      }
    } catch (err) {
      console.error(err);
      setBlockError('An error occurred during blocking');
    } finally {
      setBlocking(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all currently visible QRs that are not already blocked or assigned
      const selectable = qrs.filter(qr => !qr.isAssigned && !qr.isBlocked).map(qr => qr._id);
      setSelectedQrs(selectable);
    } else {
      setSelectedQrs([]);
    }
  };

  const handleSelectOne = (qrId) => {
    setSelectedQrs(prev => 
      prev.includes(qrId) ? prev.filter(id => id !== qrId) : [...prev, qrId]
    );
  };

  if (loading && !batch) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div className="text-red-700 font-medium">{error}</div>
        </div>
        <button 
          onClick={() => navigate('/admin/superadmin-qrs')}
          className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          <ArrowLeft size={18} /> Back to Generation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/superadmin-qrs')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-4 transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Back to Generation
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Box className="text-indigo-600" size={32} />
              {batch?.batchName}
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Batch generated on {formatDate(batch?.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              disabled={downloading}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="pdf">PDF</option>
              <option value="tiff">TIFF</option>
              <option value="cdr">CDR</option>
            </select>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                downloading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30 hover:-translate-y-0.5 shadow-emerald-600/20'
              }`}
            >
              {downloading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {downloading ? 'Preparing...' : 'Download'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div className="text-red-700 font-medium">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Total Quantity</div>
          <div className="text-3xl font-black text-slate-800">{batch?.quantity.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">QR codes in this batch</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Start Serial Number</div>
          <div className="text-3xl font-mono font-bold text-indigo-600">{formatSN(batch?.startSerialNumber)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">End Serial Number</div>
          <div className="text-3xl font-mono font-bold text-indigo-600">{formatSN(batch?.endSerialNumber)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" size={24} />
            QR Codes Preview
          </h2>

          <div className="flex w-full mt-4 md:mt-0 overflow-x-auto pb-2 -mb-2">
            <form onSubmit={handleFilterSubmit} className="flex flex-row items-center gap-3 w-full justify-start md:justify-end min-w-max">
              <div className="relative w-48 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search SN or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Start SN"
                  value={startSNFilter}
                  onChange={(e) => setStartSNFilter(e.target.value)}
                  className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="End SN"
                  value={endSNFilter}
                  onChange={(e) => setEndSNFilter(e.target.value)}
                  className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-36 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 flex-shrink-0"
              >
                <option value="all">All Status</option>
                <option value="blank">Blank Only</option>
                <option value="assigned">Assigned Only</option>
                <option value="blocked">Blocked Only</option>
              </select>

              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        {selectedQrs.length > 0 && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-indigo-800 font-semibold">
              {selectedQrs.length} QR code{selectedQrs.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold transition-colors shadow-sm"
            >
              <Ban size={16} />
              Block Selected
            </button>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={qrs.length > 0 && selectedQrs.length === qrs.filter(q => !q.isAssigned && !q.isBlocked).length && qrs.filter(q => !q.isAssigned && !q.isBlocked).length > 0}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 border-b border-slate-200 whitespace-nowrap">Serial Number</th>
                <th className="p-4 border-b border-slate-200 whitespace-nowrap">Internal ID</th>
                <th className="p-4 border-b border-slate-200 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qrs.map((qr) => {
                const isSelectable = !qr.isAssigned && !qr.isBlocked;
                const isExpanded = expandedQr === qr._id;
                
                return (
                <React.Fragment key={qr._id}>
                <tr 
                  className={`transition-colors ${selectedQrs.includes(qr._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} ${qr.isAssigned ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (qr.isAssigned) setExpandedQr(isExpanded ? null : qr._id);
                  }}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      disabled={!isSelectable}
                      checked={selectedQrs.includes(qr._id)}
                      onChange={() => handleSelectOne(qr._id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      {formatSN(qr.serialNumber)}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-500">
                    {qr.qrCode}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between">
                      {qr.isBlocked ? (
                        <span className="px-3 py-1 bg-red-50 text-red-700 font-semibold rounded-full text-xs uppercase tracking-wider">
                          Blocked ({qr.blockReason})
                        </span>
                      ) : qr.isAssigned ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-xs uppercase tracking-wider">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full text-xs uppercase tracking-wider">
                          Blank
                        </span>
                      )}
                      {qr.isAssigned && (
                        <span className="text-slate-400 text-xs ml-4">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {isExpanded && qr.isAssigned && (
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td colSpan="4" className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Company</div>
                          <div className="text-sm font-semibold text-slate-800">{qr.assignedToCompany?.companyName || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{qr.assignedToCompany?.email || ''}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name</div>
                          <div className="text-sm font-semibold text-slate-800">{qr.assignedToProduct?.productName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Brand</div>
                          <div className="text-sm font-semibold text-slate-800">{qr.assignedToProduct?.brand || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Creator</div>
                          <div className="text-sm font-semibold text-slate-800">{qr.assignedToProduct?.createdBy?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{qr.assignedToProduct?.createdBy?.email || ''}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Authorizer</div>
                          <div className="text-sm font-semibold text-slate-800">
                            {qr.assignedToProduct?.orderId?.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {qr.assignedToProduct?.orderId?.history?.find(h => h.status === 'Received' || h.status === 'Completed')?.changedBy?.email || ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Public URL</div>
                          <a href={`https://authentiks.io/qr/${qr.qrCode}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline break-all">
                            https://authentiks.io/qr/{qr.qrCode}
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              Showing page 
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="mx-1 px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                disabled={loading}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block QRs Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Ban className="text-red-500" size={24} />
                Block QR Range
              </h3>
              <button 
                onClick={() => setShowBlockModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {blockError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-lg">
                  {blockError}
                </div>
              )}
              {blockSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-lg">
                  {blockSuccess}
                </div>
              )}

              <form onSubmit={handleBlockQrs} className="space-y-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-lg font-medium text-sm border border-red-100">
                  You are about to block <strong>{selectedQrs.length}</strong> selected QR code{selectedQrs.length > 1 ? 's' : ''}. This action will prevent them from being assigned to products.
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Blocking</label>
                  <select
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="lost">Lost in Transit / Print</option>
                    <option value="damaged">Damaged Print</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={blocking}
                    className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${
                      blocking 
                        ? 'bg-red-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/30 hover:-translate-y-0.5'
                    }`}
                  >
                    {blocking ? 'Blocking...' : 'Confirm Block'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
