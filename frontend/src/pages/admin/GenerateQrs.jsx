import React, { useState, useEffect } from 'react';
import API_BASE_URL, { createOrder } from '../../config/api';

export default function GenerateQrs() {
  const [newQr, setNewQr] = useState({
    productName: '',
    brand: '',
    batchNo: '',
    manufactureDate: '',
    expiryDate: '',
    quantity: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [role, setRole] = useState('');

  const handleImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreateQr = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      if (role === 'creator') {
        // Creators should create an Order which will be processed by admin
        await createOrder({
          productName: newQr.productName,
          brand: newQr.brand,
          batchNo: newQr.batchNo,
          manufactureDate: newQr.manufactureDate,
          expiryDate: newQr.expiryDate,
          quantity: Number(newQr.quantity) || 1,
        }, token);
        alert('Order created. Admin will process it to generate QRs.');
        setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: '' });
        setImageFile(null);
        setImagePreview(null);
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/create-qr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newQr)
        });

        if (res.ok) {
          const result = await res.json();
          alert(`Successfully created ${result.count || 1} QRs!`);
          if (result.pdfBase64) downloadPdf(result.pdfBase64, 'products_qr_codes.pdf');
          setNewQr({ productName: '', brand: '', batchNo: '', manufactureDate: '', expiryDate: '', quantity: '' });
          setImageFile(null);
          setImagePreview(null);
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.error || 'Failed to create QR');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create QR');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const r = localStorage.getItem('adminRole');
    if (r) setRole(r);

    // load current user first to decide which brands to fetch
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const u = await res.json();
          // If creator, load only brands for the user's company
          if (u?.companyId?._id) {
            try {
              const bres = await fetch(`${API_BASE_URL}/admin/brands?companyId=${u.companyId._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (bres.ok) {
                const bdata = await bres.json();
                setBrands(bdata || []);
                // If creator, pre-select brand if only one or if user has brand
                if (u?.brandId?._id) {
                  setNewQr((p) => ({ ...p, brand: u.brandId.brandName }));
                }
              }
            } catch (err) {
              console.warn('Could not load company brands', err);
            }
          } else {
            // fallback: load all brands
            try {
              const gres = await fetch(`${API_BASE_URL}/admin/brands`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (gres.ok) {
                const gdata = await gres.json();
                setBrands(gdata || []);
              }
            } catch (err) {
              console.warn('Could not load brands', err);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load current user', err);
      }
    })();
  }, []);

  const downloadPdf = (base64, filename) => {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
          Create New Product Record
        </h3>
      </div>

      <form onSubmit={handleCreateQr} className="grid grid-cols-2 gap-6">
        <InputGroup label="Product Name" placeholder="e.g. Premium Widget" value={newQr.productName} onChange={(v) => setNewQr({ ...newQr, productName: v })} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Brand</label>
          <select
            value={newQr.brand}
            onChange={(e) => setNewQr({ ...newQr, brand: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
            required
            disabled={role === 'creator'}
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b.brandName}>{b.brandName}</option>
            ))}
          </select>
        </div>
        <InputGroup label="Batch Number" placeholder="e.g. BATCH-001" value={newQr.batchNo} onChange={(v) => setNewQr({ ...newQr, batchNo: v })} />
        <InputGroup label="Manufacture Date" type="date" value={newQr.manufactureDate} onChange={(v) => setNewQr({ ...newQr, manufactureDate: v })} />
        <InputGroup label="Expiry Date" type="date" value={newQr.expiryDate} onChange={(v) => setNewQr({ ...newQr, expiryDate: v })} />
        <InputGroup label="Quantity" type="number" placeholder="0" value={newQr.quantity} onChange={(v) => setNewQr({ ...newQr, quantity: v })} />

        {/* Upload Product Image (new field) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Upload Product Image</label>
          <div className="flex items-center gap-4">
            <label className="relative overflow-hidden bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 cursor-pointer text-sm text-gray-700">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
              Choose Image
            </label>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-md border" />
            ) : (
              <div className="w-20 h-20 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400">No image</div>
            )}
          </div>
        </div>

        <div className="col-span-2 pt-4">
          <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">
            Generate Product & QR
          </button>
        </div>
      </form>
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = 'text' }) {
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
  );
}
