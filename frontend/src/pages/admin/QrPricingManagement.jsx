import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Info
} from "lucide-react";
import API_BASE_URL from "../../config/api";
import { useConfirm } from "../../components/ConfirmModal";

export default function QrPricingManagement() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brackets, setBrackets] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const confirm = useConfirm();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/plans/billing-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBrackets(data.qrPricingBrackets || []);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load pricing brackets.");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/plans/billing-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrPricingBrackets: brackets }),
      });
      if (res.ok) {
        setMessage("Pricing brackets updated successfully!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError("Failed to save changes.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const addBracket = () => {
    const last = brackets[brackets.length - 1];
    const newMin = last && last.maxQuantity ? last.maxQuantity + 1 : 0;
    setBrackets([...brackets, { minQuantity: newMin, maxQuantity: null, pricePerQr: 0 }]);
  };

  const removeBracket = async (idx) => {
    if (await confirm("Are you sure you want to remove this pricing bracket?")) {
      setBrackets(brackets.filter((_, i) => i !== idx));
    }
  };

  const updateBracket = (idx, field, val) => {
    const newBrackets = [...brackets];
    newBrackets[idx][field] = val;
    setBrackets(newBrackets);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800">
                QR Volume Pricing
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                Billing Engine <ChevronRight size={12} /> Global Config
              </div>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Manage your volume-based authentication pricing. These brackets automatically calculate the unit price for new orders based on the requested quantity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addBracket}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Add Bracket
          </button>
          <button
            disabled={saving}
            onClick={saveConfig}
            className={`px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/25 ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} strokeWidth={2.5} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-3xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Layers size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Active Brackets</p>
            <h3 className="text-4xl font-black">{brackets.length}</h3>
            <p className="text-blue-200 text-[10px] font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 size={12} /> Auto-synced to public website
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">How it works</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Volume-based discount logic</p>
                </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                The system checks where the order quantity falls. For example, an order of 25,000 QR codes will use the rate defined in the 5k-50k bracket.
            </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            {message && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-in zoom-in-95 duration-300">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm uppercase tracking-tight">Success</p>
                        <p className="text-xs font-bold opacity-80">{message}</p>
                    </div>
                </div>
            )}
            {!message && !error && (
                <div className="flex flex-col items-center justify-center text-center">
                    <HelpCircle size={32} className="text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting actions...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={24} className="shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}
        </div>
      </div>

      {/* Brackets List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest w-12 text-center italic">#</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Quantity Range</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rate (Per QR)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brackets.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 whitespace-nowrap">Min Quantity</label>
                        <input
                          type="number"
                          value={b.minQuantity}
                          onChange={(e) => updateBracket(idx, "minQuantity", parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="text-slate-300 font-black pt-5">&rarr;</div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 whitespace-nowrap">Max Quantity</label>
                        <input
                          type="number"
                          value={b.maxQuantity || ""}
                          placeholder="Infinity (Keep empty)"
                          onChange={(e) => updateBracket(idx, "maxQuantity", parseInt(e.target.value) || null)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[120px]">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 whitespace-nowrap">Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={b.pricePerQr}
                          onChange={(e) => updateBracket(idx, "pricePerQr", parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => removeBracket(idx)}
                      className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Bracket"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {brackets.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Layers size={48} className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No brackets configured</p>
                      <button 
                        onClick={addBracket}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                      >
                        Create your first pricing bracket
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Syncing Brackets...</p>
          </div>
        </div>
      )}
    </div>
  );
}
