import React from 'react';
import { 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  ShieldCheck, 
  Package,
  Edit,
  Plus,
  ArrowLeft,
  Briefcase
} from 'lucide-react';

export default function CompanyProfileView({
  company,
  brands,
  staff,
  onEditCompany,
  onEditBrand,
  onEditUser,
  onAddBrand,
  onAddUser,
  onBack
}) {
  if (!company) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Companies
        </button>
        <button 
          onClick={() => onEditCompany(company)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors"
        >
          <Edit size={16} /> Edit Company Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Company Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Building size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">{company.companyName}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">{company.legalEntity}</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Globe size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium break-all">
                  {company.companyWebsite || company.website || 'No website provided'}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Mail size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium break-all">
                  {company.email || 'No email provided'}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium">
                  {company.phoneNumber || 'No phone provided'}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium">
                  {company.registerOfficeAddress || company.city || 'No address provided'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Available QRs</div>
                <div className="text-lg font-black text-emerald-600">
                  {company.qrCredits?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Related Entities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Brands Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package className="text-indigo-500" size={20} /> Brands ({brands.length})
              </h3>
              <button 
                onClick={onAddBrand}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={14} /> Add Brand
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Brand Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {brands.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No brands found.</td></tr>
                  ) : brands.map(b => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {b.brandLogo ? (
                          <img src={b.brandLogo} alt={b.brandName} className="w-8 h-8 rounded bg-white border border-slate-200 object-contain p-0.5" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">{b.brandName?.charAt(0)}</div>
                        )}
                        <span className="text-slate-800 font-bold">{b.brandName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {b.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onEditBrand(b)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-500" size={20} /> Team Members ({staff.length})
              </h3>
              <button 
                onClick={onAddUser}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={14} /> Add User
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {staff.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No users found.</td></tr>
                  ) : staff.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'authorizer' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {u.role === 'authorizer' ? <ShieldCheck size={12} className="inline mr-1 mb-0.5"/> : <Briefcase size={12} className="inline mr-1 mb-0.5"/>}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onEditUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
