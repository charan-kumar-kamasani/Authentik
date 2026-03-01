import React, { useEffect, useState, useMemo } from 'react';
import API_BASE_URL from '../../config/api';
import TablePagination from '../../components/TablePagination';
import {
  QrCode, Search, Filter, X, CheckCircle2, XCircle, Calendar, Eye, Hash, Image, Package, Clock
} from 'lucide-react';

export default function QrManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [previewImg, setPreviewImg] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const res = await fetch(API_BASE_URL + '/admin/qrs', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || 'Failed to fetch products');
        }
        setProducts(await res.json());
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const statuses = ['All', 'Active', 'Inactive'];

  const filtered = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const brandName = p.brand || (p.brandId && (p.brandId.brandName || p.brandId)) || '';
    if (q && !p.productName?.toLowerCase().includes(q) && !String(brandName).toLowerCase().includes(q) && !p.batchNo?.toLowerCase().includes(q) && !p.qrCode?.toLowerCase().includes(q)) return false;
    if (statusFilter === 'Active' && !p.isActive) return false;
    if (statusFilter === 'Inactive' && p.isActive) return false;
    return true;
  });

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);
  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const activeCount = products.filter(p => p.isActive).length;
  const inactiveCount = products.filter(p => !p.isActive).length;
  const counts = { All: products.length, Active: activeCount, Inactive: inactiveCount };

  const fmt = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  const statusConfig = {
    Active: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    Inactive: { icon: XCircle, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
  };

  const StatusBadge = ({ isActive }) => {
    const cfg = isActive ? statusConfig.Active : statusConfig.Inactive;
    const Icon = cfg.icon;
    return (
      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ' + cfg.bg + ' ' + cfg.text + ' ' + cfg.border}>
        <Icon size={12} strokeWidth={3} /> {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading QR codes...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center"><XCircle size={28} /></div>
        <p className="font-bold text-red-500">Error: {error}</p>
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
            <QrCode size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">QR Management</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Browse and manage all QR codes &amp; products</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl">
            <div className="text-xl font-black text-violet-600">{products.length}</div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="text-xl font-black text-emerald-600">{activeCount}</div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</div>
          </div>
          <div className="text-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xl font-black text-slate-500">{inactiveCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search product, brand, batch or QR code..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30">
          {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        {(searchTerm || statusFilter !== 'All') && (
          <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
            className="flex items-center gap-1 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Status pills — same style as Order Management */}
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

      {/* Table — same structure as Order Management (6 clean columns) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="px-6 py-4">Batch No</th>
                <th className="px-6 py-4">Product &amp; Brand</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><QrCode size={28} /></div>
                    <p className="font-bold text-slate-400">No QR codes match your filters.</p>
                  </div>
                </td></tr>
              ) : paginatedProducts.map(p => {
                const brandName = p.brand || (p.brandId && (p.brandId.brandName || p.brandId)) || '-';
                const img = p.productImage || p.image || p.imageUrl || p.brandLogo || '';
                const isExpanded = expandedRow === p._id;
                return (
                  <React.Fragment key={p._id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <Hash size={10} className="inline mr-1 -mt-0.5" />{p.batchNo || p._id?.slice(-8) || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <button onClick={() => setPreviewImg(img)} className="group relative shrink-0 cursor-pointer">
                              <img src={img} alt={p.productName} className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all flex items-center justify-center">
                                <Eye size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                              <Image size={14} className="text-slate-300" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{p.productName || '-'}</div>
                            <div className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-slate-300" />{brandName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-700">{p.quantity ?? '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge isActive={p.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={12} /> {fmt(p.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => setExpandedRow(isExpanded ? null : p._id)}
                            className={'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer select-none active:scale-95 shadow-sm ' +
                              (isExpanded ? 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}>
                            <Eye size={14} strokeWidth={2.5} /> {isExpanded ? 'Hide' : 'View'}
                          </button>
                          {p.qrCode && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(p.qrCode); }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer select-none active:scale-95 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm">
                              <QrCode size={14} strokeWidth={2.5} /> Copy QR
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan="6" className="px-6 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Manufacture Date</div>
                              <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> {fmt(p.manufactureDate)}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Expiry Date</div>
                              <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> {fmt(p.expiryDate)}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">QR Code</div>
                              <div className="font-mono text-[11px] text-slate-600 break-all leading-relaxed">{p.qrCode || '-'}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Product Image</div>
                              {img ? (
                                <button onClick={() => setPreviewImg(img)} className="group relative cursor-pointer">
                                  <img src={img} alt={p.productName} className="w-full h-16 object-cover rounded-lg border border-slate-200 group-hover:shadow-md transition-shadow" />
                                </button>
                              ) : (
                                <div className="w-full h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                                  <span className="text-xs text-slate-400 font-medium">No image</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          totalItems={products.length}
          filteredCount={filtered.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          itemLabel="products"
        />
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImg(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 z-10">
              <X size={16} />
            </button>
            <img src={previewImg} alt="Product" className="w-full rounded-2xl shadow-2xl border-4 border-white" />
          </div>
        </div>
      )}
    </div>
  );
}
