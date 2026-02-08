import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

// Helper for section separator
const Separator = () => (
  <div className="h-[4px] bg-gray-200 w-full mt-2 mb-6"></div>
);

export default function WebContactUs() {
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
          <h1 className="text-4xl font-bold mb-2">Get In Touch</h1>
          <p className="text-xl text-blue-200">We'll Love to Hear from You</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12 text-[#214B80] flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold whitespace-nowrap">Contact Us</h2>
            <div className="h-[4px] bg-gray-200 w-full"></div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-[#214B80] font-bold text-sm mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#214B80] h-[40px] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#214B80] font-bold text-sm mb-2">
                Email Id
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#214B80] h-[40px] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#214B80] font-bold text-sm mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#214B80] h-[40px] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#214B80] font-bold text-sm mb-2">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#214B80] shadow-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#1B4079] text-white px-10 py-2 rounded-full font-bold text-lg hover:bg-blue-900 shadow-md"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
      <WebFooter />
    </div>
  );
}
