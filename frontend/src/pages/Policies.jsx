import { useNavigate } from "react-router-dom";
import Logo from "../assets/Authentiks.png";
import NotificationIcon from "../assets/icon_notification.png";

export default function Policies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#1B2B49]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="p-2">
           <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10 overflow-y-auto">
        <h1 className="text-[#0F4160] text-[22px] font-bold mb-6">Policies</h1>
        
        <div className="text-[#1B2B49] text-[14px] leading-relaxed space-y-6">
            <div>
                <h2 className="font-bold text-[16px]">Authentiks – Policies</h2>
                <p className="opacity-75">Last updated: [01/01/2026]</p>
            </div>
            
            <p>These policies govern the use of Authentiks’ mobile application, QR authentication services, enterprise dashboard, and related systems. By using Authentiks, users and enterprise clients agree to the policies outlined below.</p>

            <div>
                <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Privacy Policy</h3>
                
                <h4 className="font-bold mb-1">1. Information We Collect</h4>
                <p className="mb-2">Authentiks may collect the following information:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Personal information (name, phone number, email – if provided)</li>
                    <li>Device and app information</li>
                    <li>QR scan data (product ID, location, time, device type)</li>
                    <li>Enterprise account and order data</li>
                </ul>

                <h4 className="font-bold mb-1">2. How We Use Information</h4>
                <p className="mb-2">Information is used to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Verify product authenticity</li>
                    <li>Detect duplicate scans and counterfeit activity</li>
                    <li>Improve system performance and fraud detection</li>
                    <li>Communicate service updates and alerts</li>
                </ul>

                <h4 className="font-bold mb-1">3. Data Sharing</h4>
                <p className="mb-2">Authentiks may share data with:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Participating brands/manufacturers</li>
                    <li>Logistics or printing partners (limited to operational needs)</li>
                    <li>Legal or regulatory authorities if required by law</li>
                </ul>

                <h4 className="font-bold mb-1">4. Data Security</h4>
                <p className="mb-4">We implement reasonable technical and organizational measures to protect data. However, no digital system is completely secure.</p>

                <h4 className="font-bold mb-1">5. Data Retention</h4>
                <p>Data is retained only as long as necessary for verification, compliance, and audit purposes.</p>
            </div>

            <div>
                <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">QR Code Usage Policy</h3>
                
                <h4 className="font-bold mb-1">6. QR Code Rules</h4>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Each QR code is unique and single-use per product</li>
                    <li>QR codes must not be copied, cloned, or reused</li>
                    <li>QR codes remain inactive until officially activated</li>
                </ul>

                <h4 className="font-bold mb-1">7. Misuse & Deactivation</h4>
                <p>Authentiks reserves the right to deactivate QR codes if misuse, duplication, or suspicious activity is detected.</p>
            </div>
            
            <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Fake Product & Fraud Policy</h3>
                 <h4 className="font-bold mb-1">8. Reporting Counterfeit Products</h4>
                 <p className="mb-4">Users may report suspected fake products through the app. Reports are reviewed and may be shared with brands or authorities.</p>

                 <h4 className="font-bold mb-1">9. Investigation Process</h4>
                 <p className="mb-2">Authentiks may:</p>
                 <ul className="list-disc pl-5 mb-2 space-y-1">
                    <li>Analyze scan patterns</li>
                    <li>Temporarily flag QR codes</li>
                    <li>Suspend enterprise accounts in serious cases</li>
                </ul>
                <p>Authentiks does not guarantee enforcement outcomes.</p>
            </div>

            <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Enterprise Data & Responsibility Policy</h3>
                 <h4 className="font-bold mb-1">10. Enterprise Obligations</h4>
                 <p className="mb-2">Enterprise clients are responsible for:</p>
                 <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Correct product and order data</li>
                    <li>Internal approvals before QR requests</li>
                    <li>Secure handling of printed QR codes</li>
                </ul>

                 <h4 className="font-bold mb-1">11. Activation Policy</h4>
                 <p className="mb-2">QR codes become active only after:</p>
                 <ul className="list-disc pl-5 mb-2 space-y-1">
                    <li>Successful dispatch</li>
                    <li>Receipt confirmation</li>
                    <li>Final activation approval</li>
                </ul>
            </div>

             <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Payment & Billing Policy (Enterprise)</h3>
                 <h4 className="font-bold mb-1">12. Fees</h4>
                 <p className="mb-4">All fees, pricing, and billing cycles are governed by separate commercial agreements.</p>
                 <h4 className="font-bold mb-1">13. Non-Payment</h4>
                 <p>Authentiks may suspend services in case of delayed or failed payments.</p>
            </div>

            <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Service Availability Policy</h3>
                 <h4 className="font-bold mb-1">14. Uptime</h4>
                 <p className="mb-4">Authentiks strives for high availability but does not guarantee uninterrupted access.</p>
                 <h4 className="font-bold mb-1">15. Maintenance</h4>
                 <p>Planned maintenance may cause temporary service disruption.</p>
            </div>

             <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Cancellation & Refund Policy</h3>
                 <h4 className="font-bold mb-1">16. Enterprise Orders</h4>
                 <p className="mb-4">Once QR codes are printed or dispatched, cancellations or refunds are not permitted unless agreed in writing.</p>
                 <h4 className="font-bold mb-1">17. App Users</h4>
                 <p>No monetary transactions occur with app users; refunds do not apply.</p>
            </div>

             <div>
                 <h3 className="font-bold text-[15px] mb-2 text-[#0F4160]">Compliance & Legal Policy</h3>
                 <h4 className="font-bold mb-1">18. Governing Law</h4>
                 <p className="mb-4">All policies are governed by the laws of India.</p>
                 <h4 className="font-bold mb-1">19. Policy Updates</h4>
                 <p>Authentiks may update these policies periodically. Continued use implies acceptance.</p>
            </div>
            
            <div className="bg-white/50 p-4 rounded-lg">
                <h3 className="font-bold text-[15px] mb-1">📩 Contact</h3>
                <p>For policy-related queries:</p>
                <p className="text-[#32ADD8] font-bold">support@authentiks.in</p>
            </div>

            <p className="text-center italic opacity-80 pb-6">By using Authentiks, you acknowledge and agree to these policies.</p>
        </div>
      </div>
    </div>
  );
}
