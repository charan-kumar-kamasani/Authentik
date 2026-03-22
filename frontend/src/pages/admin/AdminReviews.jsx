import React, { useState, useEffect, useMemo } from 'react';
import { Star, Search, Filter, Calendar, User, Package, MessageSquare, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getAllReviews } from '../../config/api';
import TablePagination from '../../components/TablePagination';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews(token);
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = 
        (r.comment?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.productId?.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRating = ratingFilter === 'All' || r.rating === Number(ratingFilter);
      
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredReviews.slice(start, start + rowsPerPage);
  }, [filteredReviews, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length
    };
  }, [reviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Product Reviews</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Manage consumer feedback and ratings</p>
          </div>
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="text-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xl font-black text-amber-600">{stats.avg}</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Avg Rating</div>
          </div>
          <div className="text-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-xl font-black text-slate-600">{stats.total}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400"><Filter size={16} /><span className="text-xs font-black uppercase tracking-wider">Filters</span></div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search comment, product or user..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30" 
          />
        </div>
        <select 
          value={ratingFilter} 
          onChange={e => setRatingFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="All">All Ratings</option>
          {[5, 4, 3, 2, 1].map(num => (
            <option key={num} value={num}>{num} Stars</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="px-4 py-4 w-12"></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
                        <MessageSquare size={28} />
                      </div>
                      <p className="font-bold text-slate-400">No reviews match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedReviews.map(review => (
                <React.Fragment key={review._id}>
                  <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleRow(review._id)}>
                    <td className="px-4 py-4 text-center">
                      <button className="text-slate-400">
                        {expandedRows.has(review._id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {review.userId?.name?.charAt(0) || <User size={14} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{review.userId?.name || 'Guest User'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{review.userId?.mobile || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{review.productId?.productName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{review.productId?.brand || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            size={14} 
                            fill={s <= review.rating ? '#f59e0b' : 'none'} 
                            className={s <= review.rating ? 'text-amber-500' : 'text-slate-200'} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 line-clamp-1 max-w-[300px]">{review.comment || 'No comment provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Calendar size={12} /> 
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(review._id) && (
                    <tr className="bg-slate-50/30">
                      <td colSpan="6" className="px-12 py-6">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                              <MessageSquare size={14} className="text-amber-500" /> Review Details
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">ID: {review._id}</span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed italic border-l-4 border-amber-400">
                            "{review.comment || 'No comment provided'}"
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opted in for offers</div>
                              <div className={`text-xs font-bold flex items-center gap-1.5 ${review.optIn ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <CheckCircle2 size={14} /> {review.optIn ? 'YES' : 'NO'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Scan</div>
                              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Package size={14} className="text-blue-500" /> AUTHENTIC
                              </div>
                            </div>
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
          totalItems={reviews.length}
          filteredCount={filteredReviews.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          itemLabel="reviews"
        />
      </div>
    </div>
  );
}
