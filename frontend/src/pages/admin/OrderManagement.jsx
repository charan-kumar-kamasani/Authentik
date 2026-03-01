import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, createOrder, updateOrderStatus, downloadOrderPdf, checkOrderCredits, getPlans, calculatePrice, validateCoupon, initiatePayment } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import TablePagination from '../../components/TablePagination';
import {
  Package, Search, Filter, X, Plus, Truck, CheckCircle2, Clock, Settings, ShieldCheck,
  FileDown, PackageCheck, AlertTriangle, ArrowRight, Hash, Calendar, ChevronRight, XCircle, Send,
  CreditCard, Zap, Coins, ShoppingCart, Loader2, Percent, IndianRupee, Gift, Receipt, AlertCircle, Tag
} from 'lucide-react';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: '', description: '' });
  const [newQr, setNewQr] = useState({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1, description: '' });
  const [role, setRole] = useState('');
  const { setLoading: setGlobalLoading } = useLoading();
  const [dispatchData, setDispatchData] = useState({ trackingNumber: '', courierName: '', notes: '' });
  const [showDispatchModal, setShowDispatchModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Credit modal state
  const [creditModal, setCreditModal] = useState(null); // { orderId, required, available, shortfall, topupCostPerQr, topupTotalCost }
  const [creditView, setCreditView] = useState('choice'); // 'choice' | 'plans' | 'checkout' | 'processing'
  const [plans, setPlans] = useState([]);
  const [creditProcessing, setCreditProcessing] = useState(false);
  const [selectedCreditPlan, setSelectedCreditPlan] = useState(null);
  const [creditCouponCode, setCreditCouponCode] = useState('');
  const [creditCouponApplied, setCreditCouponApplied] = useState(null);
  const [creditCouponError, setCreditCouponError] = useState('');
  const [creditPriceBreakdown, setCreditPriceBreakdown] = useState(null);
  const [creditLoadingPrice, setCreditLoadingPrice] = useState(false);

  useEffect(() => {
    fetchOrders();
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole) { setRole(adminRole); return; }
    const userStr = localStorage.getItem('userInfo');
    if (userStr) { try { setRole(JSON.parse(userStr).role); } catch { setRole(localStorage.getItem('role') || ''); } }
    else { setRole(localStorage.getItem('role') || ''); }
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      setOrders(await getOrders(token));
    } catch (e) { alert('Failed to load orders: ' + e.message); }
    finally { setLoading(false); }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await createOrder(newOrder, token);
      setShowCreateModal(false);
      setNewOrder({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: '', description: '' });
      fetchOrders();
    } catch (e) { alert('Failed to create order: ' + e.message); }
  };

  const handleCreatorOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await createOrder({ ...newQr, quantity: Number(newQr.quantity) || 1 }, token);
      alert('Order created! Admin will process it to generate QR codes.');
      setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1, description: '' });
      fetchOrders();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleAction = async (orderId, action, data = {}) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await updateOrderStatus(orderId, action, data, token);
      fetchOrders();
      if (action === 'dispatch') setShowDispatchModal(null);
    } catch (e) {
      // Intercept credit errors for authorize action
      if (action === 'authorize' && e.creditData) {
        setCreditModal({ orderId, ...e.creditData });
        setCreditView('choice');
        return;
      }
      alert('Failed: ' + e.message);
    }
  };

  const handleBuyPlan = async (plan) => {
    setSelectedCreditPlan(plan);
    setCreditView('checkout');
    setCreditCouponCode('');
    setCreditCouponApplied(null);
    setCreditCouponError('');
    await fetchCreditPriceBreakdown(plan.price || 0, '');
  };

  const handleBuyTopup = async () => {
    setSelectedCreditPlan(null);
    setCreditView('checkout');
    setCreditCouponCode('');
    setCreditCouponApplied(null);
    setCreditCouponError('');
    const baseAmt = (creditModal?.shortfall || 0) * 5;
    await fetchCreditPriceBreakdown(baseAmt, '');
  };

  const fetchCreditPriceBreakdown = async (baseAmount, coupon) => {
    setCreditLoadingPrice(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const breakdown = await calculatePrice(baseAmount, coupon || undefined, token);
      setCreditPriceBreakdown(breakdown);
    } catch (e) { console.error('Price calc error:', e); }
    finally { setCreditLoadingPrice(false); }
  };

  const handleApplyCreditCoupon = async () => {
    if (!creditCouponCode.trim()) return;
    setCreditCouponError('');
    const baseAmt = selectedCreditPlan ? selectedCreditPlan.price : (creditModal?.shortfall || 0) * 5;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const result = await validateCoupon(creditCouponCode, baseAmt, token);
      setCreditCouponApplied(result);
      await fetchCreditPriceBreakdown(baseAmt, creditCouponCode);
    } catch (e) {
      setCreditCouponError(e.message);
      setCreditCouponApplied(null);
    }
  };

  const handleRemoveCreditCoupon = async () => {
    setCreditCouponCode('');
    setCreditCouponApplied(null);
    setCreditCouponError('');
    const baseAmt = selectedCreditPlan ? selectedCreditPlan.price : (creditModal?.shortfall || 0) * 5;
    await fetchCreditPriceBreakdown(baseAmt, '');
  };

  const handleCreditProceedPayment = async () => {
    setCreditProcessing(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const payload = {
        type: selectedCreditPlan ? 'plan' : 'topup',
        ...(selectedCreditPlan ? { planId: selectedCreditPlan._id } : { quantity: creditModal?.shortfall || 0 }),
        ...(creditCouponApplied ? { couponCode: creditCouponApplied.code } : {}),
      };
      const result = await initiatePayment(payload, token);

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      // Auto-completed — re-try authorize
      setCreditView('processing');
      await updateOrderStatus(creditModal.orderId, 'authorize', {}, token);
      setCreditModal(null);
      resetCreditCheckout();
      fetchOrders();
      alert('Credits purchased & order authorized successfully!');
    } catch (e) {
      if (e.creditData) {
        setCreditModal({ orderId: creditModal.orderId, ...e.creditData });
        setCreditView('choice');
        alert('Payment completed but still insufficient credits. Please buy more.');
      } else {
        alert('Error: ' + e.message);
      }
    } finally { setCreditProcessing(false); }
  };

  const resetCreditCheckout = () => {
    setCreditView('choice');
    setSelectedCreditPlan(null);
    setCreditCouponCode('');
    setCreditCouponApplied(null);
    setCreditCouponError('');
    setCreditPriceBreakdown(null);
  };

  const openPlansView = async () => {
    setCreditView('plans');
    try {
      const fetched = await getPlans();
      setPlans(Array.isArray(fetched) ? fetched : fetched.plans || []);
    } catch { setPlans([]); }
  };

  const handleDownload = async (orderId) => {
    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const data = await downloadOrderPdf(orderId, token);
      if (data.pdfBase64) {
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,' + data.pdfBase64;
        link.download = 'order_' + orderId + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else { alert('No PDF data found'); }
    } catch (e) { alert(e.message); }
    finally { setGlobalLoading(false); }
  };

  const statuses = ['All', 'Pending Authorization', 'Authorized', 'Order Processing', 'Dispatching', 'Dispatched', 'Received', 'Rejected'];

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    if (q && !o.productName?.toLowerCase().includes(q) && !o.brand?.toLowerCase().includes(q) && !o.orderId?.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    return true;
  });

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);
  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const statusConfig = {
    'Pending Authorization': { icon: Clock, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    'Authorized': { icon: ShieldCheck, color: 'violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
    'Order Processing': { icon: Settings, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Dispatching': { icon: Package, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Dispatched': { icon: Truck, color: 'sky', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    'Received': { icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Rejected': { icon: XCircle, color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { icon: Package, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
    const Icon = cfg.icon;
    return (
      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ' + cfg.bg + ' ' + cfg.text + ' ' + cfg.border}>
        <Icon size={12} strokeWidth={3} /> {status}
      </span>
    );
  };

  const counts = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  // Action button renderer
  const ActionBtn = ({ onClick, icon: Icon, label, color }) => (
    <button onClick={onClick}
      className={'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer select-none active:scale-95 bg-' + color + '-50 border-' + color + '-200 text-' + color + '-700 hover:bg-' + color + '-100 shadow-sm'}>
      <Icon size={14} strokeWidth={2.5} /> {label}
    </button>
  );

  const InputField = ({ label, required, ...props }) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input {...props} required={required}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all" />
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading orders...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Order Management</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Track and manage QR code orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="text-xl font-black text-blue-600">{orders.length}</div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xl font-black text-amber-600">{counts['Pending Authorization'] || 0}</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending</div>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="text-xl font-black text-emerald-600">{counts['Received'] || 0}</div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Received</div>
          </div>
          {(role === 'admin' || role === 'superadmin' || role === 'creator') && (
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all">
              <Plus size={16} strokeWidth={3} /> New Order
            </button>
          )}
        </div>
      </div>

      {/* Creator form */}
      {role === 'creator' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Create New Product Record</h3>
          </div>
          <form onSubmit={handleCreatorOrder} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Product Name" required value={newQr.productName} onChange={e => setNewQr({ ...newQr, productName: e.target.value })} />
            <InputField label="Brand" required value={newQr.brand} onChange={e => setNewQr({ ...newQr, brand: e.target.value })} />
            <InputField label="Batch Number" required value={newQr.batchNo} onChange={e => setNewQr({ ...newQr, batchNo: e.target.value })} />
            <InputField label="Quantity" type="number" min="1" value={newQr.quantity} onChange={e => setNewQr({ ...newQr, quantity: e.target.value })} />
            <InputField label="Manufacture Date" type="date" value={newQr.manufactureDate} onChange={e => setNewQr({ ...newQr, manufactureDate: e.target.value })} />
            <InputField label="Expiry Date" type="date" value={newQr.expiryDate} onChange={e => setNewQr({ ...newQr, expiryDate: e.target.value })} />
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl active:scale-[0.98] transition-all">
                Generate Product & QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search product, brand or order ID..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        {(searchTerm || statusFilter !== 'All') && (
          <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
            className="flex items-center gap-1 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.filter(s => s !== 'All').map(s => {
          const cfg = statusConfig[s] || {};
          const count = counts[s] || 0;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
              className={'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ' +
                (statusFilter === s ? cfg.bg + ' ' + cfg.text + ' ' + cfg.border + ' shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50')}>
              <div className={'w-1.5 h-1.5 rounded-full ' + (cfg.dot || 'bg-slate-400')} /> {s}
              <span className="text-[10px] font-black ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Product & Brand</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><Package size={28} /></div>
                    <p className="font-bold text-slate-400">No orders match your filters.</p>
                  </div>
                </td></tr>
              ) : paginatedOrders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <Hash size={10} className="inline mr-1 -mt-0.5" />{order.orderId || order._id?.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{order.productName || 'Unknown'}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />{order.brand || order.brandId?.brandName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-700">{order.quantity}</span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar size={12} /> {fmt(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {/* Authorize */}
                      {order.status === 'Pending Authorization' && (role === 'company' || role === 'authorizer') && (
                        <ActionBtn onClick={() => handleAction(order._id, 'authorize')} icon={ShieldCheck} label="Authorize" color="violet" />
                      )}
                      {/* Process */}
                      {order.status === 'Authorized' && (role === 'admin' || role === 'superadmin') && (
                        <ActionBtn onClick={() => handleAction(order._id, 'process')} icon={Settings} label="Process & Generate" color="blue" />
                      )}
                      {/* Prepare Dispatch */}
                      {order.status === 'Order Processing' && (role === 'admin' || role === 'superadmin') && (
                        <ActionBtn onClick={() => handleAction(order._id, 'dispatching')} icon={PackageCheck} label="Prepare Dispatch" color="orange" />
                      )}
                      {/* Dispatch */}
                      {order.status === 'Dispatching' && (role === 'admin' || role === 'superadmin') && (
                        <ActionBtn onClick={() => setShowDispatchModal(order._id)} icon={Truck} label="Dispatch" color="amber" />
                      )}
                      {/* Received */}
                      {order.status === 'Dispatched' && (role === 'company' || role === 'authorizer') && (
                        <ActionBtn onClick={() => { if (confirm('Mark as received? This will ACTIVATE all QR codes!')) handleAction(order._id, 'received'); }}
                          icon={CheckCircle2} label="Mark Received" color="emerald" />
                      )}
                      {/* PDF */}
                      {order.qrCodesGenerated && role === 'superadmin' && (
                        <ActionBtn onClick={() => handleDownload(order._id)} icon={FileDown} label="PDF" color="slate" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          totalItems={orders.length}
          filteredCount={filtered.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          itemLabel="orders"
        />
      </div>

      {/* ── Create Order Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white"><Plus size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-white">Create New Order</h3>
                  <p className="text-blue-100 text-xs font-medium">Fill in product details</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Product Name" required value={newOrder.productName} onChange={e => setNewOrder({ ...newOrder, productName: e.target.value })} />
                <InputField label="Brand" required value={newOrder.brand} onChange={e => setNewOrder({ ...newOrder, brand: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Batch Number" value={newOrder.batchNo} onChange={e => setNewOrder({ ...newOrder, batchNo: e.target.value })} placeholder="Auto-generated if empty" />
                <InputField label="Quantity" type="number" min="1" required value={newOrder.quantity} onChange={e => setNewOrder({ ...newOrder, quantity: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Manufacture Date" type="date" value={newOrder.manufactureDate} onChange={e => setNewOrder({ ...newOrder, manufactureDate: e.target.value })} />
                <InputField label="Expiry Date" type="date" value={newOrder.expiryDate} onChange={e => setNewOrder({ ...newOrder, expiryDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={newOrder.description} onChange={e => setNewOrder({ ...newOrder, description: e.target.value })} rows="2"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Send size={16} /> Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dispatch Modal ── */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDispatchModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white"><Truck size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-white">Dispatch Order</h3>
                  <p className="text-orange-100 text-xs font-medium">Enter shipping details</p>
                </div>
              </div>
              <button onClick={() => setShowDispatchModal(null)} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <InputField label="Courier Name" value={dispatchData.courierName} onChange={e => setDispatchData({ ...dispatchData, courierName: e.target.value })} placeholder="e.g., DHL, FedEx, BlueDart" />
              <InputField label="Tracking Number" value={dispatchData.trackingNumber} onChange={e => setDispatchData({ ...dispatchData, trackingNumber: e.target.value })} placeholder="Enter tracking number" />
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea value={dispatchData.notes} onChange={e => setDispatchData({ ...dispatchData, notes: e.target.value })} rows="3" placeholder="Additional dispatch info"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDispatchModal(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleAction(showDispatchModal, 'dispatch', dispatchData)}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Truck size={16} /> Dispatch Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Insufficient Credits Modal ── */}
      {creditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { if (!creditProcessing) { setCreditModal(null); resetCreditCheckout(); } }}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className={`p-5 flex items-center justify-between shrink-0 ${creditView === 'checkout' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white">
                  {creditView === 'checkout' ? <Receipt size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{creditView === 'checkout' ? 'Checkout' : 'Insufficient Credits'}</h3>
                  <p className={`text-xs font-medium ${creditView === 'checkout' ? 'text-violet-100' : 'text-red-100'}`}>
                    {creditView === 'checkout' ? 'Review & pay' : 'Purchase QR credits to authorize'}
                  </p>
                </div>
              </div>
              {!creditProcessing && (
                <button onClick={() => { setCreditModal(null); resetCreditCheckout(); }} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Credits summary */}
              {creditView !== 'checkout' && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-black text-blue-600">{creditModal.required?.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Required</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-600">{creditModal.available?.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Available</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-red-600">{creditModal.shortfall?.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Shortfall</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing spinner */}
              {creditProcessing && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <p className="text-sm font-bold text-slate-600">Processing payment & authorizing order...</p>
                </div>
              )}

              {/* Choice view */}
              {!creditProcessing && creditView === 'choice' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 font-medium mb-4">
                    You need <span className="font-black text-red-600">{creditModal.shortfall?.toLocaleString()}</span> more QR credits to authorize this order. Choose how to proceed:
                  </p>

                  {/* Option 1: Buy a Plan */}
                  <button onClick={openPlansView}
                    className="w-full flex items-center gap-4 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl hover:bg-violet-100 hover:border-violet-300 transition-all group text-left">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:bg-violet-200 transition-colors shrink-0">
                      <CreditCard size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-sm">Buy a Plan</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Choose from available pricing plans for bulk credits</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {/* Option 2: Pay per QR */}
                  <button onClick={handleBuyTopup}
                    className="w-full flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-all group text-left">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 transition-colors shrink-0">
                      <Zap size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-sm">Pay for Remaining QRs</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {creditModal.shortfall?.toLocaleString()} QRs × ₹{creditModal.topupCostPerQr || 5} = <span className="font-black text-emerald-700">₹{creditModal.topupTotalCost?.toLocaleString()}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>
                </div>
              )}

              {/* Plans view */}
              {!creditProcessing && creditView === 'plans' && (
                <div className="space-y-3">
                  <button onClick={() => setCreditView('choice')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back to options
                  </button>
                  {plans.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium text-sm">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" /> Loading plans...
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                      {plans.map(plan => {
                        const credits = parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10);
                        return (
                          <button key={plan._id} onClick={() => handleBuyPlan(plan)}
                            className="w-full flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group text-left">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 shrink-0">
                              <ShoppingCart size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-slate-800 text-sm truncate">{plan.name}</div>
                              <div className="text-xs text-slate-500 font-medium mt-0.5">
                                {credits.toLocaleString()} QR credits • ₹{plan.pricePerQr}/QR
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-blue-600 text-sm">₹{Number(plan.price).toLocaleString()}</div>
                              {plan.isPopular && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">POPULAR</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ Checkout with Price Breakdown ═══ */}
              {!creditProcessing && creditView === 'checkout' && (
                <div className="space-y-4">
                  <button onClick={() => { setCreditView(selectedCreditPlan ? 'plans' : 'choice'); setCreditPriceBreakdown(null); setCreditCouponApplied(null); setCreditCouponCode(''); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back
                  </button>

                  {/* Order Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt size={14} className="text-slate-500" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Order Summary</span>
                    </div>
                    {selectedCreditPlan ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{selectedCreditPlan.name}</div>
                          <div className="text-xs text-slate-500">{parseInt(String(selectedCreditPlan.qrCodes || '0').replace(/,/g, '')).toLocaleString()} credits</div>
                        </div>
                        <div className="font-black text-slate-800">₹{Number(selectedCreditPlan.price).toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">QR Top-up</div>
                          <div className="text-xs text-slate-500">{creditModal.shortfall?.toLocaleString()} credits × ₹5</div>
                        </div>
                        <div className="font-black text-slate-800">₹{((creditModal.shortfall || 0) * 5).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Have a Coupon?</label>
                    {creditCouponApplied ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-emerald-700">{creditCouponApplied.code}</span>
                          <span className="text-xs text-emerald-600 ml-2">(-₹{creditCouponApplied.discount?.toLocaleString()})</span>
                        </div>
                        <button onClick={handleRemoveCreditCoupon} className="text-emerald-500 hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={creditCouponCode} onChange={e => { setCreditCouponCode(e.target.value.toUpperCase()); setCreditCouponError(''); }}
                          placeholder="Enter coupon code" onKeyDown={e => e.key === 'Enter' && handleApplyCreditCoupon()}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300" />
                        <button onClick={handleApplyCreditCoupon} disabled={!creditCouponCode.trim()}
                          className="px-4 py-2.5 bg-violet-100 border border-violet-200 text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-200 transition-colors disabled:opacity-40">
                          Apply
                        </button>
                      </div>
                    )}
                    {creditCouponError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                        <AlertCircle size={12} /> {creditCouponError}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  {creditLoadingPrice ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-violet-500" />
                    </div>
                  ) : creditPriceBreakdown && (
                    <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Price Breakdown</span>
                      </div>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">Base Amount</span>
                          <span className="font-bold text-slate-800">₹{creditPriceBreakdown.baseAmount?.toLocaleString()}</span>
                        </div>
                        {creditPriceBreakdown.gstAmount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600 flex items-center gap-1">
                              <Percent size={12} className="text-slate-400" /> GST ({creditPriceBreakdown.gstPercentage}%)
                            </span>
                            <span className="font-bold text-slate-700">+ ₹{creditPriceBreakdown.gstAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        {(creditPriceBreakdown.additionalCharges || []).map((ch, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600 flex items-center gap-1">
                              <IndianRupee size={12} className="text-slate-400" />
                              {ch.name} {ch.type === 'percentage' ? `(${ch.value}%)` : ''}
                            </span>
                            <span className="font-bold text-slate-700">+ ₹{ch.amount?.toLocaleString()}</span>
                          </div>
                        ))}
                        {creditPriceBreakdown.couponDiscount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-emerald-600 flex items-center gap-1">
                              <Gift size={12} /> Coupon Discount
                            </span>
                            <span className="font-bold text-emerald-600">- ₹{creditPriceBreakdown.couponDiscount?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t-2 border-dashed border-slate-200 pt-2.5 mt-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-slate-800">Total Amount</span>
                            <span className="text-xl font-black text-violet-700">₹{creditPriceBreakdown.finalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button onClick={handleCreditProceedPayment} disabled={!creditPriceBreakdown}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base">
                    <CreditCard size={18} />
                    {creditPriceBreakdown?.finalAmount > 0
                      ? `Pay ₹${creditPriceBreakdown.finalAmount?.toLocaleString()}`
                      : 'Complete Purchase'}
                  </button>
                </div>
              )}

              {/* Cancel */}
              {!creditProcessing && creditView !== 'checkout' && (
                <button onClick={() => { setCreditModal(null); resetCreditCheckout(); }}
                  className="w-full mt-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
