import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { useLoading } from '../../context/LoadingContext';

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending Authorization': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Authorized': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Order Processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Dispatching': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Received': return 'bg-green-100 text-green-800 border-green-200';
    case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AdminDashboard() {
  // Prefer adminRole, fall back to userInfo.role (some users log in via non-admin flow)
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
  const navigate = useNavigate();

  // Form states
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: initialRole === "superadmin" ? "admin" : "manager",
  });

  // Create Order State
  const [newOrder, setNewOrder] = useState({ 
    productName: "", 
    brand: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "", 
    quantity: ""
  });

  // Dispatch Modal State (kept minimal; real modal handled elsewhere)
  const [showDispatchModal, setShowDispatchModal] = useState(null);
  const [dispatchData, setDispatchData] = useState({ trackingNumber: '', courierName: '', notes: '' });

  const getAuthToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");
  const { setLoading: setGlobalLoading } = useLoading();

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error('fetchUsers error', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      console.error('fetchOrders error', e);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/admin");
      return;
    }

    const updatedRole = localStorage.getItem("adminRole") || (() => {
      try { const ui = localStorage.getItem('userInfo'); return ui ? JSON.parse(ui).role : (localStorage.getItem('role') || ''); } catch(e){ return localStorage.getItem('role') || ''; }
    })();
    setRole(updatedRole);

    fetchOrders();
    if (updatedRole === "superadmin" || updatedRole === "admin") {
      fetchUsers();
    }
  }, [navigate]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/admin/create-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
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
    } catch (e) {
      console.error(e);
      alert('Failed to create user');
    }
  };

  // Create Order Handler (creators now create orders, not QRs directly)
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        alert("Order created successfully! Status: Pending Authorization");
        fetchOrders();
        setNewOrder({ productName: "", brand: "", batchNo: "", manufactureDate: "", expiryDate: "", quantity: "" });
      } else {
        const err = await res.json();
        alert(`Failed to create order: ${err.message || JSON.stringify(err)}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create order');
    }
  };

  // Status Change Handlers (used only by admin/superadmin here)
  const updatedStatus = async (orderId, action) => {
    try {
      const token = getAuthToken();
      let endpoint = '';
      let method = 'PUT';
      let body = null;

      if (action === 'authorize') endpoint = `/orders/${orderId}/authorize`;
      if (action === 'process') endpoint = `/orders/${orderId}/process`;
      if (action === 'dispatching') endpoint = `/orders/${orderId}/dispatching`;
      if (action === 'dispatch') {
        endpoint = `/orders/${orderId}/dispatch`;
        body = JSON.stringify(dispatchData);
      }
      if (action === 'received') endpoint = `/orders/${orderId}/received`;

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Status updated successfully");
        fetchOrders();
        setShowDispatchModal(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || JSON.stringify(err)}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const downloadPdf = async (orderId) => {
    setGlobalLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdfBase64}`;
        link.download = `order_${orderId}_qrs.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const err = await res.json();
        alert(`Download failed: ${err.message || JSON.stringify(err)}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminEmail");
    navigate("/admin");
  };

  return (
    <>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {activeTab === "qrs" ? "Inventory & QR Workflow" : "User Access Control"}
          </h2>
          <p className="text-gray-500 mt-2">
            {activeTab === "qrs"
              ? "Track orders from creation to receipt. Inventory view is read-only for creators/authorizers."
              : "Manage permissions and create new admin users."}
          </p>
        </div>
        <div>
          <button onClick={handleLogout} className="text-red-600 font-medium hover:text-red-700">Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("qrs")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'qrs' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}
        >
          📦 Inventory & Orders
        </button>

        {/* {(role === 'superadmin' || role === 'admin') && (
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}
          >
            👥 User Management
          </button>
        )} */}
      </div>

      {activeTab === "users" && (role === "superadmin" || role === "admin") && (
        <div className="space-y-8 max-w-5xl">
          {/* User management - Invite Form */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
              Invite New Member
            </h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* InputGroup is a project component; keep same usage as other pages */}
              <InputGroup label="Email Address" type="email" placeholder="user@company.com" value={newUser.email} onChange={(v) => setNewUser({...newUser, email: v})} />
              <InputGroup label="Password" type="password" placeholder="••••••••" value={newUser.password} onChange={(v) => setNewUser({...newUser, password: v})} />

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {role === 'superadmin' && (
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${newUser.role === 'admin' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" className="hidden" name="role" value="admin" checked={newUser.role === 'admin'} onChange={() => setNewUser({...newUser, role: 'admin'})} />
                      <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">A</div>
                      <div>
                        <div className="font-semibold text-gray-900">Admin</div>
                        <div className="text-xs text-gray-500">Can create Managers & QRs</div>
                      </div>
                    </label>
                  )}

                  <label className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${newUser.role === 'manager' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" className="hidden" name="role" value="manager" checked={newUser.role === 'manager'} onChange={() => setNewUser({...newUser, role: 'manager'})} />
                    <div className="w-10 h-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center font-bold">M</div>
                    <div>
                      <div className="font-semibold text-gray-900">Manager</div>
                      <div className="text-xs text-gray-500">Can create Products & QRs</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 pt-2">
                <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                  <span>➕</span> Create Team Member
                </button>
              </div>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <h3 className="font-semibold text-gray-900">Your Team</h3>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-8 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="px-8 py-4">
                      <div className="font-semibold text-gray-900">{u.name || u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">{u.role}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{u.createdBy ? (u.createdBy.email || u.createdBy.name) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "qrs" && (
        <div className="space-y-6">

          {/* Inventory / Orders table */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <h3 className="font-semibold text-gray-900">Inventory & Orders</h3>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4 text-center w-12">SN</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Batch No</th>
                  <th className="px-6 py-4">Mfg Date</th>
                  <th className="px-6 py-4">Exp Date</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4">Received By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.length > 0 ? (
                  orders.map((order, idx) => {
                    const lastHistory = order.history && order.history.length ? order.history[order.history.length - 1] : null;
                    const lastUpdated = lastHistory?.timestamp || order.updatedAt || order.createdAt;
                    const receivedEntry = order.history ? order.history.find(h => h.status === 'Received') : null;
                    const receivedBy = receivedEntry?.role || (receivedEntry?.changedBy && (receivedEntry.changedBy.email || receivedEntry.changedBy.name)) || '—';

                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{order.productName}</span>
                          <div className="text-[10px] text-gray-400 mt-1">ID: {order.orderId || order._id}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{order.brand || order.brandName || '—'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-mono">{order.batchNo}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{order.manufactureDate}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{order.expiryDate}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-gray-900">{order.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          {order.status === 'Received' && (
                            <div className="text-[10px] text-green-600 font-bold mt-1 text-center">✓ ACTIVE</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{receivedBy}</td>

                        <td className="px-6 py-4 text-right space-x-2">
                          {/* Inventory is read-only for creators/authorizers. Actions only for admin/superadmin. */}
                          {['superadmin', 'admin'].includes(role) && (
                            <>
                              {order.status === 'Authorized' && (
                                <button onClick={() => updatedStatus(order._id, 'process')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                                  Generate QRs
                                </button>
                              )}

                              {order.status === 'Order Processing' && (
                                <button onClick={() => updatedStatus(order._id, 'dispatching')} className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition shadow-sm">
                                  Prep Dispatch
                                </button>
                              )}

                              {order.status === 'Dispatching' && (
                                <button onClick={() => setShowDispatchModal(order._id)} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition shadow-sm">
                                  Dispatch
                                </button>
                              )}

                              {/* Download only allowed for Super Admin */}
                              {order.qrCodesGenerated && role === 'superadmin' && (
                                <button onClick={() => downloadPdf(order._id)} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition shadow-sm flex inline-flex items-center gap-1">
                                  <span>📥</span> PDF
                                </button>
                              )}
                            </>
                          )}

                          <div className="text-xs text-gray-400 block mt-1">
                            {order.history && order.history.length > 0 && `Last: ${order.history[order.history.length-1].status}`}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-gray-400">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function InputGroup({ label, placeholder = '', value, onChange, type="text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
      />
    </div>
  );
}
