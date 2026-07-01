import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, ExternalLink } from 'lucide-react';

const Certificates = () => {
  const navigate = useNavigate();
  const rawData = useLocation().state as any;

  if (!rawData || !rawData.certificates || rawData.certificates.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-[#001466] text-xl font-bold mb-4">No Certificates Found</h2>
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
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Certifications & Lab Tests</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-6 space-y-4">
        {rawData.certificates.map((cert: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight flex-1">{cert.name || `Certificate ${idx + 1}`}</h2>
            </div>
            
            {cert.image && (
              <a 
                href={cert.image} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center"
              >
                <img 
                  src={cert.image} 
                  alt={cert.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('bg-slate-100');
                    target.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-slate-400 text-sm font-medium">Image not available</span>');
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                    <ExternalLink size={16} className="text-slate-900" />
                    <span className="text-sm font-bold text-slate-900">View Original</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
