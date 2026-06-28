import React, { useState } from 'react';
import { Package, AlertCircle, X, Send } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function StockRequestModal({ isOpen, onClose }) {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const qty = parseInt(quantity);
    if (!qty || qty < 5000) {
      setError('Minimum request quantity is 5000.');
      return;
    }
    if (qty % 1000 !== 0) {
      setError('Quantity must be in multiples of 1000 (e.g., 5000, 6000, 7000).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stock-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: qty, notes })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Stock request submitted successfully. Superadmin will review and assign QRs soon.');
        setTimeout(() => {
          onClose();
          setSuccess('');
          setQuantity('');
          setNotes('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Request QR Stock</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">From Superadmin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="text-red-700 text-sm font-medium">{error}</div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div className="text-emerald-700 text-sm font-medium">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Quantity Required</label>
              <input
                type="number"
                min="5000"
                step="1000"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <p className="text-xs text-slate-500 mt-2">
                Minimum 5000 QRs. Requests must be in increments of 1000 (e.g., 5000, 6000, 7000).
              </p>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special instructions or urgency..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all ${
                submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
