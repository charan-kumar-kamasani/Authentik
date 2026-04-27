import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck, ExternalLink, MessageCircle } from 'lucide-react';

export default function WebFooter() {
  return (
    <footer className="bg-[#020617] text-gray-400 border-t border-white/5 relative">
      {/* Main Footer */}
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="text-white font-black text-2xl tracking-tighter mb-4">
              Authen<span className="text-indigo-400">tiks</span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Secure product authentication, anti-counterfeit protection, and customer engagement — all in one platform.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck size={14} />
              <span>Trusted by 100+ Brands</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Problem', path: '/problem' },
                { name: 'Product', path: '/product' },
                { name: 'AI Pulse', path: '/ai-pulse' },
                { name: 'How It Works', path: '/how-it-works' },
                { name: 'Industries', path: '/industries' },
                { name: 'Pricing', path: '/pricing' },
                { name: 'About Us', path: '/about-us' },
                { name: 'FAQs', path: '/faqs' },
                { name: 'Contact Us', path: '/contact-us' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-medium hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-indigo-500 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">Legal</h4>
            <ul className="space-y-3">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms & Conditions', path: '/terms-conditions' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-medium hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-indigo-500 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Support Email</div>
                  <a href="mailto:support@authentiks.in" className="text-sm font-medium hover:text-white transition-colors">
                    support@authentiks.in
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Phone</div>
                  <a href="tel:+919342501819" className="text-sm font-medium hover:text-white transition-colors">
                    +91 93425 01819
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Office</div>
                  <span className="text-sm font-medium">Chennai, Tamil Nadu, India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-50">
            &copy; {new Date().getFullYear()} Authentiks. Precision Authentication.
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact-us" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Chat Widget */}
      <a
        href="https://wa.me/919342501819?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Authentiks."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-[#020617] text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          Chat with Support
        </span>
      </a>
    </footer>
  );
}
