import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getOrders, createOrder, updateOrderStatus, downloadOrderPdf, downloadOrderImages, checkOrderCredits, getPlans, calculatePrice, validateCoupon, initiatePayment, updateOrder, getOrderPrice } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useConfirm } from '../../components/ConfirmModal';
import TablePagination from '../../components/TablePagination';
import {
  Package, Search, Filter, X, Plus, Truck, CheckCircle2, Clock, Settings, ShieldCheck,
  FileDown, PackageCheck, AlertTriangle, ArrowRight, Hash, Calendar, ChevronRight, XCircle, Send,
  CreditCard, Zap, Coins, ShoppingCart, Loader2, Percent, IndianRupee, Gift, Receipt, AlertCircle, Tag, Eye, ChevronDown, User, Edit
} from 'lucide-react';


// --- Sub-components moved outside to fix focus issues ---
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

const ActionBtn = ({ onClick, icon: Icon, label, color }) => {
  const [busy, setBusy] = React.useState(false);
  const handle = async (e) => {
    if (busy) return;
    try {
      setBusy(true);
      const ret = onClick?.(e);
      if (ret && ret.then) await ret;
    } finally {
      setBusy(false);
    }
  };
  return (
    <button onClick={handle} disabled={busy}
      aria-disabled={busy}
      className={'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 select-none active:scale-95 bg-' + color + '-50 border-' + color + '-200 text-' + color + '-700 hover:bg-' + color + '-100 shadow-sm ' + (busy ? 'opacity-60 pointer-events-none' : 'cursor-pointer')}>
      <Icon size={14} strokeWidth={2.5} /> {label}
    </button>
  );
};

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input {...props} required={required}
      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all" />
  </div>
);

const DispatchModal = ({ orderId, initialData, onDispatch, onClose }) => {
  const [data, setData] = useState(initialData);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white"><Truck size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-white">Dispatch Order</h3>
              <p className="text-orange-100 text-xs font-medium">Enter shipping details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <InputField label="Courier Name" value={data.courierName} onChange={e => setData({ ...data, courierName: e.target.value })} placeholder="e.g., DHL, FedEx, BlueDart" />
          <InputField label="Tracking Number" value={data.trackingNumber} onChange={e => setData({ ...data, trackingNumber: e.target.value })} placeholder="Enter tracking number" />
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} rows="3" placeholder="Additional dispatch info"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button onClick={() => onDispatch(orderId, data)}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Truck size={16} /> Dispatch Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentOverviewModal = ({ order, priceData, onConfirm, onClose, isProcessing }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative">
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"><X size={20} /></button>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-xl border border-white/20">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Order Authorization</h3>
            <p className="text-indigo-100 text-sm font-bold opacity-80 mt-1">Payment & Security Review</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Product</span>
               <span className="text-sm font-bold text-slate-800">{order.productName}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</span>
               <span className="text-sm font-black text-slate-800">{order.quantity.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rate (per QR)</span>
               <span className="text-sm font-black text-indigo-600">₹{priceData.pricePerQr}</span>
            </div>
          </div>

          <div className="space-y-3 px-1">
             <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                <span>Subtotal</span>
                <span>₹{priceData.subtotal}</span>
             </div>
             <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>GST (18%)</span>
                <span>₹{priceData.tax}</span>
             </div>
             <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-dashed border-slate-200">
                <span className="text-base font-black text-slate-800 uppercase tracking-tight">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">₹{priceData.total}</span>
             </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
             <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide">
                Authorisation will proceed automatically upon successful payment. This action is final and will allow QR generation.
             </p>
          </div>

          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? (
               <><Loader2 size={20} className="animate-spin" /> Processing...</>
            ) : (
               <><CreditCard size={20} strokeWidth={2.5} /> Confirm & Pay Now</>
            )}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Secure Payment powered by PhonePe
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const [downloadModal, setDownloadModal] = useState(null); // orderId or null
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [creatorSubmitting, setCreatorSubmitting] = useState(false);
  const [userPlan, setUserPlan] = useState(null);

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

  // Edit Order State
  const [editOrderModal, setEditOrderModal] = useState({ isOpen: false, data: null });
  const [editing, setEditing] = useState(false);
  const [processModal, setProcessModal] = useState({ isOpen: false, order: null, bonusQuantity: 0 });
  const [paymentOverview, setPaymentOverview] = useState(null); // { order, priceData }
  const [payingOrder, setPayingOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole) { setRole(adminRole); return; }
    const userStr = localStorage.getItem('userInfo');
    if (userStr) { 
      try { 
        const info = JSON.parse(userStr);
        setRole(info.role); 
        if (info.role === 'creator') fetchUserProfile();
      } catch { 
        setRole(localStorage.getItem('role') || ''); 
      } 
    }
    else { setRole(localStorage.getItem('role') || ''); }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const profile = await fetch(API_BASE_URL + '/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      if (profile && profile.user && profile.user.planId) {
        setUserPlan(profile.user.planId); // Assuming populated planId or object
      }
    } catch (e) {
      console.error("Failed to fetch profile/plan:", e);
    }
  };

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
      const ok = await confirm({ title: 'Create Order', description: 'Are you sure you want to create this order?', confirmText: 'Yes, Create', cancelText: 'Cancel' });
      if (!ok) return;
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await createOrder(newOrder, token);
      setShowCreateModal(false);
      setNewOrder({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: '', description: '' });
      fetchOrders();
    } catch (e) { alert('Failed to create order: ' + e.message); }
  };

  const handleCreatorOrder = async (e) => {
    e.preventDefault();
    if (creatorSubmitting) return;
    try {
      const ok = await confirm({ title: 'Create Order', description: 'Are you sure you want to create this order? Admin will process it to generate QR codes.', confirmText: 'Yes, Create', cancelText: 'Cancel' });
      if (!ok) return;
      setCreatorSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Check for minimum quantity if plan allows it
      const minQty = userPlan?.minQuantity || 1;
      if (newQr.quantity < minQty) {
        alert(`Minimum quantity for your plan is ${minQty}. Please increase the quantity.`);
        setCreatorSubmitting(false);
        return;
      }

      await createOrder({ ...newQr, quantity: Number(newQr.quantity) || 1 }, token);
      alert('Order created! Admin will process it to generate QR codes.');
      setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1, description: '' });
      fetchOrders();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setCreatorSubmitting(false); }
  };

  const handleAction = async (orderId, action, data = {}) => {
    try {
      const actionLabels = {
        authorize: 'Authorize this order? Credits will be deducted from company balance.',
        process: 'Process this order and generate QR codes?',
        dispatching: 'Mark this order as preparing for dispatch?',
        dispatch: 'Dispatch this order with the provided details?',
      };

      if (actionLabels[action] && (!data || Object.keys(data).length === 0)) {
        if (action === 'process' && (role === 'superadmin' || role === 'admin') && (!data || Object.keys(data).length === 0)) {
          const order = orders.find(o => o._id === orderId);
          setProcessModal({ isOpen: true, order, bonusQuantity: 0 });
          return;
        }

        const ok = await confirm({ 
          title: action.charAt(0).toUpperCase() + action.slice(1), 
          description: actionLabels[action], 
          confirmText: 'Yes, Proceed', 
          cancelText: 'Cancel' 
        });
        if (!ok) return;
      }

      setGlobalLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (action === 'authorize' && (role === 'company' || role === 'authorizer')) {
         try {
            const priceData = await getOrderPrice(orderId, token);
            const order = orders.find(o => o._id === orderId);
            setPaymentOverview({ order, priceData });
            return;
         } catch (err) {
            alert('Failed to fetch pricing: ' + err.message);
            return;
         } finally {
            setGlobalLoading(false);
         }
      }

      await updateOrderStatus(orderId, action, data, token);
      
      const successMessages = {
        authorize: 'Order authorized successfully!',
        process: 'QR codes generated and order processing!',
        dispatching: 'Order status updated to dispatching.',
        dispatch: 'Order dispatched successfully!',
        received: 'Order marked as received and QR codes activated!',
        reject: 'Order rejected successfully.'
      };

      alert(successMessages[action] || 'Action completed successfully!');
      
      if (action === 'dispatch') setShowDispatchModal(null);
      if (action === 'process') setProcessModal({ isOpen: false, order: null, bonusQuantity: 0 });
      await fetchOrders();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleOrderPayment = async () => {
    if (!paymentOverview) return;
    setPayingOrder(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await initiatePayment({ 
        type: 'order', 
        orderId: paymentOverview.order._id 
      }, token);
      
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert('Payment initiated! You will be redirected.');
      }
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setPayingOrder(false);
    }
  };

  const confirm = useConfirm();

  const handleMarkReceived = async (orderId) => {
    try {
      const ok = await confirm({ title: 'Mark Received', description: 'Mark as received? This will ACTIVATE all QR codes!', confirmText: 'Yes, mark received', cancelText: 'Cancel' });
      if (ok) await handleAction(orderId, 'received');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt('Please enter a rejection reason (this will be seen by the creator/authorizer):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      setGlobalLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await updateOrderStatus(orderId, 'reject', { reason: reason.trim() }, token);
      alert('Order rejected and moved back to Pending Authorization.');
      fetchOrders();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleEditOrderSubmit = async (e) => {
    e.preventDefault();
    if (!editOrderModal.data) return;
    setEditing(true);
    try {
      // Create a payload of changing fields
      const { _id, productName, brand, batchNo, quantity, productInfo } = editOrderModal.data;
      const updates = { productName, brand, batchNo, quantity, productInfo };
      
      await updateOrder(_id, updates);
      await fetchOrders();
      setEditOrderModal({ isOpen: false, data: null });
    } catch (err) {
      alert(err.message || 'Failed to edit order');
    } finally {
      setEditing(false);
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
    //     setCreditProcessing(true);
    //     try {
    //       const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    //       const payload = {
    //         type: selectedCreditPlan ? 'plan' : 'topup',
    //         ...(selectedCreditPlan ? { planId: selectedCreditPlan._id } : { quantity: creditModal?.shortfall || 0 }),
    //         ...(creditCouponApplied ? { couponCode: creditCouponApplied.code } : {}),
    //       };
    //       const result = await initiatePayment(payload, token);
    // console.log('Initiate Payment Result:', result);
    // await new Promise(resolve => setTimeout(resolve, 20000000)); // Simulate waiting for payment completion
    //       // if (result.redirectUrl) {
    //       //   // window.location.href = result.redirectUrl;
    //       //   return;
    //       // }

    //       // Auto-completed — re-try authorize
    //       // setCreditView('processing');
    //       // await updateOrderStatus(creditModal.orderId, 'authorize', {}, token);
    //       // setCreditModal(null);
    //       // resetCreditCheckout();
    //       // fetchOrders();
    //       alert('Credits purchased & order authorized successfully!');
    //     } catch (e) {
    //       if (e.creditData) {
    //         setCreditModal({ orderId: creditModal.orderId, ...e.creditData });
    //         setCreditView('choice');
    //         alert('Payment completed but still insufficient credits. Please buy more.');
    //       } else {
    //         alert('Error: ' + e.message);
    //       }
    //     } finally { setCreditProcessing(false); }
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

  const downloadQrs = async (orderId, format) => {
    setDownloadModal(null);
    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      let blob, filename;
      if (format === 'pdf') {
        blob = await downloadOrderPdf(orderId, token);
        filename = `order_${orderId}_qrs.pdf`;
      } else {
        blob = await downloadOrderImages(orderId, token, format);
        filename = `order_${orderId}_qr_images.zip`;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) { 
      alert(e.message || "Failed to download"); 
    } finally { 
      setGlobalLoading(false); 
    }
  };

  const handleOpenDispatchModal = (order) => {
    // Try multiple fallback sources for company name and address since older orders may not be populated correctly
    let courierName = order.brandId?.companyId?.companyName || '';
    if (!courierName && order.createdBy?.role === 'company') courierName = order.createdBy.name || '';
    if (!courierName) courierName = order.brandId?.brandName || order.brand || '';
    
    let courierAddress = order.brandId?.companyId?.courierAddress || 
                         order.brandId?.companyId?.dispatchAddress || 
                         order.brandId?.companyId?.registerOfficeAddress || 
                         order.brandId?.dispatchAddress || '';
    
    setDispatchData({
      trackingNumber: '',
      courierName: courierName,
      notes: courierAddress
    });
    setShowDispatchModal(order._id);
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

  // StatusBadge and statusConfig moved outside the component to fix focus issues

  const counts = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fmtMfd = (o) => {
    if (o.manufactureDate) return fmt(o.manufactureDate);
    if (o.mfdOn && (o.mfdOn.month || o.mfdOn.year)) {
      const mm = o.mfdOn.month || '01';
      const yy = o.mfdOn.year || '1970';
      try { const dt = new Date(`${yy}-${mm}-01`); return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); } catch { return `${mm}/${yy}`; }
    }
    return '-';
  };

  const fmtExp = (o) => {
    if (o.expiryDate) return fmt(o.expiryDate);
    if (o.calculatedExpiryDate) return o.calculatedExpiryDate;
    if (o.bestBefore && (o.bestBefore.value || o.bestBefore.unit)) return `${o.bestBefore.value || '-'} ${o.bestBefore.unit || ''}`.trim();
    return '-';
  };

  // ActionBtn and InputField moved outside the component to fix focus issues

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
          {/* {(role === 'admin' || role === 'superadmin' || role === 'creator') && (
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all">
              <Plus size={16} strokeWidth={3} /> New Order
            </button>
          )} */}
        </div>
      </div>

      

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
                <th className="px-6 py-4 text-right">Total Amount</th>
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
                <React.Fragment key={order._id}>
                <tr className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedOrder === order._id ? 'bg-blue-50/30' : ''}`} onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <Hash size={10} className="inline mr-1 -mt-0.5" />{order.orderId || order._id?.slice(-6)}
                      </span>
                    </div>
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
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-slate-700">₹{(order.amount || 0).toLocaleString()}</div>
                    {order.paymentStatus === 'completed' && (
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight mt-1">Paid</div>
                    )}
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
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
                        <ActionBtn onClick={() => handleOpenDispatchModal(order)} icon={Truck} label="Dispatch" color="amber" />
                      )}
                      {/* Received */}
                      {order.status === 'Dispatched' && (role === 'company' || role === 'authorizer') && (
                        <ActionBtn onClick={() => handleMarkReceived(order._id)}
                          icon={CheckCircle2} label="Mark Received" color="emerald" />
                      )}
                      {/* Reject — allowed for superadmin/admin at most stages, authorizer/company ONLY if Pending */}
                      {((['Pending Authorization', 'Authorized', 'Order Processing', 'Dispatching'].includes(order.status) && ['admin', 'superadmin'].includes(role)) || 
                        (order.status === 'Pending Authorization' && ['authorizer', 'company'].includes(role))) && (
                        <ActionBtn onClick={() => handleRejectOrder(order._id)} icon={XCircle} label="Reject" color="red" />
                      )}
                      {/* Edit — allowed for superadmin/admin if not processed, company ONLY if Pending, creator ONLY if Rejected */}
                      {((['Pending Authorization', 'Authorized', 'Rejected'].includes(order.status) && ['admin', 'superadmin'].includes(role)) || 
                        (order.status === 'Pending Authorization' && ['company'].includes(role)) ||
                        (order.status === 'Rejected' && role === 'creator')) && (
                        <ActionBtn onClick={() => {
                          if (role === 'creator') {
                            navigate('/generate-qrs', { state: { editOrder: order } });
                          } else {
                            setEditOrderModal({ isOpen: true, data: order });
                          }
                        }} icon={Edit} label="Edit" color="slate" />
                      )}
                      {/* PDF — visible for superadmin/admin until order is marked Received, and only after authoriser approval */}
                      {order.status !== 'Received' && !['Pending Authorization', 'Rejected'].includes(order.status) && (role === 'superadmin' || role === 'admin') && (
                        <ActionBtn onClick={() => setDownloadModal(order._id)} icon={FileDown} label="Download QRs" color="slate" />
                      )}

                    </div>
                  </td>
                </tr>
                {/* ── Expanded Row ── */}
                {expandedOrder === order._id && (
                  <tr className="bg-blue-50/20">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          {/* Creator Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User size={12} /> Creator Details</h4>
                            <div className="space-y-1.5">
                              <div className="text-sm"><span className="font-bold text-slate-600">Name:</span> <span className="text-slate-800">{order.createdBy?.name || 'N/A'}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Email:</span> <span className="text-slate-800">{order.createdBy?.email || 'N/A'}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Role:</span> <span className="text-slate-800 capitalize">{order.createdBy?.role || 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Package size={12} /> Order Details</h4>
                            <div className="space-y-1.5">
                              <div className="text-sm"><span className="font-bold text-slate-600">Batch #:</span> <span className="text-slate-800">{order.batchNo || 'N/A'}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Mfd On:</span> <span className="text-slate-800">{fmtMfd(order)}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Expiry:</span> <span className="text-slate-800">{fmtExp(order)}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">QRs Generated:</span> <span className="text-slate-800">{order.qrCodesGenerated ? `${order.qrGeneratedCount || order.quantity} ✓` : 'No'}</span></div>
                            </div>
                          </div>

                          {/* Description & Product Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Eye size={12} /> Description</h4>
                            {order.description && (
                              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">{order.description}</p>
                            )}
                            {order.productInfo && (
                              <div>
                                <span className="text-xs font-bold text-slate-500">Product Info:</span>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">{order.productInfo}</p>
                              </div>
                            )}
                            {!order.description && !order.productInfo && (
                              <p className="text-sm text-slate-400 italic">No description provided</p>
                            )}
                          </div>

                          {/* Billing & Pricing */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Coins size={12} /> Billing & Pricing</h4>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500">Rate:</span>
                                <span className="font-black text-slate-700">₹{order.pricePerQr || 0} / QR</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500">Subtotal:</span>
                                <span className="font-bold text-slate-700">₹{(order.subtotal || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-indigo-600">
                                <span className="font-bold">GST (18%):</span>
                                <span className="font-bold">₹{(order.tax || 0).toLocaleString()}</span>
                              </div>
                              <div className="h-px bg-slate-200 my-1" />
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-400">Total Amount:</span>
                                <span className="text-sm font-black text-blue-600">₹{(order.amount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                            {order.paymentStatus === 'completed' ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 py-1 px-2 rounded w-fit">
                                <CheckCircle2 size={10} /> Payment Completed
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 py-1 px-2 rounded w-fit">
                                <Clock size={10} /> {order.paymentStatus === 'failed' ? 'Payment Failed' : 'Pending Payment'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Variants */}
                        {order.variants && order.variants.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Variants</h4>
                            <div className="flex flex-wrap gap-2">
                              {order.variants.map((v, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold">
                                  {v.variantName}: {v.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rejection Details */}
                        {order.history?.some(h => h.status === 'Rejected') && (
                          <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 p-4 rounded-xl">
                            <h4 className="text-xs font-black text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle size={14} /> Rejection Reason</h4>
                            <p className="text-sm text-red-800 font-medium whitespace-pre-wrap">
                              {[...order.history].reverse().find(h => h.status === 'Rejected')?.comment || 'No reason provided.'}
                            </p>
                          </div>
                        )}

                        {/* Dynamic Fields */}
                        {order.dynamicFields && Object.keys(order.dynamicFields).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Custom Fields</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(order.dynamicFields).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase">{key}</div>
                                  <div className="text-sm font-medium text-slate-700 truncate">{String(val)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Coupon / Reward Details */}
                        {order.coupon && order.coupon.code && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Gift size={14} /> Coupon / Reward</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                              <div className="text-sm"><span className="font-bold text-slate-600">Code:</span> <span className="font-black text-purple-700 tracking-wider bg-white px-2 py-0.5 rounded border border-purple-200">{order.coupon.code}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Expiry:</span> <span className="text-slate-800">{order.coupon.expiryDate ? fmt(order.coupon.expiryDate) : 'No expiry'}</span></div>
                              {order.coupon.description && <div className="text-sm col-span-2 lg:col-span-2"><span className="font-bold text-slate-600">Description:</span> <span className="text-slate-800">{order.coupon.description}</span></div>}
                            </div>
                          </div>
                        )}

                        {/* Dispatch Details */}
                        {order.dispatchDetails && order.dispatchDetails.courierName && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Truck size={12} /> Dispatch Info</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-sm"><span className="font-bold text-slate-600">Courier:</span> <span className="text-slate-800">{order.dispatchDetails.courierName}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Tracking:</span> <span className="text-slate-800">{order.dispatchDetails.trackingNumber || 'N/A'}</span></div>
                              {order.dispatchDetails.notes && <div className="text-sm col-span-3"><span className="font-bold text-slate-600">Notes:</span> <span className="text-slate-800">{order.dispatchDetails.notes}</span></div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
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

      {/* Edit Order Modal */}
      {editOrderModal.isOpen && editOrderModal.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !editing && setEditOrderModal({isOpen: false, data: null})} />
          <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Edit size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Edit Order</h3>
                  <p className="text-slate-500 text-sm font-medium">{editOrderModal.data.orderId}</p>
                </div>
              </div>
              <button type="button" onClick={() => !editing && setEditOrderModal({isOpen: false, data: null})} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="editOrderForm" onSubmit={handleEditOrderSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Basic Input Field Simulation */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
                    <input 
                      type="text"
                      value={editOrderModal.data.productName} 
                      onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, productName: e.target.value}}))}
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Brand Name</label>
                    <input 
                      type="text"
                      value={editOrderModal.data.brand} 
                      onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, brand: e.target.value}}))}
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Batch Number</label>
                    <input 
                      type="text"
                      value={editOrderModal.data.batchNo} 
                      onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, batchNo: e.target.value}}))}
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Quantity</label>
                    <input 
                      type="number"
                      value={editOrderModal.data.quantity} 
                      onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, quantity: e.target.value}}))}
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Product Information</label>
                  <textarea
                    value={editOrderModal.data.productInfo || ''}
                    onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, productInfo: e.target.value}}))}
                    rows={4}
                    placeholder="E.g., ingredients, storage instructions..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50">
              <button 
                type="button"
                onClick={() => setEditOrderModal({isOpen: false, data: null})}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                disabled={editing}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="editOrderForm"
                disabled={editing}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {editing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dispatch Modal ── */}
      {showDispatchModal && (
        <DispatchModal
          orderId={showDispatchModal}
          initialData={dispatchData}
          onDispatch={(id, data) => handleAction(id, 'dispatch', data)}
          onClose={() => setShowDispatchModal(null)}
        />
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
      {/* Process Order Modal (SuperAdmin Override) */}
      {processModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Settings size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Process Order</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Order #{processModal.order?.orderId}</p>
                </div>
              </div>
              <button 
                onClick={() => setProcessModal({ ...processModal, isOpen: false })}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested QRs</div>
                  <div className="text-2xl font-black text-slate-800">{processModal.order?.quantity}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total to Generate</div>
                  <div className="text-2xl font-black text-blue-600">
                    {(processModal.order?.quantity || 0) + (parseInt(processModal.bonusQuantity) || 0)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-black text-blue-900 mb-3">
                    <Gift size={16} className="text-blue-600" />
                    Manually Grant Bonus QRs
                  </label>
                  <p className="text-xs text-blue-700/70 font-bold mb-4 leading-relaxed">
                    As SuperAdmin, you can generate additional QR codes for this order without charge. These will be tracked as "Bonus Grant".
                  </p>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={processModal.bonusQuantity}
                      onChange={(e) => setProcessModal({ ...processModal, bonusQuantity: e.target.value })}
                      className="w-full pl-5 pr-12 py-3.5 bg-white border-2 border-blue-200 rounded-xl font-black text-lg text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400 bg-blue-50 px-2.5 py-1 rounded-lg">QRs</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">
                    This action will immediately generate QR codes and transition the order to 'Order Processing' status.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setProcessModal({ ...processModal, isOpen: false })}
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 active:scale-95 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAction(processModal.order?._id, 'process', { bonusQuantity: processModal.bonusQuantity })}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Generate & Start Processing
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-1">Download QR Codes</h3>
            <p className="text-sm text-slate-500 mb-5">Choose your preferred format:</p>
            <div className="space-y-2.5">
              <button onClick={() => downloadQrs(downloadModal, 'pdf')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                  <FileDown size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">PDF Document</div>
                  <div className="text-xs text-slate-500">270 QR codes per page, print-ready A3+</div>
                </div>
              </button>
              <button onClick={() => downloadQrs(downloadModal, 'jpg')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                  <FileDown size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">JPG Images</div>
                  <div className="text-xs text-slate-500">Individual QR images in a ZIP file</div>
                </div>
              </button>
              <button onClick={() => downloadQrs(downloadModal, 'png')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                  <FileDown size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">PNG Images</div>
                  <div className="text-xs text-slate-500">Lossless QR images in a ZIP file</div>
                </div>
              </button>
            </div>
            <button onClick={() => setDownloadModal(null)}
              className="w-full mt-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Overview Modal */}
      {paymentOverview && (
        <PaymentOverviewModal 
          order={paymentOverview.order}
          priceData={paymentOverview.priceData}
          onClose={() => setPaymentOverview(null)}
          onConfirm={handleOrderPayment}
          isProcessing={payingOrder}
        />
      )}
    </div>
  );
};

export default OrderManagement;
