import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrderStatus, downloadOrderPdf } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

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
    const [newOrder, setNewOrder] = useState({ 
        productName: '', 
        brand: '',
        batchNo: '',
        manufactureDate: '',
        expiryDate: '',
        quantity: '', 
        description: '' 
    });
    const [newQr, setNewQr] = useState({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1 });
    const [role, setRole] = useState(''); // 'admin', 'company', 'authorizer', 'creator'
    const { setLoading: setGlobalLoading } = useLoading();

    // Dispatch form
    const [dispatchData, setDispatchData] = useState({ 
        trackingNumber: '', 
        courierName: '',
        notes: '' 
    });
    const [showDispatchModal, setShowDispatchModal] = useState(null); // orderId

    useEffect(() => {
        fetchOrders();
        // Hack: Decode token or get role from local storage strictly
        // Read role from admin flow or user flow
        const adminRole = localStorage.getItem('adminRole');
        if (adminRole) {
            setRole(adminRole);
        } else {
            const userStr = localStorage.getItem('userInfo'); // or however you store it
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setRole(user.role);
                } catch (e) {
                    const r = localStorage.getItem('role') || '';
                    setRole(r);
                }
            } else {
                const r = localStorage.getItem('role') || '';
                setRole(r);
            }
        }
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const data = await getOrders(token);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            alert('Failed to load orders: ' + error.message);
            setLoading(false);
        }
    };

    // Bulk upload removed. Creators should create Orders (batches) instead of uploading QRs directly.

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            await createOrder(newOrder, token);
            setShowCreateModal(false);
            setNewOrder({ 
                productName: '', 
                brand: '',
                batchNo: '',
                manufactureDate: '',
                expiryDate: '',
                quantity: '', 
                description: '' 
            });
            fetchOrders();
            alert('Order created successfully!');
        } catch (error) {
            alert('Failed to create order: ' + error.message);
        }
    };

    const handleAction = async (orderId, action, data = {}) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
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
        setGlobalLoading(true);
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const data = await downloadOrderPdf(orderId, token);
            if (data.pdfBase64) {
                downloadPdf(data.pdfBase64, `order_${orderId}.pdf`);
            } else {
                alert("No PDF data found");
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setGlobalLoading(false);
        }
    };

    // Color logic - NEW WORKFLOW
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Authorization': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Authorized': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Order Processing': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Dispatching': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Dispatched': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Received': return 'bg-green-100 text-green-800 border-green-300';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending Authorization': '⏳',
            'Authorized': '✅',
            'Order Processing': '⚙️',
            'Dispatching': '📦',
            'Dispatched': '🚚',
            'Received': '🎉',
            'Rejected': '❌',
        };
        return icons[status] || '📋';
    };

    if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
             {/* Use existing Navbar or SimpleNav */}
             <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-blue-600 font-medium">← Dashboard</button>
                    <span className="font-bold text-xl tracking-tight text-[#214B80]">Authentik Logs</span>
                </div>
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full capitalize">{role}</span>
                     <button onClick={() => { localStorage.clear(); navigate('/admin'); }} className="text-red-500 font-medium text-sm">Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">

                {/* Creator: inline Generate QRs form (replaces Order Management for creators) */}
                {role === 'creator' && (
                    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Create New Product Record
                            </h3>

                            {/* Bulk upload removed: creators now create Orders which will be processed by admin to generate QRs */}
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const token = localStorage.getItem('token');
                                const body = {
                                    productName: newQr.productName,
                                    brand: newQr.brand,
                                    batchNo: newQr.batchNo,
                                    manufactureDate: newQr.manufactureDate,
                                    expiryDate: newQr.expiryDate,
                                    quantity: Number(newQr.quantity) || 1,
                                    description: newQr.description || ''
                                };

                                // Creators should create an Order (batch). Admin/superadmin will process the order to generate QRs.
                                await createOrder(body, token);
                                alert('Order created successfully! It will be processed by Admin to generate QR codes.');
                                setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: 1 });
                                fetchOrders();
                            } catch (err) {
                                alert('Error: ' + err.message);
                            }
                        }} className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input required className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.productName} onChange={e=>setNewQr({...newQr, productName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                <input required className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.brand} onChange={e=>setNewQr({...newQr, brand: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                                <input required className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.batchNo} onChange={e=>setNewQr({...newQr, batchNo: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" min="0" className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.quantity} onChange={e=>setNewQr({...newQr, quantity: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Manufacture Date</label>
                                <input type="date" className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.manufactureDate} onChange={e=>setNewQr({...newQr, manufactureDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" className="mt-1 block w-full px-3 py-2 border rounded" value={newQr.expiryDate} onChange={e=>setNewQr({...newQr, expiryDate: e.target.value})} />
                            </div>

                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-[#214B80] text-white font-medium py-3 rounded-xl hover:bg-[#193a62] transition-all shadow-lg">Generate Product & QR</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.brand || (order.brandId?.brandName) || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2 flex-wrap">
                                            
                                            {/* Step 1: Authorizer approves pending orders */}
                                            {order.status === 'Pending Authorization' && 
                                             (role === 'company' || role === 'authorizer') && (
                                                <button 
                                                    onClick={() => handleAction(order._id, 'authorize')}
                                                    className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold"
                                                >
                                                    ✓ Authorize
                                                </button>
                                            )}

                                            {/* Step 2: Super Admin processes & generates QRs */}
                                            {order.status === 'Authorized' && 
                                             (role === 'admin' || role === 'superadmin') && (
                                                <button 
                                                    onClick={() => handleAction(order._id, 'process')}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold"
                                                >
                                                    ⚙️ Process & Generate QRs
                                                </button>
                                            )}

                                            {/* Step 3: Super Admin marks as dispatching */}
                                            {order.status === 'Order Processing' && 
                                             (role === 'admin' || role === 'superadmin') && (
                                                <button 
                                                    onClick={() => handleAction(order._id, 'dispatching')}
                                                    className="bg-orange-500 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-bold"
                                                >
                                                    📦 Prepare Dispatch
                                                </button>
                                            )}

                                            {/* Step 4: Super Admin dispatches */}
                                            {order.status === 'Dispatching' && 
                                             (role === 'admin' || role === 'superadmin') && (
                                                <button 
                                                    onClick={() => setShowDispatchModal(order._id)}
                                                    className="bg-amber-500 hover:bg-amber-700 text-white px-3 py-1 rounded text-xs font-bold"
                                                >
                                                    🚚 Dispatch
                                                </button>
                                            )}

                                            {/* Step 5: Authorizer marks as received (ACTIVATES QRs) */}
                                            {order.status === 'Dispatched' && 
                                             (role === 'company' || role === 'authorizer') && (
                                                <button 
                                                    onClick={() => {
                                                        if (confirm('Mark as received? This will ACTIVATE all QR codes!')) {
                                                            handleAction(order._id, 'received');
                                                        }
                                                    }}
                                                    className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold animate-pulse"
                                                >
                                                    ✓ Mark Received
                                                </button>
                                            )}

                                            {/* PDF Download (if QRs generated) */}
                                            {order.qrCodesGenerated && role === 'superadmin' && (
                                                <button 
                                                    className="bg-gray-600 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold"
                                                    onClick={() => handleDownload(order._id)}
                                                >
                                                    📄 PDF
                                                </button>
                                            )}

                                            {/* Status badge */}
                                            <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)} {order.status}
                                            </span>
                                        </div>
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
                        <h2 className="text-xl font-bold mb-4">Create New QR Order</h2>
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
                                <label className="block text-gray-700 text-sm font-bold mb-2">Brand</label>
                                <input 
                                    type="text" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newOrder.brand}
                                    onChange={(e) => setNewOrder({...newOrder, brand: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Batch Number (optional)</label>
                                <input 
                                    type="text" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newOrder.batchNo}
                                    onChange={(e) => setNewOrder({...newOrder, batchNo: e.target.value})}
                                    placeholder="Auto-generated if empty"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Manufacture Date</label>
                                    <input 
                                        type="date" 
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={newOrder.manufactureDate}
                                        onChange={(e) => setNewOrder({...newOrder, manufactureDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={newOrder.expiryDate}
                                        onChange={(e) => setNewOrder({...newOrder, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                                <input 
                                    type="number" 
                                    min="1"
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
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            

            {/* Dispatch Modal */}
            {showDispatchModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">🚚 Dispatch Order</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Courier Name</label>
                            <input 
                                type="text" 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={dispatchData.courierName}
                                onChange={(e) => setDispatchData({...dispatchData, courierName: e.target.value})}
                                placeholder="e.g., DHL, FedEx, BlueDart"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tracking Number</label>
                            <input 
                                type="text" 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={dispatchData.trackingNumber}
                                onChange={(e) => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                                placeholder="Enter tracking number"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
                            <textarea 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows="3"
                                value={dispatchData.notes}
                                onChange={(e) => setDispatchData({...dispatchData, notes: e.target.value})}
                                placeholder="Additional dispatch information"
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
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-4 rounded"
                            >
                                🚚 Dispatch Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderManagement;
