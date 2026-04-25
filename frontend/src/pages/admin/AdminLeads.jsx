import React, { useState, useEffect } from 'react';
import { getLeads, updateLeadStatus } from '../../config/api';
import { CheckCircle2, XCircle, Clock, PackageCheck, AlertTriangle, User, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import TablePagination from '../../components/TablePagination';
import { useLoading } from '../../context/LoadingContext';

const AdminLeads = () => {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [statusFilter, setStatusFilter] = useState('');
    const { setLoading: setGlobalLoading } = useLoading();

    const fetchLeadsData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const data = await getLeads(page, limit, statusFilter === 'All' ? '' : statusFilter, token);
            setLeads(data.leads || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadsData();
    }, [page, limit, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        // Optimistic update
        const prevLeads = [...leads];
        setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));

        setGlobalLoading(true);
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            await updateLeadStatus(id, newStatus, undefined, token);
            // Re-fetch to ensure sync with server
            await fetchLeadsData();
        } catch (e) {
            setLeads(prevLeads); // Rollback
            alert('Failed: ' + e.message);
        } finally {
            setGlobalLoading(false);
        }
    };

    const statusColors = {
        'new': 'bg-blue-50 text-blue-600 border-blue-200',
        'contacted': 'bg-amber-50 text-amber-600 border-amber-200',
        'qualified': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'lost': 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Sales Leads</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage contact and demo requests</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'new', 'contacted', 'qualified', 'lost'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${statusFilter === s || (statusFilter === '' && s === 'All') ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[11px] font-black tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Contact Detail</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Requirements</th>
                                    <th className="px-6 py-4">Status & Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">No leads found.</td>
                                    </tr>
                                ) : leads.map(l => (
                                    <tr key={l._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2"><User size={14} className="text-slate-400"/> {l.name}</div>
                                            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2"><Mail size={12} className="text-slate-400"/> {l.email}</div>
                                            {l.phone && <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2"><Phone size={12} className="text-slate-400"/> {l.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 text-sm flex items-center gap-2"><Briefcase size={14} className="text-slate-400"/> {l.company || 'Not Specified'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap max-w-xs">{l.requirements || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusColors[l.status] || 'bg-slate-50 text-slate-600'}`}>
                                                {l.status}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
                                                <Calendar size={10}/> 
                                                <span>Created: {new Date(l.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={l.status}
                                                disabled={l.status === 'qualified'}
                                                onChange={(e) => handleStatusUpdate(l._id, e.target.value)}
                                                className={`bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-slate-300 ${l.status === 'qualified' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="lost">Lost</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {total > limit && (
                        <TablePagination totalItems={total} filteredCount={leads.length} currentPage={page} rowsPerPage={limit} onPageChange={setPage} onRowsPerPageChange={setLimit} itemLabel="leads" />
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminLeads;
