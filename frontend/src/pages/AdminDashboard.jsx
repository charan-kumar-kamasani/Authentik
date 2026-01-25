import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [role, setRole] = useState("");
  const [activeTab, setActiveTab] = useState("qrs");
  const [users, setUsers] = useState([]);
  const [qrs, setQrs] = useState([]);
  const navigate = useNavigate();

  // Form states
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "admin" });
  const [newQr, setNewQr] = useState({ 
    productName: "", 
    brand: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "", 
    quantity: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedRole = localStorage.getItem("adminRole");
    if (!token) {
      navigate("/admin");
    } else {
      setRole(storedRole);
      setNewUser(prev => ({ ...prev, role: storedRole === 'superadmin' ? 'admin' : 'manager' }));
      fetchQrs();
      if (storedRole === "superadmin" || storedRole === "admin") {
        fetchUsers();
      }
    }
  }, [navigate]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch("http://localhost:5000/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setUsers(await res.json());
  };

  const fetchQrs = async () => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch("http://localhost:5000/admin/qrs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setQrs(await res.json());
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const res = await fetch("http://localhost:5000/admin/create-user", {
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
        alert(d.error);
    }
  };

  const handleCreateQr = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const res = await fetch("http://localhost:5000/admin/create-qr", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newQr),
    });
    if (res.ok) {
      const result = await res.json();
      alert("QR created successfully!");
      if (result.pdfBase64) {
          downloadPdf(result.pdfBase64, "qr_code.pdf");
      }
      fetchQrs();
      setNewQr({ productName: "", brand: "", batchNo: "", manufactureDate: "", expiryDate: "", quantity: "" });
    } else {
        alert("Failed to create QR");
    }
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          if (data.length === 0) {
              alert("Empty sheet");
              return;
          }

          // Data Mapping (Ensure Excel columns match backend expectation or map them)
          // Expecting Excel columns: productName, brand, batchNo, manufactureDate, expiryDate, quantity
          console.log("Uploading data:", data);

          const token = localStorage.getItem("adminToken");
          const res = await fetch("http://localhost:5000/admin/bulk-upload-qrs", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
          });

          if (res.ok) {
              const result = await res.json();
              alert(result.message);
              if (result.pdfBase64) {
                 downloadPdf(result.pdfBase64, "bulk_qr_codes.pdf");
              }
              fetchQrs();
          } else {
              alert("Bulk upload failed");
          }
      };
      reader.readAsBinaryString(file);
  };
  
  const downloadPdf = (base64, filename) => {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminEmail");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Authentick<span className="text-blue-600">.</span></h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <SidebarItem 
             label="QR Management" 
             active={activeTab === "qrs"} 
             onClick={() => setActiveTab("qrs")}
             icon="📦"
           />
           {(role === "superadmin" || role === "admin") && (
             <SidebarItem 
               label="User Management" 
               active={activeTab === "users"} 
               onClick={() => setActiveTab("users")}
               icon="👥"
             />
           )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${role === 'superadmin' ? 'bg-purple-600' : role === 'admin' ? 'bg-blue-600' : 'bg-green-600'}`}>
              {role && role.length > 0 ? role[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate capitalize">{role}</p>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-medium">
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <header className="mb-10 flex justify-between items-center">
            <div>
                 <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {activeTab === "qrs" ? "Product & QR Management" : "User Access Control"}
                 </h2>
                 <p className="text-gray-500 mt-2">
                    {activeTab === "qrs" 
                        ? "Create, track and manage product QR codes." 
                        : "Manage permissions and create new admin users."}
                 </p>
            </div>
        </header>

        {activeTab === "qrs" && (
          <div className="space-y-8">
            {role !== 'superadmin' ? (
                <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                  <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Create New Product Record
                       </h3>
                       
                       <div className="relative overflow-hidden">
                           <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                               <span>📄</span> Bulk Upload (Excel)
                           </button>
                           <input 
                                type="file" 
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                           />
                       </div>
                  </div>

                  <form onSubmit={handleCreateQr} className="grid grid-cols-2 gap-6">
                    <InputGroup label="Product Name" placeholder="e.g. Premium Widget" value={newQr.productName} onChange={(v) => setNewQr({...newQr, productName: v})} />
                    <InputGroup label="Brand" placeholder="e.g. Acme Corp" value={newQr.brand} onChange={(v) => setNewQr({...newQr, brand: v})} />
                    <InputGroup label="Batch Number" placeholder="e.g. BATCH-001" value={newQr.batchNo} onChange={(v) => setNewQr({...newQr, batchNo: v})} />
                    <InputGroup label="Manufacture Date" type="date" value={newQr.manufactureDate} onChange={(v) => setNewQr({...newQr, manufactureDate: v})} />
                    <InputGroup label="Expiry Date" type="date" value={newQr.expiryDate} onChange={(v) => setNewQr({...newQr, expiryDate: v})} />
                    <InputGroup label="Quantity" type="number" placeholder="0" value={newQr.quantity} onChange={(v) => setNewQr({...newQr, quantity: v})} />
                    
                    <div className="col-span-2 pt-4">
                      <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">
                        Generate Product & QR
                      </button>
                    </div>
                  </form>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-center gap-4">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                        <h4 className="font-bold text-blue-900">Super Admin View Mode</h4>
                        <p className="text-blue-700 text-sm">You are viewing all QRs from all admins and managers. You cannot create QRs.</p>
                    </div>
                </div>
            )}

            {/* QR List */}
            <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
               <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Recent Products</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{qrs.length} Records</span>
               </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-8 py-4">Product Details</th>
                            <th className="px-6 py-4">Batch Info</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Created By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {qrs.map((qr) => (
                            <tr key={qr._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="font-medium text-gray-900">{qr.productName}</div>
                                    <div className="text-xs text-gray-500">{qr.brand}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-700">{qr.batchNo}</div>
                                    <div className="text-xs text-gray-400 font-mono">{qr.qrCode}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-500">Mfg: {qr.manufactureDate || '-'}</div>
                                    <div className="text-xs text-red-500">Exp: {qr.expiryDate}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                                        {qr.quantity} units
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-xs text-gray-500">{qr.createdBy?.email}</div>
                                    <div className="text-[10px] text-gray-400 uppercase">{qr.createdBy?.role}</div>
                                </td>
                            </tr>
                        ))}
                        {qrs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-sm">No products found. Start by creating one.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (role === "superadmin" || role === "admin") && (
          <div className="space-y-8 max-w-5xl">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">👥</div>
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Team</p>
                        <h4 className="text-2xl font-bold text-gray-900">{users.length}</h4>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">🛡️</div>
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Admins</p>
                        <h4 className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</h4>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">👔</div>
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Managers</p>
                        <h4 className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'manager').length}</h4>
                    </div>
                </div>
            </div>

             <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Invite New Member
              </h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                  {u.email[0].toUpperCase()}
                              </div>
                              <span className="text-gray-900 font-medium">{u.email}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide shadow-sm
                          ${u.role === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                          {u.role === 'admin' ? '🛡️ Admin' : '👔 Manager'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 text-sm">
                        {u.createdBy?.email ? (
                             <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{u.createdBy.email.split('@')[0]}</span>
                        ) : <span className="text-xs text-gray-400 italic">System</span>}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                      <tr>
                          <td colSpan={3} className="px-8 py-12 text-center text-gray-400">No team members found.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Components for clean code
function SidebarItem({ label, active, onClick, icon }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
            ${active 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <span className="text-lg">{icon}</span>
            {label}
        </button>
    )
}

function InputGroup({ label, placeholder, value, onChange, type="text" }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                required
            />
        </div>
    )
}
