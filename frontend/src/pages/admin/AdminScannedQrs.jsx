import React, { useState, useEffect, useMemo } from 'react';
import API_BASE_URL from '../../config/api';
import TablePagination from '../../components/TablePagination';
import {
  ScanSearch, Search, Filter, X, CheckCircle2, XCircle, AlertTriangle,
  Copy, Ban, MapPin, User, Calendar, QrCode, ShieldCheck, ExternalLink,
  ChevronDown, ChevronUp, Eye, Package, Clock
} from 'lucide-react';

export default function AdminScannedQrs() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(API_BASE_URL + '/scan/company/all', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setScans(data);
        }
      } catch (err) {
        console.error('Failed to load scans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const statusConfig = {
    ORIGINAL: { icon: CheckCircle2, label: 'Original', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', pillBg: 'bg-emerald-50', pillText: 'text-emerald-600', pillBorder: 'border-emerald-200' },
    FAKE: { icon: XCircle, label: 'Fake', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', pillBg: 'bg-red-50', pillText: 'text-red-600', pillBorder: 'border-red-200' },
    ALREADY_USED: { icon: Copy, label: 'Already Used', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', pillBg: 'bg-amber-50', pillText: 'text-amber-600', pillBorder: 'border-amber-200' },
    INACTIVE: { icon: Ban, label: 'Inactive', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', pillBg: 'bg-slate-50', pillText: 'text-slate-500', pillBorder: 'border-slate-200' },
  };

  const counts = useMemo(() => {
    const c = { ALL: scans.length, ORIGINAL: 0, FAKE: 0, ALREADY_USED: 0, INACTIVE: 0 };
    scans.forEach(s => { if (c[s.status] !== undefined) c[s.status]++; });
    return c;
  }, [scans]);

  const filteredScans = useMemo(() => {
    let result = [...scans];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(scan =>
        (scan.productName && scan.productName.toLowerCase().includes(q)) ||
        (scan.qrCode && scan.qrCode.toLowerCase().includes(q)) ||
        (scan.brand && scan.brand.toLowerCase().includes(q)) ||
        (scan.userId?.name && scan.userId.name.toLowerCase().includes(q)) ||
        (scan.userId?.mobile && scan.userId.mobile.includes(q)) ||
        (scan.place && scan.place.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(scan => scan.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      return 0;
    });

    return result;
  }, [scans, searchTerm, statusFilter, sortBy]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
  const clearFilters = () => { setSearchTerm(''); setStatusFilter('ALL'); setSortBy('newest'); setCurrentPage(1); };

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredScans.length / rowsPerPage));
  const paginatedScans = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredScans.slice(start, start + rowsPerPage);
  }, [filteredScans, currentPage, rowsPerPage]);

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortBy]);
  const hasFilters = searchTerm || statusFilter !== 'ALL' || sortBy !== 'newest';

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { icon: AlertTriangle, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status };
    const Icon = cfg.icon;
    return (
      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ' + cfg.bg + ' ' + cfg.text + ' ' + cfg.border}>
        <Icon size={12} strokeWidth={3} /> {cfg.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading scans...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <ScanSearch size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Scanned QRs</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">View all QR code scan activity</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10 flex-wrap">
          <div className="text-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-xl font-black text-slate-700">{counts.ALL}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="text-xl font-black text-emerald-600">{counts.ORIGINAL}</div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Original</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
            <div className="text-xl font-black text-red-600">{counts.FAKE}</div>
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Fake</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xl font-black text-amber-600">{counts.ALREADY_USED}</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Reused</div>
          </div>
          <div className="text-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-xl font-black text-slate-500">{counts.INACTIVE}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive</div>
          </div>
        </div>
      </div>

      {/* ── Status Pills ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All Scans', dot: 'bg-slate-400' },
          { key: 'ORIGINAL', label: 'Original', dot: 'bg-emerald-500' },
          { key: 'FAKE', label: 'Fake', dot: 'bg-red-500' },
          { key: 'ALREADY_USED', label: 'Already Used', dot: 'bg-amber-500' },
          { key: 'INACTIVE', label: 'Inactive', dot: 'bg-slate-400' },
        ].map(pill => {
          const active = statusFilter === pill.key;
          return (
            <button key={pill.key} onClick={() => setStatusFilter(pill.key)}
              className={'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95 ' +
                (active
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50')
              }>
              <span className={'w-2 h-2 rounded-full ' + (active ? 'bg-white' : pill.dot)} />
              {pill.label}
              <span className={'ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ' +
                (active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                {counts[pill.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex-1 min-w-[220px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product, QR, brand, user, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer active:scale-95">
            <X size={14} strokeWidth={3} /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Product & Brand</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">QR Code</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Scanned By</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Location</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <ScanSearch size={28} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-sm">No scans match your filters.</p>
                      {hasFilters && (
                        <button onClick={clearFilters}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedScans.map((scan) => {
                  const isExpanded = expandedRow === scan._id;
                  const hasLocation = scan.latitude && scan.longitude;
                  const mapsUrl = hasLocation
                    ? 'https://www.google.com/maps?q=' + scan.latitude + ',' + scan.longitude
                    : null;

                  return (
                    <React.Fragment key={scan._id}>
                      <tr className={'transition-colors cursor-pointer ' + (isExpanded ? 'bg-teal-50/30' : 'hover:bg-slate-50/50')}
                        onClick={() => setExpandedRow(isExpanded ? null : scan._id)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">{scan.productName || '-'}</p>
                              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{scan.brand || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <QrCode size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-xs font-mono font-semibold text-slate-600 truncate max-w-[120px]" title={scan.qrCode}>
                              {scan.qrCode ? (scan.qrCode.length > 16 ? scan.qrCode.slice(0, 8) + '...' + scan.qrCode.slice(-6) : scan.qrCode) : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={scan.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User size={13} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 leading-tight">
                                {scan.userId?.name || 'Anonymous'}
                              </p>
                              {scan.userId?.mobile && (
                                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{scan.userId.mobile}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {scan.place ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 truncate max-w-[130px]" title={scan.place}>{scan.place}</span>
                              {mapsUrl && (
                                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-teal-500 hover:text-teal-600 flex-shrink-0">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">No location</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{fmt(scan.createdAt)}</p>
                              <p className="text-[11px] font-medium text-slate-400">{fmtTime(scan.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={'transition-transform duration-200 ' + (isExpanded ? 'rotate-180' : '')}>
                            <ChevronDown size={16} className="text-slate-400" />
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-gradient-to-r from-teal-50/40 via-cyan-50/20 to-transparent">
                          <td colSpan="7" className="px-6 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <DetailCard icon={QrCode} label="Full QR Code" value={scan.qrCode || '-'} mono />
                              <DetailCard icon={Package} label="Product" value={scan.productName || '-'} sub={scan.brand} />
                              <DetailCard icon={User} label="Scanned By"
                                value={scan.userId?.name || 'Anonymous'}
                                sub={[scan.userId?.mobile, scan.userId?.email].filter(Boolean).join(' | ') || null} />
                              <DetailCard icon={MapPin} label="Location"
                                value={scan.place || 'Unknown'}
                                sub={hasLocation ? ('Lat: ' + Number(scan.latitude).toFixed(4) + ', Lng: ' + Number(scan.longitude).toFixed(4)) : null}
                                link={mapsUrl} />
                              <DetailCard icon={Calendar} label="Scanned On"
                                value={fmt(scan.createdAt)}
                                sub={fmtTime(scan.createdAt)} />
                              <DetailCard icon={ShieldCheck} label="Status"
                                value={statusConfig[scan.status]?.label || scan.status}
                                statusColor={statusConfig[scan.status]?.dot || 'bg-slate-400'} />
                              {scan.expiryDate && (
                                <DetailCard icon={Clock} label="Expiry Date" value={fmt(scan.expiryDate)} />
                              )}
                              {scan.productId?.batchNo && (
                                <DetailCard icon={Package} label="Batch No" value={scan.productId.batchNo} />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <TablePagination
          totalItems={scans.length}
          filteredCount={filteredScans.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          itemLabel="scans"
        />
      </div>
    </div>
  );
}

/* ── Detail Card Sub-Component ── */
function DetailCard({ icon: Icon, label, value, sub, mono, link, statusColor }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
          <Icon size={13} className="text-slate-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {statusColor && <span className={'w-2 h-2 rounded-full flex-shrink-0 ' + statusColor} />}
        <p className={'text-sm font-bold text-slate-800 leading-snug break-all ' + (mono ? 'font-mono text-xs' : '')}>
          {value}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-teal-500 hover:text-teal-600">
              <ExternalLink size={11} />
            </a>
          )}
        </p>
      </div>
      {sub && <p className="text-[11px] font-medium text-slate-400 mt-1 break-all">{sub}</p>}
    </div>
  );
}
