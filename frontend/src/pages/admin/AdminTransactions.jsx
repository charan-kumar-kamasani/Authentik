import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, ArrowUpRight, ArrowDownRight, Search, TrendingUp, TrendingDown, 
  Calendar, Hash, Filter, X, Coins, CreditCard, Package, Gift, UserPlus, 
  ShoppingBag, Loader2, ChevronDown, ChevronRight, Building2, Mail, Phone, MapPin,
  Download, FileText, CheckCircle2, Clock, XCircle, Eye
} from 'lucide-react';
import { getCreditTransactions, downloadInvoice } from '../../config/api';
import TablePagination from '../../components/TablePagination';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [expandedRow, setExpandedRow] = useState(null);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getCreditTransactions(token, 1, 500);
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const s = searchTerm.toLowerCase();
      if (s && 
          !t.note?.toLowerCase().includes(s) && 
          !t.type?.toLowerCase().includes(s) &&
          !t.orderId?.orderId?.toLowerCase().includes(s) &&
          !t.performedBy?.name?.toLowerCase().includes(s) &&
          !t.payment?.merchantOrderId?.toLowerCase().includes(s) &&
          !t.companyId?.companyName?.toLowerCase().includes(s)
      ) return false;
      
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;
      if (dateFrom && new Date(t.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [transactions, searchTerm, typeFilter, dateFrom, dateTo]);

  // Paginated data
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => { setCurrentPage(1); }, [searchTerm, typeFilter, dateFrom, dateTo]);

  // Stats
  const stats = useMemo(() => {
    const credits_in = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const credits_out = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const total_paid = filteredTransactions.filter(t => t.totalPaid).reduce((s, t) => s + (t.totalPaid || 0), 0);
    return { credits_in, credits_out, total_paid, net: credits_in - credits_out };
  }, [filteredTransactions]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const TransactionTypeBadge = ({ type, recordType, payment }) => {
    // If it's a payment_only record (pending/failed payment), show special badge
    if (recordType === 'payment_only' && payment) {
      if (payment.status === 'pending') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200/50">
            <Clock size={12} strokeWidth={2.5} />
            Payment Pending
          </span>
        );
      }
      if (payment.status === 'failed') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-200/50">
            <XCircle size={12} strokeWidth={2.5} />
            Payment Failed
          </span>
        );
      }
    }

    if (type === 'purchase_plan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-200/50">
          <Package size={12} strokeWidth={2.5} />
          Plan Purchase
        </span>
      );
    }
    if (type === 'purchase_topup') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-200/50">
          <Coins size={12} strokeWidth={2.5} />
          Top-up
        </span>
      );
    }
    if (type === 'spend') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-200/50">
          <ShoppingBag size={12} strokeWidth={2.5} />
          Spend
        </span>
      );
    }
    if (type === 'admin_grant') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-200/50">
          <Gift size={12} strokeWidth={2.5} />
          Admin Grant
        </span>
      );
    }
    if (type === 'refund') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200/50">
          <ArrowDownRight size={12} strokeWidth={2.5} />
          Refund
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/50">
        <Receipt size={12} strokeWidth={2.5} />
        {type}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = searchTerm || typeFilter !== 'All' || dateFrom || dateTo;

  const toggleRow = (txnId) => {
    setExpandedRow(expandedRow === txnId ? null : txnId);
  };

  const handleDownloadInvoice = async (transactionId, e) => {
    e.stopPropagation();
    try {
      await downloadInvoice(token, transactionId);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const PaymentStatusBadge = ({ payment }) => {
    if (!payment) return <span className="text-xs text-slate-400 font-medium">No Payment</span>;

    const statusStyles = {
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      failed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
    };

    const style = statusStyles[payment.status] || statusStyles.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${style.bg} ${style.text} rounded-lg text-xs font-bold border ${style.border}`}>
        <Icon size={12} strokeWidth={2.5} />
        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading transactions...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full pb-12">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Credit Transactions</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Monitor all QR credit purchases, spends & grants</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="text-xl font-black text-indigo-600">{transactions.length}</div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight size={16} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credits In</span>
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.credits_in.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">QR codes purchased</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight size={16} className="text-rose-600" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credits Out</span>
            </div>
            <div className="text-2xl font-black text-rose-600">{stats.credits_out.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">QR codes consumed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-600" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Balance</span>
            </div>
            <div className={`text-2xl font-black ${stats.net >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {stats.net.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Available credits</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-purple-600" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
            </div>
            <div className="text-2xl font-black text-purple-600">₹{stats.total_paid.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Total collected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search: note, company, order ID, ref..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="min-w-[180px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option>All</option>
              <option value="purchase_plan">Plan Purchase</option>
              <option value="purchase_topup">Top-up</option>
              <option value="spend">Spend</option>
              <option value="admin_grant">Admin Grant</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          {/* Date From */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Clear Button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider w-10"></th>
                <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3.5 text-right text-xs font-black text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3.5 text-right text-xs font-black text-slate-600 uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Payment Status</th>
                <th className="px-4 py-3.5 text-center text-xs font-black text-slate-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <Receipt size={28} className="text-slate-300" strokeWidth={2} />
                      </div>
                      <p className="font-bold text-slate-400">No transactions found.</p>
                      {hasFilters && (
                        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-700 font-bold">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <React.Fragment key={t._id}>
                    <tr 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => toggleRow(t._id)}
                    >
                      <td className="px-4 py-3.5">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          {expandedRow === t._id ? (
                            <ChevronDown size={18} strokeWidth={2.5} />
                          ) : (
                            <ChevronRight size={18} strokeWidth={2.5} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-slate-700">
                          {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <TransactionTypeBadge type={t.type} recordType={t.recordType} payment={t.payment} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {t.recordType === 'payment_only' ? (
                          <span className="text-sm font-medium text-slate-400 italic">
                            {t.payment?.status === 'pending' ? 'Awaiting' : 'No Credits'}
                          </span>
                        ) : (
                          <span className={`text-sm font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.amount > 0 ? '+' : ''}{t.amount?.toLocaleString() || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {t.totalPaid ? (
                          <span className="text-sm font-bold text-purple-600">₹{t.totalPaid.toLocaleString()}</span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <PaymentStatusBadge payment={t.payment} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {(t.type === 'purchase_plan' || t.type === 'purchase_topup') && t.recordType !== 'payment_only' && t.payment?.status === 'completed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(t._id, e); }}
                              className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors active:scale-95"
                              title="Download Invoice"
                            >
                              <Download size={16} strokeWidth={2.5} />
                            </button>
                          )}
                          {t.recordType === 'payment_only' && t.payment?.status === 'pending' && (
                            <span className="text-xs text-amber-600 font-medium">Pending</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  
                  {/* Expanded Row - Company & Payment Details */}
                  {expandedRow === t._id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-5">
                          
                          {/* Company Details Section */}
                          {t.companyId && (
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
                                  <Building2 size={20} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Company Information</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pl-13">
                                {/* Company Name */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Building2 size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-800">{t.companyId.companyName || 'N/A'}</p>
                                </div>

                                {/* Email */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Mail size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-700">{t.companyId.email || 'N/A'}</p>
                                </div>

                                {/* Phone */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Phone size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-700">{t.companyId.phoneNumber || t.companyId.supportNumber || 'N/A'}</p>
                                </div>

                                {/* Location */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {[t.companyId.city, t.companyId.country].filter(Boolean).join(', ') || 'N/A'}
                                  </p>
                                </div>

                                {/* Current Credits */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Coins size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Credits</span>
                                  </div>
                                  <p className="text-sm font-bold text-emerald-600">{(t.companyId.qrCredits || 0).toLocaleString()}</p>
                                </div>

                                {/* Transaction Balance After */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Hash size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance at Transaction</span>
                                  </div>
                                  <p className="text-sm font-bold text-blue-600">{(t.balanceAfter || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Payment Details Section */}
                          {t.payment && (
                            <>
                              <div className="border-t border-slate-200 pt-5">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
                                    <CreditCard size={20} strokeWidth={2.5} />
                                  </div>
                                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Payment Information</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pl-13">
                                  {/* Payment Status */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <CheckCircle2 size={13} className="text-slate-400" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                                    </div>
                                    <PaymentStatusBadge payment={t.payment} />
                                  </div>

                                  {/* Base Amount */}
                                  {t.payment.baseAmount && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Coins size={13} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Amount</span>
                                      </div>
                                      <p className="text-sm font-bold text-slate-800">₹{t.payment.baseAmount.toLocaleString()}</p>
                                    </div>
                                  )}

                                  {/* GST */}
                                  {t.payment.gstAmount > 0 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Receipt size={13} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GST</span>
                                      </div>
                                      <p className="text-sm font-semibold text-slate-700">₹{t.payment.gstAmount.toLocaleString()}</p>
                                    </div>
                                  )}

                                  {/* Final Amount */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <CreditCard size={13} className="text-slate-400" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Final Amount</span>
                                    </div>
                                    <p className="text-sm font-bold text-purple-600">₹{t.payment.finalAmount.toLocaleString()}</p>
                                  </div>

                                  {/* Coupon */}
                                  {t.payment.couponCode && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Gift size={13} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coupon</span>
                                      </div>
                                      <p className="text-sm font-bold text-emerald-600">{t.payment.couponCode}</p>
                                      <p className="text-xs text-emerald-600">-₹{t.payment.couponDiscount.toLocaleString()} discount</p>
                                    </div>
                                  )}

                                  {/* PhonePe Transaction ID */}
                                  {t.payment.phonePeTransactionId && (
                                    <div className="col-span-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Hash size={13} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Txn ID</span>
                                      </div>
                                      <p className="text-xs font-mono font-semibold text-slate-700 break-all">{t.payment.phonePeTransactionId}</p>
                                    </div>
                                  )}

                                  {/* Merchant Order ID */}
                                  {t.payment.merchantOrderId && (
                                    <div className="col-span-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Hash size={13} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Merchant Order ID</span>
                                      </div>
                                      <p className="text-xs font-mono font-semibold text-slate-700 break-all">{t.payment.merchantOrderId}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Transaction Details */}
                          <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
                                <FileText size={20} strokeWidth={2.5} />
                              </div>
                              <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Transaction Details</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-13">
                              {/* Transaction ID */}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Hash size={13} className="text-slate-400" />
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</span>
                                </div>
                                <p className="text-xs font-mono font-semibold text-slate-700 break-all">{t._id}</p>
                              </div>

                              {/* Unit Price */}
                              {t.unitPrice && (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Coins size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price per QR</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-800">₹{t.unitPrice}</p>
                                </div>
                              )}

                              {/* Note */}
                              {t.note && (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-700">{t.note}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {(t.type === 'purchase_plan' || t.type === 'purchase_topup') && (
                            <div className="border-t border-slate-200 pt-5">
                              {t.recordType === 'payment_only' && t.payment?.status === 'pending' && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                  <Clock size={20} className="text-amber-600" />
                                  <div>
                                    <p className="text-sm font-bold text-amber-800">Payment Pending</p>
                                    <p className="text-xs text-amber-700 mt-1">
                                      This payment is awaiting completion. Credits will be added once payment is confirmed.
                                    </p>
                                  </div>
                                </div>
                              )}
                              {t.recordType === 'payment_only' && t.payment?.status === 'failed' && (
                                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                                  <XCircle size={20} className="text-rose-600" />
                                  <div>
                                    <p className="text-sm font-bold text-rose-800">Payment Failed</p>
                                    <p className="text-xs text-rose-700 mt-1">
                                      This payment could not be completed. No credits were added. Please try again.
                                    </p>
                                  </div>
                                </div>
                              )}
                              {t.recordType !== 'payment_only' && t.payment?.status === 'completed' && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => handleDownloadInvoice(t._id, e)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                  >
                                    <Download size={16} strokeWidth={2.5} />
                                    Download Invoice
                                  </button>

                                  <p className="text-xs text-slate-400 font-medium">
                                    Invoice for this transaction
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredTransactions.length}
          filteredCount={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          itemLabel="transactions"
        />
      )}
    </div>
  );
}
