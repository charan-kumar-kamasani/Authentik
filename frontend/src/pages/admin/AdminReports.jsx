import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Search, MapPin, Calendar, Check, ExternalLink, ShieldCheck, ShieldX, Copy, Filter, X } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import TablePagination from '../../components/TablePagination';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tab, setTab] = useState('fake'); // 'fake' | 'duplicate'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [counterfeitFilter, setCounterfeitFilter] = useState('All');

  // Duplicate scans state
  const [dupScans, setDupScans] = useState([]);
  const [dupLoading, setDupLoading] = useState(true);
  const [dupSearch, setDupSearch] = useState('');
  const [dupStatusFilter, setDupStatusFilter] = useState('All');

  // Pagination state for both tabs
  const [fakePage, setFakePage] = useState(1);
  const [fakeRowsPerPage, setFakeRowsPerPage] = useState(10);
  const [dupPage, setDupPage] = useState(1);
  const [dupRowsPerPage, setDupRowsPerPage] = useState(10);

  useEffect(() => { fetchReports(); fetchDupScans(); }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/scan/reports/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setReports(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDupScans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/scanned-qrs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const all = await res.json();
        setDupScans(all.filter(s => s.status === 'ALREADY_USED' || s.status === 'FAKE'));
      }
    } catch (e) { console.error(e); }
    finally { setDupLoading(false); }
  };

  const toggleStatus = async (id, current) => {
    const next = current === 'Resolved' ? 'Pending' : 'Resolved';
    setReports(prev => prev.map(r => r._id === id ? { ...r, status: next } : r));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/scan/reports/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) throw new Error();
    } catch { setReports(prev => prev.map(r => r._id === id ? { ...r, status: current } : r)); }
  };

  const toggleCounterfeit = async (id, current) => {
    setReports(prev => prev.map(r => r._id === id ? { ...r, isCounterfeit: !current } : r));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/scan/reports/${id}/counterfeit`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    } catch { setReports(prev => prev.map(r => r._id === id ? { ...r, isCounterfeit: current } : r)); }
  };

  // Filtered fake reports
  const fakeReports = reports.filter(r => {
    const s = searchTerm.toLowerCase();
    if (s && !r.productName?.toLowerCase().includes(s) && !r.brand?.toLowerCase().includes(s)) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (counterfeitFilter === 'Yes' && !r.isCounterfeit) return false;
    if (counterfeitFilter === 'No' && r.isCounterfeit) return false;
    if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  // Filtered duplicate scans
  const filteredDups = dupScans.filter(s => {
    const q = dupSearch.toLowerCase();
    if (q && !s.productName?.toLowerCase().includes(q) && !s.brand?.toLowerCase().includes(q) && !s.qrCode?.toLowerCase().includes(q)) return false;
    if (dupStatusFilter !== 'All' && s.status !== dupStatusFilter) return false;
    return true;
  });

  // Paginated slices
  const paginatedFake = useMemo(() => {
    const start = (fakePage - 1) * fakeRowsPerPage;
    return fakeReports.slice(start, start + fakeRowsPerPage);
  }, [fakeReports, fakePage, fakeRowsPerPage]);
  useMemo(() => { setFakePage(1); }, [searchTerm, statusFilter, counterfeitFilter, dateFrom, dateTo]);

  const paginatedDups = useMemo(() => {
    const start = (dupPage - 1) * dupRowsPerPage;
    return filteredDups.slice(start, start + dupRowsPerPage);
  }, [filteredDups, dupPage, dupRowsPerPage]);
  useMemo(() => { setDupPage(1); }, [dupSearch, dupStatusFilter]);

  const fakeCount = reports.length;
  const dupCount = dupScans.length;
  const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  const StatusBadge = ({ status }) => {
    if (status === 'Resolved') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold"><Check size={12} strokeWidth={3} /> Resolved</span>;
    if (status === 'Investigating') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold"><Search size={12} strokeWidth={3} /> Reviewing</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-lg text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending</span>;
  };

  if (loading && dupLoading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading reports...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Incident Reports</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Manage fake product reports &amp; duplicate scans</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
            <div className="text-xl font-black text-red-600">{fakeCount}</div>
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Fake Reports</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xl font-black text-amber-600">{dupCount}</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Duplicates</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex gap-1">
          <button onClick={() => setTab('fake')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              tab === 'fake' ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <ShieldX size={15} /> Fake Reports
            <span className="text-[10px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">{fakeCount}</span>
          </button>
          <button onClick={() => setTab('duplicate')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              tab === 'duplicate' ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Copy size={15} /> Duplicate Scans
            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md">{dupCount}</span>
          </button>
        </div>
      </div>

      {/* ━━━━━ FAKE REPORTS TAB ━━━━━ */}
      {tab === 'fake' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search product or brand..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={counterfeitFilter} onChange={e => setCounterfeitFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30">
              <option value="All">Counterfeit: All</option>
              <option value="Yes">Counterfeit Only</option>
              <option value="No">Not Counterfeit</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            {(searchTerm || statusFilter !== 'All' || counterfeitFilter !== 'All' || dateFrom || dateTo) && (
              <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCounterfeitFilter('All'); setDateFrom(''); setDateTo(''); }}
                className="flex items-center gap-1 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-4">Product &amp; Brand</th>
                    <th className="px-6 py-4">Report Type</th>
                    <th className="px-6 py-4">Counterfeit</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 w-48">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {fakeReports.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><CheckCircle2 size={28} /></div>
                        <p className="font-bold text-slate-400">No reports match your filters.</p>
                      </div>
                    </td></tr>
                  ) : paginatedFake.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{r.productName || 'Unknown'}</div>
                        <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-300" />{r.brand || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          r.reportType === 'FAKE' ? 'bg-orange-100 text-orange-700' : 'bg-red-50 text-red-600'
                        }`}><AlertTriangle size={10} strokeWidth={3} /> {r.reportType || 'FLAGGED'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleCounterfeit(r._id, r.isCounterfeit)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer select-none active:scale-95 ${
                            r.isCounterfeit
                              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-sm shadow-red-500/10'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}>
                          {r.isCounterfeit ? <><ShieldX size={16} strokeWidth={2.5} className="text-red-500" /> Counterfeit</> : <><ShieldCheck size={16} strokeWidth={2.5} className="text-slate-400" /> Not Marked</>}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-[220px]">
                          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm text-slate-600 font-medium line-clamp-2">{r.place || 'Unknown'}</span>
                            {r.latitude && r.longitude && (
                              <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:text-blue-700 font-bold flex items-center gap-1 mt-0.5">
                                Open Map <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={12} /> {fmt(r.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={r.status} />
                          <div className="flex flex-col items-center gap-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={r.status === 'Resolved'} onChange={() => toggleStatus(r._id, r.status)} />
                              <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
                            </label>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Done</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              totalItems={reports.length}
              filteredCount={fakeReports.length}
              currentPage={fakePage}
              rowsPerPage={fakeRowsPerPage}
              onPageChange={setFakePage}
              onRowsPerPageChange={(n) => { setFakeRowsPerPage(n); setFakePage(1); }}
              itemLabel="reports"
            />
          </div>
        </>
      )}

      {/* ━━━━━ DUPLICATE SCANS TAB ━━━━━ */}
      {tab === 'duplicate' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={dupSearch} onChange={e => setDupSearch(e.target.value)} placeholder="Search product, brand or QR code..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <select value={dupStatusFilter} onChange={e => setDupStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              <option value="All">All Types</option>
              <option value="ALREADY_USED">Already Used</option>
              <option value="FAKE">Fake Scan</option>
            </select>
            {(dupSearch || dupStatusFilter !== 'All') && (
              <button onClick={() => { setDupSearch(''); setDupStatusFilter('All'); }}
                className="flex items-center gap-1 px-3 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Duplicate table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-4">Product &amp; Brand</th>
                    <th className="px-6 py-4">QR Code</th>
                    <th className="px-6 py-4">Scan Status</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Scanned At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredDups.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><CheckCircle2 size={28} /></div>
                        <p className="font-bold text-slate-400">No duplicate scans found.</p>
                      </div>
                    </td></tr>
                  ) : paginatedDups.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{s.productName || 'Unknown'}</div>
                        <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-300" />{s.brand || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 break-all max-w-[180px] block">{s.qrCode || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          s.status === 'FAKE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {s.status === 'FAKE' ? <><ShieldX size={10} /> Fake</> : <><Copy size={10} /> Already Used</>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-[220px]">
                          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-600 font-medium line-clamp-2">{s.place || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={12} /> {fmt(s.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              totalItems={dupScans.length}
              filteredCount={filteredDups.length}
              currentPage={dupPage}
              rowsPerPage={dupRowsPerPage}
              onPageChange={setDupPage}
              onRowsPerPageChange={(n) => { setDupRowsPerPage(n); setDupPage(1); }}
              itemLabel="scans"
            />
          </div>
        </>
      )}
    </div>
  );
}
