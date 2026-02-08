import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";
// Helper for section separator
const Separator = () => (
  <div className="h-[4px] bg-gray-200 w-full mt-2 mb-6"></div>
);

export default function WebAboutUs() {
  return (
    <div className="font-sans w-full min-h-screen flex flex-col bg-white">
      <WebHeader />

      {/* Banner */}
      <div
        className="w-full h-[200px] flex items-center relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${techBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 text-white">
          <h1 className="text-4xl font-bold mb-2">About Authentiks</h1>
          <p className="text-xl text-blue-200">
            Your Partner in Brand Protection
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12 text-[#214B80] max-w-5xl">
        {/* About Us */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold whitespace-nowrap">About Us</h2>
             <div className="h-[4px] bg-gray-200 flex-grow"></div>
          </div>
          <div className="text-[#214B80] font-medium space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Authentiks is a product authenticity and brand protection platform
              that helps companies ensure every product they sell is 100%
              genuine.
            </p>
            <p>
              Counterfeit products damage brand reputation and break consumer
              trust. Authentiks solves this by generating a unique QR code for
              every individual product manufactured by a brand. These QR codes
              are securely labeled on the product and can be peeled and scanned
              by the consumer after purchase to instantly verify authenticity.
            </p>
            <p>
              All QR codes are created through the Authentiks Enterprise Portal
              once a brand places an order. After approval, the codes are
              printed, delivered, and activated by the brand before being
              applied to products. Each scan confirms whether the product is
              genuine, already verified, or potentially counterfeit.
            </p>
            <p>
              Authentiks empowers brands to protect their identity and gives
              consumers confidence that what they buy is real—every single time.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold whitespace-nowrap">Our Mission</h2>
            <div className="h-[4px] bg-gray-200 flex-grow"></div>
          </div>
          <p className="text-[#214B80] font-medium text-base md:text-lg leading-relaxed">
            To protect brands and consumers by ensuring every product sold is
            genuine, traceable, and trusted, eliminating counterfeit goods from
            the market.
          </p>
        </div>

        {/* Our Vision */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
               <h2 className="text-2xl font-bold whitespace-nowrap">Our Vision</h2>
               <div className="h-[4px] bg-gray-200 flex-grow"></div>
          </div>
          
          <p className="text-[#214B80] font-medium text-base md:text-lg leading-relaxed">
            To build a world where authenticity is verified instantly, and
            consumers never have to question whether a product is real.
          </p>
        </div>

        {/* Our Values */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
               <h2 className="text-2xl font-bold whitespace-nowrap">Our Values</h2>
               <div className="h-[4px] bg-gray-200 flex-grow"></div>
          </div>
          <div className="space-y-4 text-[#214B80] text-base md:text-lg leading-relaxed">
            <div>
              <span className="font-extrabold block">Trust First:</span>
              <p className="font-medium">
                 Trust is at the core of everything we do—for brands, consumers, and partners.
              </p>
            </div>

            <div>
              <span className="font-extrabold block">
                Integrity by Design:
              </span>
              <p className="font-medium">
                We build systems that are secure, transparent, and impossible to manipulate.
              </p>
            </div>

            <div>
              <span className="font-extrabold block">
                Consumer Empowerment:
              </span>
              <p className="font-medium">
                 We give consumers the power to verify authenticity in seconds, with a simple scan.
              </p>
            </div>

            <div>
              <span className="font-extrabold block">
                Brand Protection:
              </span>
              <p className="font-medium">
                 We respect and protect the effort, craftsmanship, and reputation behind every genuine product.
              </p>
            </div>

            <div>
              <span className="font-extrabold block">
                Simplicity at Scale:
              </span>
              <p className="font-medium">
                 Complex problems deserve simple solutions that work reliably across millions of products.
              </p>
            </div>

            <div>
              <span className="font-extrabold block">
                Innovation with Purpose:
              </span>
              <p className="font-medium">
                 We use technology to solve real problems—not for hype, but for impact.
              </p>
            </div>
          </div>
        </div>
      </main>
      <WebFooter />
    </div>
  );
}
