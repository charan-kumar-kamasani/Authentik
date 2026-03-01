import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { useLoading } from '../../context/LoadingContext';
import TablePagination from '../../components/TablePagination';
import {
  Package, Search, Filter, X, Truck, CheckCircle2, Clock, Settings, ShieldCheck,
  FileDown, PackageCheck, Hash, Calendar, XCircle, Send, QrCode, Eye, Users,
  UserPlus, Shield, Briefcase
} from 'lucide-react';

export default function AdminDashboard() {
  const initialRole = localStorage.getItem("adminRole") || (() => {
    try {
      const ui = localStorage.getItem('userInfo');
      return ui ? JSON.parse(ui).role : (localStorage.getItem('role') || '');
    } catch (e) {
      return localStorage.getItem('role') || '';
    }
  })();

  const [role, setRole] = useState(initialRole);
  const [activeTab, setActiveTab] = useState("qrs");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: initialRole === "superadmin" ? "admin" : "manager",
  });

  const [newOrder, setNewOrder] = useState({
    productName: "", brand: "", batchNo: "", manufactureDate: "", expiryDate: "", quantity: ""
  });

  const [showDispatchModal, setShowDispatchModal] = useState(null);
  const [dispatchData, setDispatchData] = useState({ trackingNumber: '', courierName: '', notes: '' });

  const getAuthToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");
  const { setLoading: setGlobalLoading } = useLoading();

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(API_BASE_URL + "/admin/users", { headers: { Authorization: "Bearer " + token } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error('fetchUsers error', e); }
  };

  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(API_BASE_URL + "/orders", { headers: { Authorization: "Bearer " + token } });
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error('fetchOrders error', e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { navigate("/admin"); return; }
    const updatedRole = localStorage.getItem("adminRole") || (() => {
      try { const ui = localStorage.getItem('userInfo'); return ui ? JSON.parse(ui).role : (localStorage.getItem('role') || ''); } catch(e){ return localStorage.getItem('role') || ''; }
    })();
    setRole(updatedRole);
    fetchOrders();
    if (updatedRole === "superadmin" || updatedRole === "admin") fetchUsers();
  }, [navigate]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(API_BASE_URL + "/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        alert("User created successfully!");
        fetchUsers();
        setNewUser({ email: "", password: "", role: role === 'superadmin' ? 'admin' : 'manager' });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create user');
      }
    } catch (e) { alert('Failed to create user'); }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(API_BASE_URL + "/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        alert("Order created successfully! Status: Pending Authorization");
        fetchOrders();
        setNewOrder({ productName: "", brand: "", batchNo: "", manufactureDate: "", expiryDate: "", quantity: "" });
      } else {
        const err = await res.json();
        alert("Failed: " + (err.message || JSON.stringify(err)));
      }
    } catch (e) { alert('Failed to create order'); }
  };

  const updatedStatus = async (orderId, action) => {
    try {
      const token = getAuthToken();
      let endpoint = '';
      let body = null;
      if (action === 'authorize') endpoint = "/orders/" + orderId + "/authorize";
      if (action === 'process') endpoint = "/orders/" + orderId + "/process";
      if (action === 'dispatching') endpoint = "/orders/" + orderId + "/dispatching";
      if (action === 'dispatch') { endpoint = "/orders/" + orderId + "/dispatch"; body = JSON.stringify(dispatchData); }
      if (action === 'received') endpoint = "/orders/" + orderId + "/received";
      const res = await fetch(API_BASE_URL + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + token },
        body
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Status updated");
        fetchOrders();
        setShowDispatchModal(null);
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || JSON.stringify(err)));
      }
    } catch (e) { alert('Failed to update status'); }
  };

  const downloadPdf = async (orderId) => {
    setGlobalLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(API_BASE_URL + "/orders/" + orderId + "/download", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = "data:application/pdf;base64," + data.pdfBase64;
        link.download = "order_" + orderId + "_qrs.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const err = await res.json();
        alert("Download failed: " + (err.message || JSON.stringify(err)));
      }
    } catch (e) { alert('Failed to download PDF'); }
    finally { setGlobalLoading(false); }
  };

  // ── Filters & helpers ──
  const statuses = ['All', 'Pending Authorization', 'Authorized', 'Order Processing', 'Dispatching', 'Dispatched', 'Received', 'Rejected'];

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    if (q && !o.productName?.toLowerCase().includes(q) && !o.brand?.toLowerCase().includes(q) && !o.orderId?.toLowerCase().includes(q) && !o.batchNo?.toLowerCase().includes(q)) return false;
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
    'Pending Authorization': { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    'Authorized': { icon: ShieldCheck, bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
    'Order Processing': { icon: Settings, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Dispatching': { icon: Package, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Dispatched': { icon: Truck, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    'Received': { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Rejected': { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { icon: Package, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    const Icon = cfg.icon;
    return (
      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ' + cfg.bg + ' ' + cfg.text + ' ' + cfg.border}>
        <Icon size={12} strokeWidth={3} /> {status}
      </span>
    );
  };

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
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all" />
    </div>
  );

  const counts = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading inventory...</p>
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inventory &amp; QR Workflow</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Track orders from creation to receipt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl">
            <div className="text-xl font-black text-violet-600">{orders.length}</div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xl font-black text-amber-600">{counts['Pending Authorization'] || 0}</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending</div>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="text-xl font-black text-emerald-600">{counts['Received'] || 0}</div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Received</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search product, brand, batch or order ID..."
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
                <th className="px-6 py-4">Product &amp; Brand</th>
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
              ) : paginatedOrders.map(order => {

                const lastHistory = order.history && order.history.length ? order.history[order.history.length - 1] : null;
                const lastUpdated = lastHistory?.timestamp || order.updatedAt || order.createdAt;
                const receivedEntry = order.history ? order.history.find(h => h.status === 'Received') : null;
                const receivedBy = receivedEntry?.role || (receivedEntry?.changedBy && (receivedEntry.changedBy.email || receivedEntry.changedBy.name)) || null;
                const isExpanded = expandedRow === order._id;

                return (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <Hash size={10} className="inline mr-1 -mt-0.5" />{order.orderId || order._id?.slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{order.productName || 'Unknown'}</div>
                        <div className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-300" />{order.brand || order.brandName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-700">{order.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                        {order.status === 'Received' && (
                          <div className="text-[10px] text-emerald-600 font-black mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> ACTIVE</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={12} /> {fmt(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap items-center">
                          {/* Role-based actions */}
                          {['superadmin', 'admin'].includes(role) && (
                            <>
                              {order.status === 'Authorized' && (
                                <ActionBtn onClick={() => updatedStatus(order._id, 'process')} icon={Settings} label="Generate QRs" color="blue" />
                              )}
                              {order.status === 'Order Processing' && (
                                <ActionBtn onClick={() => updatedStatus(order._id, 'dispatching')} icon={PackageCheck} label="Prep Dispatch" color="orange" />
                              )}
                              {order.status === 'Dispatching' && (
                                <ActionBtn onClick={() => setShowDispatchModal(order._id)} icon={Truck} label="Dispatch" color="sky" />
                              )}
                              {order.qrCodesGenerated && role === 'superadmin' && (
                                <ActionBtn onClick={() => downloadPdf(order._id)} icon={FileDown} label="PDF" color="slate" />
                              )}
                            </>
                          )}

                          {/* View details button */}
                          <button onClick={() => setExpandedRow(isExpanded ? null : order._id)}
                            className={'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer select-none active:scale-95 shadow-sm ' +
                              (isExpanded ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}>
                            <Eye size={14} strokeWidth={2.5} /> {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan="6" className="px-6 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Batch No</div>
                              <div className="text-sm font-bold text-slate-700 font-mono">{order.batchNo || '-'}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Manufacture Date</div>
                              <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> {fmt(order.manufactureDate)}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Expiry Date</div>
                              <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> {fmt(order.expiryDate)}</div>
                            </div>
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Last Updated</div>
                              <div className="text-sm font-bold text-slate-700">{lastUpdated ? new Date(lastUpdated).toLocaleString() : '-'}</div>
                            </div>
                            {receivedBy && (
                              <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Received By</div>
                                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5"><CheckCircle2 size={13} /> {receivedBy}</div>
                              </div>
                            )}
                            {order.history && order.history.length > 0 && (
                              <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm md:col-span-2">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Status History</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {order.history.map((h, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">
                                      {h.status}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
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
          totalItems={orders.length}
          filteredCount={filtered.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          itemLabel="orders"
        />
      </div>

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
                <button onClick={() => updatedStatus(showDispatchModal, 'dispatch')}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Truck size={16} /> Dispatch Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
