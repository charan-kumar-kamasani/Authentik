import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function TablePagination({
  totalItems,
  filteredCount,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  itemLabel = 'items',
}) {
  const totalPages = Math.max(1, Math.ceil(filteredCount / rowsPerPage));
  const start = filteredCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, filteredCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Left: rows per page + info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rows</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300/50"
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <p className="text-xs font-bold text-slate-400">
          Showing <span className="text-slate-600">{start}-{end}</span> of <span className="text-slate-600">{filteredCount}</span> {itemLabel}
          {filteredCount !== totalItems && (
            <span className="text-slate-300"> (filtered from {totalItems})</span>
          )}
        </p>
      </div>

      {/* Right: page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="First page"
          >
            <ChevronsLeft size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous page"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>

          {getPageNumbers()[0] > 1 && (
            <span className="px-1 text-slate-300 text-xs">...</span>
          )}

          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={'min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all ' +
                (page === currentPage
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
              }
            >
              {page}
            </button>
          ))}

          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <span className="px-1 text-slate-300 text-xs">...</span>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next page"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Last page"
          >
            <ChevronsRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
