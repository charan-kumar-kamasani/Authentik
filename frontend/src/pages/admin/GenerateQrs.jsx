import React, { useState, useEffect } from 'react';
import API_BASE_URL, { createOrder } from '../../config/api';
import { Calendar, Package, Plus, X } from 'lucide-react';
import { useConfirm } from '../../components/ConfirmModal';

export default function GenerateQrs() {
  const [newQr, setNewQr] = useState({
    productName: '',
    brand: '',
    batchNo: '',
    description: '',
    productInfo: '',
    quantity: ''
  });

  // Static date fields
  const [mfdOn, setMfdOn] = useState({ month: '', year: '' });
  const [bestBefore, setBestBefore] = useState({ value: '', unit: 'months' });
  const [calculatedExpiry, setCalculatedExpiry] = useState('');

  // Dynamic fields
  const [dynamicFieldValues, setDynamicFieldValues] = useState({});
  const [formConfig, setFormConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Variants (multiple instances of each variant type)
  const [variantInstances, setVariantInstances] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [role, setRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const confirm = useConfirm();

  // Calculate expiry date when mfdOn or bestBefore changes
  useEffect(() => {
    if (mfdOn.month && mfdOn.year && bestBefore.value) {
      try {
        const month = parseInt(mfdOn.month);
        const year = parseInt(mfdOn.year);
        const duration = parseInt(bestBefore.value);
        const unit = bestBefore.unit;

        if (month >= 1 && month <= 12 && year > 0 && duration > 0) {
          let expiryMonth = month;
          let expiryYear = year;

          if (unit === 'months') {
            expiryMonth += duration;
            while (expiryMonth > 12) {
              expiryMonth -= 12;
              expiryYear += 1;
            }
          } else if (unit === 'years') {
            expiryYear += duration;
          }

          setCalculatedExpiry(`${String(expiryMonth).padStart(2, '0')}/${expiryYear}`);
        } else {
          setCalculatedExpiry('');
        }
      } catch (e) {
        setCalculatedExpiry('');
      }
    } else {
      setCalculatedExpiry('');
    }
  }, [mfdOn, bestBefore]);

  const handleImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (img.width !== img.height) {
        alert("Please upload a square image (1:1 aspect ratio).");
        e.target.value = "";
        return;
      }
      setImageFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(f);
    };
    img.src = URL.createObjectURL(f);
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  // Variant management functions
  const addVariantInstance = (variantConfig) => {
    // Always resolve the variant from the latest formConfig so changes
    // made in the FormBuilder (inputType/options) are respected immediately.
    const resolved = (formConfig?.variants || []).find(v => v.variantName === variantConfig.variantName) || variantConfig;
    const newInstance = {
      id: Date.now(),
      variantName: resolved.variantName,
      variantLabel: resolved.variantLabel,
      inputType: resolved.inputType,
      options: resolved.options || [],
      value: resolved.inputType === 'color' ? '#000000' : '',
    };
    setVariantInstances(prev => [...prev, newInstance]);
  };

  const updateVariantInstance = (id, value) => {
    setVariantInstances(prev =>
      prev.map(instance => instance.id === id ? { ...instance, value } : instance)
    );
  };

  const removeVariantInstance = (id) => {
    setVariantInstances(prev => prev.filter(instance => instance.id !== id));
  };

  // Keep existing variant instances in sync when admin updates variant types/options
  useEffect(() => {
    if (!formConfig?.variants || variantInstances.length === 0) return;
    setVariantInstances(prev => prev.map(inst => {
      const resolved = formConfig.variants.find(v => v.variantName === inst.variantName);
      if (!resolved) return inst;
      // If input type changed to color and current value is not a color, reset to a default
      let newValue = inst.value;
      if (resolved.inputType === 'color' && !(typeof newValue === 'string' && newValue.startsWith('#'))) {
        newValue = '#000000';
      }
      return { ...inst, inputType: resolved.inputType, options: resolved.options || [], value: newValue, variantLabel: resolved.variantLabel };
    }));
  }, [formConfig?.variants]);

  const handleCreateQr = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const ok = await confirm({ title: 'Create Product & QR', description: 'Are you sure you want to create this product record and generate QR codes?', confirmText: 'Yes, Create', cancelText: 'Cancel' });
    if (!ok) return;

    setSubmitting(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    // Validate mandatory fields from form config
    if (formConfig?.customFields) {
      for (const field of formConfig.customFields) {
        if (field.isMandatory && !dynamicFieldValues[field.fieldName]) {
          alert(`${field.fieldLabel} is required`);
          setSubmitting(false);
          return;
        }
      }
    }

    const uploadImage = async (file) => {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.warn('Cloudinary config missing, skipping upload');
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      } catch (err) {
        console.error('Image upload failed', err);
        return null;
      }
    };

    const uploadDynamicFiles = async (data) => {
      const updatedData = { ...data };
      for (const [key, value] of Object.entries(updatedData)) {
        if (value instanceof File) {
          updatedData[key] = await uploadImage(value);
        }
      }
      return updatedData;
    };

    try {
      let productImage = null;
      if (imageFile) {
        productImage = await uploadImage(imageFile);
      }

      // 1. Upload any images/files in dynamic fields
      const uploadedDynamicFields = await uploadDynamicFiles(dynamicFieldValues);

      // 2. Extract standardized fields using markers
      const nameField = formConfig?.customFields?.find(f => f.isProductName);
      const batchField = formConfig?.customFields?.find(f => f.isBatchNo);
      const imgField = formConfig?.customFields?.find(f => f.isProductImage);
      const quantityField = formConfig?.customFields?.find(f => f.isQuantity);

      // Resolve Product Name
      const productName = (nameField ? uploadedDynamicFields[nameField.fieldName] : (uploadedDynamicFields['productName'] || '')) || '';

      // Resolve Batch No
      const batchNo = (batchField ? uploadedDynamicFields[batchField.fieldName] : (uploadedDynamicFields['batchNo'] || '')) || '';

      // Resolve Product Image (fallback to a marked field if static one is empty)
      if (!productImage && imgField) {
        productImage = uploadedDynamicFields[imgField.fieldName];
      }

      // Resolve Quantity
      const qtyValue = (quantityField ? uploadedDynamicFields[quantityField.fieldName] : (uploadedDynamicFields['quantity'] || '')) || 1;
      const quantity = Number(qtyValue) || 1;

      const orderData = {
        productName,
        brand: newQr.brand,
        batchNo,
        quantity,
        productImage,
        description: newQr.description,
        productInfo: newQr.productInfo,
        // Static date fields
        mfdOn,
        bestBefore,
        calculatedExpiryDate: calculatedExpiry,
        // Variants (convert instances to simple array)
        variants: variantInstances.map(instance => ({
          variantName: instance.variantName,
          value: instance.value,
        })),
        // Dynamic fields (all custom field values)
        dynamicFields: uploadedDynamicFields,
      };

      if (role === 'creator') {
        // Creators create an Order — server enforces any plan minimums
        await createOrder(orderData, token);
        alert('Order created. Admin will process it to generate QRs.');
        resetForm();
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/create-qr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (res.ok) {
          const result = await res.json();
          if (result.pdfBase64) {
            alert(`Successfully created ${result.count || 1} QRs! Your PDF download will start now.`);
            downloadPdf(result.pdfBase64, 'products_qr_codes.pdf');
          } else {
            alert(`Successfully created ${result.count || 1} QRs! (Note: PDF was too large for instant download; please use the streaming 'PDF' button in Order Management for this batch).`);
          }
          resetForm();
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.error || 'Failed to create QR');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create QR');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewQr({ productName: '', brand: '', batchNo: '', description: '', productInfo: '', quantity: '' });
    setMfdOn({ month: '', year: '' });
    setBestBefore({ value: '', unit: 'months' });
    setCalculatedExpiry('');
    setDynamicFieldValues({});
    setVariantInstances([]);
    setImageFile(null);
    setImagePreview(null);
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
          setCurrentUser(u);

          // Fetch global form configuration
          try {
            const configRes = await fetch(`${API_BASE_URL}/admin/form-config`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (configRes.ok) {
              const configData = await configRes.json();
              setFormConfig(configData.formConfig || null);
            }
          } catch (err) {
            console.warn('Could not load form config', err);
          } finally {
            setLoadingConfig(false);
          }

          // Load brands for the company only
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
          }

        } else {
          setLoadingConfig(false);
        }
      } catch (err) {
        console.warn('Could not load current user', err);
        setLoadingConfig(false);
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

  const renderDynamicField = (field) => {
    const value = dynamicFieldValues[field.fieldName] || '';

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <InputGroup
            key={field.fieldName}
            label={field.fieldLabel}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(v) => handleDynamicFieldChange(field.fieldName, v)}
            type={field.fieldType === 'number' ? 'number' : field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
            required={field.isMandatory}
            helpText={field.isQuantity ? "This field determines the number of QRs to be generated." : null}
          />
        );

      case 'dropdown':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.fieldName, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required={field.isMandatory}
            >
              <option value="">Select {field.fieldLabel}</option>
              {(field.options || []).map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5 col-span-2">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder || ''}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none"
              required={field.isMandatory}
            />
          </div>
        );

      case 'date':
        return (
          <InputGroup
            key={field.fieldName}
            label={field.fieldLabel}
            value={value}
            onChange={(v) => handleDynamicFieldChange(field.fieldName, v)}
            type="date"
            required={field.isMandatory}
          />
        );

      case 'file':
      case 'image':
        const filePreview = value instanceof File && field.fieldType === 'image' ? URL.createObjectURL(value) : null;
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <label className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer text-sm text-slate-700 hover:bg-slate-100 transition-colors font-medium">
                <input
                  type="file"
                  accept={field.fieldType === 'image' ? 'image/*' : '*/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && field.fieldType === 'image') {
                      const img = new Image();
                      img.onload = () => {
                        if (img.width !== img.height) {
                          alert('Please upload a square image (1:1 aspect ratio).');
                          e.target.value = '';
                          return;
                        }
                        handleDynamicFieldChange(field.fieldName, file);
                      };
                      img.src = URL.createObjectURL(file);
                    } else {
                      handleDynamicFieldChange(field.fieldName, file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={field.isMandatory}
                />
                Choose {field.fieldType === 'image' ? 'Image' : 'File'}
              </label>
              {field.fieldType === 'image' && (
                filePreview ? (
                  <img src={filePreview} alt="preview" className="w-20 h-20 object-cover rounded-md border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-400">No image</div>
                )
              )}
              {value instanceof File && (
                <span className="text-xs text-slate-500">{value.name}</span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loadingConfig) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading form configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
          Create New Product Record
        </h3>
      </div>

      {/* Company Form Config Info */}
      {/* {formConfig && currentUser?.companyId && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-xs text-indigo-800">
          </p>
        </div>
      )} */}

      <form onSubmit={handleCreateQr} className="grid grid-cols-2 gap-6">
        {/* Brand Dropdown (Static Field) */}
        {formConfig?.staticFields?.brand?.enabled && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              Brand {formConfig.staticFields.brand.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <select
              value={newQr.brand}
              onChange={(e) => setNewQr({ ...newQr, brand: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required={formConfig.staticFields.brand.isMandatory}
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b.brandName}>{b.brandName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Product Image Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Product Image
          </label>
          <div className="flex items-center gap-4">
            <label className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer text-sm text-slate-700 hover:bg-slate-100 transition-colors font-medium">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageFile ? 'Change Image' : 'Choose Image'}
            </label>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">No image</div>
            )}
            {imageFile && (
              <span className="text-xs text-slate-500 truncate max-w-[100px]">{imageFile.name}</span>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Product Description (Additional Info)
          </label>
          <textarea
            value={newQr.description}
            onChange={(e) => setNewQr({ ...newQr, description: e.target.value })}
            placeholder="Enter product details, key benefits, or other additional info..."
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none"
          />
        </div>

        {/* Product Info (Paragraph for scan results) */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Product Info (Shown on scan result page)
          </label>
          <textarea
            value={newQr.productInfo}
            onChange={(e) => setNewQr({ ...newQr, productInfo: e.target.value })}
            placeholder="Enter detailed product info paragraph that customers will see after scanning..."
            rows={5}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none"
          />
        </div>




        {/* Dynamic Custom Fields */}
        {formConfig?.customFields && formConfig.customFields.length > 0 && (
          <>
            {formConfig.customFields
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(field => renderDynamicField(field))}
          </>
        )}

        {/* Product Variants Section */}
        {formConfig?.variants && formConfig.variants.length > 0 && (
          <>
            <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-800">Product Variants (Optional)</h4>
              </div>
            </div>

            {/* Variant Selector Buttons */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Add Variants</label>
              <div className="flex flex-wrap gap-2">
                {formConfig.variants.map((variant) => (
                  <button
                    key={variant.variantName}
                    type="button"
                    onClick={() => addVariantInstance(variant)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Add {variant.variantLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Added Variant Instances */}
            {variantInstances.length > 0 && (
              <div className="col-span-2 space-y-3">
                {variantInstances.map((instance) => (
                  <div key={instance.id} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-blue-700 mb-1">
                        {instance.variantLabel}
                      </label>
                      {instance.inputType === 'color' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={instance.value || '#000000'}
                            onChange={(e) => updateVariantInstance(instance.id, e.target.value)}
                            className="w-16 h-10 rounded border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={instance.value || '#000000'}
                            onChange={(e) => updateVariantInstance(instance.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                            placeholder="#000000"
                          />
                        </div>
                      ) : instance.inputType === 'dropdown' ? (
                        <select
                          value={instance.value}
                          onChange={(e) => updateVariantInstance(instance.id, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        >
                          <option value="">Select {instance.variantLabel}</option>
                          {(instance.options || []).map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={instance.value}
                          onChange={(e) => updateVariantInstance(instance.id, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder={`Enter ${instance.variantLabel}`}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantInstance(instance.id)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-indigo-600" />
            <h4 className="text-sm font-semibold text-slate-800">Date & Expiry Information</h4>
          </div>
        </div>

        {/* Static Date Fields - Mfd On (MM/YYYY) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Mfd On (Manufacturing Date) <span className="text-indigo-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="MM"
              value={mfdOn.month}
              onChange={(e) => setMfdOn({ ...mfdOn, month: e.target.value })}
              min="1"
              max="12"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required
            />
            <input
              type="number"
              placeholder="YYYY"
              value={mfdOn.year}
              onChange={(e) => setMfdOn({ ...mfdOn, year: e.target.value })}
              min="2000"
              max="2099"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required
            />
          </div>
        </div>

        {/* Best Before (Shelf Life) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Best Before (Shelf Life) <span className="text-indigo-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Duration"
              value={bestBefore.value}
              onChange={(e) => setBestBefore({ ...bestBefore, value: e.target.value })}
              min="1"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required
            />
            <select
              value={bestBefore.unit}
              onChange={(e) => setBestBefore({ ...bestBefore, unit: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              required
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        {/* Calculated Expiry Date (Read-only Display) */}
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Calculated Expiry Date (Auto-calculated)
          </label>
          <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-800 font-semibold">
            {calculatedExpiry || 'Enter Mfd On and Best Before to calculate'}
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-2 pt-4">
          <button type="submit" disabled={submitting} className={"w-full text-white font-semibold py-3 rounded-xl transition-all shadow-sm " + (submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700')}>
            {submitting ? 'Creating...' : 'Generate Product & QR'}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = 'text', required = true, helpText = null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 ml-1">
        {label} {required && <span className="text-indigo-600">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
        required={required}
      />
      {helpText && (
        <p className="text-[11px] text-blue-600 font-medium ml-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {helpText}
        </p>
      )}
    </div>
  );
}
