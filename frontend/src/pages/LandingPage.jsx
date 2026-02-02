import React from 'react';
import heroImage from '../assets/web/image 1.png';
import step1Icon from '../assets/web/1 5521.png'; 
import step2Icon from '../assets/web/2 1.png'; 
import step3Icon from '../assets/web/3 1.png'; 
import fmcgImg from '../assets/web/fmcg 1.png';
import pharmImg from '../assets/web/pharm 1.png';
import fashionImg from '../assets/web/Fashion 1.png';
import electronicsImg from '../assets/web/Electronics 1.png';
import autoImg from '../assets/web/auto 1.png';
import cosmeticImg from '../assets/web/cosmetics 1.png';
import banner1 from '../assets/corosels/banner_1.jpg';
import banner2 from '../assets/corosels/banner_2.jpg';
import banner3 from '../assets/corosels/banner_3.jpg';
import WebHeader from '../components/WebHeader';
import WebFooter from '../components/WebFooter';

// Helper to make the separator consistently
const SectionSeparator = () => (
  <div className="h-[4px] bg-gray-200 flex-grow "></div>
);

// Helper for Industry Card
const IndustryCard = ({ title, image }) => (
  <div className="flex flex-col">
    <h3 className="text-[#214B80] font-bold text-xl mb-4 text-left">{title}</h3>
    <div className="border-4 border-gray-200 p-2">
      <img src={image} alt={title} className="w-full h-auto object-cover" />
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="font-sans w-full overflow-x-hidden">
      <WebHeader />

      {/* Hero Section */}
      <section className="relative w-full">
        <img 
          src={heroImage} 
          alt="Hero" 
          className="w-full h-full object-contain object-contain"
        />
        <div className="absolute inset-0 bg-transparent flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-white text-3xl md:text-5xl lg:text-5xl font-bold max-w-xl drop-shadow-lg leading-tight">
              Authentiks protects your brand by proving every product is genuine
            </h1>
          </div>
        </div>
      </section>

      {/* Global Counterfeit Problem Fact Section */}
      <section className="py-12 bg-white w-full px-16">
        <div className="flex items-center justify-center mb-10 relative w-full px-4 gap-4">
             <SectionSeparator />
             <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center">Global Counterfeit Problem Fact</h2>
             <SectionSeparator />
        </div>

        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <img src={banner2} alt="1/5 products fake" className="w-full h-auto object-contain shadow-sm rounded-lg" />
            <img src={banner3} alt="2.3 Trillion market" className="w-full h-auto object-contain shadow-sm rounded-lg" />
            <img src={banner1} alt="10% revenue loss" className="w-full h-auto object-contain shadow-sm rounded-lg" />

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white w-full px-16">
        <div className="flex items-center justify-center mb-10 relative w-full px-4 gap-4">
             <SectionSeparator />
             <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center">How It Works</h2>
             <SectionSeparator />
        </div>

        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center group">
            <div className="mb-4 relative w-48 h-48 flex items-center justify-center transition-transform group-hover:scale-105">
                 <img src={step1Icon} alt="Buy" className="w-full h-full object-contain" />
            </div>
            <div className="bg-[#1B4079] text-white px-12 py-2 rounded-full text-xl font-bold mb-4 shadow-lg min-w-[180px]">
              BUY
            </div>
            <p className="text-gray-800 font-semibold text-sm md:text-base max-w-[200px] leading-snug">
              Choose the product with an Authentiks QR label
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center group">
            <div className="mb-4 relative w-48 h-48 flex items-center justify-center transition-transform group-hover:scale-105">
                 <img src={step2Icon} alt="Scan" className="w-full h-full object-contain" />
            </div>
            <div className="bg-[#1B4079] text-white px-12 py-2 rounded-full text-xl font-bold mb-4 shadow-lg min-w-[180px]">
              SCAN
            </div>
            <p className="text-gray-800 font-semibold text-sm md:text-base max-w-[200px] leading-snug">
              Scan the QR code using your phone to check authenticity
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center group">
            <div className="mb-4 relative w-48 h-48 flex items-center justify-center transition-transform group-hover:scale-105">
                 <img src={step3Icon} alt="Verify" className="w-full h-full object-contain" />
            </div>
            <div className="bg-[#1B4079] text-white px-12 py-2 rounded-full text-xl font-bold mb-4 shadow-lg min-w-[180px]">
              VERIFY
            </div>
            <p className="text-gray-800 font-semibold text-sm md:text-base max-w-[200px] leading-snug">
              Instantly confirm whether the product is genuine or not
            </p>
          </div>
        </div>
      </section>

      {/* Top Industries We Serve Section */}
      <section className="py-12 bg-white w-full px-16">
        <div className="flex items-center justify-center mb-10 relative w-full px-4 gap-4">
             <SectionSeparator />
             <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center">Top Industries We Serve</h2>
             <SectionSeparator />
        </div>

        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            <IndustryCard title="FMCG" image={fmcgImg} />
            <IndustryCard title="Pharmaceuticals" image={pharmImg} />
            
            <IndustryCard title="Fashion, Apparel & Luxury" image={fashionImg} />
            <IndustryCard title="Electronics" image={electronicsImg} />
            
            <IndustryCard title="Automotive Parts" image={autoImg} />
            <IndustryCard title="Cosmetics" image={cosmeticImg} />
        </div>
      </section>
      
      <WebFooter />
    </div>
  );
}
