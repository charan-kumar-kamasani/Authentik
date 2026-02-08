import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config/api';

export default function QrManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/qrs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || 'Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    const r = localStorage.getItem('adminRole') || (() => {
      try { const ui = localStorage.getItem('userInfo'); return ui ? JSON.parse(ui).role : (localStorage.getItem('role') || localStorage.getItem('userRole')); } catch(e) { return localStorage.getItem('role') || localStorage.getItem('userRole'); }
    })();
    if (r) setRole(r);
  }, []);

  if (loading) return <div className="p-6">Loading QRs...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">QR Management</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manufacture Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => {
              // Prefer brand string, fall back to nested brand object if present
              const brandName = p.brand || (p.brandId && (p.brandId.brandName || p.brandId));
              // image candidates
              const img = p.productImage || p.image || p.imageUrl || p.brandLogo || '';
              // format date to dd/mm/yyyy if present
              const fmt = (d) => {
                if (!d) return '—';
                try {
                  const dt = new Date(d);
                  if (isNaN(dt)) return d;
                  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
                } catch { return d; }
              };

              return (
                <tr key={p._id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.productName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{brandName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.batchNo || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(p.manufactureDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(p.expiryDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.quantity ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {img ? (
                      <img src={img} alt={p.productName} className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 break-words max-w-xs">{p.qrCode || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
