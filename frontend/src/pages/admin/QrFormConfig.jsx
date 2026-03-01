import React from 'react';
import { FormInput } from 'lucide-react';
import FormBuilder from '../../components/FormBuilder';

export default function QrFormConfig() {

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FormInput size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">QR Form Configuration</h1>
            <p className="text-sm text-slate-500 font-medium">Customize the QR creation form with dynamic fields for all companies</p>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <FormBuilder 
        onSave={() => {
          // Optionally refresh or show success message
        }}
      />
    </div>
  );
}
