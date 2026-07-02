import React, { useState, useEffect } from 'react';
import API_BASE_URL, { getProductTemplates, createProductTemplate, authorizeProductTemplate, deleteProductTemplate, getBrands, updateProductTemplate, reorderProductTemplates } from '../../config/api';
import { Package, Plus, CheckCircle, Clock, Trash2, Search, Filter, ShieldCheck, Info, Image as ImageIcon, Edit, ShoppingCart, BookOpen, GripVertical } from 'lucide-react';
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
  
  // Drag and drop state
  const [draggedProductIdx, setDraggedProductIdx] = useState(null);
  const [dragOverProductIdx, setDragOverProductIdx] = useState(null);

  const [draggedLinkIdx, setDraggedLinkIdx] = useState(null);
  const [dragOverLinkIdx, setDragOverLinkIdx] = useState(null);
  
  const [formData, setFormData] = useState({
    productName: '',
    skuNumber: '',
    brandId: '',
    productInfo: '',
    productImage: null,
    imagePreview: null,
    ingredients: '',
    certificates: [],
    orderLinks: [],
    educationContent: [],
  });

  const resetForm = () => {
    setFormData({
      productName: '',
      skuNumber: '',
      brandId: brands[0]?._id || '',
      productInfo: '',
      productImage: null,
      imagePreview: null,
      ingredients: '',
      certificates: [],
      orderLinks: [],
      educationContent: [],
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

  const handleCertificateImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newCertificates = [...formData.certificates];
      newCertificates[index] = {
        ...newCertificates[index],
        imageFile: file,
        image: URL.createObjectURL(file)
      };
      setFormData({ ...formData, certificates: newCertificates });
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

      const productInfoWords = formData.productInfo.trim().split(/\s+/).filter(Boolean).length;
      if (productInfoWords > 250) {
        await confirm({ title: 'Limit Exceeded', description: 'Product description cannot exceed 250 words.', cancelText: null });
        setSubmitting(false);
        return;
      }

      const finalOrderLinks = [];
      for (const link of formData.orderLinks || []) {
        if (!link.url) continue;
        let siteImageUrl = link.siteImage || '';
        if (link.siteImageFile) {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
          const uploadFormData = new FormData();
          uploadFormData.append('file', link.siteImageFile);
          uploadFormData.append('upload_preset', uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: uploadFormData });
          const data = await res.json();
          siteImageUrl = data.secure_url;
        }
        let generatedTitle = '';
        try {
          generatedTitle = new URL(link.url).hostname.replace('www.', '').split('.')[0];
          generatedTitle = generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1);
        } catch(e) {}
        
        finalOrderLinks.push({
          title: generatedTitle,
          url: link.url,
          siteImage: siteImageUrl
        });
      }

      const finalCertificates = [];
      for (const cert of formData.certificates || []) {
        if (!cert.name && !cert.imageFile && !cert.image) continue;
        let certImageUrl = cert.image || '';
        if (cert.imageFile) {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
          const uploadFormData = new FormData();
          uploadFormData.append('file', cert.imageFile);
          uploadFormData.append('upload_preset', uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: uploadFormData });
          const data = await res.json();
          certImageUrl = data.secure_url;
        }
        finalCertificates.push({
          name: cert.name || '',
          image: certImageUrl
        });
      }

      const productPayload = {
        productName: formData.productName,
        skuNumber: formData.skuNumber,
        brandId: formData.brandId,
        productInfo: formData.productInfo,
        ingredients: formData.ingredients || '',
        certificates: finalCertificates,
        orderLinks: finalOrderLinks,
        educationContent: formData.educationContent || [],
      };

      if (finalImageUrl) {
        productPayload.productImage = finalImageUrl;
      }

      if (editProductId) {
        if (!formData.imagePreview && !formData.productImage) {
          productPayload.productImage = '';
        }
        await updateProductTemplate(editProductId, productPayload);
        await confirm({ title: 'Updated', description: 'Product updated successfully!', cancelText: null });
      } else {
        await createProductTemplate(productPayload);
        await confirm({ title: 'Created', description: 'Product created successfully!', cancelText: null });
      }

      resetForm();
      setActiveTab('list');
      fetchInitialData();
    } catch (err) {
      await confirm({ title: 'Error', description: 'Failed to save product: ' + err.message, cancelText: null });
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
      orderLinks: product.orderLinks || [],
      educationContent: product.educationContent || [],
      certificates: product.certificates || [],
      ingredients: product.ingredients || '',
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
      await confirm({ title: 'Error', description: 'Failed to delete product', cancelText: null });
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    // Optimistically update UI
    setProducts(products.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
    
    try {
      await updateProductTemplate(product._id, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on failure
      setProducts(products.map(p => p._id === product._id ? { ...p, status: product.status } : p));
      await confirm({ title: 'Error', description: 'Failed to update product status', cancelText: null });
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedProductIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be captured before we style the original element
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverProductIdx(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedProductIdx(null);
    setDragOverProductIdx(null);
  };

  const handleLinkDragStart = (e, index) => {
    setDraggedLinkIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleLinkDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverLinkIdx(index);
  };

  const handleLinkDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleLinkDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedLinkIdx(null);
    setDragOverLinkIdx(null);
  };

  const handleLinkDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedLinkIdx === null || draggedLinkIdx === dropIndex) {
      handleLinkDragEnd(e);
      return;
    }
    const newLinks = [...formData.orderLinks];
    const draggedItem = newLinks[draggedLinkIdx];
    newLinks.splice(draggedLinkIdx, 1);
    newLinks.splice(dropIndex, 0, draggedItem);
    setFormData({ ...formData, orderLinks: newLinks });
    handleLinkDragEnd(e);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedProductIdx === null || draggedProductIdx === dropIndex) {
      handleDragEnd(e);
      return;
    }

    const newProducts = [...products];
    const draggedItem = newProducts[draggedProductIdx];
    newProducts.splice(draggedProductIdx, 1);
    newProducts.splice(dropIndex, 0, draggedItem);

    setProducts(newProducts);
    handleDragEnd(e);

    // Call API to update the backend
    try {
      const itemsToUpdate = newProducts.map((p, idx) => ({ id: p._id, displayOrder: idx }));
      await reorderProductTemplates(itemsToUpdate);
    } catch (err) {
      console.error("Failed to reorder products:", err);
      // Re-fetch to revert to actual state in case of error
      fetchInitialData();
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

                  <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-600 ml-1">Product Image</label>
                      <div className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-[1.5rem] shadow-sm">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                </div>
                <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={18} className="text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-800">Consumer View Info</h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">This information will be displayed to customers when they scan a QR code of this product.</p>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-gray-600">Product Description</label>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            (formData.productInfo.trim().split(/\s+/).filter(Boolean).length > 250) ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {formData.productInfo.trim().split(/\s+/).filter(Boolean).length} / 250 Words
                          </span>
                        </div>
                        <textarea
                          placeholder="Comprehensive details for scan result page..."
                          value={formData.productInfo}
                          onChange={(e) => {
                            const val = e.target.value;
                            const words = val.trim().split(/\s+/).filter(Boolean);
                            // Allow deletion or keeping within 250 words
                            if (words.length <= 250 || val.length < formData.productInfo.length) {
                              setFormData({ ...formData, productInfo: val });
                            }
                          }}
                          rows={3}
                          className={`w-full px-6 py-4 bg-white border rounded-[1.5rem] text-gray-900 resize-none focus:outline-none focus:ring-4 transition-all font-medium shadow-sm ${
                            (formData.productInfo.trim().split(/\s+/).filter(Boolean).length > 250) 
                              ? 'border-red-500 focus:ring-red-500/10' 
                              : 'border-gray-100 focus:ring-blue-500/10'
                          }`}
                        />
                        {formData.productInfo.trim().split(/\s+/).filter(Boolean).length > 250 && (
                          <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1">
                            <Plus size={10} className="rotate-45" /> Description exceeds maximum word limit of 250 words.
                          </p>
                        )}
                    </div>

                    {/* Ingredients */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-600 ml-1">Ingredients</label>
                        <textarea
                          placeholder="List ingredients here..."
                          value={formData.ingredients}
                          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                          rows={3}
                          className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-gray-900 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm"
                        />
                    </div>

                    {/* Certificates and Lab Tests */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-600 ml-1">Certificates and Lab Tests</label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, certificates: [...(formData.certificates || []), { name: '', image: '', imageFile: null }] })}
                          className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg"
                        >
                          <Plus size={16} /> Add Certificate
                        </button>
                      </div>
                      
                      {formData.certificates?.length > 0 ? (
                        <div className="space-y-4">
                          {formData.certificates.map((cert, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl items-start shadow-sm relative group">
                                <div className="flex-1 space-y-3">
                                  <input
                                    type="text"
                                    placeholder="Certificate Name (e.g. GMP Certified)"
                                    value={cert.name}
                                    onChange={(e) => {
                                      const newCerts = [...formData.certificates];
                                      newCerts[index].name = e.target.value;
                                      setFormData({ ...formData, certificates: newCerts });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                  <div className="flex items-center gap-4">
                                      <label className="flex-shrink-0 cursor-pointer">
                                          <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                                              <ImageIcon size={16} />
                                              <span className="text-[8px] mt-1 font-bold uppercase tracking-wider">Choose</span>
                                          </div>
                                          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleCertificateImageChange(e, index)} className="hidden" />
                                      </label>
                                      {cert.image && (
                                          <div className="relative group/img">
                                              {cert.image.toLowerCase().endsWith('.pdf') || (cert.imageFile && cert.imageFile.type === 'application/pdf') ? (
                                                  <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-red-500 shadow-sm">
                                                      <span className="text-xs font-bold">PDF</span>
                                                  </div>
                                              ) : (
                                                  <img src={cert.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                                              )}
                                              <button 
                                                  type="button" 
                                                  onClick={() => {
                                                    const newCerts = [...formData.certificates];
                                                    newCerts[index].image = '';
                                                    newCerts[index].imageFile = null;
                                                    setFormData({ ...formData, certificates: newCerts });
                                                  }}
                                                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all shadow-md"
                                              >
                                                  <Plus className="rotate-45 w-3 h-3" />
                                              </button>
                                          </div>
                                      )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCerts = [...formData.certificates];
                                    newCerts.splice(index, 1);
                                    setFormData({ ...formData, certificates: newCerts });
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="text-gray-300 mb-2" size={24} />
                            <p className="text-xs font-medium text-gray-500">No certificates or lab tests added yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/80 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-800">Product Education Resources</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, educationContent: [...(formData.educationContent || []), { title: '', description: '', url: '' }] })}
                      className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={16} /> Add Resource
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Add links to instructional videos, blog posts, or images to educate your customers.</p>
                  
                  <div className="space-y-4">
                    {!(formData.educationContent && formData.educationContent.length > 0) ? (
                      <div className="text-center py-6 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-400 text-sm font-medium">No education resources added yet.</p>
                      </div>
                    ) : (
                      formData.educationContent.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col sm:flex-row">
                          <div className="flex-1 space-y-3 w-full">
                            <input
                              type="text"
                              placeholder="Resource Title (e.g. How to assemble)"
                              value={item.title}
                              onChange={(e) => {
                                const newContent = [...formData.educationContent];
                                newContent[index].title = e.target.value;
                                setFormData({ ...formData, educationContent: newContent });
                              }}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium"
                            />
                            <textarea
                              placeholder="Brief description..."
                              value={item.description}
                              onChange={(e) => {
                                const newContent = [...formData.educationContent];
                                newContent[index].description = e.target.value;
                                setFormData({ ...formData, educationContent: newContent });
                              }}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-h-[60px]"
                            />
                            <input
                              type="url"
                              placeholder="https://... (Video, Image, or Doc URL)"
                              value={item.url}
                              onChange={(e) => {
                                const newContent = [...formData.educationContent];
                                newContent[index].url = e.target.value;
                                setFormData({ ...formData, educationContent: newContent });
                              }}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newContent = [...formData.educationContent];
                              newContent.splice(index, 1);
                              setFormData({ ...formData, educationContent: newContent });
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 sm:mt-1 self-end sm:self-auto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={18} className="text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-800">Purchase / Reorder Links</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, orderLinks: [...(formData.orderLinks || []), { title: '', url: '' }] })}
                      className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={16} /> Add Link
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Add links to Amazon, Flipkart, or your own website so customers can reorder.</p>
                  
                  <div className="space-y-4">
                    {!(formData.orderLinks && formData.orderLinks.length > 0) ? (
                      <div className="text-center py-6 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-400 text-sm font-medium">No purchase links added yet.</p>
                      </div>
                    ) : (
                      formData.orderLinks.map((link, index) => (
                        <div 
                          key={index} 
                          className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                          draggable
                          onDragStart={(e) => handleLinkDragStart(e, index)}
                          onDragEnter={(e) => handleLinkDragEnter(e, index)}
                          onDragOver={handleLinkDragOver}
                          onDragEnd={handleLinkDragEnd}
                          onDrop={(e) => handleLinkDrop(e, index)}
                        >
                          <div className="mt-2 text-gray-400 cursor-grab active:cursor-grabbing hover:text-blue-500">
                            <GripVertical size={20} />
                          </div>
                          <div className="flex-1 space-y-3">
                            <input
                              type="url"
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...formData.orderLinks];
                                newLinks[index].url = e.target.value;
                                setFormData({ ...formData, orderLinks: newLinks });
                              }}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [...formData.orderLinks];
                              newLinks.splice(index, 1);
                              setFormData({ ...formData, orderLinks: newLinks });
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={submitting || (formData.productInfo.trim().split(/\s+/).filter(Boolean).length > 250)}
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
                {products.map((product, index) => (
                  <div 
                    key={product._id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-white rounded-[2.5rem] p-6 shadow-sm border ${dragOverProductIdx === index ? 'border-blue-500 scale-105 shadow-xl ring-4 ring-blue-500/20' : 'border-gray-100'} hover:shadow-xl hover:shadow-gray-200/50 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-move ${product.status === 'inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  >
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
                            onClick={() => handleToggleStatus(product)}
                            className={`px-3 py-1.5 mr-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-1 ${product.status === 'inactive' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                            title={product.status === 'inactive' ? "Set Active" : "Set Inactive"}
                        >
                          {product.status === 'inactive' ? 'Inactive' : 'Active'}
                        </button>
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
