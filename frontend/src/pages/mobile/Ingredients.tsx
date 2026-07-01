import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, FlaskConical } from 'lucide-react';

const Ingredients = () => {
  const navigate = useNavigate();
  const rawData = useLocation().state as any;

  if (!rawData || !rawData.ingredients) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-[#001466] text-xl font-bold mb-4">No Ingredients Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#001466] text-white rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 font-sans">
      {/* Header */}
      <div className="bg-[#001466] text-white pt-8 pb-6 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Ingredients</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FlaskConical size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Formulation</h2>
              <p className="text-xs font-medium text-slate-500">What goes into this product</p>
            </div>
          </div>
          
          <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{rawData.ingredients}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
