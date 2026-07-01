import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL, { createOrder, updateOrder, getProductTemplates, createProductTemplate, deleteProductTemplate, getBrands } from '../../config/api';
import { Calendar, Package, Plus, X, List, LayoutGrid, Trash2, CheckCircle2, Search, ArrowLeft, Gift, Shield, ShieldCheck, Info } from 'lucide-react';
import { useConfirm } from '../../components/ConfirmModal';

export default function GenerateQrs() {
  const [currentStep, setCurrentStep] = useState(1);
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

  // Cashback fields
  const [cashback, setCashback] = useState({ isActive: false, totalFund: '', minPerUser: '', maxPerUser: '' });

  // Loyalty Points fields
  const [loyalty, setLoyalty] = useState({ isActive: false, pointsPerScan: '', totalPointsFund: '' });


  // Dynamic fields
  const [dynamicFieldValues, setDynamicFieldValues] = useState({});
  const [formConfig, setFormConfig] = useState({
    customFields: [
      { fieldName: "sku", fieldLabel: "SKU", fieldType: "text", isMandatory: false, placeholder: "e.g. WH-1000XM4" },
      { fieldName: "batchNo", fieldLabel: "Batch Number", fieldType: "text", isMandatory: true, isBatchNo: true, placeholder: "e.g. BT-2023-10-X" },
      { fieldName: "mrp", fieldLabel: "MRP", fieldType: "number", isMandatory: false, placeholder: "e.g. 2999" },
      { fieldName: "manufacturedBy", fieldLabel: "Manufactured by", fieldType: "text", isMandatory: false, placeholder: "e.g. Alpha Industries" },
      { fieldName: "marketedBy", fieldLabel: "Marketed by", fieldType: "text", isMandatory: false, placeholder: "e.g. Beta Retail Pvt. Ltd." },
      { fieldName: "countryOfOrigin", fieldLabel: "Country of Origin", fieldType: "text", isMandatory: false, placeholder: "e.g. India" },
      { fieldName: "importedAndMktBy", fieldLabel: "Imported and Mkt by", fieldType: "text", isMandatory: false, placeholder: "e.g. Global Impex" },
      { fieldName: "importedRgNo", fieldLabel: "Imported Rg. No", fieldType: "text", isMandatory: false, placeholder: "e.g. IMP-49281" },
      { fieldName: "importedOn", fieldLabel: "Imported on (MM/YYYY)", fieldType: "text", isMandatory: false, placeholder: "e.g. 10/2023" },
      { fieldName: "website", fieldLabel: "Website", fieldType: "text", isMandatory: false, placeholder: "e.g. www.example.com" },
      { fieldName: "customerCare", fieldLabel: "Customer Care", fieldType: "text", isMandatory: false, placeholder: "e.g. 1800-103-7799" },
      { fieldName: "supportEmail", fieldLabel: "Support Email", fieldType: "email", isMandatory: false, placeholder: "e.g. support@example.com" },
      { fieldName: "quantity", fieldLabel: "QR Quantity", fieldType: "number", isMandatory: true, isQuantity: true, placeholder: "e.g. 1000" },
      { fieldName: "additionalInfo", fieldLabel: "Additional Info", fieldType: "textarea", isMandatory: false, placeholder: "Enter any additional product information, materials used, care instructions, etc." }
    ],
    staticFields: {
      brand: { enabled: true, isMandatory: true },
      mfdOn: { enabled: true, isMandatory: true },
      bestBefore: { enabled: true, isMandatory: true },
    },
    variants: [
      { variantName: "color", variantLabel: "Color", inputType: "color" },
      { variantName: "size", variantLabel: "Size", inputType: "text" },
      { variantName: "model_series", variantLabel: "Model / Series", inputType: "text" }
    ]
  });
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [rating, setRating] = useState(0);
  const [optIn, setOptIn] = useState(true);
  const [couponCopied, setCouponCopied] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState({ purchaseDate: '', purchaseSource: '', sellerName: '' });
  const [invoiceImages, setInvoiceImages] = useState([]);
  const [previewSubmitting, setPreviewSubmitting] = useState(false);
  const [warrantyClaimStatus, setWarrantyClaimStatus] = useState(null);
  const [warrantyClaimed, setWarrantyClaimed] = useState(false);

  const resetPreviewStates = () => {
    setShowReviewModal(false);
    setShowWarrantyModal(false);
    setShowCouponReveal(false);
    setRating(0);
    setOptIn(true);
    setCouponCopied(false);
    setIsReviewed(false);
    setWarrantyForm({ purchaseDate: '', purchaseSource: '', sellerName: '' });
    setInvoiceImages([]);
    setPreviewSubmitting(false);
    setWarrantyClaimStatus(null);
    setWarrantyClaimed(false);
  };

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
        templateId: order.templateId || '',
        productName: order.productName || '',
        skuNumber: order.skuNumber || '',
        brand: order.brand || '',
        brandId: (order.brandId?._id || order.brandId) || '',
        batchNo: order.batchNo || '',
        productInfo: order.productInfo || '',
        quantity: order.quantity || '',
        ingredients: order.ingredients || '',
        certificates: order.certificates || [],
        orderLinks: order.orderLinks || [],
        educationContent: order.educationContent || []
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
      if (order.cashback) {
        setCashback({
          isActive: order.cashback.isActive || false,
          totalFund: order.cashback.totalFund || '',
          minPerUser: order.cashback.minPerUser || '',
          maxPerUser: order.cashback.maxPerUser || '',
        });
      }
      if (order.loyalty) {
        setLoyalty({
          isActive: order.loyalty.isActive || false,
          pointsPerScan: order.loyalty.pointsPerScan || '',
          totalPointsFund: order.loyalty.totalPointsFund || '',
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
    let formattedValue = value;

    if (fieldName === 'importedOn' && typeof value === 'string') {
      let numericVal = value.replace(/\D/g, '');
      
      if (numericVal.length > 2) {
        let month = numericVal.slice(0, 2);
        let year = numericVal.slice(2, 6);
        
        let m = parseInt(month, 10);
        if (m > 12) month = '12';
        if (m === 0 && month.length === 2) month = '01';

        if (year.length === 4) {
          let y = parseInt(year, 10);
          if (y > 2050) year = '2050';
        }
        
        formattedValue = `${month}/${year}`;
      } else {
        let m = parseInt(numericVal, 10);
        if (m > 12) numericVal = '12';
        if (m === 0 && numericVal.length === 2) numericVal = '01';
        formattedValue = numericVal;
      }
    }

    setDynamicFieldValues(prev => ({ ...prev, [fieldName]: formattedValue }));
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

  const handleNextStep = () => {
    const stepEl = document.getElementById(`step-${currentStep}`);
    if (stepEl) {
      const inputs = stepEl.querySelectorAll('input, select, textarea');
      for (let i = 0; i < inputs.length; i++) {
        if (!inputs[i].checkValidity()) {
          inputs[i].reportValidity();
          return;
        }
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prepareOrderData = async (e) => {
    if (e) e.preventDefault();
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
      // Validate Website and Support Email in custom fields
      const dynamicEmail = dynamicFieldValues['supportEmail'];
      if (dynamicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dynamicEmail)) {
        await confirm({ title: 'Invalid Email', description: 'Please enter a valid Support Email address.', cancelText: null });
        setSubmitting(false);
        return;
      }

      const dynamicWebsite = dynamicFieldValues['website'];
      if (dynamicWebsite && !/^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+.*)$/.test(dynamicWebsite)) {
        await confirm({ title: 'Invalid Website', description: 'Please enter a valid Website URL.', cancelText: null });
        setSubmitting(false);
        return;
      }

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



      // Minimum quantity check (Field based)
      if (quantityField && quantityField.validation?.min) {
        if (quantity < quantityField.validation.min) {
          await confirm({ title: 'Validation Failed', description: `Minimum quantity allowed is ${quantityField.validation.min} units.`, cancelText: null });
          setSubmitting(false);
          return;
        }
      }

      // Multiple of 250 check removed as requested

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

      // Clean up legacy fields from dynamicFields
      const cleanedDynamicFields = { ...uploadedDynamicFields };
      delete cleanedDynamicFields['mrp'];
      delete cleanedDynamicFields['manufacturedBy'];
      delete cleanedDynamicFields['marketedBy'];
      delete cleanedDynamicFields['Product Quantity'];

      const orderData = {
        templateId: newQr.templateId,
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
        dynamicFields: cleanedDynamicFields,
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
        // Cashback (if provided)
        cashback: cashback.isActive ? {
          isActive: true,
          totalFund: Number(cashback.totalFund) || 0,
          minPerUser: Number(cashback.minPerUser) || 0,
          maxPerUser: Number(cashback.maxPerUser) || 0,
        } : undefined,
        // Loyalty Points (if provided)
        loyalty: loyalty.isActive ? {
          isActive: true,
          pointsPerScan: Number(loyalty.pointsPerScan) || 0,
          totalPointsFund: Number(loyalty.totalPointsFund) || 0,
        } : undefined,
      };

      return orderData;
    } catch (err) {
      console.error(err);
      await confirm({ title: 'Error', description: err.message || 'Failed to prepare QR order', cancelText: null });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewResultScreen = async (e) => {
    const data = await prepareOrderData(e);
    if (data) setMobilePreviewOrder(data);
  };

  const handleConfirmAndSubmit = async (e) => {
    const data = await prepareOrderData(e);
    if (data) {
      const isConfirmed = await confirm({
        title: 'Confirm Order Creation',
        description: 'Are you sure you want to proceed? Once generated, product configuration cannot be changed.',
        confirmText: 'Yes, Submit',
        cancelText: 'Cancel'
      });
      if (isConfirmed) {
        submitOrderData(data);
      }
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
          description: 'Order created successfully. The Authorizer will review it.',
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
    setCashback({ isActive: false, totalFund: '', minPerUser: '', maxPerUser: '' });
    setLoyalty({ isActive: false, pointsPerScan: '', totalPointsFund: '' });
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

          // Using hardcoded formConfig
          setLoadingConfig(false);

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
            min={field.isQuantity ? "250" : undefined}
            step={field.isQuantity ? "250" : undefined}
            helpText={field.isQuantity 
              ? (currentUser?.companyId ? `You have ${(currentUser.companyId.qrCredits || 0).toLocaleString()} Physical QRs available. Must be in multiples of 250.` : "This field determines the number of QRs to be generated. Must be in multiples of 250.") 
              : null}
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

  const steps = [
    { id: 1, title: 'Product Basics', icon: Package },
    { id: 2, title: 'Variants & Specs', icon: LayoutGrid },
    { id: 3, title: 'Dates & Expiry', icon: Calendar },
    { id: 4, title: 'Rewards & Offers', icon: Gift },
    { id: 5, title: 'Warranty', icon: Shield },
    { id: 6, title: 'QR Quantity', icon: Package },
    { id: 7, title: 'Review', icon: CheckCircle2 }
  ];

  return (
    <div className="bg-white rounded-2xl p-0 shadow-sm border border-slate-200 relative">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Create New Product Record
          </h3>
        </div>

        {/* Professional Minimalist Stepper UI */}
        <div className="sticky top-[56px] z-40 bg-white/95 backdrop-blur-md pt-4 pb-6 mb-10 -mx-8 px-8 border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between relative px-2">
            {/* Minimalist Progress Line */}
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-[2px] bg-slate-100 z-0"></div>
            <div 
              className="absolute left-8 top-5 -translate-y-1/2 h-[2px] bg-indigo-600 z-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 64px)` }}
            ></div>
            
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = isCompleted;
              
              return (
                <div 
                  key={step.id} 
                  onClick={() => {
                    if (isClickable) setCurrentStep(step.id);
                  }}
                  className={`relative z-10 flex flex-col items-center gap-3 bg-white transition-all duration-300 ${isClickable ? 'cursor-pointer group' : ''}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 outline outline-[6px] outline-white ${
                      isActive 
                        ? 'bg-indigo-600 text-white ring-1 ring-indigo-600/20 shadow-sm' 
                        : isCompleted 
                          ? 'bg-indigo-600 text-white group-hover:bg-indigo-700' 
                          : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.id}</span>}
                  </div>
                  <div className="flex flex-col items-center bg-white px-2">
                    <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-700 group-hover:text-indigo-600' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-6">

        {/* STEP 1: Product Basics */}
        <div id="step-1" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 1 ? 'block' : 'hidden'}`}>

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
                  templateId: prod._id,
                  productName: prod.productName,
                  skuNumber: prod.skuNumber || '',
                  productInfo: prod.productInfo || '',
                  brand: (prod.brandId?.brandName || prod.brand) || '',
                  brandId: (prod.brandId?._id || prod.brandId) || '',
                  ingredients: prod.ingredients || '',
                  certificates: prod.certificates || [],
                  orderLinks: prod.orderLinks || [],
                  educationContent: prod.educationContent || []
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

        {/* Extended Catalog Information Preview */}
        {isCatalogProduct && (newQr.ingredients || (newQr.certificates?.length > 0) || (newQr.educationContent?.length > 0) || (newQr.orderLinks?.length > 0)) && (
          <div className="col-span-2 mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5" /> Additional Catalog Details Included
            </h4>
            
            {newQr.ingredients && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingredients</span>
                <p className="text-sm text-slate-700 font-medium line-clamp-2">{newQr.ingredients}</p>
              </div>
            )}
            
            {(newQr.certificates?.length > 0) && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificates</span>
                <div className="flex flex-wrap gap-2">
                  {newQr.certificates.map((cert, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {cert.name || 'Certificate'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(newQr.educationContent?.length > 0) && (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education Resources</span>
                <div className="flex flex-wrap gap-2">
                  {newQr.educationContent.map((edu, i) => (
                    <a key={i} href={edu.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100/70 text-indigo-700 text-xs font-semibold hover:bg-indigo-200 transition-colors border border-indigo-200/50">
                      {edu.title || 'Resource'}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {(newQr.orderLinks?.length > 0) && (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Links</span>
                <div className="flex flex-wrap gap-2">
                  {newQr.orderLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100/70 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition-colors border border-emerald-200/50">
                      {link.title || 'Link'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        </div> {/* End Step 1 */}

        {/* STEP 2: Attributes & Variants */}
        <div id="step-2" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 2 ? 'block' : 'hidden'}`}>

        {/* Dynamic Custom Fields */}
        {formConfig?.customFields && formConfig.customFields.length > 0 && (
          <>
            {formConfig.customFields
              .filter(field => !field.isQuantity)
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
                  { variantName: 'color', variantLabel: 'Color', inputType: 'text' },
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
                        <input
                          type="text"
                          value={instance.value}
                          onChange={(e) => updateVariantInstance(instance.id, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="e.g. Red, Space Grey"
                        />
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
        </div> {/* End Step 2 */}

        {/* STEP 3: Dates & Expiry */}
        <div id="step-3" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 3 ? 'block' : 'hidden'}`}>

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

        </div> {/* End Step 3 */}

        {/* STEP 4: Rewards & Offers */}
        <div id="step-4" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 4 ? 'block' : 'hidden'}`}>

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

        </div> {/* End Step 4 */}

        {/* STEP 5: Warranty */}
        <div id="step-5" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 5 ? 'block' : 'hidden'}`}>

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

        {/* Cashback Information Section */}
        {/* <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} className="text-pink-600" />
            <h4 className="text-sm font-semibold text-slate-800">Cashback Program (Optional)</h4>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              checked={cashback.isActive} 
              onChange={(e) => setCashback({...cashback, isActive: e.target.checked})}
              className="w-4 h-4 text-pink-600 bg-slate-100 border-slate-300 rounded focus:ring-pink-500"
            />
            <span className="text-sm font-medium text-slate-700">Enable lucky cashback for this batch</span>
          </label>
        </div>

        {cashback.isActive && (
          <>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">
                Total Cashback Fund (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={cashback.totalFund}
                onChange={(e) => setCashback({ ...cashback, totalFund: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">
                Minimum Amount per User (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={cashback.minPerUser}
                onChange={(e) => setCashback({ ...cashback, minPerUser: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">
                Maximum Amount per User (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={cashback.maxPerUser}
                onChange={(e) => setCashback({ ...cashback, maxPerUser: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
              />
            </div>
          </>
        )} */}

        {/* Loyalty Points Section */}
        {/* <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} className="text-amber-600" />
            <h4 className="text-sm font-semibold text-slate-800">Loyalty Points Program (Optional)</h4>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              checked={loyalty.isActive} 
              onChange={(e) => setLoyalty({...loyalty, isActive: e.target.checked})}
              className="w-4 h-4 text-amber-600 bg-slate-100 border-slate-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-slate-700">Enable loyalty points for this batch</span>
          </label>
        </div>

        {loyalty.isActive && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">
                Points per Scan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={loyalty.pointsPerScan}
                onChange={(e) => setLoyalty({ ...loyalty, pointsPerScan: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">
                Total Points Fund <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={loyalty.totalPointsFund}
                onChange={(e) => setLoyalty({ ...loyalty, totalPointsFund: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
              />
            </div>
          </>
        )} */}

        {/* Order Links Section (Removed, handled via Templates) */}

        </div> {/* End Step 5 */}

        {/* STEP 6: QR Quantity */}
        <div id="step-6" className={`col-span-2 grid grid-cols-2 gap-6 ${currentStep === 6 ? 'block' : 'hidden'}`}>
          <div className="col-span-2 border-b border-slate-200 pb-4 mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" /> Output Quantity
            </h4>
            <p className="text-xs text-slate-500 mt-1">Specify how many QR codes you want to generate for this product.</p>
          </div>
          
          {formConfig?.customFields && formConfig.customFields
            .filter(f => f.isQuantity)
            .map(field => renderDynamicField(field))}
        </div> {/* End Step 6 */}

        {/* STEP 7: Review */}
        <div id="step-7" className={`col-span-2 flex flex-col gap-6 ${currentStep === 7 ? 'block' : 'hidden'}`}>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <h4 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <CheckCircle2 size={24} className="text-indigo-600" />
                Final Review
              </h4>

              <div className="flex flex-col gap-8">
                
                {/* 1. Core Product & Output */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-sm">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Package size={14} /> Product Identity & Output
                  </h5>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {imagePreview ? (
                      <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center shrink-0 text-slate-400">
                        <Package size={24} />
                        <span className="text-[10px] font-semibold mt-1">No Image</span>
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Product Name</p>
                        <p className="text-sm font-bold text-slate-900">{newQr.productName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Brand</p>
                        <p className="text-sm font-bold text-slate-900">{newQr.brand || 'Not provided'}</p>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Product Info</p>
                        <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{newQr.productInfo || 'Not provided'}</p>
                      </div>
                      
                      {/* Show QR Quantity here */}
                      {(formConfig?.customFields || []).filter(f => f.isQuantity).map((field, idx) => (
                        <div key={idx} className="col-span-1 sm:col-span-2 mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-indigo-100 text-indigo-600 flex items-center justify-center">
                              <LayoutGrid size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-indigo-900 uppercase tracking-widest">{field.fieldLabel}</p>
                              <p className="text-xs text-indigo-700/80 font-medium">Number of QR Codes to generate</p>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-indigo-600">
                            {dynamicFieldValues[field.fieldName] ? Number(dynamicFieldValues[field.fieldName]).toLocaleString() : '0'} <span className="text-sm font-bold text-indigo-400">QRs</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Specs & Details */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-sm">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <List size={14} /> Specifications & Details
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Mfd On</p>
                      <p className="text-sm font-semibold text-slate-800">{mfdOn.month && mfdOn.year ? `${mfdOn.month}/${mfdOn.year}` : <span className="text-slate-300 italic">Not provided</span>}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Best Before</p>
                      <p className="text-sm font-semibold text-slate-800">{bestBefore.value ? `${bestBefore.value} ${bestBefore.unit}` : <span className="text-slate-300 italic">Not provided</span>}</p>
                    </div>

                    {(formConfig?.customFields || []).filter(f => !f.isQuantity).map((field, idx) => {
                      const val = dynamicFieldValues[field.fieldName];
                      return (
                        <div key={idx} className={field.fieldType === 'textarea' ? 'col-span-2 sm:col-span-3' : ''}>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{field.fieldLabel}</p>
                          <p className={`text-sm font-semibold ${val ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                            {val ? val : 'Not provided'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Variants */}
                {variantInstances.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-sm">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <LayoutGrid size={14} /> Product Variants
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {variantInstances.map((v, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-800 rounded-xl text-sm font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">{v.variantLabel || v.variantName}</span>
                          <span className="w-px h-3 bg-slate-300"></span>
                          {v.value || 'N/A'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Connected Programs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-sm">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Gift size={14} /> Connected Programs
                  </h5>
                  <div className="flex flex-wrap gap-4">
                    <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${coupon.title ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200 grayscale opacity-60'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${coupon.title ? 'bg-purple-200 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
                        <Gift size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Coupon</p>
                        <p className={`text-xs font-bold ${coupon.title ? 'text-purple-900' : 'text-slate-500'}`}>{coupon.title ? 'Active' : 'Disabled'}</p>
                      </div>
                    </div>
                    


                    <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${warranty.duration ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 grayscale opacity-60'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${warranty.duration ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Warranty</p>
                        <p className={`text-xs font-bold ${warranty.duration ? 'text-blue-900' : 'text-slate-500'}`}>{warranty.duration ? `${warranty.duration} ${warranty.durationUnit}` : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 text-center font-medium mt-2">Please review the details above carefully before generating QRs. Once generated, some details cannot be changed.</p>
        </div>

        {/* Form Footer / Stepper Navigation */}
        <div className="col-span-2 flex items-center justify-between pt-8 mt-6 border-t border-slate-200/60">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || submitting}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
              currentStep === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm shadow-sm active:scale-[0.98]"
            >
              Continue
              <ArrowLeft size={16} className="rotate-180" />
            </button>
          ) : (
            <div className="flex gap-4 items-center">
              <button 
                type="button" 
                onClick={handlePreviewResultScreen}
                disabled={submitting} 
                className={`px-6 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm active:scale-[0.98] ${
                  submitting 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Preview Mobile View
              </button>
              
              <button 
                type="button" 
                onClick={handleConfirmAndSubmit}
                disabled={submitting} 
                className={`px-6 py-2.5 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm active:scale-[0.98] ${
                  submitting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    Confirm & Submit
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </form>

      </div>

      {/* --- Consumer Mobile Preview Modal --- */}
      {/* --- Consumer Mobile Preview Modal --- */}
      {mobilePreviewOrder && (() => {
        const fieldLabels = {};
        if (formConfig?.customFields) {
          formConfig.customFields.forEach(f => {
            fieldLabels[f.fieldName] = f.fieldLabel;
          });
        }

        const formatLabel = (key) => {
          if (!key) return '';
          const lowerK = key.toLowerCase();
          
          if (lowerK.startsWith('field_')) return "Product Detail";
          if (lowerK.startsWith('variant_')) return "Specification";
          
          const manualMap = {
            "marketedby": "Marketed By",
            "manufacturedby": "Manufactured By",
            "countryoforigin": "Country of Origin",
            "customercare": "Customer Care",
            "supportemail": "Support E-mail",
            "website": "Website",
            "importerregno": "Importer Reg. No",
            "importmarketedby": "Import & Marketed By"
          };
          if (manualMap[lowerK]) return manualMap[lowerK];
          
          if (key.includes(' ')) {
            return key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          }
          if (key !== key.toUpperCase()) {
            const result = key.replace(/([A-Z])/g, " $1");
            return result.charAt(0).toUpperCase() + result.slice(1).trim();
          }
          return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        };

        const getFieldVal = (key) => {
          if (mobilePreviewOrder[key] !== undefined && mobilePreviewOrder[key] !== null) return mobilePreviewOrder[key];
          if (key === 'sku' && mobilePreviewOrder['skuNumber'] !== undefined) return mobilePreviewOrder['skuNumber'];
          if (key === 'expiryDate' && mobilePreviewOrder['calculatedExpiryDate'] !== undefined) return mobilePreviewOrder['calculatedExpiryDate'];

          const dyn = mobilePreviewOrder.dynamicFields || {};
          const possibleKeys = [
            key,
            key.toLowerCase(),
            key.toUpperCase(),
            key.replace(/([A-Z])/g, "_$1").toLowerCase(),
            key.replace(/([A-Z])/g, " $1").toLowerCase(),
          ];

          for (const pk of possibleKeys) {
            if (dyn[pk] !== undefined && dyn[pk] !== null) return dyn[pk];
          }

          return null;
        };

        const formatMonthYear = (v) => {
          if (!v) return "";
          const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

          if (typeof v === 'object') {
            if (v.month && v.year) {
              const mInt = parseInt(v.month);
              if (!isNaN(mInt) && mInt >= 1 && mInt <= 12) {
                const monthStr = new Date(2000, mInt - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
                return `${capitalize(monthStr)} ${v.year}`;
              }
              return `${capitalize(String(v.month))} ${v.year}`;
            }
            return "";
          } else if (typeof v === 'string') {
            const parts = v.split(/[\/\-]/);
            if (parts.length === 2 || parts.length === 3) {
              const m = parseInt(parts.length === 3 ? parts[1] : parts[0]);
              let y = parseInt(parts.length === 3 ? parts[2] : parts[1]);
              if (y < 100) y += 2000;
              if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12 && y >= 1000) {
                const monthStr = new Date(2000, m - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
                return `${capitalize(monthStr)} ${y}`;
              }
            }

            const d = new Date(v);
            if (!isNaN(d.getTime()) && v.length >= 8 && !/^\d+$/.test(v)) {
              const formatted = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
              return formatted.split(' ').map(capitalize).join(' ');
            }
            return v.split(' ').map(capitalize).join(' ');
          }
          return String(v);
        };


        const technicalFields = [
          { key: "brand", label: "Brand" },
          { key: "category", label: "Category" },
          { key: "batchNo", label: "Batch #" },
          { key: "sku", label: "SKU" },
          { key: "mrp", label: "MRP" },
          { key: "color", label: "Color" },
          { key: "size", label: "Size" },
          { key: "model", label: "Model / Series" },
          { key: "weight", label: "Weight" },
          { key: "storage", label: "Storage" },
          { key: "flavour", label: "Flavour" },
          { key: "capacity", label: "Capacity" },
          { key: "material", label: "Material" },
          { key: "mfdOn", label: "Mfd on" },
          { key: "expiryDate", label: "Exp by" },
        ];

        const blueFields = [];
        const handledKeys = new Set();

        technicalFields.forEach(({ key, label }) => {
          let val = getFieldVal(key);

          if (!val && mobilePreviewOrder.variants) {
            const variant = mobilePreviewOrder.variants.find(v => v.variantName?.toLowerCase() === key.toLowerCase() || v.variantLabel?.toLowerCase() === key.toLowerCase());
            if (variant) val = variant.value;
          }

          if (key === "mfdOn" && val) {
            val = formatMonthYear(val);
          }
          if (key === "expiryDate" && val) {
            val = formatMonthYear(val);
          }

          if (key === "mrp" && val) {
            const num = String(val).replace(/[^0-9.]/g, '');
            if (num && !isNaN(Number(num))) {
              val = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(num));
            } else {
              val = val.toString().startsWith('₹') ? val : `₹${val}`;
            }
          }

          if (val && val !== "-") {
            const finalLabel = key === "mrp" ? "MRP" : (fieldLabels[key] || label);
            blueFields.push({ label: finalLabel, value: String(val) });
            handledKeys.add(key.toLowerCase());
            handledKeys.add(key);
            handledKeys.add(key.replace(/([A-Z])/g, "_$1").toLowerCase());
            handledKeys.add(key.replace(/([A-Z])/g, " $1").toLowerCase());
          }
        });

        const allVariants = mobilePreviewOrder.variants || [];
        allVariants.forEach((v) => {
          const vName = v.variantName || "";
          if (!handledKeys.has(vName.toLowerCase()) && !handledKeys.has(vName)) {
            blueFields.push({
              label: fieldLabels[vName] || v.variantLabel || formatLabel(vName),
              value: String(v.value)
            });
            handledKeys.add(vName.toLowerCase());
          }
        });

        const additionalInfoFields = [
          { key: "manufacturedBy", label: "Manufactured By" },
          { key: "marketedBy", label: "Marketed By" },
          { key: "importMarketedBy", label: "Import & Marketed By" },
          { key: "importerRegNo", label: "Importer Reg. No" },
          { key: "countryOfOrigin", label: "Country of Origin" },
          { key: "website", label: "Website" },
          { key: "supportEmail", label: "Support E-mail" },
          { key: "customerCare", label: "Customer Care" },
        ];

        const grayFields = [];
        additionalInfoFields.forEach(({ key, label }) => {
          let val = getFieldVal(key);
          


          if (val && val !== "-" && !handledKeys.has(key.toLowerCase())) {
            grayFields.push({ label, value: String(val) });
            handledKeys.add(key.toLowerCase());
          }
        });

        const combinedDynamicFields = mobilePreviewOrder.dynamicFields || {};
        Object.keys(combinedDynamicFields).forEach(k => {
          if (!handledKeys.has(k.toLowerCase()) && !handledKeys.has(k)) {
            const lowerKey = k.toLowerCase();
            if (lowerKey === 'product quantity' || lowerKey === 'quantity' || lowerKey === 'productquantity' || lowerKey === 'qr quantity' || lowerKey === 'qrquantity' || lowerKey.includes('sku')) {
              return;
            }

            let val = combinedDynamicFields[k];
            if (val && val !== "-") {
              if (typeof val === 'object' && val.month && val.year) {
                val = formatMonthYear(val);
              } else if (typeof val === 'string' && /^\d{1,2}[\/\-]\d{4}$/.test(val)) {
                val = formatMonthYear(val);
              }

              if (typeof val !== 'object') {
                const label = fieldLabels[k] || formatLabel(k);
                grayFields.push({ label, value: String(val) });
                handledKeys.add(k.toLowerCase());
              }
            }
          }
        });

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-[375px] h-[750px] max-h-[90vh] bg-[#F5F5F5] rounded-[2.5rem] shadow-2xl overflow-hidden border-[10px] border-slate-800 flex flex-col" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl w-1/2 mx-auto z-50"></div>
              
              {/* Header */}
              <div className="w-full flex items-center justify-center p-4 bg-white sticky top-0 z-40 shadow-sm pt-8 flex-shrink-0">
                <h1 className="text-[18px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
                <button 
                  onClick={() => { setMobilePreviewOrder(null); resetPreviewStates(); }} 
                  className="absolute right-4 top-7 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                  title="Close Emulator"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>

              {/* Scrollable Mobile View */}
              <div className="flex-1 w-full flex flex-col overflow-y-auto px-3 pb-24 pt-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Status Card */}
                <div className="bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
                  <div className="flex flex-row justify-center items-center gap-2.5">
                    <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
                      <ShieldCheck size={26} className="text-[#2CA4D6]" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-[17px] font-bold leading-tight">
                        Authentic Product
                      </h2>
                      <p className="text-[11px] opacity-90 font-medium">
                        This product has been verified as genuine
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="bg-white shadow-sm rounded-b-[16px] pb-5 flex flex-col items-center relative gap-3 border border-t-0 border-gray-100">
                  <div className="w-full bg-[#1F2642] py-2.5 text-center">
                    <h3 className="text-white font-bold text-[18px] px-2 truncate leading-tight">
                      {mobilePreviewOrder.productName}
                    </h3>
                  </div>

                  {/* Product Image */}
                  <div className="relative h-[210px] w-[90%] rounded-[2rem] mt-1 mx-auto overflow-hidden bg-white shadow-2xl border-4 border-white shadow-indigo-100/50 flex items-center justify-center">
                    {mobilePreviewOrder.productImage ? (
                      <img src={mobilePreviewOrder.productImage} className="w-full h-full object-contain" alt="Product" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                        <span className="text-slate-300 font-bold text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Blue Fields Grid */}
                  {blueFields.length > 0 && (
                    <div className="w-full px-4 pt-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        {blueFields.map((field, idx) => (
                          <div key={idx} className="bg-[#259DCF] rounded-[16px] p-3 shadow-md text-left transition-all">
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                              {field.label}
                            </p>
                            <p className="text-white text-[13px] font-bold leading-tight break-words">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gray Additional Info */}
                  {((mobilePreviewOrder.productInfo && mobilePreviewOrder.productInfo.trim()) || grayFields.length > 0) && (
                    <div className="w-full px-4 mt-3">
                      <h4 className="text-[#333] font-black text-[11px] mb-2 ml-1 uppercase tracking-wider">Additional Info:</h4>
                      <div className="bg-[#F2F2F2] p-4 rounded-[16px] shadow-inner space-y-3.5 border border-gray-200/55">
                        {mobilePreviewOrder.productInfo && mobilePreviewOrder.productInfo.trim() && (
                          <div className="mb-2">
                            <p className="text-[#444] text-[12px] font-medium whitespace-pre-wrap leading-relaxed">
                              {mobilePreviewOrder.productInfo}
                            </p>
                          </div>
                        )}
                        {grayFields.length > 0 && (
                          <div className="space-y-2.5">
                            {grayFields.map((field, idx) => (
                              <div key={idx} className="border-b border-gray-300/30 pb-2.5 last:border-0 last:pb-0">
                                <p className="text-[#333] text-[9.5px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                                  {field.label}
                                </p>
                                <p className="text-[#0D4E96] text-[12px] font-bold max-w-full break-words whitespace-pre-line">
                                  {field.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Reviews Button */}
                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={isReviewed}
                  className={`w-full ${isReviewed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642]'} text-white font-bold text-[16px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(14,92,171,0.25)] mt-4 active:scale-95 transition-transform flex items-center justify-center gap-2`}
                >
                  {isReviewed ? "Product Reviewed" : (mobilePreviewOrder.coupon ? "Review & Claim Coupon" : "Review Product")}
                </button>

                {/* Interactive Warranties Button */}
                {mobilePreviewOrder.warranty && (
                  <div className="mt-3">
                    {warrantyClaimed ? (
                      <button
                        onClick={() => alert("Simulated Redirect to Warranty Claims Tracking Page")}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[15px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Track Warranty
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowWarrantyModal(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[15px] py-3.5 rounded-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Register Warranty
                      </button>
                    )}
                  </div>
                )}
                
                <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Simulator Mode - View Only</p>
              </div>

              {/* ===== Modals Rendered Absolutes in Viewport Wrapper ===== */}

              {/* 1. Review Modal Bottom Sheet */}
              {showReviewModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center rounded-[2.5rem] overflow-hidden animate-in fade-in duration-200">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setShowReviewModal(false)} />
                  
                  {/* Sheet */}
                  <div className="relative w-full bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>

                    {/* Product Hero */}
                    <div className="px-6 pt-6 pb-4 text-center border-b border-slate-50">
                      {mobilePreviewOrder.productImage ? (
                        <div className="w-[70px] h-[70px] rounded-[20px] overflow-hidden mx-auto mb-3 shadow-md bg-white p-0.5 border">
                          <img src={mobilePreviewOrder.productImage} alt="" className="w-full h-full object-contain rounded-[18px]" />
                        </div>
                      ) : (
                        <div className="w-[70px] h-[70px] rounded-[20px] bg-slate-50 mx-auto mb-3 flex items-center justify-center border">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                      )}
                      <h2 className="text-[18px] font-black text-[#0D4E96] tracking-tight leading-tight mb-1">{mobilePreviewOrder.productName}</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{mobilePreviewOrder.brand || "Brand"}</p>
                    </div>

                    {/* Rating Section */}
                    <div className="px-6 py-5 text-center">
                      <p className="text-[16px] font-black text-slate-800 mb-1">How was your experience?</p>
                      <p className="text-[12px] text-slate-400 font-bold mb-4">Tap a star to rate this product</p>

                      <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-all active:scale-75 hover:scale-105 duration-200"
                            style={{ transform: star <= rating ? 'scale(1.1)' : 'scale(1)' }}
                          >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#CBD5E1"} strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <div className="h-5">
                        {rating > 0 && (
                          <p className="text-[13px] font-black text-[#F59E0B]">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Opt-in & Submit */}
                    <div className="px-6 pb-2 text-left">
                      <label className="flex items-start gap-3 cursor-pointer mb-5 group">
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="sr-only" />
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${optIn ? 'bg-[#0D4E96] border-[#0D4E96] scale-105' : 'bg-white border-slate-300'}`}>
                            {optIn && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
                          </div>
                        </div>
                        <span className="text-[11.5px] font-bold text-slate-600 leading-tight">Yes, I would like to receive exclusive offer and discounts from the brand</span>
                      </label>

                      <button
                        onClick={() => {
                          if (rating === 0) return;
                          setPreviewSubmitting(true);
                          setTimeout(() => {
                            setPreviewSubmitting(false);
                            setIsReviewed(true);
                            setShowReviewModal(false);
                            if (mobilePreviewOrder.coupon) {
                              setShowCouponReveal(true);
                            } else {
                              alert("Thank you for your review!");
                            }
                          }, 800);
                        }}
                        disabled={rating === 0 || previewSubmitting}
                        className={`w-full py-3.5 rounded-[30px] font-bold text-[15px] shadow-md flex items-center justify-center ${
                          rating === 0 || previewSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white active:scale-95 transition-transform'
                        }`}
                      >
                        {previewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Coupon Reveal Page Overlay */}
              {showCouponReveal && (
                <div className="absolute inset-0 z-50 bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#F8FAFC] flex flex-col overflow-y-auto rounded-[2rem] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* Header */}
                  <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm/50 pt-8 flex-shrink-0">
                    <button onClick={() => setShowCouponReveal(false)} className="text-[#0D4E96] p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-[18px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
                    <div className="w-8"></div>
                  </div>

                  <div className="flex-1 px-4 py-6 flex flex-col items-center relative overflow-hidden text-center">
                    <div className="absolute top-6 left-4 opacity-25 text-pink-500 animate-bounce">🎈</div>
                    <div className="absolute top-12 right-6 opacity-25 text-amber-500 animate-pulse">✨</div>

                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2CA4D6] bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100/50 mb-2 inline-block">
                        Reward Unlocked 🎉
                      </span>
                      <h2 className="bg-gradient-to-r from-[#0D4E96] to-[#1E3A8A] bg-clip-text text-transparent text-[20px] font-black leading-tight">
                        Congratulations!<br />You've Earned a Coupon
                      </h2>
                    </div>

                    {/* Ticket Graphic Card */}
                    <div className="w-full max-w-sm relative mt-4 shadow-xl rounded-[24px] bg-white border border-slate-100 text-center">
                      {/* Overlapping Gift Icon */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-tr from-[#0D4E96] to-[#2CA4D6] rounded-full border-4 border-white flex items-center justify-center z-20 shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <polyline points="20 12 20 22 4 22 4 12"></polyline>
                          <rect x="2" y="7" width="20" height="5"></rect>
                          <line x1="12" y1="22" x2="12" y2="7"></line>
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                        </svg>
                      </div>

                      {/* Header */}
                      <div className="bg-[#1F2642] bg-gradient-to-br from-[#0D4E96] via-[#1E3A8A] to-[#1F2642] rounded-t-[24px] pt-10 pb-6 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 mb-2">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                          <span className="text-white text-[8px] font-black uppercase tracking-wider">{mobilePreviewOrder.brand || "Brand"}</span>
                        </div>
                        <h3 className="text-white text-[16px] font-black uppercase tracking-wide leading-tight px-2">
                          {mobilePreviewOrder.coupon?.title || "REWARD UNLOCKED"}
                        </h3>
                      </div>

                      {/* Notched Divider */}
                      <div className="relative py-4 bg-slate-50 border-y border-dashed border-slate-200 flex items-center justify-center">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFFFF] rounded-full border border-slate-200/50 shadow-inner z-10" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFFFF] rounded-full border border-slate-200/50 shadow-inner z-10" />

                        <div className="flex items-center justify-between gap-3 px-4 py-1.5 rounded-xl border-2 border-dashed font-mono text-[16px] font-black uppercase tracking-widest border-cyan-500/30 bg-cyan-500/5 text-[#0D4E96]">
                          <span>{mobilePreviewOrder.coupon?.code || "WELCOME50"}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(mobilePreviewOrder.coupon?.code || "WELCOME50");
                              setCouponCopied(true);
                              setTimeout(() => setCouponCopied(false), 2000);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              couponCopied
                                ? 'bg-emerald-500 text-white shadow-md scale-105'
                                : 'bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200 active:scale-90'
                            }`}
                          >
                            {couponCopied ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="bg-white rounded-b-[24px] p-5 text-center">
                        {mobilePreviewOrder.coupon?.expiryDate && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Valid Until: <span className="text-slate-700">{new Date(mobilePreviewOrder.coupon.expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                          </p>
                        )}
                        {mobilePreviewOrder.coupon?.description && (
                          <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-[12px] font-medium text-slate-600">
                            {mobilePreviewOrder.coupon.description}
                          </div>
                        )}
                        <button onClick={() => setShowCouponReveal(false)} className="w-full bg-[#1F2642] text-white font-bold text-[14px] py-3 rounded-xl shadow-md">Done</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Warranty Claim Modal Bottom Sheet */}
              {showWarrantyModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center rounded-[2.5rem] overflow-hidden animate-in fade-in duration-200">
                  <div className="absolute inset-0" onClick={() => setShowWarrantyModal(false)} />

                  <div className="relative w-full bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    <button
                      onClick={() => setShowWarrantyModal(false)}
                      className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>

                    {/* Header */}
                    <div className="px-6 pt-5 pb-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-3 flex items-center justify-center shadow-md">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <h2 className="text-[18px] font-black text-[#0D4E96] tracking-tight">Register Warranty</h2>
                      <p className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Upload purchase invoice to activate</p>
                    </div>

                    {/* Warranty Policies Parameters Card */}
                    {mobilePreviewOrder.warranty && (mobilePreviewOrder.warranty.duration || mobilePreviewOrder.warranty.warrantyType) && (
                      <div className="mx-6 mb-4 bg-emerald-50 rounded-xl border border-emerald-100 p-4 space-y-2 text-left">
                        {mobilePreviewOrder.warranty.warrantyType && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-emerald-800 font-bold uppercase tracking-wider">Type</span>
                            <span className="text-emerald-950 font-black">{mobilePreviewOrder.warranty.warrantyType}</span>
                          </div>
                        )}
                        {mobilePreviewOrder.warranty.duration && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-emerald-800 font-bold uppercase tracking-wider">Duration</span>
                            <span className="text-emerald-950 font-black">
                              {mobilePreviewOrder.warranty.duration} {mobilePreviewOrder.warranty.durationUnit || "months"}
                            </span>
                          </div>
                        )}
                        {mobilePreviewOrder.warranty.description && (
                          <div className="border-t border-emerald-100 pt-2 text-[11px] text-emerald-800">
                            {mobilePreviewOrder.warranty.description}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Inputs */}
                    <div className="px-6 space-y-4 text-left">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Purchase Date *</label>
                        <input
                          type="date"
                          value={warrantyForm.purchaseDate}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-[12.5px]"
                          required
                        />
                      </div>

                      {/* Invoice bill capture preview block */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Invoice / Receipt Bill Images *</label>
                        {invoiceImages.length > 0 ? (
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {invoiceImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-300 bg-emerald-50 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <button
                                  type="button"
                                  onClick={() => setInvoiceImages([])}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setInvoiceImages([{ preview: 'simulated' }])}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-700 font-black text-[12px] hover:bg-emerald-100/70 transition-colors"
                            >
                              Camera
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoiceImages([{ preview: 'simulated' }])}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl text-blue-700 font-black text-[12px] hover:bg-blue-100/70 transition-colors"
                            >
                              Gallery
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (!warrantyForm.purchaseDate || invoiceImages.length === 0) return;
                          setPreviewSubmitting(true);
                          setTimeout(() => {
                            setPreviewSubmitting(false);
                            setWarrantyClaimStatus("Processing");
                            setWarrantyClaimed(true);
                            setShowWarrantyModal(false);
                            alert("Warranty registration simulated successfully!");
                          }, 850);
                        }}
                        disabled={!warrantyForm.purchaseDate || invoiceImages.length === 0 || previewSubmitting}
                        className={`w-full py-3.5 rounded-[30px] font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 ${
                          !warrantyForm.purchaseDate || invoiceImages.length === 0 || previewSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:opacity-95 active:scale-95 transition-transform'
                        }`}
                      >
                        {previewSubmitting ? "Registering..." : "Submit Warranty"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sticky Submit Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-50 flex items-center justify-center">
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
        );
      })()}
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = 'text', required = true, helpText = null, min, step }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 ml-1">
        {label} {required && <span className="text-indigo-600">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (type === 'number') val = val.replace(/\D/g, '');
          onChange(val);
        }}
        min={min}
        step={step}
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
