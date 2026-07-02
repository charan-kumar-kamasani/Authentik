import React, { useState, useEffect, useCallback } from 'react';
import { Box, Printer, AlertCircle, History, List, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL, { getAllCompanies } from '../../config/api';
import { useConfirm } from '../../components/ConfirmModal';

export default function GenerateBlankQrs() {
  const [quantity, setQuantity] = useState('');
  const [format, setFormat] = useState('pdf');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [rejectModal, setRejectModal] = useState({ show: false, requestId: null, reason: '' });
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Assign states
  const [companies, setCompanies] = useState([]);
  const [assignTargetCompany, setAssignTargetCompany] = useState('');
  const [assignQty, setAssignQty] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  
  const [qrStats, setQrStats] = useState({ globalUnassigned: 0, totalGenerated: 0 });
  const [stockRequests, setStockRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  const [activeTab, setActiveTab] = useState('requests');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchAssignments, setBatchAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});
  
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const res = await fetch(`${API_BASE_URL}/admin/blank-qr-batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setLoadingBatches(false);
    }
  }, [token]);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await getAllCompanies(token);
      setCompanies(Array.isArray(data) ? data : data.companies || []);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blank-qrs-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQrStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, [token]);

  const fetchStockRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch(`${API_BASE_URL}/stock-requests`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setStockRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch stock requests", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  const handleToggleBatch = async (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    if (!batchAssignments[batchId]) {
      setLoadingAssignments(prev => ({ ...prev, [batchId]: true }));
      try {
        const res = await fetch(`${API_BASE_URL}/admin/blank-qr-batches/${batchId}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBatchAssignments(prev => ({ ...prev, [batchId]: data }));
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoadingAssignments(prev => ({ ...prev, [batchId]: false }));
      }
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchCompanies();
    fetchStats();
    fetchStockRequests();
  }, [fetchBatches, fetchCompanies, fetchStats, fetchStockRequests]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const qtyNum = parseInt(quantity);
    if (!qtyNum || qtyNum <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }
    if (qtyNum % 250 !== 0) {
      setError('Quantity must be a multiple of 250.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/generate-blank-qrs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: qtyNum, format: 'none' }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Successfully generated ${data.count} blank QRs!`);
        setQuantity('');
        fetchBatches(); // refresh the table
        fetchStats(); // refresh stats
        setShowGenerateModal(false); // Close modal
        setActiveTab('history'); // Navigate to history tab
      } else {
        setError(data.error || 'Failed to generate QRs.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssignSuccess('');

    if (!assignTargetCompany) {
      setAssignError('Please select a company.');
      return;
    }

    const qtyNum = parseInt(assignQty);
    if (!qtyNum || qtyNum <= 0) {
      setAssignError('Please enter a valid quantity.');
      return;
    }

    setAssigning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/assign-blank-qrs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ companyId: assignTargetCompany, quantity: qtyNum })
      });
      const data = await res.json();
      if (res.ok) {
        setAssignSuccess(data.message);
        setAssignQty('');
        setAssignTargetCompany('');
        fetchCompanies(); // Refresh company qrCredits
        fetchStats(); // Refresh unassigned stats
        fetchStockRequests(); // Refresh requests table if open
      } else {
        setAssignError(data.message || 'Failed to assign QRs');
      }
    } catch (err) {
      setAssignError('Error assigning QRs');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateAmount = async (requestId, currentAmount) => {
    const newAmountStr = window.prompt("Enter new amount (in ₹):", currentAmount);
    if (newAmountStr === null) return;
    
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/stock-requests/${requestId}/update-amount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: newAmount })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStockRequests();
      } else {
        alert(data.error || "Failed to update amount.");
      }
    } catch (err) {
      alert("An error occurred while updating the amount.");
    }
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

  const handleUpdateStatus = async (requestId, newStatus, bypassPaymentCheck = false, skipConfirm = false) => {
    if (!skipConfirm) {
      let description = `Are you sure you want to mark this request as '${newStatus}'?`;

      if (newStatus === 'Preparing for Dispatch') {
        try {
          const previewRes = await fetch(`${API_BASE_URL}/stock-requests/${requestId}/preview-allocation`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (previewRes.ok) {
            const previewData = await previewRes.json();
            description = (
              <div className="flex flex-col gap-3">
                <p className="text-slate-700 font-medium">Are you sure you want to mark this request as <strong>Preparing for Dispatch</strong>?</p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm">
                  <p className="text-indigo-800 font-semibold mb-1">QRs to be allocated and deducted from Global Inventory:</p>
                  <p className="font-mono font-bold text-indigo-900 bg-white px-2 py-1 rounded inline-block shadow-sm">
                    {formatSN(previewData.startSerialNumber)} ➔ {formatSN(previewData.endSerialNumber)}
                  </p>
                </div>
              </div>
            );
          } else {
            const errorData = await previewRes.json();
            await confirm({ title: 'Allocation Error', description: errorData.error || "Failed to preview allocation. Not enough global QRs available?", cancelText: null });
            return;
          }
        } catch (err) {
          console.error("Preview allocation error:", err);
          await confirm({ title: 'Error', description: "An error occurred while fetching allocation preview.", cancelText: null });
          return;
        }
      }

      const ok = await confirm({
        title: 'Update Status',
        description: description,
        confirmText: 'Yes, update status',
        cancelText: 'Cancel'
      });
      if (!ok) return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/stock-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, bypassPaymentCheck })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStockRequests();
        await fetchStats();
      } else {
        await confirm({ title: 'Error', description: data.error || "Failed to update request status.", cancelText: null });
      }
    } catch (err) {
      await confirm({ title: 'Error', description: "An error occurred while updating the request.", cancelText: null });
    }
  };

  const handleRejectRequest = (requestId) => {
    setRejectModal({ show: true, requestId, reason: '' });
  };

  const submitRejectRequest = async () => {
    const { requestId, reason } = rejectModal;
    try {
      const res = await fetch(`${API_BASE_URL}/stock-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: reason })
      });
      const data = await res.json();
      if (res.ok) {
        setRejectModal({ show: false, requestId: null, reason: '' });
        fetchStockRequests();
      } else {
        await confirm({ title: 'Error', description: data.error || "Failed to reject request.", cancelText: null });
      }
    } catch (err) {
      await confirm({ title: 'Error', description: "An error occurred while rejecting the request.", cancelText: null });
    }
  };

  const downloadFile = (base64, filename) => {
    const link = document.createElement('a');
    let mimeType = 'application/pdf';
    if (filename.endsWith('.zip')) {
      mimeType = 'application/zip';
    }
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };



  return (
    <div className="max-w-6xl mx-auto pb-12 p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Box className="text-indigo-600" size={32} />
            Generate Blank QRs (A3)
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage global physical QR inventory and company stock requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 text-sm font-bold text-emerald-700 flex items-center shadow-sm">
            {qrStats.globalUnassigned.toLocaleString()} Global QRs Available
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Generate QRs
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Box size={18} />
            Assign QRs
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-6 border-b border-slate-200 mb-6 px-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 font-bold text-base transition-colors relative ${
            activeTab === 'requests' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            Pending Stock Requests
            {stockRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {stockRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </div>
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-bold text-base transition-colors relative ${
            activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <History size={18} />
            Generation History
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content: Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-left text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="p-4 md:px-8">Company</th>
                  <th className="p-4 md:px-8">Quantity Requested</th>
                  <th className="p-4 md:px-8">Requested By</th>
                  <th className="p-4 md:px-8">Payment</th>
                  <th className="p-4 md:px-8">Status</th>
                  <th className="p-4 md:px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stockRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle size={40} className="text-slate-300" />
                        <p className="text-lg font-medium">No stock requests found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockRequests.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 md:px-8 font-bold text-slate-800">{req.companyId?.companyName || 'Unknown'}</td>
                      <td className="p-4 md:px-8">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="font-black text-indigo-600 text-base">
                            {req.quantity.toLocaleString()}
                          </span>
                          {req.startSerialNumber && req.endSerialNumber && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 mt-1">
                              SN: {formatSN(req.startSerialNumber)} - {formatSN(req.endSerialNumber)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 md:px-8 font-medium text-slate-600">
                        {req.requestedBy?.name || req.requestedBy?.email}
                        {req.notes && <div className="text-xs text-slate-400 mt-1 italic max-w-xs truncate" title={req.notes}>"{req.notes}"</div>}
                      </td>
                      <td className="p-4 md:px-8">
                        {req.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">PAID (₹{req.amount})</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                              {req.amount === null || req.amount === undefined ? 'Pending' : req.amount === 0 ? 'Free' : `₹${req.amount}`}
                            </span>
                            <button
                              onClick={() => handleUpdateAmount(req._id, req.amount)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 md:px-8">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          req.status === 'Pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          req.status === 'Approved' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          req.status === 'Preparing for Dispatch' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          req.status === 'Dispatched' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          req.status === 'Received' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 md:px-8">
                        <div className="flex flex-col gap-2 items-start">
                          {req.status === 'Pending' && (
                            <div className="flex items-center gap-2">
                              {req.paymentStatus !== 'paid' && req.amount > 0 ? (
                                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                  Payment Pending
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(req._id, 'Approved')}
                                  className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleRejectRequest(req._id)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 font-bold text-xs rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {req.status === 'Approved' && (
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'Preparing for Dispatch')}
                              className="px-3 py-1.5 font-bold text-xs rounded-lg transition-colors shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Prepare Dispatch
                            </button>
                          )}
                          {req.status === 'Preparing for Dispatch' && (
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'Dispatched')}
                              className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                            >
                              Mark Dispatched
                            </button>
                          )}
                          {req.status === 'Dispatched' && (
                            <span className="text-xs text-slate-400 font-medium italic">
                              Waiting for company to receive...
                            </span>
                          )}
                          {req.status !== 'Pending' && (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              Processed by {req.fulfilledBy?.name?.split(' ')[0] || req.fulfilledBy?.email?.split('@')[0]}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap">Date & Time</th>
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap">Batch ID</th>
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap">Quantity</th>
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap">Serial Number Range</th>
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap">Generated By</th>
                  <th className="p-4 border-b border-slate-200 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingBatches ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        Loading history...
                      </div>
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <List size={40} className="text-slate-300" />
                        <p className="text-lg">No blank QR batches generated yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const isExpanded = expandedBatch === batch._id;
                    const assignments = batchAssignments[batch._id] || [];
                    const isLoading = loadingAssignments[batch._id];
                    return (
                    <React.Fragment key={batch._id}>
                    <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleToggleBatch(batch._id)}>
                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {formatDate(batch.createdAt)}
                      </td>
                      <td className="p-4 font-medium text-slate-900 whitespace-nowrap">
                        {batch.batchName}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm">
                          {batch.quantity.toLocaleString()} QRs
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg text-sm border border-slate-200">
                          <span className="font-semibold text-slate-900">{formatSN(batch.startSerialNumber)}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-semibold text-slate-900">{formatSN(batch.endSerialNumber)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {batch.createdBy?.name || batch.createdBy?.email || 'Unknown'}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/superadmin-qrs/batch/${batch._id}`); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors mr-2"
                        >
                          <ExternalLink size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="p-0 border-b border-slate-100">
                          <div className="p-6 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Company Assignments</h4>
                            {isLoading ? (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                Loading assignments...
                              </div>
                            ) : assignments.length === 0 ? (
                              <div className="text-sm text-slate-500 italic">No QRs from this batch have been assigned to any company yet.</div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignments.map((seg, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                    <div className="font-bold text-slate-800 text-sm">{seg.company?.companyName || 'Unknown Company'}</div>
                                    <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 w-fit">
                                      <span className="font-semibold">{formatSN(seg.startSerialNumber)}</span>
                                      <span className="text-slate-400">➔</span>
                                      <span className="font-semibold">{formatSN(seg.endSerialNumber)}</span>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                                      {seg.count.toLocaleString()} QRs Assigned
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Printer className="text-indigo-600" size={20} />
                Generate Blank QRs
              </h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-red-700 font-medium text-sm">{error}</div>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-emerald-700 font-medium text-sm">{success}</div>
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Number of QR Codes to Generate
                  </label>
                  <input
                    type="number"
                    min="250"
                    step="250"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                  />
                </div>



                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all ${
                    submitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Printer size={18} />
                      Generate QRs
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Box className="text-emerald-600" size={20} />
                Assign QRs to Company
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6">
              {assignError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-red-700 font-medium text-sm">{assignError}</div>
                </div>
              )}
              {assignSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-emerald-700 font-medium text-sm">{assignSuccess}</div>
                </div>
              )}

              <form onSubmit={handleAssign} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Company
                  </label>
                  <select
                    value={assignTargetCompany}
                    onChange={(e) => setAssignTargetCompany(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    required
                  >
                    <option value="">Select a company...</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName} ({c.qrCredits || 0} physical available)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Quantity to Assign
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={assignQty}
                    onChange={(e) => setAssignQty(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Assigns unassigned physical Blank QRs from global inventory to this company.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-base shadow-lg shadow-emerald-500/30 transition-all ${
                    assigning
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {assigning ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assigning...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <List size={18} />
                      Confirm Assign
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                Reject Request
              </h3>
              <button 
                onClick={() => setRejectModal({ show: false, requestId: null, reason: '' })}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="E.g., Payment failed, insufficient stock..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none h-32"
              />
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setRejectModal({ show: false, requestId: null, reason: '' })}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejectRequest}
                className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
