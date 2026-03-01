import React, { useState, useEffect } from 'react';
import { 
  FormInput, Plus, Trash2, GripVertical, Check, X, ChevronDown, ChevronUp,
  Type, Hash, List, FileText, Image, Calendar, Mail, Phone, Settings, Eye, EyeOff
} from 'lucide-react';

const fieldTypeOptions = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'dropdown', label: 'Dropdown', icon: List },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'file', label: 'File Upload', icon: FileText },
  { value: 'image', label: 'Image Upload', icon: Image },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
];

export default function FormBuilder({ onSave }) {
  const [formConfig, setFormConfig] = useState({
    formName: 'QR Creation Form',
    description: '',
    customFields: [],
    staticFields: {
      brand: { enabled: true, isMandatory: true },
      mfdOn: { enabled: true, isMandatory: true },
      bestBefore: { enabled: true, isMandatory: true },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedField, setExpandedField] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchFormConfig();
  }, []);

  const fetchFormConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://authentik-8p39.vercel.app'}/admin/form-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formConfig) {
          setFormConfig(data.formConfig);
        }
      }
    } catch (error) {
      console.error('Error fetching form config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://authentik-8p39.vercel.app'}/admin/form-config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formConfig),
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormConfig(data.formConfig);
        onSave && onSave(data.formConfig);
        alert('Form configuration saved successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    const newField = {
      fieldName: `field_${Date.now()}`,
      fieldLabel: 'New Field',
      fieldType: 'text',
      isMandatory: false,
      options: [],
      placeholder: '',
      order: formConfig.customFields.length,
    };
    setFormConfig({
      ...formConfig,
      customFields: [...formConfig.customFields, newField],
    });
    setExpandedField(formConfig.customFields.length);
  };

  const updateCustomField = (index, updates) => {
    const updatedFields = [...formConfig.customFields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  const deleteCustomField = (index) => {
    const updatedFields = formConfig.customFields.filter((_, i) => i !== index);
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  const moveField = (index, direction) => {
    const updatedFields = [...formConfig.customFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updatedFields.length) return;
    
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  const addOption = (fieldIndex) => {
    const updatedFields = [...formConfig.customFields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options.push('');
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...formConfig.customFields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  const deleteOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formConfig.customFields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFormConfig({ ...formConfig, customFields: updatedFields });
  };

  // Variant management functions
  const addVariant = () => {
    const newVariant = {
      variantName: `variant_${Date.now()}`,
      variantLabel: 'New Variant',
      inputType: 'text',
      options: [],
      order: (formConfig.variants || []).length,
    };
    setFormConfig({
      ...formConfig,
      variants: [...(formConfig.variants || []), newVariant],
    });
  };

  const updateVariant = (index, updates) => {
    const updatedVariants = [...(formConfig.variants || [])];
    updatedVariants[index] = { ...updatedVariants[index], ...updates };
    setFormConfig({ ...formConfig, variants: updatedVariants });
  };

  const deleteVariant = (index) => {
    const updatedVariants = (formConfig.variants || []).filter((_, i) => i !== index);
    setFormConfig({ ...formConfig, variants: updatedVariants });
  };

  const renderPreviewField = (field) => {
    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <input
              type={field.fieldType}
              placeholder={field.placeholder || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 placeholder:text-slate-300"
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <select disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
              <option>Select {field.fieldLabel}</option>
              {(field.options || []).map((opt, idx) => (
                <option key={idx}>{opt}</option>
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
              placeholder={field.placeholder || ''}
              rows={3}
              disabled
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 placeholder:text-slate-300 resize-none"
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <input
              type="date"
              disabled
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400"
            />
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div key={field.fieldName} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {field.fieldLabel} {field.isMandatory && <span className="text-indigo-600">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <button disabled className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed">
                Choose {field.fieldType === 'image' ? 'Image' : 'File'}
              </button>
              {field.fieldType === 'image' && (
                <div className="w-20 h-20 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                  No image
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle Preview Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-2 border border-slate-200"
        >
          {showPreview ? (
            <>
              <EyeOff size={18} />
              Hide Preview
            </>
          ) : (
            <>
              <Eye size={18} />
              Show Preview
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-900">Form Preview</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                {formConfig.formName || 'QR Creation Form'}
              </h3>
              {formConfig.description && (
                <p className="text-sm text-gray-500 mt-1 ml-3">{formConfig.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Brand Dropdown (Static Field) */}
              {formConfig.staticFields?.brand?.enabled && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">
                    Brand {formConfig.staticFields.brand.isMandatory && <span className="text-indigo-600">*</span>}
                  </label>
                  <select disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                    <option>Select brand</option>
                  </select>
                </div>
              )}

              {/* Custom Fields */}
              {formConfig.customFields
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(field => renderPreviewField(field))}

              {/* Date & Expiry Section Divider */}
              <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-indigo-600" />
                  <h4 className="text-sm font-semibold text-slate-800">Date & Expiry Information</h4>
                </div>
              </div>

              {/* Mfd On */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Mfd On (Manufacturing Date) <span className="text-indigo-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="YYYY"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400"
                  />
                </div>
              </div>

              {/* Best Before */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Best Before (Shelf Life) <span className="text-indigo-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400"
                  />
                  <select disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                    <option>Months</option>
                    <option>Years</option>
                  </select>
                </div>
              </div>

              {/* Calculated Expiry */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Calculated Expiry Date (Auto-calculated)
                </label>
                <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold">
                  Enter Mfd On and Best Before to calculate
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-2 pt-4">
                <button disabled className="w-full bg-gray-300 text-white font-medium py-3 rounded-xl cursor-not-allowed">
                  Generate Product & QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Form Name</label>
            <input
              type="text"
              value={formConfig.formName}
              onChange={(e) => setFormConfig({ ...formConfig, formName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="QR Creation Form"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={formConfig.description}
              onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Form description (optional)"
            />
          </div>
        </div>
      </div>

      {/* Static Fields Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">📅 Static Date Fields (Always Present)</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Mfd On:</strong> Manufacturing date (MM/YYYY format - Month/Year boxes)</p>
          <p><strong>Best Before:</strong> Shelf life duration (Number + Months/Years dropdown)</p>
          <p><strong>Expiry Date:</strong> Auto-calculated from Mfd On + Best Before (MM/YYYY)</p>
        </div>
      </div>

      {/* Custom Fields */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">Custom Fields</h2>
          <button
            onClick={addCustomField}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Field
          </button>
        </div>

        {formConfig.customFields.length === 0 ? (
          <div className="text-center py-12">
            <Settings size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-semibold">No custom fields added yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "Add Field" to create your first custom field</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formConfig.customFields.map((field, index) => (
              <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Field Header */}
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedField(expandedField === index ? null : index)}>
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical size={18} className="text-slate-400" />
                    <div className="flex items-center gap-2">
                      {React.createElement(fieldTypeOptions.find(t => t.value === field.fieldType)?.icon || Type, { size: 16, className: 'text-slate-500' })}
                      <span className="font-bold text-slate-800">{field.fieldLabel}</span>
                    </div>
                    {field.isMandatory && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                      disabled={index === formConfig.customFields.length - 1}
                      className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomField(index); }}
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Field Details (Expanded) */}
                {expandedField === index && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Field Label *</label>
                        <input
                          type="text"
                          value={field.fieldLabel}
                          onChange={(e) => updateCustomField(index, { fieldLabel: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Field Label"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Field Name (Internal) *</label>
                        <input
                          type="text"
                          value={field.fieldName}
                          onChange={(e) => updateCustomField(index, { fieldName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="field_name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Field Type *</label>
                        <select
                          value={field.fieldType}
                          onChange={(e) => updateCustomField(index, { fieldType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {fieldTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => updateCustomField(index, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter placeholder text"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.isMandatory}
                        onChange={(e) => updateCustomField(index, { isMandatory: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm font-semibold text-slate-700">Make this field mandatory</label>
                    </div>

                    {/* Dropdown Options */}
                    {field.fieldType === 'dropdown' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Dropdown Options</label>
                        <div className="space-y-2">
                          {(field.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                onClick={() => deleteOption(index, optIndex)}
                                className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(index)}
                            className="w-full px-3 py-2 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-sm font-semibold transition-colors"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Variants Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Product Variants</h2>
            <p className="text-xs text-slate-500 mt-1">Define variant types (Color, Size, Model) - creators can add multiple values for each</p>
          </div>
          <button
            onClick={addVariant}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Variant
          </button>
        </div>

        {(!formConfig.variants || formConfig.variants.length === 0) ? (
          <div className="text-center py-12">
            <List size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-semibold">No variants configured</p>
            <p className="text-sm text-slate-400 mt-1">Add variants like Color, Size, or Model for flexible product variations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(formConfig.variants || []).map((variant, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <List size={18} className="text-blue-600" />
                    <span className="font-semibold text-slate-800">{variant.variantLabel}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{variant.inputType}</span>
                  </div>
                  <button
                    onClick={() => deleteVariant(index)}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Variant Label</label>
                    <input
                      type="text"
                      value={variant.variantLabel}
                      onChange={(e) => updateVariant(index, { variantLabel: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g., Color"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Internal Name</label>
                    <input
                      type="text"
                      value={variant.variantName}
                      onChange={(e) => updateVariant(index, { variantName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g., color"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Input Type</label>
                    <select
                      value={variant.inputType}
                      onChange={(e) => updateVariant(index, { inputType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="color">Color Picker</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>
                </div>

                {variant.inputType === 'dropdown' && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Dropdown Options</label>
                    <div className="space-y-2">
                      {(variant.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const updated = [...(formConfig.variants || [])];
                              updated[index].options[optIndex] = e.target.value;
                              setFormConfig({ ...formConfig, variants: updated });
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <button
                            onClick={() => {
                              const updated = [...(formConfig.variants || [])];
                              updated[index].options.splice(optIndex, 1);
                              setFormConfig({ ...formConfig, variants: updated });
                            }}
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updated = [...(formConfig.variants || [])];
                          if (!updated[index].options) updated[index].options = [];
                          updated[index].options.push('');
                          setFormConfig({ ...formConfig, variants: updated });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-sm font-semibold transition-colors"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Check size={18} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
}
