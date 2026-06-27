import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { state: data } = useLocation() as { state: any };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center justify-center">
        <p className="text-gray-500">No product data available.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 font-bold">Go Back</button>
      </div>
    );
  }

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

  const formatLabel = (key: string) => {
    if (key.toLowerCase().startsWith('field_')) return "Product Detail";
    if (key.toLowerCase().startsWith('variant_')) return "Specification";
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1).trim();
  };

  const blueFields: { label: string; value: any }[] = [];
  const handledKeys = new Set<string>();
  const fieldLabels = data.fieldLabels || data.productId?.fieldLabels || {};

  const formatMonthYear = (v: any) => {
    if (!v) return "";
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
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

  technicalFields.forEach(({ key, label }) => {
    let val = data[key] || data.productId?.[key];
    if (!val && data.dynamicFields) val = data.dynamicFields[key];
    if (!val && data.productId?.dynamicFields) val = data.productId.dynamicFields[key];
    if (!val && (data.variants || data.productId?.variants)) {
      const vArr = (data.variants || data.productId?.variants);
      const variant = vArr.find((v: any) => v.variantName?.toLowerCase() === key.toLowerCase());
      if (variant) val = variant.value;
    }
    if (key === "mfdOn") {
      const mfd = val || data.mfdOn || data.productId?.mfdOn;
      if (mfd) val = formatMonthYear(mfd);
    }
    if (key === "expiryDate") {
      const exp = val || data.expiryDate || data.expiry || data.calculatedExpiryDate || data.productId?.expiryDate || data.productId?.expiry || data.productId?.calculatedExpiryDate;
      if (exp) val = formatMonthYear(exp);
    }
    if (key === "mrp") {
      if (val) {
        const num = String(val).replace(/[^0-9.]/g, '');
        if (num && !isNaN(Number(num))) {
          val = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(num));
        } else {
          val = val.toString().startsWith('₹') ? val : `₹${val}`;
        }
      }
    }
    if (val && val !== "-") {
      const finalLabel = key === "mrp" ? "MRP" : (fieldLabels[key] || label);
      blueFields.push({ label: finalLabel, value: String(val) });
      handledKeys.add(key);
    }
  });

  const allVariants = data.variants || data.productId?.variants || [];
  allVariants.forEach((v: any) => {
    if (!handledKeys.has(v.variantName) && !handledKeys.has(v.variantName?.toLowerCase())) {
      blueFields.push({
        label: fieldLabels[v.variantName] || v.variantLabel || formatLabel(v.variantName || ""),
        value: String(v.value)
      });
      handledKeys.add(v.variantName);
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

  const grayFields: { label: string; value: any }[] = [];

  additionalInfoFields.forEach(({ key, label }) => {
    let val = data[key] || data.productId?.[key];
    if (!val && data.dynamicFields) val = data.dynamicFields[key];
    if (!val && data.productId?.dynamicFields) val = data.productId?.dynamicFields[key];
    if (val && val !== "-" && !handledKeys.has(key)) {
      grayFields.push({ label, value: String(val) });
      handledKeys.add(key);
    }
  });

  const combinedDynamicFields = { ...(data.productId?.dynamicFields || {}), ...(data.dynamicFields || {}) };
  Object.keys(combinedDynamicFields).forEach(key => {
    if (!handledKeys.has(key)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'product quantity' || lowerKey === 'quantity' || lowerKey === 'productquantity' || lowerKey === 'qr quantity' || lowerKey === 'qrquantity' || lowerKey.includes('sku')) {
        return;
      }
      let val = combinedDynamicFields[key];
      if (val && val !== "-") {
        if (typeof val === 'object' && val.month && val.year) {
          val = formatMonthYear(val);
        } else if (typeof val === 'string' && /^\d{1,2}[\/\-]\d{4}$/.test(val)) {
          val = formatMonthYear(val);
        }
        if (typeof val !== 'object') {
          const label = fieldLabels[key] || formatLabel(key);
          grayFields.push({ label, value: String(val) });
          handledKeys.add(key);
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Product Details"
        onLeftClick={() => navigate(-1)}
        rightIcon={<div className="w-10" />}
        onNotificationClick={() => {}}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-10">
        <div className="p-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {blueFields.map((field, idx) => (
              <div key={idx} className="bg-white p-4 flex flex-col justify-center shadow-sm rounded-[16px]">
                <p className="text-[#333] text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1 leading-tight">{field.label}</p>
                <p className="text-[#0D4E96] text-[15px] font-black tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{field.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-[#333] font-bold text-[14px] mb-3 ml-1 uppercase tracking-tight">Additional Info:</h4>
            <div className="bg-[#F2F2F2] p-5 rounded-[20px] shadow-sm space-y-4 border border-gray-200/50">
              {(data.description || data.productId?.description || data.productInfo || data.productId?.productInfo) && (
                <div className="mb-4">
                  <p className="text-[#444] text-[15px] font-medium whitespace-pre-wrap leading-relaxed">
                    {data.description || data.productId?.description || data.productInfo || data.productId?.productInfo}
                  </p>
                </div>
              )}
              {(data.keyBenefits || data.productId?.keyBenefits) && (
                <div className="mb-4">
                  <p className="text-[#333] text-[12px] font-bold uppercase tracking-wider opacity-60 mb-1">Key Benefits</p>
                  <ul className="list-disc pl-5 text-[#444] text-[14px] font-medium space-y-1">
                    {(data.keyBenefits || data.productId?.keyBenefits).split('\n').filter(Boolean).map((benefit: string, i: number) => (
                      <li key={i}>{benefit.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                {grayFields.map(({ label, value }, idx) => (
                  <div key={idx} className="border-b border-gray-300/30 pb-3 last:border-0 last:pb-0">
                    <p className="text-[#333] text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
                    <p className="text-[#0D4E96] text-[14px] font-bold whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
