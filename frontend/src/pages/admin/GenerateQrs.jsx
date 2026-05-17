import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL, { createOrder, updateOrder, getProductTemplates, createProductTemplate, deleteProductTemplate, getBrands } from '../../config/api';
import { Calendar, Package, Plus, X, List, LayoutGrid, Trash2, CheckCircle2, Search, ArrowLeft, Gift, Shield, ShieldCheck } from 'lucide-react';
import { useConfirm } from '../../components/ConfirmModal';

export default function GenerateQrs() {
  const [newQr, setNewQr] = useState({
    productName: '',
    skuNumber: '',
    brand: '',
    brandId: '',
    batchNo: '',
    productInfo: '',
    quantity: ''
  });
  const [filterBrandId, setFilterBrandId] = useState('');

  // Static date fields
  const [mfdOn, setMfdOn] = useState({ month: '', year: '' });
  const [bestBefore, setBestBefore] = useState({ value: '', unit: 'months' });
  const [calculatedExpiry, setCalculatedExpiry] = useState('');

  // Coupon fields
  const [coupon, setCoupon] = useState({ title: '', code: '', description: '', websiteLink: '', expiryDate: '' });

  // Warranty fields
  const [warranty, setWarranty] = useState({ duration: '', durationUnit: 'months', warrantyType: '', description: '', customerCare: '', supportEmail: '' });

  // Dynamic fields
  const [dynamicFieldValues, setDynamicFieldValues] = useState({});
  const [formConfig, setFormConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isCatalogProduct, setIsCatalogProduct] = useState(false);

  // Variants (multiple instances of each variant type)
  const [variantInstances, setVariantInstances] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [role, setRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [mobilePreviewOrder, setMobilePreviewOrder] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill form if editing existing order
  useEffect(() => {
    const order = location.state?.editOrder;
    if (order) {
      setEditingOrder(order);
      setNewQr({
        productName: order.productName || '',
        skuNumber: order.skuNumber || '',
        brand: order.brand || '',
        brandId: (order.brandId?._id || order.brandId) || '',
        batchNo: order.batchNo || '',
        productInfo: order.productInfo || '',
        quantity: order.quantity || ''
      });
      if (order.mfdOn) setMfdOn(order.mfdOn);
      if (order.bestBefore) setBestBefore(order.bestBefore);
      if (order.calculatedExpiryDate) setCalculatedExpiry(order.calculatedExpiryDate);
      if (order.dynamicFields) setDynamicFieldValues(order.dynamicFields);
      if (order.productImage) setImagePreview(order.productImage);
      if (order.variants) {
        setVariantInstances(order.variants.map((v, i) => ({
          id: Date.now() + i,
          variantName: v.variantName,
          value: v.value,
          variantLabel: v.variantName, // fallback
          inputType: 'text' // fallback, synced later
        })));
        if (order.coupon) {
        setCoupon({
          title: order.coupon.title || '',
          code: order.coupon.code || '',
          description: order.coupon.description || '',
          websiteLink: order.coupon.websiteLink || '',
          expiryDate: order.coupon.expiryDate || '',
          _expiryMonth: order.coupon.expiryDate ? new Date(order.coupon.expiryDate).getMonth() + 1 : '',
          _expiryYear: order.coupon.expiryDate ? new Date(order.coupon.expiryDate).getFullYear() : ''
        });
      }
      if (order.warranty) {
        setWarranty({
          duration: order.warranty.duration || '',
          durationUnit: order.warranty.durationUnit || 'months',
          warrantyType: order.warranty.warrantyType || '',
          description: order.warranty.description || '',
          customerCare: order.warranty.customerCare || '',
          supportEmail: order.warranty.supportEmail || '',
        });
      }
    }
    }
  }, [location.state]);

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
      variantName: resolved.variantName || 'custom_variant_' + Date.now(),
      variantLabel: resolved.variantLabel || 'New Variant',
      inputType: resolved.inputType || 'text',
      options: resolved.options || [],
      value: (resolved.inputType === 'color' ? '#000000' : ''),
      isCustom: !resolved.variantName
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

    // Mobile preview modal now serves as the confirmation step

    setSubmitting(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    // Validate mandatory fields and phone fields from form config
    if (formConfig?.customFields) {
      for (const field of formConfig.customFields) {
        const val = dynamicFieldValues[field.fieldName];
        if (field.isMandatory && !val) {
          await confirm({ title: 'Required Field', description: `${field.fieldLabel} is required`, cancelText: null });
          setSubmitting(false);
          return;
        }
        // Phone validation for dynamic fields of type 'phone'
        if (field.fieldType === 'phone' && val) {
          const phoneClean = String(val).replace(/[^0-9]/g, '');
          if (phoneClean.length !== 10) {
            await confirm({ title: 'Invalid Phone', description: `${field.fieldLabel} must be exactly 10 digits`, cancelText: null });
            setSubmitting(false);
            return;
          }
        }
      }
    }
    // Coupon Validation: If title is present, other fields are mandatory
    if (coupon.title) {
      if (!coupon.code || !coupon.expiryDate || !coupon.description || !coupon.websiteLink) {
        await confirm({ title: 'Missing Info', description: 'All coupon fields (Title, Code, Expiry, Description, Website Link) are mandatory if you provide a title.', cancelText: null });
        setSubmitting(false);
        return;
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
      } else if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('http')) {
        productImage = imagePreview;
      }

      // 1. Upload any images/files in dynamic fields
      const uploadedDynamicFields = await uploadDynamicFiles(dynamicFieldValues);

      // 2. Extract standardized fields using markers
      const nameField = formConfig?.customFields?.find(f => f.isProductName);
      const batchField = formConfig?.customFields?.find(f => f.isBatchNo);
      const imgField = formConfig?.customFields?.find(f => f.isProductImage);

      // Resolve Product Name
      const productName = (nameField ? uploadedDynamicFields[nameField.fieldName] : (uploadedDynamicFields['productName'] || '')) || newQr.productName || '';

      // Resolve Batch No
      const batchNo = (batchField ? uploadedDynamicFields[batchField.fieldName] : (uploadedDynamicFields['batchNo'] || '')) || newQr.batchNo || '';

      // Resolve Product Image (fallback to a marked field if static one is empty)
      if (!productImage && imgField) {
        productImage = uploadedDynamicFields[imgField.fieldName];
      }
      // Resolve Quantity (Improved detection)
      let quantityField = formConfig?.customFields?.find(f => f.isQuantity);
      
      // Fallback: search for field with "quantity" in label or name if no explicit marker
      if (!quantityField && formConfig?.customFields) {
        quantityField = formConfig.customFields.find(f => 
          (f.fieldLabel?.toLowerCase().includes('quantity')) || 
          (f.fieldName?.toLowerCase().includes('quantity'))
        );
      }

      const qtyValue = (quantityField ? uploadedDynamicFields[quantityField.fieldName] : (uploadedDynamicFields['quantity'] || uploadedDynamicFields['qrQuantity'] || '')) || 1;
      const quantity = Number(qtyValue) || 1;

      // Hard minimum: 1000 units required
      if (quantity < 1000) {
        await confirm({ title: 'Quantity Alert', description: `Minimum order quantity is 1000 units. You entered ${quantity}.`, cancelText: null });
        setSubmitting(false);
        return;
      }

      // Description word limit: 200 words max
      const descText = (newQr.productInfo || '').trim();
      if (descText) {
        const wordCount = descText.split(/\s+/).filter(Boolean).length;
        if (wordCount > 200) {
          await confirm({ title: 'Limit Exceeded', description: `Product description cannot exceed 200 words. Current: ${wordCount} words.`, cancelText: null });
          setSubmitting(false);
          return;
        }
      }

      // Minimum quantity check (Plan based)
      const activePlan = currentUser?.companyId?.planId;
      if (activePlan) {
        const minStr = activePlan.minQrPerOrder || activePlan.minQr || '';
        const planMin = Number(String(minStr).replace(/[^\d]/g, '') || 0);
        if (planMin > 0 && quantity < planMin) {
          await confirm({ title: 'Plan Restriction', description: `Minimum quantity for your plan (${activePlan.name}) is ${planMin} units.`, cancelText: null });
          setSubmitting(false);
          return;
        }
      }

      // Minimum quantity check (Field based)
      if (quantityField && quantityField.validation?.min) {
        if (quantity < quantityField.validation.min) {
          await confirm({ title: 'Validation Failed', description: `Minimum quantity allowed is ${quantityField.validation.min} units.`, cancelText: null });
          setSubmitting(false);
          return;
        }
      }

      // Warranty fields validation
      const hasAnyWarrantyField = !!(
        warranty.duration ||
        warranty.warrantyType ||
        warranty.description ||
        warranty.customerCare ||
        warranty.supportEmail
      );

      if (hasAnyWarrantyField) {
        const missingFields = [];
        if (!warranty.duration) missingFields.push('Warranty Duration');
        if (!warranty.warrantyType) missingFields.push('Warranty Type');
        if (!warranty.description) missingFields.push('Warranty Description');
        if (!warranty.customerCare) missingFields.push('Customer Care Number');
        if (!warranty.supportEmail) missingFields.push('Support Email');

        if (missingFields.length > 0) {
          await confirm({
            title: 'Warranty Info Required',
            description: `Since you've filled some warranty details, all warranty fields are mandatory. Please fill: ${missingFields.join(', ')}.`,
            cancelText: null
          });
          setSubmitting(false);
          return;
        }

        // Email validation for supportEmail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(warranty.supportEmail)) {
          await confirm({
            title: 'Invalid Support Email',
            description: 'Please enter a valid support email address for warranty.',
            cancelText: null
          });
          setSubmitting(false);
          return;
        }
      }

      const orderData = {
        productName,
        skuNumber: newQr.skuNumber,
        brand: newQr.brand,
        brandId: newQr.brandId,
        batchNo,
        quantity,
        productImage,
        productInfo: newQr.productInfo,
        // Static date fields
        mfdOn,
        bestBefore,
        calculatedExpiryDate: calculatedExpiry,
        // Variants (convert instances to simple array)
        variants: variantInstances.map(instance => ({
          variantName: instance.variantName,
          variantLabel: instance.variantLabel,
          value: instance.value,
        })),
        // Dynamic fields (all custom field values)
        dynamicFields: uploadedDynamicFields,
        // Coupon (if provided)
        coupon: coupon.title ? {
          title: coupon.title,
          code: coupon.code,
          description: coupon.description,
          websiteLink: coupon.websiteLink,
          expiryDate: coupon.expiryDate || null,
        } : undefined,
        // Warranty (if provided)
        warranty: (warranty.duration || warranty.warrantyType || warranty.customerCare || warranty.supportEmail || warranty.description) ? {
          duration: warranty.duration ? Number(warranty.duration) : null,
          durationUnit: warranty.durationUnit || 'months',
          warrantyType: warranty.warrantyType,
          description: warranty.description,
          customerCare: warranty.customerCare,
          supportEmail: warranty.supportEmail,
        } : undefined,
      };

      setMobilePreviewOrder(orderData);
    } catch (err) {
      console.error(err);
      await confirm({ title: 'Error', description: err.message || 'Failed to prepare QR order', cancelText: null });
    } finally {
      setSubmitting(false);
    }
  };

  const submitOrderData = async (orderData) => {
    setSubmitting(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id, orderData);
        setMobilePreviewOrder(null);
        await confirm({
          title: 'Success!',
          description: role === 'creator' ? 'Order updated and re-submitted! Authorizer will review it again.' : 'Order updated successfully!',
          confirmText: 'Done',
          cancelText: null
        });
        navigate('/orders');
      } else if (role === 'creator') {
        await createOrder(orderData, token);
        setMobilePreviewOrder(null);
        await confirm({
          title: 'Success!',
          description: 'Order created successfully. The authorizer will process it to generate QRs.',
          confirmText: 'Done',
          cancelText: null
        });
        navigate('/orders');
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
          let msg = `Successfully created ${result.count || 1} QRs!`;
          if (result.pdfBase64) {
            msg += ' Your PDF download will start now.';
            downloadPdf(result.pdfBase64, 'products_qr_codes.pdf');
          } else {
            msg += " (Note: PDF was too large for instant download; please use the streaming 'PDF' button in Order Management for this batch).";
          }
          
          setMobilePreviewOrder(null);
          await confirm({
            title: 'Success!',
            description: msg,
            confirmText: 'Done',
            cancelText: null
          });
          navigate('/orders');
        } else {
          const d = await res.json().catch(() => ({}));
          setMobilePreviewOrder(null);
          await confirm({ title: 'Error', description: d.error || 'Failed to create QR', cancelText: null });
        }
      }
    } catch (err) {
      console.error(err);
      await confirm({ title: 'Error', description: err.message || 'Failed to create QR', cancelText: null });
    } finally {
      setSubmitting(false);
      setMobilePreviewOrder(null);
    }
  };

  const resetForm = () => {
    setNewQr({ productName: '', skuNumber: '', brand: '', batchNo: '', productInfo: '', quantity: '' });
    setMfdOn({ month: '', year: '' });
    setBestBefore({ value: '', unit: 'months' });
    setCalculatedExpiry('');
    setDynamicFieldValues({});
    setVariantInstances([]);
    setImageFile(null);
    setImagePreview(null);
    setIsCatalogProduct(false);
    setCoupon({ code: '', description: '', expiryDate: '' });
    setWarranty({ duration: '', durationUnit: 'months', warrantyType: '', description: '' });
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
            const companyId = u.companyId._id;
            try {
              const bdata = await getBrands(companyId);
                const activeBrands = (bdata || []).filter(b => b.status !== 'blocked');
                setBrands(activeBrands);
                if (u?.brandId?._id) {
                  setNewQr((p) => ({ ...p, brand: u.brandId.brandName, brandId: u.brandId._id }));
                  setFilterBrandId(u.brandId._id);
                }
            } catch (err) {
              console.warn('Could not load company brands', err);
            }

            // Load products for the company
            try {
              const pData = await getProductTemplates(companyId);
              setProducts(pData || []);
            } catch (err) {
              console.warn('Could not load company products', err);
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
  


  const handleSelectTemplate = (t) => {
    setNewQr({
      productName: t.productName || '',
      skuNumber: t.skuNumber || '',
      brand: t.brandId?.brandName || t.brand || '',
      brandId: t.brandId?._id || t.brandId || '',
      batchNo: '', // Batch usually fresh
      productInfo: t.productInfo || '',
      quantity: ''
    });

    if (t.bestBefore) {
      setBestBefore({
        value: t.bestBefore.value || '',
        unit: t.bestBefore.unit || 'months'
      });
    }

    if (t.productImage) {
      setImagePreview(t.productImage);
      setImageFile(null); // Clear local file if using template image
    }

    setIsCatalogProduct(true);

    if (t.dynamicFields) {
      setDynamicFieldValues(t.dynamicFields);
    }

    if (t.variants && t.variants.length > 0) {
      setVariantInstances(t.variants.map(v => ({
        ...v,
        id: Date.now() + Math.random() // Ensure unique ID
      })));
    } else {
      setVariantInstances([]);
    }

    setActiveTab('generate');
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



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
            onChange={(v) => handleDynamicFieldChange(field.fieldName, field.fieldType === 'phone' ? v.replace(/[^0-9]/g, '') : v)}
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

  const filteredProducts = filterBrandId 
    ? products.filter(p => (p.brandId?._id || p.brandId) === filterBrandId)
    : products;

  const hasAnyWarrantyField = !!(
    warranty.duration ||
    warranty.warrantyType ||
    warranty.description ||
    warranty.customerCare ||
    warranty.supportEmail
  );

  return (
    <div className="bg-white rounded-2xl p-0 shadow-sm border border-slate-200 relative overflow-hidden">
      {/* Tabs */}

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Create New Product Record
          </h3>
        </div>

        <form onSubmit={handleCreateQr} className="grid grid-cols-2 gap-6">

        {/* Brand Filter */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            Filter by Brand
          </label>
          <select
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold shadow-sm cursor-pointer"
            value={filterBrandId}
            onChange={(e) => {
              setFilterBrandId(e.target.value);
              // reset product selection if it doesn't match the new brand
              if (e.target.value && isCatalogProduct && newQr.brandId !== e.target.value) {
                setNewQr(prev => ({ ...prev, productName: '', skuNumber: '', productInfo: '', brand: '', brandId: '' }));
                setIsCatalogProduct(false);
                setImagePreview(null);
                setImageFile(null);
              }
            }}
          >
            <option value="">-- All Brands --</option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.brandName}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 mt-1">
            Narrow down products by brand
          </p>
        </div>

        {/* Product Selection from Catalog */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            Select Product from Catalog <span className="text-indigo-600">*</span>
            {products.length === 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">No products found</span>}
          </label>
          <select
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold shadow-sm cursor-pointer"
            onChange={(e) => {
              const selectedId = e.target.value;
              if (!selectedId) {
                setNewQr(prev => ({...prev, productName: '', skuNumber: '', productInfo: '', brand: '', brandId: ''}));
                setIsCatalogProduct(false);
                setImagePreview(null);
                setImageFile(null);
                return;
              }
              const prod = products.find(p => p._id === selectedId);
              if (prod) {
                setNewQr({
                  ...newQr,
                  productName: prod.productName,
                  skuNumber: prod.skuNumber || '',
                  productInfo: prod.productInfo || '',
                  brand: (prod.brandId?.brandName || prod.brand) || '',
                  brandId: (prod.brandId?._id || prod.brandId) || ''
                });
                setIsCatalogProduct(true);
                if (prod.productImage) {
                  setImagePreview(prod.productImage);
                  setImageFile(null);
                } else {
                  setImagePreview(null);
                  setImageFile(null);
                }
              }
            }}
            required
          >
            <option value="">-- Choose Product --</option>
            {filteredProducts.map(p => (
              <option key={p._id} value={p._id}>{p.productName} ({p.brandId?.brandName || p.brand})</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 mt-1">
            Selecting a product from the catalog auto-fills its brand, image and details.
          </p>
        </div>



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
                disabled={isCatalogProduct}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
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
            disabled={isCatalogProduct}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none disabled:bg-slate-100 disabled:text-slate-500"
          />
          {(() => {
            const wc = (newQr.productInfo || '').trim().split(/\s+/).filter(Boolean).length;
            return (
              <div className={`text-xs font-bold ml-1 mt-0.5 ${wc > 200 ? 'text-red-500' : wc > 180 ? 'text-amber-500' : 'text-slate-400'}`}>
                {wc}/200 words {wc > 200 && '— exceeds limit'}
              </div>
            );
          })()}
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
        {((formConfig?.variants && formConfig.variants.length > 0) || variantInstances.length > 0) && (
          <>
            <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-800">Product Variants</h4>
              </div>
            </div>

            {/* Variant Selector Buttons */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Available Variant Types</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { variantName: 'color', variantLabel: 'Color', inputType: 'color' },
                  { variantName: 'size', variantLabel: 'Size', inputType: 'text' },
                  { variantName: 'model_series', variantLabel: 'Model/Series', inputType: 'text' },
                  { variantName: 'weight', variantLabel: 'Weight', inputType: 'text' },
                  { variantName: 'storage', variantLabel: 'Storage', inputType: 'text' },
                  { variantName: 'flavour', variantLabel: 'Flavour', inputType: 'text' },
                  { variantName: 'capacity', variantLabel: 'Capacity', inputType: 'text' },
                  { variantName: 'material', variantLabel: 'Material', inputType: 'text' }
                ].map((variant) => (
                  <button
                    key={variant.variantName}
                    type="button"
                    onClick={() => addVariantInstance(variant)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-sm"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Add {variant.variantLabel}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addVariantInstance({})}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-sm border-2 border-slate-200 border-dashed"
                >
                  <Plus size={14} strokeWidth={3} />
                  Add Custom Variant
                </button>
              </div>
            </div>

            {/* Display Added Variant Instances */}
            {variantInstances.length > 0 && (
              <div className="col-span-2 space-y-3">
                {variantInstances.map((instance) => (
                  <div key={instance.id} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex-1">
                      {instance.isCustom ? (
                        <input
                          type="text"
                          value={instance.variantLabel}
                          onChange={(e) => {
                            setVariantInstances(prev => prev.map(inst => 
                              inst.id === instance.id ? { ...inst, variantLabel: e.target.value, variantName: e.target.value.toLowerCase().replace(/\s+/g, '_') } : inst
                            ));
                          }}
                          className="block w-full text-xs font-bold text-blue-700 mb-1 bg-transparent border-b border-blue-200 focus:border-blue-400 focus:outline-none"
                          placeholder="Variant Name (e.g. Material)"
                        />
                      ) : (
                        <label className="block text-xs font-semibold text-blue-700 mb-1">
                          {instance.variantLabel}
                        </label>
                      )}
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
            Mfd On (Manufacturing Date)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="MM"
              value={mfdOn.month}
              onChange={(e) => setMfdOn({ ...mfdOn, month: e.target.value.replace(/\D/g, '') })}
              maxLength="2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
 
            />
            <input
              type="text"
              placeholder="YYYY"
              value={mfdOn.year}
              onChange={(e) => setMfdOn({ ...mfdOn, year: e.target.value.replace(/\D/g, '') })}
              maxLength="4"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
    
            />
          </div>
        </div>

        {/* Best Before (Shelf Life) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Best Before (Shelf Life)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Duration"
              value={bestBefore.value}
              onChange={(e) => setBestBefore({ ...bestBefore, value: e.target.value.replace(/\D/g, '') })}
              maxLength="4"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
         
            />
            <select
              value={bestBefore.unit}
              onChange={(e) => setBestBefore({ ...bestBefore, unit: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              
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

        {/* Coupon Code Section */}
        <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} className="text-purple-600" />
            <h4 className="text-sm font-semibold text-slate-800">Coupon / Reward (Optional)</h4>
          </div>
        </div>

        {/* Coupon Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Coupon Title {coupon.title && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. Special Offer"
            value={coupon.title}
            onChange={(e) => setCoupon({ ...coupon, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
          />
        </div>

        {/* Website Link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Website Link {coupon.title && <span className="text-red-500">*</span>}
          </label>
          <input
            type="url"
            placeholder="e.g. https://brand.com/redeem"
            value={coupon.websiteLink}
            onChange={(e) => setCoupon({ ...coupon, websiteLink: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Coupon Code {coupon.title && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. SAVE20"
            value={coupon.code}
            onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium uppercase"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Coupon Expiry Date {coupon.title && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-2">
            <select
              value={coupon.expiryDate ? new Date(coupon.expiryDate).getMonth() + 1 || '' : (coupon._expiryMonth || '')}
              onChange={(e) => {
                const mm = e.target.value;
                const yy = coupon._expiryYear || new Date().getFullYear();
                setCoupon({ ...coupon, _expiryMonth: mm, _expiryYear: yy, expiryDate: mm && yy ? `${yy}-${String(mm).padStart(2, '0')}-28` : '' });
              }}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
              ))}
            </select>
            <select
              value={coupon._expiryYear || (coupon.expiryDate ? new Date(coupon.expiryDate).getFullYear() : '')}
              onChange={(e) => {
                const yy = e.target.value;
                const mm = coupon._expiryMonth || (coupon.expiryDate ? new Date(coupon.expiryDate).getMonth() + 1 : '');
                setCoupon({ ...coupon, _expiryYear: yy, _expiryMonth: mm, expiryDate: mm && yy ? `${yy}-${String(mm).padStart(2, '0')}-28` : '' });
              }}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
            >
              <option value="">YYYY</option>
              {Array.from({ length: 10 }, (_, i) => {
                const yr = new Date().getFullYear() + i;
                return <option key={yr} value={yr}>{yr}</option>;
              })}
            </select>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Coupon Description {coupon.title && <span className="text-red-500">*</span>}
          </label>
          <textarea
            placeholder="e.g. Get 20% off on your next purchase..."
            value={coupon.description}
            onChange={(e) => setCoupon({ ...coupon, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium resize-none"
          />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 mt-1">
            If provided, users who scan &amp; review this product will receive this coupon as a reward.
          </p>
        </div>

        {/* Warranty Information Section */}
        <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-emerald-600" />
            <h4 className="text-sm font-semibold text-slate-800">Warranty Information (Optional)</h4>
          </div>
        </div>

        {/* Warranty Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Warranty Duration {hasAnyWarrantyField && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="e.g. 12"
              value={warranty.duration}
              onChange={(e) => setWarranty({ ...warranty, duration: e.target.value.replace(/\D/g, '') })}
              maxLength="4"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            />
            <select
              value={warranty.durationUnit}
              onChange={(e) => setWarranty({ ...warranty, durationUnit: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        {/* Warranty Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Warranty Type {hasAnyWarrantyField && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. Manufacturer Warranty"
            value={warranty.warrantyType}
            onChange={(e) => setWarranty({ ...warranty, warrantyType: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        {/* Customer Care Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Customer Care Number {hasAnyWarrantyField && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. +1-800-555-0199"
            value={warranty.customerCare}
            onChange={(e) => setWarranty({ ...warranty, customerCare: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        {/* Support Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Support Email {hasAnyWarrantyField && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            placeholder="e.g. support@brand.com"
            value={warranty.supportEmail}
            onChange={(e) => setWarranty({ ...warranty, supportEmail: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        {/* Warranty Description */}
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Warranty Description {hasAnyWarrantyField && <span className="text-red-500">*</span>}
          </label>
          <textarea
            placeholder="e.g. Covers manufacturing defects for 12 months from date of purchase..."
            value={warranty.description}
            onChange={(e) => setWarranty({ ...warranty, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium resize-none"
          />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 mt-1">
            If provided, warranty information will be displayed to customers on the scan result page.
          </p>
        </div>

        {/* Submit Button */}
        <div className="col-span-2 pt-4">
          <button 
            type="submit" 
            disabled={submitting} 
            className={"w-full text-white font-semibold py-3.5 rounded-xl transition-all shadow-md " + (submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]')}
          >
            {submitting ? 'Processing...' : (role === 'creator' ? 'Create Order & QRs' : 'Generate Product & QR')}
          </button>
        </div>
      </form>

      </div>

      {/* --- Consumer Mobile Preview Modal --- */}
      {mobilePreviewOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-[375px] h-[750px] max-h-[90vh] bg-[#F5F5F5] rounded-[2.5rem] shadow-2xl overflow-y-auto border-[10px] border-slate-800 flex flex-col hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl w-1/2 mx-auto z-50"></div>
            
            {/* Header */}
            <div className="w-full flex items-center justify-center p-4 bg-white sticky top-0 z-40 shadow-sm/50 pt-8">
              <h1 className="text-[18px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
              <button 
                onClick={() => setMobilePreviewOrder(null)} 
                className="absolute right-4 top-7 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                title="Close Emulator"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="w-full flex flex-col pb-6">
              {/* Authentic Status Card */}
                <div className="flex flex-row justify-center items-center gap-3">
                  <div className="bg-white rounded-full p-1.5">
                    <ShieldCheck size={24} className="text-[#2CA4D6] fill-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-[16px] font-bold leading-tight">Authentic Product</h2>
                    <p className="text-[11px] opacity-90 font-medium">This product has been verified as genuine</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white shadow-sm rounded-b-[14px] mx-3">
                <div className="bg-white pb-5 flex flex-col items-center relative gap-3 rounded-b-[14px]">
                  <div className="w-full bg-[#1F2642] py-2 text-center">
                    <h3 className="text-white font-bold text-[18px] px-2 truncate leading-tight">{mobilePreviewOrder.productName}</h3>
                  </div>
                  <div className="relative h-[200px] w-[90%] rounded-[1.5rem] mt-2 mx-auto overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-md border-4 border-white flex items-center justify-center">
                    {mobilePreviewOrder.productImage ? (
                      <img src={mobilePreviewOrder.productImage} className="w-full h-full object-contain" alt="Product" />
                    ) : (
                      <span className="text-slate-300 font-bold text-sm">No Image</span>
                    )}
                  </div>
                  
                  {/* Grid Fields */}
                  <div className="w-full px-4 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#F0F7FF] rounded-xl flex items-center justify-start gap-3 p-3 border border-[#e5f0fa]">
                         <div className="flex-1 w-full flex flex-col items-start gap-0"><span className="text-[#0D4E96] text-[9px] font-black uppercase tracking-widest opacity-60">Brand</span><span className="text-[#0D4E96] text-[13px] font-black tracking-tight">{mobilePreviewOrder.brand}</span></div>
                      </div>
                      {mobilePreviewOrder.mfdOn?.month && (
                        <div className="bg-[#F0F7FF] rounded-xl flex items-center justify-start gap-3 p-3 border border-[#e5f0fa]">
                           <div className="flex-1 w-full flex flex-col items-start gap-0"><span className="text-[#0D4E96] text-[9px] font-black uppercase tracking-widest opacity-60">Mfd on</span><span className="text-[#0D4E96] text-[13px] font-black tracking-tight">{mobilePreviewOrder.mfdOn?.month} {mobilePreviewOrder.mfdOn?.year}</span></div>
                        </div>
                      )}
                      {(mobilePreviewOrder.variants || []).slice(0,2).map((val, idx) => (
                        <div key={idx} className="bg-[#F0F7FF] rounded-xl flex items-center justify-start gap-3 p-3 border border-[#e5f0fa]">
                           <div className="flex-1 w-full flex flex-col items-start gap-0"><span className="text-[#0D4E96] text-[9px] font-black uppercase tracking-widest opacity-60 truncate w-full">{val.variantName}</span><span className="text-[#0D4E96] text-[13px] font-black tracking-tight truncate w-full">{val.value}</span></div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-5 border-t border-gray-100 pt-3 mb-3">
                      <h4 className="text-[#333] font-bold text-[12px] mb-2 ml-1 uppercase tracking-tight">Additional Info:</h4>
                      <div className="bg-[#F2F2F2] p-3 rounded-[16px] shadow-sm space-y-3 border border-gray-200/50">
                        {mobilePreviewOrder.productInfo && (
                          <div className="mb-3">
                            <p className="text-[#444] text-[12px] font-medium whitespace-pre-wrap leading-relaxed">{mobilePreviewOrder.productInfo}</p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="border-b border-gray-300/30 pb-2">
                             <p className="text-[#333] text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Manufactured By</p>
                             <p className="text-[#0D4E96] text-[12px] font-bold">{currentUser?.companyId?.companyName || 'Unknown Company'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 mt-auto">
                    <button
                        onClick={() => submitOrderData(mobilePreviewOrder)}
                        disabled={submitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Submitting...' : 'Proceed to Submit'} <ArrowLeft className="rotate-180" size={18} />
                    </button>
                </div>
              </div>
          </div>
        </div>
      )}
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
        type={type === 'number' ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (type === 'number') val = val.replace(/\D/g, '');
          onChange(val);
        }}
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
