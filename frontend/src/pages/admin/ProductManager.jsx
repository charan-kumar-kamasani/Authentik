import React, { useState, useEffect } from 'react';
import API_BASE_URL, { getProductTemplates, createProductTemplate, authorizeProductTemplate, deleteProductTemplate, getBrands, updateProductTemplate } from '../../config/api';
import { Package, Plus, CheckCircle, Clock, Trash2, Search, Filter, ShieldCheck, Info, Image as ImageIcon, Edit } from 'lucide-react';
import { useConfirm } from '../../components/ConfirmModal';

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [brands, setBrands] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    skuNumber: '',
    brandId: '',
    productInfo: '',
    productImage: null,
    imagePreview: null,
  });

  const resetForm = () => {
    setFormData({
      productName: '',
      skuNumber: '',
      brandId: brands[0]?._id || '',
      productInfo: '',
      productImage: null,
      imagePreview: null,
    });
    setEditProductId(null);
  };

  const confirm = useConfirm();
  const role = localStorage.getItem('adminRole');
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Get current user info
      const meRes = await fetch(`${API_BASE_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const me = await meRes.json();
      setUser(me);

      // Fetch brands for dropdown
      if (me.companyId) {
        const bData = await getBrands(me.companyId._id || me.companyId);
        const activeBrands = (bData || []).filter(b => b.status !== 'blocked');
        setBrands(activeBrands);
        if (activeBrands.length > 0) {
            setFormData(prev => ({ ...prev, brandId: activeBrands[0]._id }));
        }
      }

      // Fetch products for this company
      const companyId = me.companyId?._id || me.companyId;
      const pData = await getProductTemplates(companyId);
      setProducts(pData || []);
    } catch (err) {
      console.error('Failed to fetch initial data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        productImage: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = '';
      if (formData.productImage) {
        // Upload image to Cloudinary (reusing logic from GenerateQrs)
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.productImage);
        uploadFormData.append('upload_preset', uploadPreset);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadFormData,
        });
        const data = await res.json();
        finalImageUrl = data.secure_url;
      }

      const productPayload = {
        productName: formData.productName,
        skuNumber: formData.skuNumber,
        brandId: formData.brandId,
        productInfo: formData.productInfo,
      };

      if (finalImageUrl) {
        productPayload.productImage = finalImageUrl;
      }

      if (editProductId) {
        if (!formData.imagePreview && !formData.productImage) {
          productPayload.productImage = '';
        }
        await updateProductTemplate(editProductId, productPayload);
        alert('Product updated successfully!');
      } else {
        await createProductTemplate(productPayload);
        alert('Product created successfully!');
      }

      resetForm();
      setActiveTab('list');
      fetchInitialData();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (product) => {
    setFormData({
      productName: product.productName || '',
      skuNumber: product.skuNumber || '',
      brandId: product.brandId?._id || product.brandId || '',
      productInfo: product.productInfo || '',
      productImage: null,
      imagePreview: product.productImage || null,
    });
    setEditProductId(product._id);
    setActiveTab('create');
  };


  const handleDelete = async (id) => {
    const ok = await confirm({
        title: 'Delete Product',
        description: 'Are you sure you want to delete this product catalog entry?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });
    if (!ok) return;

    try {
      await deleteProductTemplate(id);
      fetchInitialData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const canCreate = role === 'creator' || role === 'authorizer' || role === 'superadmin' || role === 'admin' || role === 'company';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="animate-in slide-in-from-left duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Product Manager</span>
            </h2>
            <p className="text-gray-500 font-bold text-lg max-w-2xl">
              Centralized catalog for managing and authorizing products within your enterprise.
            </p>
          </div>
          
          <div className="flex items-center gap-3 animate-in slide-in-from-right duration-700">
            <button 
              onClick={() => { resetForm(); setActiveTab('list'); }}
              className={`px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all uppercase tracking-widest ${activeTab === 'list' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'}`}
            >
              Catalog List
            </button>
            <button 
              onClick={async () => { 
                setActiveTab('reviews');
                if (reviews.length === 0) {
                  setLoadingReviews(true);
                  try {
                    const { getAllReviews } = await import('../../config/api');
                    const rData = await getAllReviews(token);
                    setReviews(rData || []);
                  } catch (err) {
                    console.error("Failed to fetch reviews", err);
                  } finally {
                    setLoadingReviews(false);
                  }
                }
              }}
              className={`px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all uppercase tracking-widest ${activeTab === 'reviews' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border-2 border-amber-500 text-amber-500 hover:bg-amber-50'}`}
            >
              Reviews
            </button>
            {canCreate && (
              <button 
                onClick={() => { resetForm(); setActiveTab('create'); }}
                className={`px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
              >
                <Plus size={18} />
                Add Product
              </button>
            )}
          </div>
        </header>

        <main className="px-4">
          {activeTab === 'create' ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/40 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editProductId ? 'Edit Product' : 'Add New Product'}</h2>
                  <p className="text-gray-500 font-medium text-sm">{editProductId ? 'Update the details for this catalog entry.' : 'Create a reusable product profile for the catalog.'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100/50">
                  <div className="flex flex-col gap-2 group">
                    <label className="text-sm font-bold text-gray-600 ml-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classic T-Shirt"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 group">
                    <label className="text-sm font-bold text-gray-600 ml-1">SKU Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SKU-12345 (Optional)"
                      value={formData.skuNumber}
                      onChange={(e) => setFormData({ ...formData, skuNumber: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 group">
                    <label className="text-sm font-bold text-gray-600 ml-1">Brand *</label>
                    <select
                      required
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>Select a Brand</option>
                      {brands.map(b => (
                        <option key={b._id} value={b._id}>{b.brandName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={18} className="text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-800">Consumer View Info</h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">This information will be displayed to customers when they scan a QR code of this product.</p>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-600 ml-1">Image Description</label>
                        <textarea
                        placeholder="Comprehensive details for scan result page..."
                        value={formData.productInfo}
                        onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                        rows={3}
                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-gray-900 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm"
                        />
                    </div>
 
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-600 ml-1">Product Image</label>
                        <div className="flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
                            <label className="flex-shrink-0 cursor-pointer">
                                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                                    <ImageIcon size={24} />
                                    <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Choose</span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            {formData.imagePreview ? (
                                <div className="relative group">
                                    <img src={formData.imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl shadow-md" />
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({ ...formData, productImage: null, imagePreview: null })}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                    >
                                        <Plus className="rotate-45 w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 font-medium">Upload a clear product photo to showcase on scan results.</p>
                            )}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-gray-900 to-indigo-900 text-white font-black py-4 rounded-[1.5rem] hover:shadow-2xl hover:shadow-indigo-900/40 active:scale-[0.98] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? (editProductId ? 'Updating...' : 'Creating Product...') : (editProductId ? 'Update Product' : 'Add to Catalog')}
                    <Package className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search product name or brand..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 transition-all">
                        <Filter size={20} />
                    </button>
                    <div className="h-8 w-px bg-gray-100 mx-2" />
                    <span className="text-sm font-bold text-gray-500">{products.length} Products Found</span>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-5">
                      <div className="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex-shrink-0">
                        {product.productImage ? (
                          <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-black text-gray-900 truncate" title={product.productName}>{product.productName}</h4>
                           <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                            Verified Entry
                          </span>
                        </div>
                        <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">{product.brandId?.brandName || product.brand}</p>
                        {product.skuNumber && (
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            SKU: <span className="text-gray-600">{product.skuNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {/* Simplified creator badge */}
                           <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title={`Creator: ${product.creator?.name || 'Unknown'}`}>
                             {product.creator?.name?.charAt(0) || 'U'}
                           </div>
                        </div>
                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Catalog Ready
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handleEditClick(product)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {(role !== 'authorizer' && role !== 'creator') && (
                          <button 
                              onClick={() => handleDelete(product._id)}
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="bg-white rounded-[2.5rem] p-20 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                    <Package size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Empty Catalog</h3>
                  <p className="text-gray-500 font-medium max-w-sm">No products found for your company. Start by adding your first product to the catalog.</p>
                  {canCreate && (
                    <button 
                      onClick={() => setActiveTab('create')}
                      className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl transition-all"
                    >
                      Create First Product
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductManager;
