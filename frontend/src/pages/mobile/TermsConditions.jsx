import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";

export default function TermsConditions() {
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
          className="text-[24px] font-bold tracking-tight text-[#214B80]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="p-2">
           <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10 overflow-y-auto">
        <h1 className="text-[#0F4160] text-[22px] font-bold mb-6">Terms & Conditions</h1>
        
        <div className="text-[#214B80] text-[14px] leading-relaxed space-y-6">
            <div>
                <h2 className="font-bold text-[16px]">Authentiks – Terms & Conditions</h2>
                <p className="opacity-75">Last updated: [01/01/2026]</p>
            </div>
            
            <p>These Terms & Conditions ("Terms") govern the use of the Authentiks mobile application, website, QR authentication services and enterprise dashboard operated by Authentiks ("Authentiks", "we", "our", "us"). By accessing or using Authentiks, you agree to be bound by these Terms.</p>

            {/* PART A */}
            <div>
                <h3 className="font-bold text-[16px] mb-3 text-[#0F4160] decoration-2 underline underline-offset-4">PART A: TERMS FOR APP USERS (BUYERS / SCANNERS)</h3>
                
                <h4 className="font-bold mb-1">1. Eligibility</h4>
                <p className="mb-4">You must be at least 18 years old or have legal parental consent to use the Authentiks app.</p>

                <h4 className="font-bold mb-1">2. Purpose of the App</h4>
                <p className="mb-4">Authentiks allows users to scan QR codes on products to check authenticity based on data provided by participating brands and manufacturers. Authentiks does not sell, manufacture, or distribute products.</p>

                <h4 className="font-bold mb-1">3. Authenticity Disclaimer</h4>
                <p className="mb-4">Authentiks verifies products based on information received from brands and enterprise clients. While we strive for accuracy, Authentiks does not guarantee that a product is genuine, nor do we take responsibility for manufacturing defects, seller behavior, or counterfeit activity beyond our system data.</p>

                <h4 className="font-bold mb-1">4. Scan Results</h4>
                <p className="mb-2">Scan outcomes may include:</p>
                <ul className="list-disc pl-5 mb-2 space-y-1">
                    <li>Authentic</li>
                    <li>Duplicate Scan</li>
                    <li>Not Verified / Counterfeit</li>
                </ul>
                <p className="mb-4">Results are informational and should be used as guidance only.</p>

                 <h4 className="font-bold mb-1">5. Fake Product Reporting</h4>
                <p className="mb-4">Users may report suspected counterfeit products. Authentiks may share such reports with the concerned brand or authorities where required.</p>

                 <h4 className="font-bold mb-1">6. User Conduct</h4>
                <p className="mb-2">Users agree not to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Misuse QR codes</li>
                    <li>Attempt to manipulate scan results</li>
                    <li>Upload false or misleading reports</li>
                    <li>Use the app for unlawful purposes</li>
                </ul>

                 <h4 className="font-bold mb-1">7. Data & Privacy</h4>
                <p className="mb-4">Authentiks may collect limited data such as device information, scan location, and timestamps to improve fraud detection. All data usage is governed by our Privacy Policy.</p>

                 <h4 className="font-bold mb-1">8. Limitation of Liability</h4>
                <p className="mb-4">Authentiks shall not be liable for losses arising from the purchase, use, or resale of any product scanned through the app.</p>

                 <h4 className="font-bold mb-1">9. Termination</h4>
                <p>We reserve the right to suspend or terminate access for misuse or violation of these Terms.</p>
            </div>

            {/* PART B */}
             <div>
                <h3 className="font-bold text-[16px] mb-3 text-[#0F4160] decoration-2 underline underline-offset-4 mt-6">PART B: TERMS FOR ENTERPRISE CLIENTS (BRANDS / MANUFACTURERS)</h3>
                
                <h4 className="font-bold mb-1">10. Enterprise Account Responsibility</h4>
                <p className="mb-2">Enterprise clients are responsible for:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Accurate product data</li>
                    <li>Correct quantity requests</li>
                    <li>Secure internal approvals (Creator & Authorizer)</li>
                </ul>

                <h4 className="font-bold mb-1">11. QR Code Generation & Ownership</h4>
                <p className="mb-4">All QR codes generated via Authentiks are unique and traceable. QR codes remain inactive until officially activated after dispatch and confirmation. QR codes may not be reused, duplicated, or altered.</p>

                <h4 className="font-bold mb-1">12. Approval & Activation Flow</h4>
                <p className="mb-2">Authentiks follows a structured workflow:</p>
                <ul className="list-disc pl-5 mb-2 space-y-1">
                    <li>Order Initiation by Creator</li>
                    <li>Authorization by Authorizer</li>
                    <li>Acceptance & Printing by Authentiks</li>
                    <li>Dispatch & Activation upon confirmation</li>
                </ul>
                <p className="mb-4">Authentiks is not responsible for delays caused by incomplete approvals or incorrect data.</p>

                 <h4 className="font-bold mb-1">13. Printing & Dispatch</h4>
                <p className="mb-4">Authentiks shall print and dispatch QR codes as per approved orders. Risk transfers to the enterprise client upon dispatch unless otherwise agreed.</p>

                 <h4 className="font-bold mb-1">14. Misuse & Fraud</h4>
                <p className="mb-2">Any misuse, resale, cloning, or unauthorized sharing of QR codes may result in:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Immediate suspension</li>
                    <li>Deactivation of QR codes</li>
                    <li>Legal action if required</li>
                </ul>

                 <h4 className="font-bold mb-1">15. Service Availability</h4>
                <p className="mb-4">Authentiks strives for high availability but does not guarantee uninterrupted service due to maintenance, updates, or force majeure events.</p>

                <h4 className="font-bold mb-1">16. Fees & Payments</h4>
                <p className="mb-4">Enterprise pricing, billing cycles, and payment terms shall be governed by separate commercial agreements.</p>

                <h4 className="font-bold mb-1">17. Data Rights</h4>
                <p className="mb-4">Enterprise clients retain ownership of their product data. Authentiks retains rights to system data, analytics, and fraud insights derived from usage.</p>

                <h4 className="font-bold mb-1">18. Indemnity</h4>
                <p className="mb-4">Enterprise clients agree to indemnify Authentiks against claims arising from counterfeit products, regulatory violations, or inaccurate data submissions.</p>

                <h4 className="font-bold mb-1">19. Confidentiality</h4>
                <p>All enterprise data, workflows, and QR logic are confidential and may not be disclosed without written consent.</p>
            </div>

            {/* PART C */}
            <div>
                 <h3 className="font-bold text-[16px] mb-3 text-[#0F4160] decoration-2 underline underline-offset-4 mt-6">GENERAL TERMS</h3>

                 <h4 className="font-bold mb-1">20. Intellectual Property</h4>
                 <p className="mb-4">All trademarks, software, and platform content belong to Authentiks.</p>
                 
                 <h4 className="font-bold mb-1">21. Modifications</h4>
                 <p className="mb-4">Authentiks may update these Terms periodically. Continued use implies acceptance.</p>

                 <h4 className="font-bold mb-1">22. Governing Law</h4>
                 <p className="mb-4">These Terms shall be governed by the laws of India.</p>

                 <div className="bg-white/50 p-4 rounded-lg">
                    <h3 className="font-bold text-[15px] mb-1">23. Contact</h3>
                    <p>For queries, contact:</p>
                    <p className="text-[#32ADD8] font-bold">support@authentiks.in</p>
                </div>
            </div>

            <p className="text-center italic opacity-80 pb-6 pt-4">By using Authentiks, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
        </div>
      </div>
    </div>
  );
}
