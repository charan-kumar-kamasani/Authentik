import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GenerateQrs from './GenerateQrs';
import QrManagement from './QrManagement';
import API_BASE_URL from '../../config/api';

// Sidebar item component (pure, declared outside render)
function SidebarItem({ label, onClick, icon, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${isActive ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

// Users submenu (pure, declared outside render)
function UsersSubmenu({ activePath, locationSearch, navigateTo }) {
  const isParentActive = activePath === '/users' || activePath.startsWith('/users');
  if (!isParentActive) return null;
  const isSearch = (name) => locationSearch.includes(`tab=${name}`);
  return (
    <div className="mt-2 px-2">
      <button
        onClick={() => navigateTo('/users?tab=list')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${isSearch('list') || (!locationSearch && activePath === '/users') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
      >
        👥 User List
      </button>
      <button
        onClick={() => navigateTo('/users?tab=createBrand')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mt-1 transition ${isSearch('createBrand') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
      >
        🏢 Create Brand
      </button>
      <button
        onClick={() => navigateTo('/users?tab=createStaff')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mt-1 transition ${isSearch('createStaff') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
      >
        👤 Create New User
      </button>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('adminRole') || '';
  // default creator view should open Generate QRs by default
  const [creatorView, setCreatorView] = useState(role === 'creator' ? 'generate' : null); // 'generate' | 'management' | null

  useEffect(() => {
    if (role === 'creator') {
      // ensure the admin dashboard route is active so the in-place view renders
      navigate('/admin/dashboard');
    }
  }, [role, navigate]);

  const activePath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Authentick<span className="text-blue-600">.</span></h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {role === 'creator' ? (
              <div className="space-y-2">
                <SidebarItem label="Generate QRs" onClick={() => { setCreatorView('generate'); navigate('/admin/dashboard'); }} icon="🔖" isActive={creatorView === 'generate'} />
                <SidebarItem label="QR Inventory" onClick={() => { setCreatorView('management'); navigate('/admin/dashboard'); }} icon="📦" isActive={creatorView === 'management'} />
              </div>
            ) : (
            <>
              <SidebarItem label="Order Management" onClick={() => navigate('/orders')} icon="🧾" isActive={activePath === '/orders'} />
              <SidebarItem label="QR Inventory" onClick={() => navigate('/admin/dashboard')} icon="🔍" isActive={activePath === '/admin/dashboard'} />
              {['superadmin', 'admin', 'company'].includes(role) && (
                <div>
                  <SidebarItem label="User Management" onClick={() => navigate('/users')} icon="👥" isActive={activePath === '/users' || activePath.startsWith('/users')} />
                  <UsersSubmenu activePath={activePath} locationSearch={location.search} navigateTo={(to) => navigate(to)} />
                </div>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${role === 'superadmin' ? 'bg-purple-600' : role === 'admin' ? 'bg-blue-600' : 'bg-green-600'}`}>
              {role && role.length > 0 ? role[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate capitalize">{role}</p>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-medium">Log out</button>
            </div>
          </div>
        </div>
      </aside>

        <main className="flex-1 p-10 overflow-auto">
          {role === 'creator' ? (
            creatorView === 'generate' ? (
              <GenerateQrs />
            ) : (
              /* show dashboard children (which include inventory) */
              children
            )
          ) : (
            children
          )}
      </main>
    </div>
  );
}