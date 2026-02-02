import React from 'react';

export default function WebFooter() {
  return (
    <footer className="bg-[#333333] text-white py-6">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
            <div className="mb-2 md:mb-0">
                &copy; 2026 Authentiks. All rights reserved.
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-gray-300 italic">Terms & Conditions</a>
                <a href="#" className="hover:text-gray-300 italic">Privacy Policy</a>
            </div>
        </div>
    </footer>
  );
}
