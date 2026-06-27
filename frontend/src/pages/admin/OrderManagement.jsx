import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getOrders, createOrder, updateOrderStatus, downloadOrderPdf, downloadOrderCsv, downloadOrderImages, checkOrderCredits, getPlans, calculatePrice, validateCoupon, initiatePayment, updateOrder, getOrderPrice, checkPaymentStatus, getCreditsBalance } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useConfirm } from '../../components/ConfirmModal';
import TablePagination from '../../components/TablePagination';
import {
  Package, Search, Filter, X, Plus, Truck, CheckCircle2, Clock, Settings, ShieldCheck,
  FileDown, PackageCheck, AlertTriangle, ArrowRight, Hash, Calendar, ChevronRight, XCircle, Send,
  CreditCard, Zap, Coins, ShoppingCart, Loader2, Percent, IndianRupee, Gift, Receipt, AlertCircle, Tag, Eye, ChevronDown, User, Edit, Smartphone, Activity
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



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://authentik-8p39.vercel.app';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');
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
  const [mobilePreviewOrder, setMobilePreviewOrder] = useState(null);
  const [globalFieldLabels, setGlobalFieldLabels] = useState({});

  // Preview interactive state
  const [isReviewed, setIsReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [optIn, setOptIn] = useState(false);
  const [previewSubmitting, setPreviewSubmitting] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState({ purchaseDate: '' });
  const [invoiceImages, setInvoiceImages] = useState([]);
  const [warrantyClaimStatus, setWarrantyClaimStatus] = useState("Processing");
  const [warrantyClaimed, setWarrantyClaimed] = useState(false);

  const resetPreviewStates = () => {
    setIsReviewed(false);
    setShowReviewModal(false);
    setShowCouponReveal(false);
    setShowWarrantyModal(false);
    setRating(0);
    setOptIn(false);
    setPreviewSubmitting(false);
    setCouponCopied(false);
    setWarrantyForm({ purchaseDate: '' });
    setInvoiceImages([]);
    setWarrantyClaimed(false);
  };



  // Edit Order State
  const [editOrderModal, setEditOrderModal] = useState({ isOpen: false, data: null });
  const [editing, setEditing] = useState(false);
  const [processModal, setProcessModal] = useState({ isOpen: false, order: null, bonusQuantity: 0 });


  useEffect(() => {
    fetchFormConfigLabels();
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

  const fetchFormConfigLabels = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/form-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formConfig) {
          const dict = {};
          if (data.formConfig.customFields) {
            data.formConfig.customFields.forEach(f => {
              if (f.fieldName && f.fieldLabel) {
                 dict[f.fieldName.toLowerCase()] = f.fieldLabel;
              }
            });
          }
          if (data.formConfig.variants) {
            data.formConfig.variants.forEach(f => {
              if (f.variantName && f.variantLabel) {
                 dict[f.variantName.toLowerCase()] = f.variantLabel;
              }
            });
          }
          setGlobalFieldLabels(dict);
        }
      }
    } catch (e) {
      console.error('Failed to fetch FormConfig to resolve labels:', e);
    }
  };

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
    } catch (e) { await confirm({ title: 'Error', description: 'Failed to load orders: ' + e.message, cancelText: null }); }
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
    } catch (e) { await confirm({ title: 'Error', description: 'Failed to create order: ' + e.message, cancelText: null }); }
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
        await confirm({ title: 'Minimum Quantity', description: `Minimum quantity for your plan is ${minQty}. Please increase the quantity.`, cancelText: null });
        setCreatorSubmitting(false);
        return;
      }

      await createOrder({ ...newQr, quantity: Number(newQr.quantity) || 1 }, token);
      await confirm({ title: 'Success', description: 'Order created! Admin will process it to generate QR codes.', cancelText: null });
      setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1, description: '' });
      fetchOrders();
    } catch (e) { await confirm({ title: 'Error', description: 'Error: ' + e.message, cancelText: null }); }
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
        if (action === 'process' && (role === 'superadmin' || role === 'admin')) {
          const order = orders.find(o => o._id === orderId);
          setProcessModal({ isOpen: true, order, bonusQuantity: 0 });
          return;
        }

        let descriptionNode = actionLabels[action];

        if (action === 'authorize') {
          const order = orders.find(o => o._id === orderId);
          if (order) {
            const requiredQrs = order.quantity || 0;
            
            let availableQrs = 0;
            try {
              const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
              const bal = await getCreditsBalance(token);
              availableQrs = (bal && (bal.qrCredits || bal.credits || bal.available || bal.balance)) ? Number((bal.qrCredits || bal.credits || bal.available || bal.balance)) : 0;
            } catch (e) {
              console.error("Failed to fetch available balance:", e);
              availableQrs = parseInt(localStorage.getItem('remainingCredits')) || 0;
            }
            
            if (availableQrs < requiredQrs) {
                await confirm({ 
                    title: 'Insufficient Physical QRs', 
                    description: `You need ${requiredQrs.toLocaleString()} QRs for this order, but the company only has ${availableQrs.toLocaleString()} QRs available. Please assign more stock.`, 
                    confirmText: 'Okay', 
                    cancelText: null 
                });
                return;
            }

            const cashbackActive = order.cashback?.isActive;
            const cashbackFund = cashbackActive ? (order.cashback.totalFund || 0) : 0;
            const totalPayable = cashbackFund; // Only cashback requires payment

            descriptionNode = (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Authorize this order?</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">Physical QRs Required:</span>
                    <span className="font-bold text-indigo-600">{requiredQrs.toLocaleString()} QRs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">Available Balance:</span>
                    <span className="font-bold text-emerald-600">{availableQrs.toLocaleString()} QRs</span>
                  </div>
                  
                  {cashbackActive && (
                    <>
                      <div className="h-px bg-slate-200 my-2"></div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-800 uppercase tracking-tight text-xs">Cashback Fund Payable:</span>
                        <span className="font-bold text-blue-600 text-lg tracking-tight">₹{totalPayable.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                {!cashbackActive && (
                  <p className="text-xs text-amber-700 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                    <span>No cashback program was added. You can cancel and click 'Edit' to add a cashback program if needed.</span>
                  </p>
                )}
              </div>
            );
          }
        }

        const ok = await confirm({ 
          title: action.charAt(0).toUpperCase() + action.slice(1), 
          description: descriptionNode, 
          confirmText: 'Yes, Proceed', 
          cancelText: 'Cancel' 
        });
        if (!ok) return;
      }

      setGlobalLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Restore credits logic: let updateOrderStatus handle authorization.
      // If there's a shortfall, it will throw an error with creditData.

      await updateOrderStatus(orderId, action, data, token);
      
      const successMessages = {
        authorize: 'Order authorized successfully!',
        process: 'QR codes generated and order processing!',
        dispatching: 'Order status updated to dispatching.',
        dispatch: 'Order dispatched successfully!',
        received: 'Order marked as received and QR codes activated!',
        reject: 'Order rejected successfully.'
      };

      await confirm({
        title: 'Success!',
        description: successMessages[action] || 'Action completed successfully!',
        confirmText: 'Done',
        cancelText: null
      });
      
      if (action === 'dispatch') setShowDispatchModal(null);
      if (action === 'process') setProcessModal({ isOpen: false, order: null, bonusQuantity: 0 });
      await fetchOrders();
    } catch (e) {
      await confirm({ title: 'Action Failed', description: 'Failed: ' + e.message, cancelText: null });
    } finally {
      setGlobalLoading(false);
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
      await confirm({ title: 'Requirement', description: 'Rejection reason is required.', cancelText: null });
      return;
    }

    try {
      setGlobalLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await updateOrderStatus(orderId, 'reject', { reason: reason.trim() }, token);
      await confirm({ title: 'Order Rejected', description: 'Order rejected and moved back to Pending Authorization.', cancelText: null });
      fetchOrders();
    } catch (e) {
      await confirm({ title: 'Failed', description: 'Failed: ' + e.message, cancelText: null });
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
      const { _id, productName, brand, batchNo, quantity, productInfo, cashback } = editOrderModal.data;
      const updates = { productName, brand, batchNo, quantity, productInfo, cashback };
      
      await updateOrder(_id, updates);
      await fetchOrders();
      setEditOrderModal({ isOpen: false, data: null });
    } catch (err) {
      await confirm({ title: 'Edit Failed', description: err.message || 'Failed to edit order', cancelText: null });
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
    const baseAmt = creditModal?.topupTotalCost || ((creditModal?.shortfall || 0) * (creditModal?.topupCostPerQr || 5));
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
    const baseAmt = selectedCreditPlan ? selectedCreditPlan.price : (creditModal?.topupTotalCost || ((creditModal?.shortfall || 0) * (creditModal?.topupCostPerQr || 5)));
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
    const baseAmt = selectedCreditPlan ? selectedCreditPlan.price : (creditModal?.topupTotalCost || ((creditModal?.shortfall || 0) * (creditModal?.topupCostPerQr || 5)));
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
        orderId: creditModal?.orderId,
        redirectUrl: `${window.location.origin}/orders?payment_success=true&orderId=${creditModal?.orderId}`
      };
      
      const result = await initiatePayment(payload, token);
      console.log('Initiate Payment Result:', result);
      
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      } else if (result.autoCompleted) {
        // Auto-completed — re-try authorize
        setCreditView('processing');
        await updateOrderStatus(creditModal.orderId, 'authorize', {}, token);
        setCreditModal(null);
        resetCreditCheckout();
        fetchOrders();
        await confirm({ title: 'Success', description: 'Credits purchased & order authorized successfully!', cancelText: null });
      } else {
        await confirm({ title: 'Redirecting', description: 'Payment initiated! You will be redirected.', cancelText: null });
      }
    } catch (e) {
      if (e.creditData) {
        setCreditModal({ orderId: creditModal.orderId, ...e.creditData });
        setCreditView('choice');
        await confirm({ title: 'Insufficient Credits', description: 'Payment completed but still insufficient credits. Please buy more.', cancelText: null });
      } else {
        await confirm({ title: 'Error', description: 'Error: ' + e.message, cancelText: null });
      }
    } finally { 
      setCreditProcessing(false); 
    }
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
      const order = orders.find(o => o._id === orderId);
      const displayId = order?.orderId || orderId;
      const safeId = displayId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      let blob, filename;
      if (format === 'pdf') {
        blob = await downloadOrderPdf(orderId, token);
        filename = `${safeId}_qrs.pdf`;
      } else if (format === 'csv') {
        blob = await downloadOrderCsv(orderId, token);
        filename = `${safeId}_qrs.csv`;
      } else {
        blob = await downloadOrderImages(orderId, token, format);
        filename = `${safeId}_qr_images.zip`;
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
      await confirm({ title: 'Download Failed', description: e.message || "Failed to download", cancelText: null }); 
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
  }).sort((a, b) => {
    const dateA = new Date(a[sortBy] || a.createdAt);
    const dateB = new Date(b[sortBy] || b.createdAt);
    return dateB - dateA;
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
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="updatedAt">Last Updated First</option>
          <option value="createdAt">Newest Created First</option>
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
                <th className="px-6 py-4">Warranty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">{sortBy === 'updatedAt' ? 'Last Updated' : 'Created At'}</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-16 text-center">
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
                  <td className="px-6 py-4">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/admin/warranty-claims?search=${encodeURIComponent(order.productName || '')}&orderId=${order._id}`); 
                      }} 
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck size={14} /> Go to Warranty
                    </button>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar size={12} /> {fmt(order[sortBy] || order.createdAt)}
                    </div>
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
                      {/* Edit — allowed for superadmin always, admin if not processed, company ONLY if Pending, creator ONLY if Rejected */}
                      {(role === 'superadmin' || 
                        (['Pending Authorization', 'Authorized', 'Rejected'].includes(order.status) && role === 'admin') || 
                        (order.status === 'Pending Authorization' && ['company', 'authorizer'].includes(role)) ||
                        (order.status === 'Rejected' && role === 'creator')) && (
                        <ActionBtn onClick={() => {
                          if (role === 'creator' || role === 'superadmin') {
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
                      {/* Mobile Preview Action */}
                      <ActionBtn onClick={() => setMobilePreviewOrder(order)} icon={Eye} label="Preview" color="slate" />
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

                          </div>

                        {/* Tracking History */}
                        {order.history && order.history.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                              <Activity size={12} /> Order Tracking History
                            </h4>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                              {[...order.history].reverse().map((h, i) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <CheckCircle2 size={16} />
                                  </div>
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                      <div className="font-bold text-slate-800 text-sm">{h.status}</div>
                                      <time className="text-xs font-medium text-slate-500">{fmt(h.date || h.createdAt || order.updatedAt)}</time>
                                    </div>
                                    {h.comment && <div className="text-sm text-slate-600 mb-2">{h.comment}</div>}
                                    {h.changedBy && (
                                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                        <User size={10} /> {h.changedBy.name || h.changedBy.email || 'System'} 
                                        {h.role && <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] uppercase ml-1">{h.role}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
                              {Object.entries(order.dynamicFields).map(([key, val]) => {
                                const formatLabel = (k) => {
                                  if (!k) return '';
                                  const lowerK = k.toLowerCase();
                                  if (globalFieldLabels[lowerK]) return globalFieldLabels[lowerK];
                                  
                                  if (lowerK.startsWith('field_')) return "Product Detail";
                                  if (lowerK.startsWith('variant_')) return "Specification";
                                  
                                  const manualMap = {
                                    "marketedby": "Marketed By",
                                    "manufacturedby": "Manufactured By",
                                    "countryoforigin": "Country of Origin",
                                    "customercare": "Customer Care"
                                  };
                                  if (manualMap[lowerK]) return manualMap[lowerK];
                                  if (k.includes(' ')) return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                                  if (k !== k.toUpperCase()) {
                                    const result = k.replace(/[A-Z]/g, (match) => ` ${match}`);
                                    return result.charAt(0).toUpperCase() + result.slice(1).trim();
                                  }
                                  return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
                                };
                                return (
                                  <div key={key} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{formatLabel(key)}</div>
                                    <div className="text-sm font-medium text-slate-700 truncate">{String(val)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Coupon / Reward Details */}
                        {order.coupon && order.coupon.title && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Gift size={14} /> Coupon / Reward: <span className="text-slate-700 ml-1">{order.coupon.title}</span></h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                              <div className="text-sm"><span className="font-bold text-slate-600">Code:</span> <span className="font-black text-purple-700 tracking-wider bg-white px-2 py-0.5 rounded border border-purple-200">{order.coupon.code}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Expiry:</span> <span className="text-slate-800">{order.coupon.expiryDate ? fmt(order.coupon.expiryDate) : 'No expiry'}</span></div>
                              {order.coupon.websiteLink && <div className="text-sm col-span-2 lg:col-span-1"><span className="font-bold text-slate-600">Link:</span> <span className="text-blue-600 truncate block">{order.coupon.websiteLink}</span></div>}
                              {order.coupon.description && <div className="text-sm col-span-2 lg:col-span-1"><span className="font-bold text-slate-600">Description:</span> <span className="text-slate-800">{order.coupon.description}</span></div>}
                            </div>
                          </div>
                        )}

                        {/* Cashback Details */}
                        {order.cashback && order.cashback.isActive && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Gift size={14} /> Cashback Program Active</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                              <div className="text-sm"><span className="font-bold text-slate-600">Total Fund:</span> <span className="font-black text-emerald-700">₹{order.cashback.totalFund}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Disbursed:</span> <span className="font-black text-slate-800">₹{order.cashback.disbursed}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Min Amount:</span> <span className="text-slate-800">₹{order.cashback.minPerUser}</span></div>
                              <div className="text-sm"><span className="font-bold text-slate-600">Max Amount:</span> <span className="text-slate-800">₹{order.cashback.maxPerUser}</span></div>
                            </div>
                          </div>
                        )}

                        {/* Order Links */}
                        {order.orderLinks && order.orderLinks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> 
                              Order Links
                            </h4>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {order.orderLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1"
                                >
                                  {link.title}
                                </a>
                              ))}
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

                        {/* Consumer Mobile Scan Preview Button */}
                        <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200 flex justify-end">
                          <button
                            onClick={() => setMobilePreviewOrder({ ...order, 
                              productName: order.productName,
                              productImage: order.productImage,
                              brand: order.brand || order.brandId?.brandName || '-',
                              companyName: order.brandId?.companyId?.companyName || '-',
                              description: order.description || order.productInfo,
                              mfdOn: order.mfdOn,
                              expiryDate: order.expiryDate || order.calculatedExpiryDate,
                              dynamicFields: order.dynamicFields,
                              variants: order.variants
                            })}
                            className="px-6 py-3 bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white rounded-xl text-sm font-black flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all uppercase tracking-widest active:scale-95"
                          >
                            <Smartphone size={16} /> Original Scan Preview
                          </button>
                        </div>
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

                <div className="border border-emerald-100 rounded-2xl bg-emerald-50/30 overflow-hidden">
                  <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between cursor-pointer" onClick={() => {
                    setEditOrderModal(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        cashback: {
                          ...prev.data.cashback,
                          isActive: !(prev.data.cashback?.isActive)
                        }
                      }
                    }));
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Gift size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Cashback Program (Optional)</h3>
                        <p className="text-xs text-slate-500">Enable lucky cashback for users when they scan</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${editOrderModal.data.cashback?.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${editOrderModal.data.cashback?.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {editOrderModal.data.cashback?.isActive && (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fund (₹)</label>
                        <input type="number" value={editOrderModal.data.cashback?.totalFund || ''} onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, cashback: {...prev.data.cashback, totalFund: e.target.value}}}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-slate-800" placeholder="e.g. 50000" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min per User (₹)</label>
                        <input type="number" value={editOrderModal.data.cashback?.minPerUser || ''} onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, cashback: {...prev.data.cashback, minPerUser: e.target.value}}}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-slate-800" placeholder="e.g. 5" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max per User (₹)</label>
                        <input type="number" value={editOrderModal.data.cashback?.maxPerUser || ''} onChange={e => setEditOrderModal(prev => ({...prev, data: {...prev.data, cashback: {...prev.data.cashback, maxPerUser: e.target.value}}}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-slate-800" placeholder="e.g. 50" />
                      </div>
                    </div>
                  )}
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
              
              <button onClick={() => downloadQrs(downloadModal, 'csv')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                  <FileDown size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">CSV Mapping Data</div>
                  <div className="text-xs text-slate-500">For mapped physical QRs</div>
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



      {/* --- Consumer Mobile Preview Modal --- */}
      {mobilePreviewOrder && (() => {
        // Resolve field display
        const getFieldVal = (k) => {
          if (mobilePreviewOrder[k] && mobilePreviewOrder[k] !== "-") return mobilePreviewOrder[k];
          if (mobilePreviewOrder.dynamicFields && mobilePreviewOrder.dynamicFields[k] && mobilePreviewOrder.dynamicFields[k] !== "-") {
            return mobilePreviewOrder.dynamicFields[k];
          }
          return "";
        };

        const formatMonthYear = (val) => {
          if (!val) return "";
          if (typeof val === 'object') {
            if (val.month && val.year) {
              return `${val.month} ${val.year}`;
            }
            return "";
          }
          const str = String(val);
          const parts = str.split(/[\/\-]/);
          if (parts.length === 2) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mIdx = parseInt(parts[0], 10) - 1;
            if (mIdx >= 0 && mIdx < 12) {
              return `${months[mIdx]} ${parts[1]}`;
            }
          }
          return str;
        };

        const formatLabel = (key) => {
          if (!key) return "";
          const lowerK = key.toLowerCase();
          if (globalFieldLabels[lowerK]) return globalFieldLabels[lowerK];
          
          if (lowerK.startsWith('field_')) return "Product Detail";
          if (lowerK.startsWith('variant_')) return "Specification";
          
          const manualMap = {
            "marketedby": "Marketed By",
            "manufacturedby": "Manufactured By",
            "countryoforigin": "Country of Origin",
            "customercare": "Customer Care"
          };
          if (manualMap[lowerK]) return manualMap[lowerK];

          if (key.includes(' ')) {
            return key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          }

          if (key !== key.toUpperCase()) {
            const result = key.replace(/[A-Z]/g, (match) => ` ${match}`);
            return result.charAt(0).toUpperCase() + result.slice(1).trim();
          }

          return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        };

        const fieldLabels = globalFieldLabels || {};
        const handledKeys = new Set();
        const blueFields = [];

        // Exclude generic keys
        const excludeKeys = ["productname", "productimage", "brand", "companyname", "description", "warranty", "coupon", "mfdon", "variants", "dynamicfields"];
        excludeKeys.forEach(k => handledKeys.add(k));

        // 1. Warranty & Coupon fields to ignore in general dynamic list
        handledKeys.add("couponcode");
        handledKeys.add("couponexpiry");
        handledKeys.add("coupondescription");
        handledKeys.add("warrantyduration");
        handledKeys.add("warrantytype");

        // 2. Extract specific Blue Fields (Mfg Date, Expiry Date, Batch No, Rate, Warranty, Coupon)
        const mfdVal = getFieldVal("mfdOn");
        if (mfdVal) {
          blueFields.push({ label: "Mfg Date", value: formatMonthYear(mfdVal) });
          handledKeys.add("mfdon");
          handledKeys.add("manufacturedate");
        }

        const expVal = getFieldVal("expiryDate") || getFieldVal("expirydate");
        if (expVal) {
          blueFields.push({ label: "Expiry Date", value: formatMonthYear(expVal) });
          handledKeys.add("expirydate");
        }

        const batchVal = getFieldVal("batchNo") || getFieldVal("batchno") || getFieldVal("batchnumber");
        if (batchVal) {
          blueFields.push({ label: "Batch No", value: String(batchVal) });
          handledKeys.add("batchno");
          handledKeys.add("batchnumber");
        }

        // Additional special metrics
        const specialGridSpecs = [
          { key: "rate", label: "Rate" },
          { key: "mrp", label: "MRP" },
          { key: "warranty", label: "Warranty" },
          { key: "coupon", label: "Coupon" }
        ];

        specialGridSpecs.forEach(({ key, label }) => {
          const val = getFieldVal(key);
          if (val && val !== "-" && !handledKeys.has(key.toLowerCase())) {
            let displayVal = String(val);
            if (key === "rate" || key === "mrp") {
              if (!displayVal.startsWith("₹")) displayVal = `₹${displayVal}`;
            } else if (key === "warranty" && typeof val === 'object') {
              displayVal = `${val.duration || ''} ${val.durationUnit || 'months'}`;
            } else if (key === "coupon" && typeof val === 'object') {
              displayVal = val.title || "Discount Coupon";
            }

            blueFields.push({ label, value: displayVal });
            handledKeys.add(key.toLowerCase());
            handledKeys.add(key.replace(/([A-Z])/g, "_$1").toLowerCase());
            handledKeys.add(key.replace(/([A-Z])/g, " $1").toLowerCase());
          }
        });

        const allVariants = mobilePreviewOrder.variants || [];
        allVariants.forEach((v) => {
          const vName = v.variantName || "";
          if (!handledKeys.has(vName.toLowerCase()) && !handledKeys.has(vName)) {
            blueFields.push({
              label: fieldLabels[vName] || v.variantLabel || formatLabel(vName),
              value: String(v.value)
            });
            handledKeys.add(vName.toLowerCase());
          }
        });

        const additionalInfoFields = [
          { key: "manufacturedBy", label: "Manufactured By" },
          { key: "marketedBy", label: "Marketed By" },
          { key: "importMarketedBy", label: "Import & Marketed By" },
          { key: "importerRegNo", label: "Importer Reg. No" },
          { key: "countryOfOrigin", label: "Country of Origin" },
          { key: "website", label: "Website" },
          { key: "supportEmail", label: "Support E-mail" },
          { key: "customerCare", label: "Customer Care" },
        ];

        const grayFields = [];
        additionalInfoFields.forEach(({ key, label }) => {
          let val = getFieldVal(key);
          


          if (val && val !== "-" && !handledKeys.has(key.toLowerCase())) {
            grayFields.push({ label, value: String(val) });
            handledKeys.add(key.toLowerCase());
          }
        });

        const combinedDynamicFields = mobilePreviewOrder.dynamicFields || {};
        Object.keys(combinedDynamicFields).forEach(k => {
          if (!handledKeys.has(k.toLowerCase()) && !handledKeys.has(k)) {
            const lowerKey = k.toLowerCase();
            if (lowerKey === 'product quantity' || lowerKey === 'quantity' || lowerKey === 'productquantity' || lowerKey === 'qr quantity' || lowerKey === 'qrquantity' || lowerKey.includes('sku')) {
              return;
            }

            let val = combinedDynamicFields[k];
            if (val && val !== "-") {
              if (typeof val === 'object' && val.month && val.year) {
                val = formatMonthYear(val);
              } else if (typeof val === 'string' && /^\d{1,2}[\/\-]\d{4}$/.test(val)) {
                val = formatMonthYear(val);
              }

              if (typeof val !== 'object') {
                const label = fieldLabels[k] || formatLabel(k);
                grayFields.push({ label, value: String(val) });
                handledKeys.add(k.toLowerCase());
              }
            }
          }
        });

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-[375px] h-[750px] max-h-[90vh] bg-[#F5F5F5] rounded-[2.5rem] shadow-2xl overflow-hidden border-[10px] border-slate-800 flex flex-col" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl w-1/2 mx-auto z-50"></div>
              
              {/* Header */}
              <div className="w-full flex items-center justify-center p-4 bg-white sticky top-0 z-40 shadow-sm pt-8 flex-shrink-0">
                <h1 className="text-[18px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
                <button 
                  onClick={() => { setMobilePreviewOrder(null); resetPreviewStates(); }} 
                  className="absolute right-4 top-7 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                  title="Close Emulator"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>

              {/* Scrollable Mobile View */}
              <div className="flex-1 w-full flex flex-col overflow-y-auto px-3 pb-8 pt-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Status Card */}
                <div className="bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
                  <div className="flex flex-row justify-center items-center gap-2.5">
                    <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
                      <ShieldCheck size={26} className="text-[#2CA4D6]" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-[17px] font-bold leading-tight">
                        Authentic Product
                      </h2>
                      <p className="text-[11px] opacity-90 font-medium">
                        This product has been verified as genuine
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="bg-white shadow-sm rounded-b-[16px] pb-5 flex flex-col items-center relative gap-3 border border-t-0 border-gray-100">
                  <div className="w-full bg-[#1F2642] py-2.5 text-center">
                    <h3 className="text-white font-bold text-[18px] px-2 truncate leading-tight">
                      {mobilePreviewOrder.productName}
                    </h3>
                  </div>

                  {/* Product Image */}
                  <div className="relative h-[210px] w-[90%] rounded-[2rem] mt-1 mx-auto overflow-hidden bg-white shadow-2xl border-4 border-white shadow-indigo-100/50 flex items-center justify-center">
                    {mobilePreviewOrder.productImage ? (
                      <img src={mobilePreviewOrder.productImage} className="w-full h-full object-contain" alt="Product" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                        <span className="text-slate-300 font-bold text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Blue Fields Grid */}
                  {blueFields.length > 0 && (
                    <div className="w-full px-4 pt-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        {blueFields.map((field, idx) => (
                          <div key={idx} className="bg-[#259DCF] rounded-[16px] p-3 shadow-md text-left transition-all">
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                              {field.label}
                            </p>
                            <p className="text-white text-[13px] font-bold leading-tight break-words">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gray Additional Info */}
                  {((mobilePreviewOrder.description && mobilePreviewOrder.description.trim()) || grayFields.length > 0) && (
                    <div className="w-full px-4 mt-3">
                      <h4 className="text-[#333] font-black text-[11px] mb-2 ml-1 uppercase tracking-wider">Additional Info:</h4>
                      <div className="bg-[#F2F2F2] p-4 rounded-[16px] shadow-inner space-y-3.5 border border-gray-200/55">
                        {mobilePreviewOrder.description && mobilePreviewOrder.description.trim() && (
                          <div className="mb-2">
                            <p className="text-[#444] text-[12px] font-medium whitespace-pre-wrap leading-relaxed">
                              {mobilePreviewOrder.description}
                            </p>
                          </div>
                        )}
                        {grayFields.length > 0 && (
                          <div className="space-y-2.5">
                            {grayFields.map((field, idx) => (
                              <div key={idx} className="border-b border-gray-300/30 pb-2.5 last:border-0 last:pb-0">
                                <p className="text-[#333] text-[9.5px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                                  {field.label}
                                </p>
                                <p className="text-[#0D4E96] text-[12px] font-bold max-w-full break-words whitespace-pre-line">
                                  {field.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Reviews Button */}
                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={isReviewed}
                  className={`w-full ${isReviewed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642]'} text-white font-bold text-[16px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(14,92,171,0.25)] mt-4 active:scale-95 transition-transform flex items-center justify-center gap-2`}
                >
                  {isReviewed ? "Product Reviewed" : (mobilePreviewOrder.coupon ? "Review & Claim Coupon" : "Review Product")}
                </button>

                {/* Interactive Warranties Button */}
                {mobilePreviewOrder.warranty && (
                  <div className="mt-3">
                    {warrantyClaimed ? (
                      <button
                        onClick={() => alert("Simulated Redirect to Warranty Claims Tracking Page")}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[15px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Track Warranty
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowWarrantyModal(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[15px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Register Warranty
                      </button>
                    )}
                  </div>
                )}
                
                <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Simulator Mode - View Only</p>
              </div>

              {/* ===== Modals Rendered Absolutes in Viewport Wrapper ===== */}

              {/* 1. Review Modal Bottom Sheet */}
              {showReviewModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center rounded-[2.5rem] overflow-hidden animate-in fade-in duration-200">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setShowReviewModal(false)} />
                  
                  {/* Sheet */}
                  <div className="relative w-full bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>

                    {/* Product Hero */}
                    <div className="px-6 pt-6 pb-4 text-center border-b border-slate-50">
                      {mobilePreviewOrder.productImage ? (
                        <div className="w-[70px] h-[70px] rounded-[20px] overflow-hidden mx-auto mb-3 shadow-md bg-white p-0.5 border">
                          <img src={mobilePreviewOrder.productImage} alt="" className="w-full h-full object-contain rounded-[18px]" />
                        </div>
                      ) : (
                        <div className="w-[70px] h-[70px] rounded-[20px] bg-slate-50 mx-auto mb-3 flex items-center justify-center border">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                      )}
                      <h2 className="text-[18px] font-black text-[#0D4E96] tracking-tight leading-tight mb-1">{mobilePreviewOrder.productName}</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{mobilePreviewOrder.brand || "Brand"}</p>
                    </div>

                    {/* Rating Section */}
                    <div className="px-6 py-5 text-center">
                      <p className="text-[16px] font-black text-slate-800 mb-1">How was your experience?</p>
                      <p className="text-[12px] text-slate-400 font-bold mb-4">Tap a star to rate this product</p>

                      <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-all active:scale-75 hover:scale-105 duration-200"
                            style={{ transform: star <= rating ? 'scale(1.1)' : 'scale(1)' }}
                          >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#CBD5E1"} strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <div className="h-5">
                        {rating > 0 && (
                          <p className="text-[13px] font-black text-[#F59E0B]">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Opt-in & Submit */}
                    <div className="px-6 pb-2 text-left">
                      <label className="flex items-start gap-3 cursor-pointer mb-5 group">
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="sr-only" />
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${optIn ? 'bg-[#0D4E96] border-[#0D4E96] scale-105' : 'bg-white border-slate-300'}`}>
                            {optIn && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
                          </div>
                        </div>
                        <span className="text-[11.5px] font-bold text-slate-600 leading-tight">Yes, I would like to receive exclusive offer and discounts from the brand</span>
                      </label>

                      <button
                        onClick={() => {
                          if (rating === 0) return;
                          setPreviewSubmitting(true);
                          setTimeout(() => {
                            setPreviewSubmitting(false);
                            setIsReviewed(true);
                            setShowReviewModal(false);
                            if (mobilePreviewOrder.coupon) {
                              setShowCouponReveal(true);
                            } else {
                              alert("Thank you for your review!");
                            }
                          }, 800);
                        }}
                        disabled={rating === 0 || previewSubmitting}
                        className={`w-full py-3.5 rounded-[30px] font-bold text-[15px] shadow-md flex items-center justify-center ${
                          rating === 0 || previewSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white active:scale-95 transition-transform'
                        }`}
                      >
                        {previewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Coupon Reveal Page Overlay */}
              {showCouponReveal && (
                <div className="absolute inset-0 z-50 bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#F8FAFC] flex flex-col overflow-y-auto rounded-[2rem] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* Header */}
                  <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm/50 pt-8 flex-shrink-0">
                    <button onClick={() => setShowCouponReveal(false)} className="text-[#0D4E96] p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-[18px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
                    <div className="w-8"></div>
                  </div>

                  <div className="flex-1 px-4 py-6 flex flex-col items-center relative overflow-hidden text-center">
                    <div className="absolute top-6 left-4 opacity-25 text-pink-500 animate-bounce">🎈</div>
                    <div className="absolute top-12 right-6 opacity-25 text-amber-500 animate-pulse">✨</div>

                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2CA4D6] bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100/50 mb-2 inline-block">
                        Reward Unlocked 🎉
                      </span>
                      <h2 className="bg-gradient-to-r from-[#0D4E96] to-[#1E3A8A] bg-clip-text text-transparent text-[20px] font-black leading-tight">
                        Congratulations!<br />You've Earned a Coupon
                      </h2>
                    </div>

                    {/* Ticket Graphic Card */}
                    <div className="w-full max-w-sm relative mt-4 shadow-xl rounded-[24px] bg-white border border-slate-100 text-center">
                      {/* Overlapping Gift Icon */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-tr from-[#0D4E96] to-[#2CA4D6] rounded-full border-4 border-white flex items-center justify-center z-20 shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <polyline points="20 12 20 22 4 22 4 12"></polyline>
                          <rect x="2" y="7" width="20" height="5"></rect>
                          <line x1="12" y1="22" x2="12" y2="7"></line>
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                        </svg>
                      </div>

                      {/* Header */}
                      <div className="bg-[#1F2642] bg-gradient-to-br from-[#0D4E96] via-[#1E3A8A] to-[#1F2642] rounded-t-[24px] pt-10 pb-6 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 mb-2">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                          <span className="text-white text-[8px] font-black uppercase tracking-wider">{mobilePreviewOrder.brand || "Brand"}</span>
                        </div>
                        <h3 className="text-white text-[16px] font-black uppercase tracking-wide leading-tight px-2">
                          {mobilePreviewOrder.coupon?.title || "REWARD UNLOCKED"}
                        </h3>
                      </div>

                      {/* Notched Divider */}
                      <div className="relative py-4 bg-slate-50 border-y border-dashed border-slate-200 flex items-center justify-center">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFFFF] rounded-full border border-slate-200/50 shadow-inner z-10" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFFFF] rounded-full border border-slate-200/50 shadow-inner z-10" />

                        <div className="flex items-center justify-between gap-3 px-4 py-1.5 rounded-xl border-2 border-dashed font-mono text-[16px] font-black uppercase tracking-widest border-cyan-500/30 bg-cyan-500/5 text-[#0D4E96]">
                          <span>{mobilePreviewOrder.coupon?.code || "WELCOME50"}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(mobilePreviewOrder.coupon?.code || "WELCOME50");
                              setCouponCopied(true);
                              setTimeout(() => setCouponCopied(false), 2000);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              couponCopied
                                ? 'bg-emerald-500 text-white shadow-md scale-105'
                                : 'bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200 active:scale-90'
                            }`}
                          >
                            {couponCopied ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="bg-white rounded-b-[24px] p-5 text-center">
                        {mobilePreviewOrder.coupon?.expiryDate && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Valid Until: <span className="text-slate-700">{new Date(mobilePreviewOrder.coupon.expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                          </p>
                        )}
                        {mobilePreviewOrder.coupon?.description && (
                          <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-[12px] font-medium text-slate-600">
                            {mobilePreviewOrder.coupon.description}
                          </div>
                        )}
                        <button onClick={() => setShowCouponReveal(false)} className="w-full bg-[#1F2642] text-white font-bold text-[14px] py-3 rounded-xl shadow-md">Done</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Warranty Claim Modal Bottom Sheet */}
              {showWarrantyModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center rounded-[2.5rem] overflow-hidden animate-in fade-in duration-200">
                  <div className="absolute inset-0" onClick={() => setShowWarrantyModal(false)} />

                  <div className="relative w-full bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    <button
                      onClick={() => setShowWarrantyModal(false)}
                      className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>

                    {/* Header */}
                    <div className="px-6 pt-5 pb-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-3 flex items-center justify-center shadow-md">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <h2 className="text-[18px] font-black text-[#0D4E96] tracking-tight">Register Warranty</h2>
                      <p className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Upload purchase invoice to activate</p>
                    </div>

                    {/* Warranty Policies Parameters Card */}
                    {mobilePreviewOrder.warranty && (mobilePreviewOrder.warranty.duration || mobilePreviewOrder.warranty.warrantyType) && (
                      <div className="mx-6 mb-4 bg-emerald-50 rounded-xl border border-emerald-100 p-4 space-y-2 text-left">
                        {mobilePreviewOrder.warranty.warrantyType && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-emerald-800 font-bold uppercase tracking-wider">Type</span>
                            <span className="text-emerald-950 font-black">{mobilePreviewOrder.warranty.warrantyType}</span>
                          </div>
                        )}
                        {mobilePreviewOrder.warranty.duration && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-emerald-800 font-bold uppercase tracking-wider">Duration</span>
                            <span className="text-emerald-950 font-black">
                              {mobilePreviewOrder.warranty.duration} {mobilePreviewOrder.warranty.durationUnit || "months"}
                            </span>
                          </div>
                        )}
                        {mobilePreviewOrder.warranty.description && (
                          <div className="border-t border-emerald-100 pt-2 text-[11px] text-emerald-800">
                            {mobilePreviewOrder.warranty.description}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Inputs */}
                    <div className="px-6 space-y-4 text-left">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Purchase Date *</label>
                        <input
                          type="date"
                          value={warrantyForm.purchaseDate}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-[12.5px]"
                          required
                        />
                      </div>

                      {/* Invoice bill capture preview block */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Invoice / Receipt Bill Images *</label>
                        {invoiceImages.length > 0 ? (
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {invoiceImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-300 bg-emerald-50 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <button
                                  type="button"
                                  onClick={() => setInvoiceImages([])}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setInvoiceImages([{ preview: 'simulated' }])}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-700 font-black text-[12px] hover:bg-emerald-100/70 transition-colors"
                            >
                              Camera
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoiceImages([{ preview: 'simulated' }])}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl text-blue-700 font-black text-[12px] hover:bg-blue-100/70 transition-colors"
                            >
                              Gallery
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (!warrantyForm.purchaseDate || invoiceImages.length === 0) return;
                          setPreviewSubmitting(true);
                          setTimeout(() => {
                            setPreviewSubmitting(false);
                            setWarrantyClaimStatus("Processing");
                            setWarrantyClaimed(true);
                            setShowWarrantyModal(false);
                            alert("Warranty registration simulated successfully!");
                          }, 850);
                        }}
                        disabled={!warrantyForm.purchaseDate || invoiceImages.length === 0 || previewSubmitting}
                        className={`w-full py-3.5 rounded-[30px] font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 ${
                          !warrantyForm.purchaseDate || invoiceImages.length === 0 || previewSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:opacity-95 active:scale-95 transition-transform'
                        }`}
                      >
                        {previewSubmitting ? "Registering..." : "Submit Warranty"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Simulator Mode - View Only</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OrderManagement;
