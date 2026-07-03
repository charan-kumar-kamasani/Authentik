import React from 'react';
import { ChevronDown, FlaskConical, Award } from 'lucide-react';

export const AccordionItem = ({ title, subtitle, icon: Icon, children, isOpen, onToggle }: any) => {
  return (
    <div className="bg-white rounded-[16px] mb-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-[#105DE4] flex items-center justify-center shrink-0">
             <Icon size={24} strokeWidth={1.5} />
          </div>
          <div className="text-left">
             <h3 className="text-[15px] font-bold text-[#0B1E36] leading-tight">{title}</h3>
             {subtitle && <p className="text-[12px] font-medium text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 border-t border-slate-50">
             {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const KeyValueRow = ({ label, value }: any) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[13px] font-medium text-slate-500">{label}</span>
      <span className="text-[13px] font-bold text-[#0B1E36] text-right max-w-[60%]">{value}</span>
    </div>
  );
};

export const CertificateViewer = ({ cert }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const fileUrl = cert.image || cert.file || cert.url;
  
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 p-4 active:bg-slate-100 w-full text-left"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
          {cert.isLabTest ? <FlaskConical size={20} strokeWidth={2} /> : <Award size={20} strokeWidth={2} />}
        </div>
        <div className="flex-1">
          <h4 className="text-[14px] font-bold text-[#0B1E36] leading-tight mb-1">{cert.name}</h4>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && fileUrl && (
        <div className="p-4 pt-0 border-t border-slate-100 animate-in slide-in-from-top-2">
          <a href={fileUrl} target="_blank" rel="noreferrer" className="block w-full rounded-lg overflow-hidden border border-slate-200">
             <img src={fileUrl} alt={cert.name} className="w-full h-auto object-contain bg-white max-h-[300px]" />
          </a>
        </div>
      )}
    </div>
  );
};
