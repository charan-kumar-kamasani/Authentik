import React from 'react';

export default function WebFooter() {
  return (
    <footer className="bg-[#020617] text-gray-400 py-12 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
                <div className="text-white font-black text-xl tracking-tighter">
                  Authen<span className="text-indigo-400">tiks</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
                    &copy; 2026 Authentiks. Precision Authentication.
                </div>
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
        </div>
    </footer>
  );
}
