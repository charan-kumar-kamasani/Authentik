import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Percent, Plus, Trash2, Save, Loader2, X,
  Tag, ToggleLeft, ToggleRight, Calendar, Edit3, Gift,
  IndianRupee, ChevronRight, AlertCircle, CheckCircle2, Hash
} from 'lucide-react';
import {
  getSettings, updateSettings,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
} from '../../config/api';

export default function AdminSettings() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const [tab, setTab] = useState('tax'); // 'tax' | 'coupons'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Tax & Charges state
  const [gstPercentage, setGstPercentage] = useState(18);
  const [charges, setCharges] = useState([]);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponModal, setCouponModal] = useState(null); // null | 'create' | couponObj

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, couponsData] = await Promise.all([
        getSettings(),
        getCoupons(token).catch(() => []),
      ]);
      setGstPercentage(settingsData.gstPercentage ?? 18);
      setCharges(settingsData.additionalCharges || []);
      setCoupons(couponsData || []);
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Tax & Charges handlers ──
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({ gstPercentage, additionalCharges: charges }, token);
      showToast('Settings saved successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const addCharge = () => {
    setCharges(prev => [...prev, { name: '', type: 'percentage', value: 0, isActive: true }]);
  };

  const updateCharge = (index, field, value) => {
    setCharges(prev => prev.map((ch, i) => i === index ? { ...ch, [field]: value } : ch));
  };

  const removeCharge = (index) => {
    setCharges(prev => prev.filter((_, i) => i !== index));
  };

  // ── Coupon handlers ──
  const handleSaveCoupon = async (data) => {
    setSaving(true);
    try {
      if (data._id) {
        await updateCoupon(data._id, data, token);
        showToast('Coupon updated');
      } else {
        await createCoupon(data, token);
        showToast('Coupon created');
      }
      setCouponModal(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id, token);
      showToast('Coupon deleted');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive }, token);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-bold animate-in slide-in-from-right ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Admin Settings</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Manage taxes, charges & coupons</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('tax')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'tax' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Percent size={16} /> Tax & Charges
        </button>
        <button onClick={() => setTab('coupons')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'coupons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Gift size={16} /> Coupons
        </button>
      </div>

      {/* ═══════════════ TAX & CHARGES TAB ═══════════════ */}
      {tab === 'tax' && (
        <div className="space-y-5">
          {/* GST Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">GST Configuration</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 max-w-md">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">GST Percentage (%)</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" step="0.1" value={gstPercentage}
                      onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all" />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-center">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Preview</div>
                  <div className="text-lg font-black text-indigo-700">{gstPercentage}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charges Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Additional Charges</h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{charges.length}</span>
              </div>
              <button onClick={addCharge}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                <Plus size={14} /> Add Charge
              </button>
            </div>
            <div className="p-6 space-y-3">
              {charges.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3"><IndianRupee size={28} /></div>
                  <p className="font-bold text-slate-400 text-sm">No additional charges configured</p>
                  <p className="text-xs text-slate-400 mt-1">Add service fees, convenience charges, etc.</p>
                </div>
              )}
              {charges.map((ch, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <input type="text" value={ch.name} onChange={(e) => updateCharge(i, 'name', e.target.value)} placeholder="Charge name"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300" />
                  <select value={ch.type} onChange={(e) => updateCharge(i, 'type', e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                  <input type="number" min="0" step="0.01" value={ch.value} onChange={(e) => updateCharge(i, 'value', parseFloat(e.target.value) || 0)} placeholder="Value"
                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-right" />
                  <button onClick={() => updateCharge(i, 'isActive', !ch.isActive)}
                    className={`p-2 rounded-lg transition-colors ${ch.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`} title={ch.isActive ? 'Active' : 'Inactive'}>
                    {ch.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => removeCharge(i)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSaveSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* ═══════════════ COUPONS TAB ═══════════════ */}
      {tab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Coupons</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{coupons.length}</span>
            </div>
            <button onClick={() => setCouponModal('create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl active:scale-95 transition-all">
              <Plus size={14} /> New Coupon
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Amount</th>
                  <th className="px-6 py-4">Max Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {coupons.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><Gift size={28} /></div>
                      <p className="font-bold text-slate-400">No coupons yet</p>
                    </div>
                  </td></tr>
                ) : coupons.map(coupon => (
                  <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-lg text-xs font-black text-violet-700 tracking-wider">
                        <Tag size={12} /> {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {coupon.minAmount > 0 ? `₹${coupon.minAmount}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {coupon.maxDiscount > 0 ? `₹${coupon.maxDiscount}` : 'No cap'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">
                        {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Calendar size={12} /> {fmt(coupon.expiryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleCoupon(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${coupon.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {coupon.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setCouponModal(coupon)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteCoupon(coupon._id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ COUPON MODAL ═══════════════ */}
      {couponModal && (
        <CouponFormModal
          coupon={couponModal === 'create' ? null : couponModal}
          onSave={handleSaveCoupon}
          onClose={() => setCouponModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

// ── Coupon Form Modal ──
function CouponFormModal({ coupon, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || 0,
    minAmount: coupon?.minAmount || 0,
    maxDiscount: coupon?.maxDiscount || 0,
    expiryDate: coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
    usageLimit: coupon?.usageLimit || 0,
    isActive: coupon?.isActive !== undefined ? coupon.isActive : true,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return alert('Coupon code is required');
    if (form.discountValue <= 0) return alert('Discount value must be greater than 0');
    onSave({
      ...(coupon?._id ? { _id: coupon._id } : {}),
      ...form,
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white"><Gift size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-white">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <p className="text-violet-100 text-xs font-medium">Configure discount coupon</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Code *</label>
              <input type="text" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SAVE20"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => set('discountType', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Discount Value *</label>
              <input type="number" min="0" step="0.01" value={form.discountValue} onChange={e => set('discountValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Purchase (₹)</label>
              <input type="number" min="0" value={form.minAmount} onChange={e => set('minAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Max Discount (₹)</label>
              <input type="number" min="0" value={form.maxDiscount} onChange={e => set('maxDiscount', parseFloat(e.target.value) || 0)} placeholder="0 = no cap"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Usage Limit</label>
              <input type="number" min="0" value={form.usageLimit} onChange={e => set('usageLimit', parseInt(e.target.value) || 0)} placeholder="0 = unlimited"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="flex items-end pb-1">
              <button type="button" onClick={() => set('isActive', !form.isActive)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${form.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Get 20% off on your first purchase"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
