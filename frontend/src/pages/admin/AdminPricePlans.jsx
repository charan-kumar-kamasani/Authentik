import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Edit2, Trash2, Star, Settings2, Eye, EyeOff, Sliders, Calendar } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const GRADIENTS = {
  Trial: 'from-slate-500 to-slate-700',
  Starter: 'from-emerald-500 to-green-600',
  Growth: 'from-blue-500 to-indigo-600',
  Scale: 'from-purple-500 to-violet-600',
  Shield: 'from-slate-800 to-gray-950',
};

const CYCLE_KEYS = ['monthly', 'quarterly', 'yearly'];
const CYCLE_COLORS = { monthly: 'amber', quarterly: 'blue', yearly: 'emerald' };
const CYCLE_ICONS = { monthly: '1M', quarterly: '3M', yearly: '1Y' };

const DEFAULT_CONFIG = {
  monthlyMultiplier: 1.3, quarterlyMultiplier: 1.1, yearlyMultiplier: 1.0,
  monthlyLabel: 'Monthly', quarterlyLabel: 'Quarterly', yearlyLabel: 'Yearly',
};

const emptyCyclePricing = () => ({ pricePerQr: 0, validity: '-', saveText: '-' });

export default function AdminPricePlans() {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState('yearly');
  const [preview, setPreview] = useState(false);
  const [billingConfig, setBillingConfig] = useState(DEFAULT_CONFIG);
  const [configModal, setConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState(DEFAULT_CONFIG);
  const [configSaving, setConfigSaving] = useState(false);

  const [featModal, setFeatModal] = useState(false);
  const [newFeat, setNewFeat] = useState({ name: '', type: 'boolean' });

  const [planModal, setPlanModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', pricePerQr: 0, qrCodes: '', minQrPerOrder: '',
    planValidity: '', isPopular: false, isTrial: false, saveText: '',
    pricing: {
      monthly: emptyCyclePricing(),
      quarterly: emptyCyclePricing(),
      yearly: emptyCyclePricing(),
    },
    features: [],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const h = { Authorization: `Bearer ${token}` };
      const [pRes, fRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/plans/plans`, { headers: h }),
        fetch(`${API_BASE_URL}/plans/features`, { headers: h }),
        fetch(`${API_BASE_URL}/plans/billing-config`, { headers: h }),
      ]);
      if (pRes.ok) setPlans(await pRes.json());
      if (fRes.ok) setFeatures(await fRes.json());
      if (cRes.ok) { const cfg = await cRes.json(); setBillingConfig(cfg); setConfigForm(cfg); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cycleLabel = (key) => {
    if (key === 'monthly') return billingConfig.monthlyLabel || 'Monthly';
    if (key === 'quarterly') return billingConfig.quarterlyLabel || 'Quarterly';
    return billingConfig.yearlyLabel || 'Yearly';
  };

  // Get the price for a plan for the active cycle
  const getPlanPrice = (plan) => {
    const cp = plan.pricing?.[cycle];
    if (cp && cp.pricePerQr !== undefined && cp.pricePerQr !== null) return cp.pricePerQr;
    return plan.pricePerQr ?? 0;
  };

  // Get the validity for a plan for the active cycle
  const getPlanValidity = (plan) => {
    const cp = plan.pricing?.[cycle];
    if (cp && cp.validity && cp.validity !== '-') return cp.validity;
    return plan.planValidity || '-';
  };

  // Get the save text for a plan for the active cycle
  const getPlanSave = (plan) => {
    const cp = plan.pricing?.[cycle];
    if (cp && cp.saveText && cp.saveText !== '-') return cp.saveText;
    return plan.saveText || '-';
  };

  /* ─── Config ─── */
  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/plans/billing-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(configForm),
      });
      if (res.ok) { const cfg = await res.json(); setBillingConfig(cfg); setConfigModal(false); }
    } catch (e) { console.error(e); }
    finally { setConfigSaving(false); }
  };

  /* ─── Feature CRUD ─── */
  const saveFeature = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/plans/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newFeat),
    });
    if (res.ok) { setNewFeat({ name: '', type: 'boolean' }); setFeatModal(false); fetchAll(); }
  };

  const delFeature = async (id) => {
    if (!window.confirm('Delete this feature from all plans?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_BASE_URL}/plans/features/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  /* ─── Plan CRUD ─── */
  const openPlan = (plan = null) => {
    if (plan) {
      setEditId(plan._id);
      setForm({
        name: plan.name, pricePerQr: plan.pricePerQr, qrCodes: plan.qrCodes || '',
        minQrPerOrder: plan.minQrPerOrder || '', planValidity: plan.planValidity || '',
        isPopular: plan.isPopular, isTrial: plan.isTrial || false, saveText: plan.saveText || '',
        pricing: {
          monthly:   plan.pricing?.monthly   || emptyCyclePricing(),
          quarterly: plan.pricing?.quarterly || emptyCyclePricing(),
          yearly:    plan.pricing?.yearly    || emptyCyclePricing(),
        },
        features: plan.features.map(f => ({ featureId: f.featureId?._id || f.featureId, value: f.value })),
      });
    } else {
      setEditId(null);
      setForm({
        name: '', pricePerQr: 0, qrCodes: '', minQrPerOrder: '', planValidity: '', isPopular: false, isTrial: false, saveText: '',
        pricing: { monthly: emptyCyclePricing(), quarterly: emptyCyclePricing(), yearly: emptyCyclePricing() },
        features: [],
      });
    }
    setPlanModal(true);
  };

  const setCF = (cyc, field, val) => {
    setForm(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [cyc]: { ...prev.pricing[cyc], [field]: val } },
    }));
  };

  const setFV = (fid, val) => {
    setForm(prev => {
      const arr = [...prev.features];
      const idx = arr.findIndex(f => f.featureId === fid);
      if (idx >= 0) arr[idx].value = val; else arr.push({ featureId: fid, value: val });
      return { ...prev, features: arr };
    });
  };

  const savePlan = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editId ? `${API_BASE_URL}/plans/plans/${editId}` : `${API_BASE_URL}/plans/plans`;
    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: form.pricePerQr }),
    });
    if (res.ok) { setPlanModal(false); fetchAll(); }
  };

  const delPlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_BASE_URL}/plans/plans/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const grad = (name) => GRADIENTS[name] || 'from-blue-500 to-blue-600';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading pricing engine...</p>
      </div>
    </div>
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* ─── HEADER ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Subscription Plans</h2>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Configure pricing tiers, features &amp; billing cycles</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setPreview(!preview)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${preview ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {preview ? <EyeOff size={16} /> : <Eye size={16} />}
            {preview ? 'Admin View' : 'Preview'}
          </button>
          <button onClick={() => { setConfigForm(billingConfig); setConfigModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-slate-300 transition-all">
            <Sliders size={16} /> Billing Config
          </button>
          <button onClick={() => setFeatModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-slate-300 transition-all">
            <Settings2 size={16} /> Add Feature
          </button>
          <button onClick={() => openPlan()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={16} strokeWidth={3} /> New Plan
          </button>
        </div>
      </div>

      {/* ─── BILLING CYCLE TABS ─── */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex gap-1 items-center">
          {CYCLE_KEYS.map(key => {
            const label = cycleLabel(key);
            const isActive = cycle === key;
            const colr = CYCLE_COLORS[key];
            return (
              <button key={key} onClick={() => setCycle(key)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  isActive ? `bg-${colr}-100 text-${colr}-700` : 'bg-slate-200 text-slate-500'
                }`}>{CYCLE_ICONS[key]}</span>
                {label}
                {key === 'yearly' && (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">BEST</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━━━━━━━ PREVIEW MODE ━━━━━━━━━ */}
      {preview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {plans.map(plan => {
            const popular = plan.isPopular;
            const price = getPlanPrice(plan);
            const validity = getPlanValidity(plan);
            const save = getPlanSave(plan);
            return (
              <div key={plan._id} className={`relative bg-white rounded-2xl border-2 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                popular ? 'border-purple-300 shadow-xl shadow-purple-500/10 scale-[1.02] z-10' : 'border-slate-200 shadow-sm'
              }`}>
                {popular && (
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-[10px] font-black text-center py-1.5 uppercase tracking-widest rounded-t-xl">
                    Most Popular
                  </div>
                )}
                <div className={`bg-gradient-to-br ${grad(plan.name)} text-white p-6 text-center ${!popular ? 'rounded-t-xl' : ''}`}>
                  {plan.isTrial && <div className="text-[10px] font-black bg-white/20 inline-block px-2 py-0.5 rounded mb-2 uppercase tracking-wider">Trial Plan</div>}
                  <div className="text-2xl font-black">{plan.name}</div>
                  <div className="mt-3 flex items-baseline justify-center gap-0.5">
                    <span className="text-lg font-bold opacity-80">&#8377;</span>
                    <span className="text-5xl font-black tracking-tighter">{price}</span>
                  </div>
                  <div className="text-sm opacity-80 font-semibold mt-1">per QR Code</div>
                  {save && save !== '-' && (
                    <div className="mt-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-md inline-block uppercase tracking-wide">
                      Save &#8377; {save}
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="space-y-2.5 text-sm mb-4 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">QR Codes</span>
                      <span className="font-black text-slate-800">{plan.qrCodes || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Min / Order</span>
                      <span className="font-black text-slate-800">{plan.minQrPerOrder || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1"><Calendar size={12} /> Validity</span>
                      <span className="font-black text-slate-800">{validity && validity !== '-' ? `${validity} days` : '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {features.map(feat => {
                      const pf = plan.features.find(f => (f.featureId?._id || f.featureId) === feat._id);
                      const val = pf?.value;
                      const isOff = !pf || val === false || val === 'false';
                      return (
                        <div key={feat._id} className="flex items-center gap-2.5 text-sm">
                          {isOff ? (
                            <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                              <X size={11} className="text-red-300" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                              <Check size={11} className="text-emerald-600" strokeWidth={3} />
                            </div>
                          )}
                          <span className={isOff ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>{feat.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className={`mt-5 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    popular
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>Get Started</button>
                </div>
              </div>
            );
          })}
          {plans.length === 0 && <div className="col-span-full text-center py-20 text-slate-400"><p className="font-bold">No plans yet.</p></div>}
        </div>
      ) : (

        /* ━━━━━━━━━ ADMIN TABLE MODE ━━━━━━━━━ */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="p-5 border-b border-r border-slate-100 bg-slate-50/80 text-left w-56 min-w-[220px] sticky left-0 z-10 backdrop-blur-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Feature Matrix</div>
                    <div className="text-sm font-black text-slate-700">Plans &rarr;</div>
                  </th>
                  {plans.map(plan => {
                    const price = getPlanPrice(plan);
                    const save = getPlanSave(plan);
                    return (
                      <th key={plan._id} className={`border-b border-slate-100 text-center min-w-[170px] relative group ${plan.isPopular ? 'bg-purple-50/20' : ''}`}>
                        {plan.isPopular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-b-sm" />}
                        {plan.isPopular && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest z-10 whitespace-nowrap shadow-md shadow-purple-500/30 flex items-center gap-1">
                            <Star size={9} fill="currentColor" /> Most Popular
                          </div>
                        )}
                        <div className={`mx-2 mt-5 mb-2 p-4 rounded-xl bg-gradient-to-br ${grad(plan.name)} text-white shadow-md`}>
                          {plan.isTrial && <div className="text-[9px] font-black bg-white/20 inline-block px-1.5 py-0.5 rounded mb-1 uppercase">Trial</div>}
                          <div className="font-black text-lg tracking-tight">{plan.name}</div>
                          <div className="flex items-baseline justify-center gap-0.5 mt-1">
                            <span className="text-sm opacity-80 font-bold">&#8377;</span>
                            <span className="text-3xl font-black">{price}</span>
                          </div>
                          <div className="text-[10px] opacity-75 font-bold mt-0.5">per QR &middot; {cycleLabel(cycle)}</div>
                          {save && save !== '-' && (
                            <div className="text-[9px] font-black bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded mt-2 inline-block uppercase">
                              SAVE &#8377; {save}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center gap-1.5 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openPlan(plan)} title="Edit" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => delPlan(plan._id)} title="Delete" className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Price per QR (cycle) */}
                <tr className="border-b border-slate-100/50 bg-blue-50/20">
                  <td className="px-5 py-3.5 border-r border-slate-100 bg-blue-50/40 text-sm font-bold text-blue-700 sticky left-0 backdrop-blur-sm">
                    Price per QR ({cycleLabel(cycle)})
                  </td>
                  {plans.map(plan => (
                    <td key={plan._id} className={`px-5 py-3.5 text-center text-sm font-black text-blue-700 ${plan.isPopular ? 'bg-purple-50/10' : ''}`}>
                      &#8377;{getPlanPrice(plan)}
                    </td>
                  ))}
                </tr>
                {/* Validity (cycle) */}
                <tr className="border-b border-slate-100/50 bg-emerald-50/20">
                  <td className="px-5 py-3.5 border-r border-slate-100 bg-emerald-50/40 text-sm font-bold text-emerald-700 sticky left-0 backdrop-blur-sm flex items-center gap-1.5">
                    <Calendar size={14} /> Validity ({cycleLabel(cycle)})
                  </td>
                  {plans.map(plan => {
                    const v = getPlanValidity(plan);
                    return (
                      <td key={plan._id} className={`px-5 py-3.5 text-center text-sm font-black text-emerald-700 ${plan.isPopular ? 'bg-purple-50/10' : ''}`}>
                        {v && v !== '-' ? `${v} days` : '-'}
                      </td>
                    );
                  })}
                </tr>
                {/* Save (cycle) */}
                <tr className="border-b border-slate-100/50 bg-amber-50/20">
                  <td className="px-5 py-3.5 border-r border-slate-100 bg-amber-50/40 text-sm font-bold text-amber-700 sticky left-0 backdrop-blur-sm">
                    Save ({cycleLabel(cycle)})
                  </td>
                  {plans.map(plan => {
                    const s = getPlanSave(plan);
                    return (
                      <td key={plan._id} className={`px-5 py-3.5 text-center text-sm font-black text-amber-700 ${plan.isPopular ? 'bg-purple-50/10' : ''}`}>
                        {s && s !== '-' ? `&#8377;${s}` : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Static plan details */}
                {[
                  { label: 'No. of QR Codes', key: 'qrCodes' },
                  { label: 'Min. QR Codes / Order', key: 'minQrPerOrder' },
                ].map(row => (
                  <tr key={row.key} className="border-b border-slate-100/50">
                    <td className="px-5 py-3.5 border-r border-slate-100 bg-slate-50/40 text-sm font-bold text-slate-600 sticky left-0 backdrop-blur-sm">{row.label}</td>
                    {plans.map(plan => (
                      <td key={plan._id} className={`px-5 py-3.5 text-center text-sm font-black text-slate-700 ${plan.isPopular ? 'bg-purple-50/10' : ''}`}>
                        {plan[row.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Divider */}
                <tr><td colSpan={plans.length + 1} className="h-2 bg-slate-50/60 border-y border-slate-100/50" /></tr>

                {/* Feature rows */}
                {features.map(feat => (
                  <tr key={feat._id} className="border-b border-slate-100/50 hover:bg-slate-50/30 transition-colors group/row">
                    <td className="px-5 py-3.5 border-r border-slate-100 bg-white text-sm font-semibold text-slate-600 sticky left-0 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 italic">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          {feat.name}
                        </span>
                        <button onClick={() => delFeature(feat._id)} className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-600 p-1 rounded transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                    {plans.map(plan => {
                      const pf = plan.features.find(f => (f.featureId?._id || f.featureId) === feat._id);
                      const val = pf?.value;
                      let cell;
                      if (!pf || val === false || val === 'false') {
                        cell = <div className="w-7 h-7 mx-auto rounded-full bg-red-50 flex items-center justify-center border border-red-100"><X size={14} className="text-red-300" strokeWidth={3} /></div>;
                      } else if (val === true || val === 'true') {
                        cell = <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200"><Check size={14} className="text-emerald-600" strokeWidth={3} /></div>;
                      } else {
                        cell = <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">{String(val)}</span>;
                      }
                      return <td key={plan._id + feat._id} className={`px-5 py-3.5 text-center ${plan.isPopular ? 'bg-purple-50/10' : ''}`}>{cell}</td>;
                    })}
                  </tr>
                ))}

                {features.length === 0 && (
                  <tr><td colSpan={plans.length + 1} className="p-12 text-center text-slate-400 text-sm font-medium">No features configured.</td></tr>
                )}

                {plans.length > 0 && (
                  <tr className="bg-slate-50/50">
                    <td className="px-5 py-4 border-r border-slate-100 sticky left-0 backdrop-blur-sm" />
                    {plans.map(plan => (
                      <td key={plan._id} className="px-5 py-4 text-center">
                        <div className={`mx-auto inline-block px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                          plan.isPopular ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}>Get Started</div>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── FEATURE MODAL ─── */}
      {featModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={saveFeature} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button type="button" onClick={() => setFeatModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl"><Settings2 size={18} /></div>
              Add Feature
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">Feature Name</label>
                <input required value={newFeat.name} onChange={e => setNewFeat({ ...newFeat, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="e.g. Geo Analytics" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">Type</label>
                <select value={newFeat.type} onChange={e => setNewFeat({ ...newFeat, type: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all">
                  <option value="boolean">Checkmark (Yes / No)</option>
                  <option value="string">Custom Text Value</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95">Save Feature</button>
          </form>
        </div>
      )}

      {/* ─── PLAN MODAL ─── */}
      {planModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={savePlan} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-xl"><Plus size={18} /></div>
                {editId ? 'Edit Plan' : 'Create Plan'}
              </h3>
              <button type="button" onClick={() => setPlanModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={22} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* Core Details */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Core Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Plan Name</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Growth" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">No. of QR Codes</label>
                    <input value={form.qrCodes} onChange={e => setForm({ ...form, qrCodes: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="25,000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Min QR / Order</label>
                    <input value={form.minQrPerOrder} onChange={e => setForm({ ...form, minQrPerOrder: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1,000" />
                  </div>
                </div>
              </div>

              {/* Per-Cycle Pricing */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" /> Pricing per Billing Cycle
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {CYCLE_KEYS.map(cyc => {
                    const colr = CYCLE_COLORS[cyc];
                    const cp = form.pricing[cyc] || emptyCyclePricing();
                    return (
                      <div key={cyc} className={`rounded-xl border-2 overflow-hidden ${
                        colr === 'amber' ? 'border-amber-200 bg-amber-50/30' :
                        colr === 'blue' ? 'border-blue-200 bg-blue-50/30' :
                        'border-emerald-200 bg-emerald-50/30'
                      }`}>
                        <div className={`px-4 py-2.5 text-center font-black text-sm uppercase tracking-wider ${
                          colr === 'amber' ? 'bg-amber-100 text-amber-800' :
                          colr === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cycleLabel(cyc)}
                        </div>
                        <div className="p-3 space-y-3">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Price / QR (&#8377;)</label>
                            <input type="number" step="0.01" min="0"
                              value={cp.pricePerQr ?? 0}
                              onChange={e => setCF(cyc, 'pricePerQr', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Validity (Days)</label>
                            <input
                              value={cp.validity ?? '-'}
                              onChange={e => setCF(cyc, 'validity', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              placeholder="e.g. 30, 90, 365" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Save Text</label>
                            <input
                              value={cp.saveText ?? '-'}
                              onChange={e => setCF(cyc, 'saveText', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              placeholder="e.g. 25k or -" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all select-none ${form.isPopular ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="hidden" />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${form.isPopular ? 'bg-purple-600 text-white' : 'bg-slate-200 text-transparent'}`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className={`font-bold text-sm ${form.isPopular ? 'text-purple-800' : 'text-slate-600'}`}>Most Popular</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all select-none ${form.isTrial ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <input type="checkbox" checked={form.isTrial} onChange={e => setForm({ ...form, isTrial: e.target.checked })} className="hidden" />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${form.isTrial ? 'bg-amber-500 text-white' : 'bg-slate-200 text-transparent'}`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className={`font-bold text-sm ${form.isTrial ? 'text-amber-800' : 'text-slate-600'}`}>Trial Plan</span>
                </label>
              </div>

              {/* Feature allocation */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" /> Feature Allocation
                </h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                  {features.map(f => {
                    const cur = form.features.find(pf => pf.featureId === f._id)?.value ?? (f.type === 'boolean' ? false : '');
                    return (
                      <div key={f._id} className="flex items-center justify-between p-3.5 hover:bg-white transition-colors">
                        <span className="text-sm font-bold text-slate-700">{f.name}</span>
                        {f.type === 'boolean' ? (
                          <select value={String(cur)} onChange={e => setFV(f._id, e.target.value === 'true')}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="false">&#10006; Excluded</option>
                            <option value="true">&#10004; Included</option>
                          </select>
                        ) : (
                          <input value={cur} onChange={e => setFV(f._id, e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-40 font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Value" />
                        )}
                      </div>
                    );
                  })}
                  {features.length === 0 && <div className="p-6 text-center text-slate-400 text-sm font-medium">No features yet.</div>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl bg-white">
              <button type="button" onClick={() => setPlanModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                <Check size={16} strokeWidth={3} /> {editId ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── BILLING CONFIG MODAL ─── */}
      {configModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button type="button" onClick={() => setConfigModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <div className="w-9 h-9 bg-violet-100 text-violet-600 flex items-center justify-center rounded-xl"><Sliders size={18} /></div>
              Billing Cycle Labels
            </h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Customize the tab labels shown to users.</p>
            <div className="space-y-4">
              {[
                { key: 'monthlyLabel',   label: 'Monthly Tab', color: 'amber' },
                { key: 'quarterlyLabel',  label: 'Quarterly Tab', color: 'blue' },
                { key: 'yearlyLabel',     label: 'Yearly Tab', color: 'emerald' },
              ].map(c => (
                <div key={c.key}>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">{c.label}</label>
                  <input value={configForm[c.key] || ''} onChange={e => setConfigForm({ ...configForm, [c.key]: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              ))}
            </div>
            <button onClick={saveConfig} disabled={configSaving}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {configSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={16} strokeWidth={3} /> Save Labels</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
