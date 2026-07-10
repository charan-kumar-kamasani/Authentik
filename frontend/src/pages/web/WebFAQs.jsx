import React, { useState } from "react";
import { ChevronDown, Calendar, ChevronRight } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import faqHeroImage from "../../assets/banners/new_banners/faq.png";

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className={`border rounded-xl mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
    >
      <button 
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-bold text-lg ${isOpen ? 'text-blue-700' : 'text-slate-900'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
          <ChevronDown size={18} />
        </div>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out px-6 text-slate-600 leading-relaxed overflow-hidden ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-2 border-t border-blue-100 whitespace-pre-line">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FaqSection = ({ title, items }) => (
  <div className="mb-16">
    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
      <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
      {title}
    </h3>
    <div className="space-y-4">
      {items.map((item, index) => (
        <FaqItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  </div>
);

export default function WebFAQs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const faqData = [
    {
      title: "General",
      items: [
        {
          question: "What is Authentiks?",
          answer: "Authentiks is a Consumer Intelligence Platform that transforms every physical product into a connected digital asset. Through a secure QR identity, brands can authenticate products, register consumers, deliver digital product passports, and build long-term customer relationships."
        },
        {
          question: "Who is Authentiks built for?",
          answer: "Authentiks is designed for consumer brands across industries including Nutraceuticals, Pharmaceuticals, Cosmetics, Personal Care, Electronics, Luxury Goods, FMCG, and other businesses looking to enhance product trust and consumer engagement."
        },
        {
          question: "How is Authentiks different from a QR code generator?",
          answer: "Authentiks goes far beyond QR generation. Every QR code is linked to a unique digital product identity, enabling authentication, consumer registration, product passports, loyalty programs, warranty management, and actionable consumer intelligence."
        }
      ]
    },
    {
      title: "Product Authentication",
      items: [
        {
          question: "How does product authentication work?",
          answer: "Each product is assigned a unique secure QR identity. When consumers scan the QR code, Authentiks instantly verifies the product's authenticity and provides a trusted digital experience."
        },
        {
          question: "Can counterfeit products be detected?",
          answer: "Yes. Authentiks can identify duplicate or suspicious QR scans, helping brands detect potential counterfeit activity and gain visibility into product authenticity."
        },
        {
          question: "Does every product receive a unique QR code?",
          answer: "Yes. Every individual product is assigned its own unique secure digital identity."
        }
      ]
    },
    {
      title: "Consumer Intelligence",
      items: [
        {
          question: "What is Consumer Intelligence?",
          answer: "Consumer Intelligence gives brands valuable first-party insights about product ownership, consumer registrations, engagement, regional demand, and post-purchase behavior—helping businesses make better marketing and product decisions."
        },
        {
          question: "What consumer information can brands collect?",
          answer: "Brands can collect information voluntarily shared by consumers during product registration, such as contact details, purchase information, location, and engagement history, in accordance with applicable privacy regulations and user consent."
        },
        {
          question: "Can brands engage consumers after purchase?",
          answer: "Yes. Authentiks enables brands to continue engaging consumers through product passports, rewards, campaigns, warranty services, reorder reminders, and exclusive offers."
        }
      ]
    },
    {
      title: "Platform Features",
      items: [
        {
          question: "What is a Digital Product Passport?",
          answer: "A Digital Product Passport provides consumers with instant access to product information, ingredients, certifications, usage instructions, warranties, authenticity verification, and other brand content from a single scan."
        },
        {
          question: "Does Authentiks support warranty management?",
          answer: "Yes. Brands can activate warranties, register product ownership, and manage warranty-related consumer interactions through the platform."
        },
        {
          question: "Can Authentiks help increase repeat purchases?",
          answer: "Yes. Features such as Smart Reorder, rewards, loyalty campaigns, and personalized consumer engagement help brands encourage repeat purchases and strengthen long-term customer relationships."
        }
      ]
    },
    {
      title: "Security & Implementation",
      items: [
        {
          question: "Is consumer data secure?",
          answer: "Yes. Authentiks follows industry best practices to protect consumer information using secure cloud infrastructure, encrypted communications, and enterprise-grade security controls."
        },
        {
          question: "Can Authentiks integrate with existing business systems?",
          answer: "Yes. Authentiks is designed with an API-ready architecture to support integration with existing business applications and workflows where required."
        },
        {
          question: "How long does implementation take?",
          answer: "Implementation timelines depend on business requirements and product volume. Our team works closely with every brand to ensure a smooth and efficient deployment."
        },
        {
          question: "Is onboarding support provided?",
          answer: "Yes. Every implementation includes guidance from our team to help brands successfully launch and maximize the value of the platform."
        }
      ]
    },
    {
      title: "Plans",
      items: [
        {
          question: "Which plan is right for my business?",
          answer: "Our Starter, Growth, and Enterprise plans are designed to support businesses at different stages of growth. Our team will help recommend the most suitable plan based on your business objectives and product scale."
        },
        {
          question: "Can I upgrade my plan later?",
          answer: "Yes. Brands can seamlessly upgrade their plan as their business and platform requirements evolve."
        },
        {
          question: "How do I get started?",
          answer: "Simply book a demo with our team. We'll understand your business needs, demonstrate the platform, and recommend the best implementation approach."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={faqHeroImage}
            alt="FAQ Banner"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about Authentiks, from product authentication to integration and pricing.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
            {faqData.map((section, index) => (
              <FaqSection key={index} title={section.title} items={section.items} />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-blue-600 rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                Still Have Questions?
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                We're here to help. Whether you're exploring product authentication, consumer intelligence, or enterprise deployment, our team is ready to answer your questions.
              </p>
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10 inline-flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 duration-200"
              >
                <Calendar size={20} /> Book a Demo
              </button>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      <WebFooter />
      <DemoModal isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
