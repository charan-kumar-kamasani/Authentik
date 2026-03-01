import React, { useState, useEffect } from 'react';
import API_BASE_URL, { createOrder } from '../../config/api';
import { Calendar, Package, Plus, X } from 'lucide-react';

export default function GenerateQrs() {
  const [newQr, setNewQr] = useState({
    productName: '',
    brand: '',
    batchNo: '',
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
    setImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setImagePreview(null);
    }
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  // Variant management functions
  const addVariantInstance = (variantConfig) => {
    const newInstance = {
      id: Date.now(),
      variantName: variantConfig.variantName,
      variantLabel: variantConfig.variantLabel,
      inputType: variantConfig.inputType,
      options: variantConfig.options || [],
      value: variantConfig.inputType === 'color' ? '#000000' : '',
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

  const handleCreateQr = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    // Validate mandatory fields from form config
    if (formConfig?.customFields) {
      for (const field of formConfig.customFields) {
        if (field.isMandatory && !dynamicFieldValues[field.fieldName]) {
          alert(`${field.fieldLabel} is required`);
          return;
        }
      }
    }

    try {
      // Extract key fields from dynamicFieldValues
      const productName = dynamicFieldValues['productName'] || '';
      const batchNo = dynamicFieldValues['batchNo'] || '';
      const quantity = Number(dynamicFieldValues['quantity']) || 1;

      const orderData = {
        productName,
        brand: newQr.brand,
        batchNo,
        quantity,
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
        dynamicFields: dynamicFieldValues,
      };

      if (role === 'creator') {
        // Creators create an Order
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
          alert(`Successfully created ${result.count || 1} QRs!`);
          if (result.pdfBase64) downloadPdf(result.pdfBase64, 'products_qr_codes.pdf');
          resetForm();
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

  const resetForm = () => {
    setNewQr({ productName: '', brand: '', batchNo: '', quantity: '' });
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
        return (
          <InputGroup
            key={field.fieldName}
            label={field.fieldLabel}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(v) => handleDynamicFieldChange(field.fieldName, v)}
            type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
            required={field.isMandatory}
          />
        );

      case 'number':
        return (
          <InputGroup
            key={field.fieldName}
            label={field.fieldLabel}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(v) => handleDynamicFieldChange(field.fieldName, v)}
            type="number"
            required={field.isMandatory}
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
                  onChange={(e) => handleDynamicFieldChange(field.fieldName, e.target.files?.[0] || null)}
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
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
            Generate Product & QR
          </button>
        </div>
      </form>
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = 'text', required = true }) {
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
    </div>
  );
}
