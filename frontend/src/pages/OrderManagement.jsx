import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrderStatus, downloadOrderPdf } from '../config/api';
import { useNavigate } from 'react-router-dom';

// Simplified Navbar if not available
const SimpleNav = () => (
    <nav className="bg-black text-white p-4 flex justify-between">
        <span className="font-bold text-xl">Authentik</span>
        <a href="/admin-dashboard" className="text-gray-300">Dashboard</a>
    </nav>
);

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrder, setNewOrder] = useState({ productName: '', quantity: '', description: '' });
    const [role, setRole] = useState(''); // 'admin', 'company', 'authorizer', 'creator'

    // Dispatch form
    const [dispatchData, setDispatchData] = useState({ trackingNumber: '', notes: '' });
    const [showDispatchModal, setShowDispatchModal] = useState(null); // orderId

    useEffect(() => {
        fetchOrders();
        // Hack: Decode token or get role from local storage strictly
        const userStr = localStorage.getItem('userInfo'); // or however you store it
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role);
        }
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await getOrders(token);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            alert('Failed to load orders: ' + error.message);
            setLoading(false);
        }
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await createOrder(newOrder, token);
            setShowCreateModal(false);
            setNewOrder({ productName: '', quantity: '', description: '' });
            fetchOrders();
        } catch (error) {
            alert('Failed to create order');
        }
    };

    const handleAction = async (orderId, action, data = {}) => {
        try {
            const token = localStorage.getItem('token');
            await updateOrderStatus(orderId, action, data, token);
            fetchOrders();
            if (action === 'dispatch') setShowDispatchModal(null);
        } catch (error) {
            alert(`Failed to ${action} order: ` + error.message);
        }
    };

    const downloadPdf = (base64, filename) => {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${base64}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const data = await downloadOrderPdf(orderId, token);
            if (data.pdfBase64) {
                downloadPdf(data.pdfBase64, `order_${orderId}.pdf`);
            } else {
                alert("No PDF data found");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Color logic based on screenshot
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Authorization': return 'bg-yellow-500 text-black';
            case 'Authorized': return 'bg-purple-600 text-white';
            case 'Accepted & Ready to Print': return 'bg-blue-500 text-white';
            case 'Dispatched - Pending Activation': return 'bg-orange-500 text-white';
            case 'Activated': return 'bg-green-600 text-white';
            case 'Rejected / Cancelled': return 'bg-red-600 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    const getStatusText = (status) => {
         // Map internal status to display text if needed, or just use status
         // Screenshot shows "Pending Authorization", "Authorized", "Accepted & Ready to Print"
         return status;
    };

    if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
             {/* Use existing Navbar or SimpleNav */}
             <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-blue-600 font-medium">← Dashboard</button>
                    <span className="font-bold text-xl tracking-tight text-[#1B2B49]">Authentik Logs</span>
                </div>
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full capitalize">{role}</span>
                     <button onClick={() => { localStorage.clear(); navigate('/admin'); }} className="text-red-500 font-medium text-sm">Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Order Management</h1>
                    {(role === 'creator'|| role === 'company' || role === 'authorizer') && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                        >
                            + New Order
                        </button>
                    )}
                </div>

                {/* Orders List */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.company?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        
                                        {/* Authorization Action (Company/Authorizer) */}
                                        {order.status === 'Pending Authorization' && 
                                         (role === 'company' || role === 'authorizer') && (
                                            <button 
                                                onClick={() => handleAction(order._id, 'authorize')}
                                                className="text-purple-600 hover:text-purple-900 font-bold"
                                            >
                                                Authorize
                                            </button>
                                        )}

                                        {/* Accept & Print Action (Admin) */}
                                        {order.status === 'Authorized' && role === 'admin' && (
                                            <button 
                                                onClick={() => handleAction(order._id, 'accept')}
                                                className="text-blue-600 hover:text-blue-900 font-bold"
                                            >
                                                Accept & Print
                                            </button>
                                        )}

                                        {/* Dispatch Action (Admin) */}
                                        {order.status === 'Accepted & Ready to Print' && role === 'admin' && (
                                            <button 
                                                onClick={() => setShowDispatchModal(order._id)}
                                                className="text-orange-600 hover:text-orange-900 font-bold"
                                            >
                                                Dispatch
                                            </button>
                                        )}

                                        {/* Activate Action (Company/Authorizer) */}
                                        {order.status === 'Dispatched - Pending Activation' && 
                                         (role === 'company' || role === 'authorizer') && (
                                            <button 
                                                onClick={() => handleAction(order._id, 'activate')}
                                                className="text-green-600 hover:text-green-900 font-bold"
                                            >
                                                Activate
                                            </button>
                                        )}

                                        {/* PDF Download */}
                                        {['Dispatched - Pending Activation', 'Activated'].includes(order.status) && (
                                            <button 
                                                className="text-gray-600 hover:text-gray-900 ml-2 font-bold"
                                                onClick={() => handleDownload(order._id)}
                                            >
                                                📄 PDF
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Order</h2>
                        <form onSubmit={handleCreateOrder}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                                <input 
                                    type="text" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newOrder.productName}
                                    onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                                <input 
                                    type="number" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newOrder.quantity}
                                    onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newOrder.description}
                                    onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dispatch Modal */}
            {showDispatchModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Dispatch Order</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tracking Number</label>
                            <input 
                                type="text" 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={dispatchData.trackingNumber}
                                onChange={(e) => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
                            <textarea 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={dispatchData.notes}
                                onChange={(e) => setDispatchData({...dispatchData, notes: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => setShowDispatchModal(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleAction(showDispatchModal, 'dispatch', dispatchData)}
                                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Dispatch Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderManagement;
