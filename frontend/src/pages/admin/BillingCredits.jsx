import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCreditsBalance, getCreditTransactions, getPlans, calculatePrice, validateCoupon, initiatePayment, checkPaymentStatus, checkIsTestAccount } from '../../config/api';
import TablePagination from '../../components/TablePagination';
import {
  CreditCard, Coins, Zap, ShoppingCart, ChevronRight, ArrowUpRight, ArrowDownRight,
  TrendingUp, Package, Calendar, Hash, Loader2, Plus, RefreshCw, Tag, Gift, X,
  Percent, IndianRupee, CheckCircle2, AlertCircle, Receipt, FileText, Eye, Beaker
} from 'lucide-react';

const BillingCredits = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyView, setBuyView] = useState('choice'); // 'choice' | 'comparison' | 'plans' | 'topup' | 'checkout'
  const [topupQty, setTopupQty] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isTestAccount, setIsTestAccount] = useState(false);
  const [testAmount, setTestAmount] = useState(null);

  // Checkout state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount, ... }
  const [couponError, setCouponError] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bal, txns, testAccountStatus] = await Promise.all([
        getCreditsBalance(token),
        getCreditTransactions(token),
        checkIsTestAccount().catch(() => ({ isTestAccount: false, testAmount: null }))
      ]);
      setBalance(bal);
      setTransactions(Array.isArray(txns) ? txns : txns.transactions || []);
      setIsTestAccount(testAccountStatus.isTestAccount || false);
      setTestAmount(testAccountStatus.testAmount || null);
    } catch (e) {
      console.error('Failed to load billing data:', e);
    } finally { setLoading(false); }
  };

  const handleBuyPlan = async (plan) => {
    setSelectedPlan(plan);
    setBuyView('checkout');
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
    // Check if it's an on-demand/starter plan
    const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
    if (isOnDemand) {
      // Redirect to topup for custom quantity
      setBuyView('topup');
      return;
    }
    // Calculate total price as pricePerQr * number of QR codes
    const credits = parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10) || 0;
    const baseAmount = credits * (plan.pricePerQr || 0);
    await fetchPriceBreakdown(baseAmount, '');
  };

  const handleBuyTopup = async () => {
    const qty = parseInt(topupQty, 10);
    if (!qty || qty < 1) { alert('Enter a valid quantity'); return; }
    setSelectedPlan(null);
    setBuyView('checkout');
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
    await fetchPriceBreakdown(qty * 5, '');
  };

  const fetchPriceBreakdown = async (baseAmount, coupon) => {
    setLoadingPrice(true);
    try {
      const breakdown = await calculatePrice(baseAmount, coupon || undefined, token);
      setPriceBreakdown(breakdown);
    } catch (e) {
      console.error('Price calc error:', e);
    } finally { setLoadingPrice(false); }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    const baseAmt = selectedPlan 
      ? (parseInt(String(selectedPlan.qrCodes || '0').replace(/,/g, ''), 10) * (selectedPlan.pricePerQr || 0))
      : parseInt(topupQty) * 5;
    try {
      const result = await validateCoupon(couponCode, baseAmt, token);
      setCouponApplied(result);
      setCouponError('');
      await fetchPriceBreakdown(baseAmt, couponCode);
    } catch (e) {
      setCouponError(e.message);
      setCouponApplied(null);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
    const baseAmt = selectedPlan 
      ? (parseInt(String(selectedPlan.qrCodes || '0').replace(/,/g, ''), 10) * (selectedPlan.pricePerQr || 0))
      : parseInt(topupQty) * 5;
    await fetchPriceBreakdown(baseAmt, '');
  };

  const handleProceedPayment = async () => {
    setProcessing(true);
    try {
      const payload = {
        type: selectedPlan ? 'plan' : 'topup',
        ...(selectedPlan ? { planId: selectedPlan._id } : { quantity: parseInt(topupQty) }),
        ...(couponApplied ? { couponCode: couponApplied.code } : {}),
      };
      const result = await initiatePayment(payload, token);

      if (result.redirectUrl) {
        // PhonePe redirect
        window.location.href = result.redirectUrl;
        return;
      }

      // Auto-completed (no payment gateway / free)
      setShowBuyModal(false);
      resetCheckout();
      fetchData();
      alert(`Purchase successful! ${result.creditsAdded || 0} credits added.`);
    } catch (e) {
      alert('Payment failed: ' + e.message);
    } finally { setProcessing(false); }
  };

  const resetCheckout = () => {
    setBuyView('choice');
    setSelectedPlan(null);
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
    setPriceBreakdown(null);
    setTopupQty('');
  };

  const openBuyModal = async () => {
    setShowBuyModal(true);
    resetCheckout();
    try {
      const fetched = await getPlans();
      setPlans(Array.isArray(fetched) ? fetched : fetched.plans || []);
    } catch { setPlans([]); }
  };

  // Check for payment return from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment');
    if (paymentId) {
      (async () => {
        try {
          const status = await checkPaymentStatus(paymentId, token);
          if (status.status === 'completed') {
            alert('Payment successful! Credits have been added.');
          } else if (status.status === 'failed') {
            alert('Payment failed. Please try again.');
          }
        } catch { }
        window.history.replaceState({}, '', window.location.pathname);
        fetchData();
      })();
    }
  }, []);

  // Pagination
  const paginatedTxns = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return transactions.slice(start, start + rowsPerPage);
  }, [transactions, currentPage, rowsPerPage]);

  const typeConfig = {
    purchase_plan: { label: 'Plan Purchase', icon: ShoppingCart, color: 'blue', sign: '+' },
    purchase_topup: { label: 'Top-up', icon: Zap, color: 'emerald', sign: '+' },
    spend: { label: 'Order Spend', icon: Package, color: 'red', sign: '' },
    refund: { label: 'Refund', icon: RefreshCw, color: 'amber', sign: '+' },
    admin_grant: { label: 'Admin Grant', icon: Gift, color: 'violet', sign: '+' },
  };

  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const fmtTime = d => d ? new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading billing...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Credits & Billing</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your QR credit balance</p>
          </div>
        </div>
        <button onClick={openBuyModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 active:scale-95 transition-all z-10">
          <Plus size={16} strokeWidth={3} /> Buy Credits
        </button>
      </div>

      {/* Test Account Banner */}
      {isTestAccount && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Beaker size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-black text-purple-900">Test Account Mode</h3>
                <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">TESTING</span>
              </div>
              <p className="text-sm text-purple-800 leading-relaxed">
                This account is configured for payment gateway testing. When you initiate any payment, 
                you will be charged <span className="font-black">₹{testAmount}</span> instead of the actual package price. 
                This allows you to test the complete payment flow without paying the full amount.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-700">
                <AlertCircle size={14} strokeWidth={2.5} />
                <span className="font-semibold">All credits will be added normally after successful payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-violet-50 rounded-full blur-2xl opacity-60 pointer-events-none translate-x-1/4 translate-y-1/4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
              <Coins size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Balance</span>
          </div>
          <div className="text-3xl font-black text-slate-800">
            {(balance?.qrCredits || 0).toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">QR credits available</div>
        </div>

        {/* Total Purchased */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60 pointer-events-none translate-x-1/4 translate-y-1/4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Purchased</span>
          </div>
          <div className="text-3xl font-black text-slate-800">
            {transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Credits acquired</div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-60 pointer-events-none translate-x-1/4 translate-y-1/4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
          </div>
          <div className="text-3xl font-black text-slate-800">
            {Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Credits used on orders</div>
        </div>
      </div>

      {/* Transaction History - Navigate to Full Page */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Transaction History</h3>
          </div>
          <button onClick={() => navigate('/admin/transactions')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Eye size={14} /> View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Credits</th>
                <th className="px-6 py-4">Balance After</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><CreditCard size={28} /></div>
                    <p className="font-bold text-slate-400">No transactions yet.</p>
                  </div>
                </td></tr>
              ) : paginatedTxns.slice(0, 5).map(txn => {
                const cfg = typeConfig[txn.type] || { label: txn.type, icon: Hash, color: 'slate', sign: '' };
                const Icon = cfg.icon;
                const isPositive = txn.amount > 0;
                return (
                  <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${cfg.color}-100 text-${cfg.color}-600`}>
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{txn.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-600">{txn.balanceAfter?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {txn.totalPaid ? (
                        <span className="text-sm font-bold text-slate-700">₹{txn.totalPaid?.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 font-medium max-w-[200px] truncate">
                        {txn.planName && <span className="font-bold text-slate-600">{txn.planName} • </span>}
                        {txn.note || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {fmt(txn.createdAt)}</div>
                        <div className="text-slate-400 mt-0.5">{fmtTime(txn.createdAt)}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {transactions.length > 5 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <button 
              onClick={() => navigate('/admin/transactions')}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FileText size={16} strokeWidth={2.5} />
              View All Transactions & Download Invoices
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              View complete transaction history with payment details, status tracking, and invoice downloads
            </p>
          </div>
        )}
      </div>

      {/* ── Buy Credits Modal ── */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { if (!processing) { setShowBuyModal(false); resetCheckout(); } }}>
          <div onClick={e => e.stopPropagation()} className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden max-h-[90vh] flex flex-col ${buyView === 'comparison' ? 'max-w-6xl' : 'max-w-lg'}`}>
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white">
                  {buyView === 'checkout' ? <Receipt size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{buyView === 'checkout' ? 'Checkout' : 'Buy Credits'}</h3>
                  <p className="text-violet-100 text-xs font-medium">{buyView === 'checkout' ? 'Review & pay' : 'Add QR credits to your balance'}</p>
                </div>
              </div>
              {!processing && (
                <button onClick={() => { setShowBuyModal(false); resetCheckout(); }} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Current balance */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-5 flex items-center justify-between">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Current Balance</span>
                <span className="text-lg font-black text-violet-700">{(balance?.qrCredits || 0).toLocaleString()} credits</span>
              </div>

              {processing && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 size={32} className="animate-spin text-violet-500" />
                  <p className="text-sm font-bold text-slate-600">Processing payment...</p>
                </div>
              )}

              {/* Choice */}
              {!processing && buyView === 'choice' && (
                <div className="space-y-3">
                  <button onClick={() => setBuyView('comparison')}
                    className="w-full flex items-center gap-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all group text-left">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-200 shrink-0">
                      <Package size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-sm">View Pricing Comparison</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Compare all plans with full pricing breakdown</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button onClick={() => setBuyView('plans')}
                    className="w-full flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group text-left">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-200 shrink-0">
                      <ShoppingCart size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-sm">Buy a Plan</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Choose from pricing plans with bulk discounts</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button onClick={() => setBuyView('topup')}
                    className="w-full flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-all group text-left">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 shrink-0">
                      <Zap size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-sm">Pay-Per-QR Top-up</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Buy exact quantity at ₹5 per QR credit</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
              )}

              {/* Pricing Comparison Table */}
              {!processing && buyView === 'comparison' && (
                <div className="space-y-4">
                  <button onClick={() => setBuyView('choice')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back
                  </button>
                  
                  {plans.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium text-sm">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" /> Loading plans...
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden -mx-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider border-r border-slate-200 w-48">Feature</th>
                              {plans.map(plan => {
                                const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
                                const credits = isOnDemand ? 0 : parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10);
                                const calculatedPrice = isOnDemand ? 0 : credits * (plan.pricePerQr || 0);
                                return (
                                  <th key={plan._id} className="px-4 py-3 text-center border-r border-slate-200 last:border-r-0">
                                    <div className="font-black text-slate-800 text-base mb-1">{plan.name}</div>
                                    <div className="text-3xl font-black text-blue-600 mb-0.5">₹{plan.pricePerQr || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-500">per QR • Yearly</div>
                                    {plan.isPopular && (
                                      <div className="mt-2">
                                        <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">POPULAR</span>
                                      </div>
                                    )}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {/* Price per QR */}
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs font-bold text-blue-600 border-r border-slate-200">Price per QR (Yearly)</td>
                              {plans.map(plan => (
                                <td key={plan._id} className="px-4 py-3 text-center font-bold text-slate-700 text-base border-r border-slate-200 last:border-r-0">
                                  ₹{plan.pricePerQr || 0}
                                </td>
                              ))}
                            </tr>
                            
                            {/* Validity */}
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600 border-r border-slate-200">
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> Validity (Yearly)</span>
                              </td>
                              {plans.map(plan => (
                                <td key={plan._id} className="px-4 py-3 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                                  {plan.planValidity || '365 days'}
                                </td>
                              ))}
                            </tr>
                            
                            {/* Save Amount */}
                            <tr className="hover:bg-slate-50 bg-amber-50/30">
                              <td className="px-4 py-3 text-xs font-bold text-orange-600 border-r border-slate-200">Save (Yearly)</td>
                              {plans.map(plan => (
                                <td key={plan._id} className="px-4 py-3 text-center font-bold text-orange-600 border-r border-slate-200 last:border-r-0">
                                  {plan.saveText || '-'}
                                </td>
                              ))}
                            </tr>
                            
                            {/* No. of QR Codes */}
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600 border-r border-slate-200">No. of QR Codes</td>
                              {plans.map(plan => {
                                const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
                                const credits = isOnDemand ? 0 : parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10);
                                return (
                                  <td key={plan._id} className="px-4 py-3 text-center font-bold text-slate-800 border-r border-slate-200 last:border-r-0">
                                    {isOnDemand ? 'On-Demand' : (plan.qrCodes === 'Unlimited' ? plan.qrCodes : (credits || 0).toLocaleString())}
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* Min. QR Codes / Order */}
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600 border-r border-slate-200">Min. QR Codes / Order</td>
                              {plans.map(plan => (
                                <td key={plan._id} className="px-4 py-3 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                                  {plan.minQrPerOrder || '-'}
                                </td>
                              ))}
                            </tr>
                            
                            {/* Total Price */}
                            <tr className="hover:bg-slate-50 bg-blue-50/50">
                              <td className="px-4 py-3 text-xs font-black text-slate-800 border-r border-slate-200">Total Price</td>
                              {plans.map(plan => {
                                const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
                                const credits = isOnDemand ? 0 : parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10);
                                const calculatedPrice = isOnDemand ? 0 : credits * (plan.pricePerQr || 0);
                                return (
                                  <td key={plan._id} className="px-4 py-3 text-center border-r border-slate-200 last:border-r-0">
                                    {isOnDemand ? (
                                      <div>
                                        <div className="font-black text-green-600 text-sm">Pay as you go</div>
                                        <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                          Qty × ₹{plan.pricePerQr || 0}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="font-black text-blue-600 text-lg">₹{(calculatedPrice || 0).toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                          {(credits || 0).toLocaleString()} × ₹{plan.pricePerQr || 0}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                             
                            {/* Select button */}
                            <tr className="bg-slate-50">
                              <td className="px-4 py-3 border-r border-slate-200"></td>
                              {plans.map(plan => {
                                const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
                                return (
                                  <td key={plan._id} className="px-4 py-3 text-center border-r border-slate-200 last:border-r-0">
                                    <button
                                      onClick={() => isOnDemand ? setBuyView('topup') : handleBuyPlan(plan)}
                                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
                                    >
                                      {isOnDemand ? 'Buy Custom' : 'Select Plan'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Plans list */}
              {!processing && buyView === 'plans' && (
                <div className="space-y-3">
                  <button onClick={() => setBuyView('choice')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back
                  </button>
                  {plans.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium text-sm">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" /> Loading plans...
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                      {plans.map(plan => {
                        const isOnDemand = plan.qrCodes === 'On-Demand' || plan.name?.toLowerCase().includes('starter');
                        const credits = isOnDemand ? 0 : parseInt(String(plan.qrCodes || '0').replace(/,/g, ''), 10) || 0;
                        const calculatedPrice = credits * (plan.pricePerQr || 0);
                        return (
                          <button key={plan._id} onClick={() => handleBuyPlan(plan)}
                            className="w-full flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group text-left">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 shrink-0">
                              <Tag size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-slate-800 text-sm truncate">{plan.name}</div>
                              <div className="text-xs text-slate-500 font-medium mt-0.5">
                                {isOnDemand ? 'Pay as you go' : `${credits.toLocaleString()} credits × ₹${plan.pricePerQr}/QR`}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-blue-600 text-sm">
                                {isOnDemand ? '₹' + plan.pricePerQr + '/QR' : '₹' + calculatedPrice.toLocaleString()}
                              </div>
                              {plan.isPopular && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">POPULAR</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Top-up form */}
              {!processing && buyView === 'topup' && (
                <div className="space-y-4">
                  <button onClick={() => setBuyView('choice')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back
                  </button>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Number of QR Credits</label>
                    <input type="number" min="1" value={topupQty} onChange={e => setTopupQty(e.target.value)} placeholder="e.g., 500"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all" />
                  </div>
                  {topupQty && parseInt(topupQty) > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">{parseInt(topupQty).toLocaleString()} QRs × ₹5</span>
                      <span className="text-lg font-black text-emerald-700">₹{(parseInt(topupQty) * 5).toLocaleString()}</span>
                    </div>
                  )}
                  <button onClick={handleBuyTopup}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Zap size={16} /> Proceed to Checkout
                  </button>
                </div>
              )}

              {/* ═══ Checkout with Price Breakdown ═══ */}
              {!processing && buyView === 'checkout' && (
                <div className="space-y-4">
                  <button onClick={() => { setBuyView(selectedPlan ? 'plans' : 'topup'); setPriceBreakdown(null); setCouponApplied(null); setCouponCode(''); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                    <ChevronRight size={12} className="rotate-180" /> Back
                  </button>

                  {/* Order Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt size={14} className="text-slate-500" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Order Summary</span>
                    </div>
                    {selectedPlan ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{selectedPlan.name}</div>
                            <div className="text-xs text-slate-500">
                              {(parseInt(String(selectedPlan.qrCodes || '0').replace(/,/g, '')) || 0).toLocaleString()} credits × ₹{selectedPlan.pricePerQr}/QR
                            </div>
                          </div>
                          <div className="font-black text-slate-800">
                            ₹{((parseInt(String(selectedPlan.qrCodes || '0').replace(/,/g, '')) || 0) * (selectedPlan.pricePerQr || 0)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">QR Top-up</div>
                          <div className="text-xs text-slate-500">{parseInt(topupQty).toLocaleString()} credits × ₹5</div>
                        </div>
                        <div className="font-black text-slate-800">₹{(parseInt(topupQty) * 5).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Have a Coupon?</label>
                    {couponApplied ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-emerald-700">{couponApplied.code}</span>
                          <span className="text-xs text-emerald-600 ml-2">(-₹{couponApplied.discount?.toLocaleString()})</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          placeholder="Enter coupon code" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300" />
                        <button onClick={handleApplyCoupon} disabled={!couponCode.trim()}
                          className="px-4 py-2.5 bg-violet-100 border border-violet-200 text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-200 transition-colors disabled:opacity-40">
                          Apply
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                        <AlertCircle size={12} /> {couponError}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  {loadingPrice ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-violet-500" />
                    </div>
                  ) : priceBreakdown && (
                    <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Price Breakdown</span>
                      </div>
                      <div className="p-4 space-y-2.5">
                        {/* Base */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">Base Amount</span>
                          <span className="font-bold text-slate-800">₹{priceBreakdown.baseAmount?.toLocaleString()}</span>
                        </div>
                        {/* GST */}
                        {priceBreakdown.gstAmount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600 flex items-center gap-1">
                              <Percent size={12} className="text-slate-400" /> GST ({priceBreakdown.gstPercentage}%)
                            </span>
                            <span className="font-bold text-slate-700">+ ₹{priceBreakdown.gstAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        {/* Additional Charges */}
                        {(priceBreakdown.additionalCharges || []).map((ch, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600 flex items-center gap-1">
                              <IndianRupee size={12} className="text-slate-400" />
                              {ch.name} {ch.type === 'percentage' ? `(${ch.value}%)` : ''}
                            </span>
                            <span className="font-bold text-slate-700">+ ₹{ch.amount?.toLocaleString()}</span>
                          </div>
                        ))}
                        {/* Coupon Discount */}
                        {priceBreakdown.couponDiscount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-emerald-600 flex items-center gap-1">
                              <Gift size={12} /> Coupon Discount
                            </span>
                            <span className="font-bold text-emerald-600">- ₹{priceBreakdown.couponDiscount?.toLocaleString()}</span>
                          </div>
                        )}
                        {/* Divider & Total */}
                        <div className="border-t-2 border-dashed border-slate-200 pt-2.5 mt-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-slate-800">Total Amount</span>
                            <span className="text-xl font-black text-violet-700">₹{priceBreakdown.finalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Test Account Notice */}
                        {isTestAccount && (
                          <div className="mt-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Beaker size={16} className="text-purple-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                              <div>
                                <p className="text-xs font-bold text-purple-900 mb-1">Test Account Payment</p>
                                <p className="text-xs text-purple-700 leading-relaxed">
                                  You will be charged only <span className="font-black">₹{testAmount}</span> for testing purposes. 
                                  Full credits will be added after successful payment.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button onClick={handleProceedPayment} disabled={!priceBreakdown}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base">
                    <CreditCard size={18} />
                    {isTestAccount
                      ? `Pay Test Amount ₹${testAmount}`
                      : priceBreakdown?.finalAmount > 0
                        ? `Pay ₹${priceBreakdown.finalAmount?.toLocaleString()}`
                        : 'Complete Purchase'}
                  </button>
                </div>
              )}

              {/* Cancel */}
              {!processing && buyView !== 'checkout' && (
                <button onClick={() => { setShowBuyModal(false); resetCheckout(); }}
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

export default BillingCredits;
