import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";
import { Linkedin } from "lucide-react";
import ibadulImage from "../../assets/web/founders/main.png";
import charanImage from "../../assets/web/founders/charan.png";
import rajeevImage from "../../assets/web/founders/image.png";
export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6 bg-white/50 backdrop-blur-sm border-b-2 border-[#E8F4F9]">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D4E96" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1
          className="text-[24px] font-black tracking-tight"
        >
          <span className="bg-gradient-to-r from-[#0D4E96] to-[#1e3a5f] bg-clip-text text-transparent">Authen</span><span className="bg-gradient-to-r from-[#2CA4D6] to-[#1a5fa8] bg-clip-text text-transparent">tiks</span>
        </h1>
        <button className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all" onClick={() => navigate('/notifications')}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D4E96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
             <path d="M13.73 21a2 2 0 0 1-3.46 0" />
           </svg>
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10">
        <h1 className="text-[#0D4E96] text-[24px] font-black mb-3 mt-4">About Us</h1>
        <p className="text-[#2CA4D6] text-[16px] font-bold mb-6 italic">Protecting Brands. Powering Trust. Unlocking Intelligence.</p>
        
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(13,78,150,0.12)] border-2 border-white text-[#1e3a5f] text-[14px] leading-relaxed space-y-5">
            
            {/* Why Authentiks Exists */}
            <div>
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Why Authentiks Exists</h3>
                <p className="font-medium mb-3">Modern businesses invest heavily in acquiring customers, building products, and growing distribution. Yet once a product reaches the consumer, brands often lose visibility and ownership of the relationship.</p>
                <ul className="list-disc pl-5 space-y-1 font-medium mb-3 text-[#1a5fa8]">
                    <li>Marketplaces own customer data.</li>
                    <li>Retailers own the transaction.</li>
                    <li>Distributors own the supply chain.</li>
                </ul>
                <p className="font-bold text-[15px] mb-3 text-[#0D4E96]">Brands own the product—but not the consumer relationship.</p>
                <p className="font-bold mb-3 text-[#2CA4D6]">Authentiks changes that.</p>
                <p className="font-medium">Our Consumer Intelligence Platform transforms every physical product into a secure digital identity, enabling brands to authenticate products, register consumers, collect first-party data, deliver engaging post-purchase experiences, and make smarter business decisions through real-time insights.</p>
            </div>

            {/* Our Mission */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[18px] p-5 border-l-4 border-[#2CA4D6]">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Our Mission</h3>
                <p className="font-medium">
                    To help every brand build trusted, data-driven relationships with consumers by transforming physical products into connected digital assets.
                </p>
            </div>

            {/* Our Vision */}
            <div className="bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] rounded-[18px] p-5 border-l-4 border-[#0D4E96]">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Our Vision</h3>
                <p className="font-medium">
                    A future where every physical product has a secure digital identity, every consumer can trust what they buy, and every brand truly owns its customer relationship.
                </p>
            </div>

            {/* Our Values */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[18px] p-5">
                <h3 className="font-black text-[17px] mb-3 text-[#0D4E96]">Our Values</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Trust by Design</h4>
                        <p className="font-medium text-[13px]">Trust is built into every product through secure digital identities and verified consumer experiences.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Consumer First</h4>
                        <p className="font-medium text-[13px]">Technology should simplify ownership, improve transparency, and create meaningful experiences for consumers.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Innovation with Purpose</h4>
                        <p className="font-medium text-[13px]">Every feature we build is designed to solve real business challenges while delivering measurable value.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[15px] text-[#1a5fa8] mb-1">Long-Term Partnerships</h4>
                        <p className="font-medium text-[13px]">We believe the strongest businesses are built through trust, collaboration, and lasting relationships.</p>
                    </div>
                </div>
            </div>

            {/* Why Brands Choose Authentiks */}
            <div className="bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] rounded-[18px] p-5">
                <h3 className="font-black text-[17px] mb-2 text-[#0D4E96]">Why Brands Choose Authentiks</h3>
                <p className="font-medium mb-3">Brands choose Authentiks because we help them move beyond product authentication.</p>
                <p className="font-medium mb-3">We enable them to build direct consumer relationships, capture first-party intelligence, protect brand integrity, and create meaningful post-purchase experiences—all through one connected platform.</p>
                <p className="font-medium">Our solution combines enterprise-grade security, scalable technology, and actionable insights, helping brands make every product work harder long after it has been sold.</p>
            </div>

            {/* Leadership */}
            <div className="mt-8">
                <h3 className="font-black text-[22px] mb-6 text-[#0D4E96] text-center tracking-tight">Leadership</h3>
                
                {/* Rajeev */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center mb-6">
                   <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden mb-4">
                     <img src={rajeevImage} alt="Rajeev Mecheri" className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = 'none'; }} />
                   </div>
                   <div className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">Mentor & Strategic Advisor</div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">Rajeev Mecheri</h3>
                   <p className="text-[#2CA4D6] text-[11px] font-bold mb-3">Serial Entrepreneur • Angel Investor • Technology Leader</p>
                   <a href="https://www.linkedin.com/in/rajeevmecheri/" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 mb-4 inline-block"><Linkedin size={16}/></a>
                   <div className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                     <p className="mb-3">Rajeev Mecheri is one of India's most respected technology entrepreneurs and startup mentors. Over the past three decades, he has built and scaled multiple technology companies, led successful global exits, invested in innovative startups and contributed extensively to the entrepreneurial ecosystem through organizations including The Chennai Angels, TiE, EO and YPO.</p>
                     <p>At Authentiks, Rajeev serves as Mentor and Strategic Advisor, helping shape our long-term vision, product strategy and enterprise growth. His mentorship reflects our commitment to building a globally trusted Consumer Intelligence Platform that enables brands to create secure, connected and intelligent product experiences.</p>
                   </div>
                </div>

                {/* Ibadul */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center mb-6">
                   <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden mb-4">
                     <img src={ibadulImage} alt="Ibadul Hassan" className="w-full h-full object-cover object-top" />
                   </div>
                   <div className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">Co-Founder & Business Head</div>
                   <h3 className="text-xl font-black text-slate-900 mb-2">Ibadul Hassan</h3>
                   <a href="https://www.linkedin.com/in/ibadul-hassan-6430b247/" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 mb-4 inline-block"><Linkedin size={16}/></a>
                   <div className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                     <p className="mb-3">Hassan is the Co-Founder & Business Head of Authentiks, where he leads business strategy, product innovation, and enterprise growth. With over 18 years of cross-functional leadership experience, he has worked with both global enterprises and high-growth startups, driving initiatives across operations, supply chain, digital transformation, customer experience and business development.</p>
                     <p>Driven by the belief that brands should own their customer relationships—not just their sales—he co-founded Authentiks to redefine how physical products connect with consumers. His focus is on building a platform that enables brands to authenticate products, capture first-party consumer intelligence and create meaningful post-purchase experiences at scale.</p>
                   </div>
                </div>

                {/* Charan */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                   <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden mb-4">
                     <img src={charanImage} alt="Charan Kumar" className="w-full h-full object-cover object-top" />
                   </div>
                   <div className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">Co-Founder & Technology Head</div>
                   <h3 className="text-xl font-black text-slate-900 mb-2">Charan Kumar</h3>
                   <a href="https://www.linkedin.com/in/charan-kumar-kamasani" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 mb-4 inline-block"><Linkedin size={16}/></a>
                   <div className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                     <p className="mb-3">Charan is the Co-Founder & Head of Technology at Authentiks, leading the platform's technology vision, product engineering and architecture. With expertise in full-stack development, cloud technologies, APIs and scalable application development, he focuses on building secure, high-performance systems that enable brands to connect every physical product with its digital identity.</p>
                     <p>At Authentiks, Charan drives the development of the Consumer Intelligence Platform, ensuring every component—from product authentication and digital product passports to analytics and enterprise integrations—is built with scalability, security and reliability at its core.</p>
                   </div>
                </div>
            </div>

            {/* Building the Future */}
            <div className="bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-[18px] p-5 text-white">
                <h3 className="font-black text-[17px] mb-2">Building the Future</h3>
                <p className="font-medium mb-3">The future of commerce is not just about selling products.</p>
                <p className="font-medium mb-3">It is about creating trusted, connected experiences that continue long after the purchase.</p>
                <p className="font-medium mb-3">At Authentiks, we are building the digital infrastructure that enables every physical product to become a source of trust, intelligence, and lifelong consumer engagement.</p>
                <p className="font-bold">Because every product should do more than reach a consumer. It should build a relationship.</p>
            </div>

            {/* Final Call to Action */}
            <div className="bg-[#E8F4F9] rounded-[18px] p-6 text-center border-2 border-[#2CA4D6]">
                <h3 className="font-black text-[19px] mb-2 text-[#0D4E96]">Ready to Build Smarter Consumer Relationships?</h3>
                <p className="font-medium text-[14px] text-[#1e3a5f] mb-5">Transform every product into a connected digital asset and unlock the power of consumer intelligence.</p>
                <button className="bg-[#0D4E96] text-white font-bold py-3 px-6 rounded-full w-full shadow-lg hover:bg-[#1a5fa8] active:scale-95 transition-all" onClick={() => navigate('/contact-us')}>
                    Book a Demo
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
