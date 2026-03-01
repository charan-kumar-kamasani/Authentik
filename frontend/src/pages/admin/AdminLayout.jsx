import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Building, UserPlus, FileText, Component, 
  Search, BarChart2, Package, CreditCard, Tag, LogOut, 
  ChevronRight, Box, ShieldCheck, Ticket, LayoutDashboard, Receipt, Beaker, FormInput
} from 'lucide-react';
import GenerateQrs from './GenerateQrs';
import QrManagement from './QrManagement';
import API_BASE_URL from '../../config/api';

// Sidebar item component
function SidebarItem({ label, onClick, icon: Icon, isActive, hasSubmenu }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
          ${isActive 
            ? 'bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-white' 
            : 'text-gray-500 hover:bg-blue-50/50 hover:text-blue-700'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} strokeWidth={2.5} />
        {label}
      </div>
      {hasSubmenu && (
        <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? 'rotate-90 text-white/80' : 'text-gray-300'}`} />
      )}
    </button>
  );
}

// Users submenu 
function UsersSubmenu({ activePath, locationSearch, navigateTo }) {
  const isParentActive = activePath === '/users' || activePath.startsWith('/users');
  if (!isParentActive) return null;
  const isSearch = (name) => locationSearch.includes(`tab=${name}`);
  const isList = isSearch('list') || (!locationSearch && activePath === '/users');
  
  return (
    <div className="mt-1 mb-2 px-3 pl-11 flex flex-col gap-1 border-l-2 border-blue-100/50 ml-6 pb-2 relative">
      <button
        onClick={() => navigateTo('/users?tab=list')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isList ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-2"><Users size={14} /> User List</div>
      </button>
      <button
        onClick={() => navigateTo('/users?tab=createBrand')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSearch('createBrand') ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-2"><Building size={14} /> Create Brand</div>
      </button>
      <button
        onClick={() => navigateTo('/users?tab=createStaff')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSearch('createStaff') ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-2"><UserPlus size={14} /> Create User</div>
      </button>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('adminRole') || '';
  const email = localStorage.getItem('adminEmail') || '';
  const [creatorView, setCreatorView] = useState(role === 'creator' ? 'generate' : null);

  useEffect(() => {
    if (role === 'creator') navigate('/admin/dashboard');
  }, [role, navigate]);

  const activePath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  };

  const roleColors = {
    superadmin: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    admin: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    company: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    creator: 'bg-gradient-to-br from-orange-400 to-red-500'
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col h-screen fixed top-0 left-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="p-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${Object.values(roleColors)[0]}`}>
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">Authentick<span className="text-blue-600">.</span></h1>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {role === 'creator' ? (
            <div className="space-y-1.5">
              <SidebarItem label="Generate QRs" onClick={() => { setCreatorView('generate'); navigate('/admin/dashboard'); }} icon={Box} isActive={creatorView === 'generate'} />
              <SidebarItem label="QR Inventory" onClick={() => { setCreatorView('management'); navigate('/admin/dashboard'); }} icon={Package} isActive={creatorView === 'management'} />
            </div>
          ) : (
            <>
              <SidebarItem label="Dashboard" onClick={() => navigate('/admin/analytics')} icon={LayoutDashboard} isActive={activePath === '/admin/analytics'} />
              <SidebarItem label="Order Management" onClick={() => navigate('/orders')} icon={FileText} isActive={activePath === '/orders'} />
              <SidebarItem label="Scanned QRs" onClick={() => navigate('/admin/scanned-qrs')} icon={Search} isActive={activePath === '/admin/scanned-qrs'} />
              <SidebarItem label="Reports" onClick={() => navigate('/admin/reports')} icon={BarChart2} isActive={activePath === '/admin/reports'} />
              <SidebarItem label="QR Inventory" onClick={() => navigate('/admin/dashboard')} icon={Package} isActive={activePath === '/admin/dashboard'} />
              
              {['superadmin'].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billing & Pricing</p>
                  <div className="space-y-1.5">
                    <SidebarItem label="Transactions" onClick={() => navigate('/admin/transactions')} icon={CreditCard} isActive={activePath === '/admin/transactions'} />
                    <SidebarItem label="Price Plans" onClick={() => navigate('/admin/price-plans')} icon={Tag} isActive={activePath === '/admin/price-plans'} />
                  </div>
                </div>
              )}

              {['superadmin', 'admin'].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration</p>
                  <div className="space-y-1.5">
                    {['superadmin'].includes(role) && <SidebarItem label="Settings" onClick={() => navigate('/admin/settings')} icon={Ticket} isActive={activePath === '/admin/settings'} />}
                    {['superadmin'].includes(role) && <SidebarItem label="Test Accounts" onClick={() => navigate('/admin/test-accounts')} icon={Beaker} isActive={activePath === '/admin/test-accounts'} />}
                    <SidebarItem label="QR Form Config" onClick={() => navigate('/admin/form-config')} icon={FormInput} isActive={activePath === '/admin/form-config'} />
                  </div>
                </div>
              )}

              {['company', 'authorizer'].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billing</p>
                  <div className="space-y-1.5">
                    <SidebarItem label="Credits & Billing" onClick={() => navigate('/admin/billing')} icon={CreditCard} isActive={activePath === '/admin/billing'} />
                    <SidebarItem label="Transactions" onClick={() => navigate('/admin/transactions')} icon={Receipt} isActive={activePath === '/admin/transactions'} />
                  </div>
                </div>
              )}

              {['superadmin', 'admin', 'company'].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Team & Access</p>
                  <div>
                    <SidebarItem 
                      label="User Management" 
                      onClick={() => navigate('/users')} 
                      icon={Users} 
                      isActive={activePath === '/users' || activePath.startsWith('/users')} 
                      hasSubmenu={true} 
                    />
                    <UsersSubmenu activePath={activePath} locationSearch={location.search} navigateTo={(to) => navigate(to)} />
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 m-4 mt-0 bg-slate-50 border border-slate-200/60 rounded-2xl relative group">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner ${roleColors[role] || roleColors.company}`}>
              {email ? email.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-bold text-slate-800 truncate">{email || 'Administrator'}</p>
              <p className="text-[11px] font-medium text-slate-500 capitalize">{role} Account</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] p-8 md:p-12 min-h-screen">
        <div className="w-full h-full animate-in fade-in duration-500">
          {role === 'creator' ? (
            creatorView === 'generate' ? <GenerateQrs /> : children
          ) : (
            children
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}}/>
    </div>
  );
}