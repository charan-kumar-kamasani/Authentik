import React, { useState, useEffect } from 'react';
import { createCompanyUser, createStaffUser, getStaffUsers } from '../config/api';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [staff, setStaff] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'create'
    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '', userRole: 'creator' });

    useEffect(() => {
        const userStr = localStorage.getItem('userInfo');
        if(userStr) {
            const u = JSON.parse(userStr);
            setRole(u.role);
            if(u.role === 'company' || u.role === 'authorizer') {
                loadStaff();
            }
        }
    }, []);

    const loadStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await getStaffUsers(token);
            setStaff(data);
        } catch(e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (role === 'admin') {
                // Admin creates companies
                await createCompanyUser(formData, token);
                alert('Company Created Successfully');
            } else if (role === 'company') {
                // Company creates Authorizers or Creator
                await createStaffUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.userRole // 'authorizer' or 'creator'
                }, token);
                alert('User Created Successfully');
                loadStaff();
            } else if (role === 'authorizer') {
                // Authorizer creates Creator
                await createStaffUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: 'creator'
                }, token);
                alert('Creator Created Successfully');
                loadStaff();
            }
            setFormData({ name: '', email: '', password: '', userRole: 'creator' });
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    if (role === 'user' || role === 'creator') return <div className="p-10">Access Denied</div>;

    // Add Nav
    return (
        <div className="min-h-screen bg-gray-50">
             <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-blue-600 font-medium">← Dashboard</button>
                    <span className="font-bold text-xl tracking-tight text-[#1B2B49]">User Management</span>
                </div>
                 <div className="flex items-center gap-4">
                     <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full capitalize">{role}</span>
                     <button onClick={() => { localStorage.clear(); navigate('/admin'); }} className="text-red-500 font-medium text-sm">Logout</button>
                </div>
            </nav>

            <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            
            <div className="flex space-x-4 mb-6 border-b pb-2">
                <button 
                    className={`font-semibold ${activeTab==='list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={()=>setActiveTab('list')}
                >
                    User List
                </button>
                <button 
                     className={`font-semibold ${activeTab==='create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                     onClick={()=>setActiveTab('create')}
                >
                    Create New User
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="bg-white p-6 rounded shadow-md max-w-lg">
                    <h2 className="text-xl font-bold mb-4">
                        Create {role === 'admin' ? 'Company' : 'Staff'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Name</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                value={formData.name}
                                onChange={e=>setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Email</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                type="email"
                                value={formData.email}
                                onChange={e=>setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Password</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                type="password"
                                value={formData.password}
                                onChange={e=>setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        
                        {/* Admin always creates 'company' logic handled in submit, but maybe visualize it */}
                        {role === 'admin' && (
                             <div className="text-sm text-gray-500">Creating Account Type: <b>Company</b></div>
                        )}

                        {role === 'company' && (
                            <div>
                                <label className="block text-gray-700">Role</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={formData.userRole}
                                    onChange={e=>setFormData({...formData, userRole: e.target.value})}
                                >
                                    <option value="creator">Creator</option>
                                    <option value="authorizer">Authorizer</option>
                                </select>
                            </div>
                        )}

                         {role === 'authorizer' && (
                             <div className="text-sm text-gray-500">Creating Account Type: <b>Creator</b></div>
                        )}

                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                            Create User
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staff.map(u => (
                                <tr key={u._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap uppercase text-xs font-bold text-gray-600 border border-gray-200 inline-block px-1 mt-3 rounded">{u.role}</td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            </div>
        </div>
    );
};
export default UserManagement;
