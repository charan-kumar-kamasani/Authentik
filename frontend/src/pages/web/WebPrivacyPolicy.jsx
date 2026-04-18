import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";

const SectionTitle = ({ children }) => (
  <h2 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6 mt-16`}>
    {children}
  </h2>
);

export default function WebPrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            <section className="py-20 md:py-32 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16 border-b border-white/10 pb-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 uppercase">
                            Privacy <span className="gradient-text">Policy</span>
                        </h1>
                        <p className="text-gray-400 font-bold mb-2">Effective Date: [1/4/2026]</p>
                        <p className="text-gray-400 font-bold leading-relaxed">
                            Authentiks (“we”, “our”, “us”) is a product of Recomm Innovations Private Limited.<br/>
                            We are committed to protecting your privacy and ensuring transparency in how your data is collected, used and safeguarded.
                            This Privacy Policy explains how we handle information when you use our website, platform, and services.
                        </p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-gray-400 prose-ul:font-medium prose-ul:text-gray-400">
                        
                        <SectionTitle>1. INFORMATION WE COLLECT</SectionTitle>
                        <p>We collect information to provide and improve our services.</p>
                        
                        <h3 className="text-xl font-black text-white mt-8 mb-4">A. Information You Provide (Brands / Businesses)</h3>
                        <p>When you: Sign up, Contact us, Request a demo, Use our platform</p>
                        <p>We may collect:</p>
                        <ul>
                            <li>Name</li>
                            <li>Business / Brand name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Billing details</li>
                            <li>Product / SKU information</li>
                        </ul>

                        <h3 className="text-xl font-black text-white mt-8 mb-4">B. Information Collected via QR Code Scans (End Users)</h3>
                        <p>When a customer scans a QR code, we may collect (only if enabled by brand):</p>
                        <ul>
                            <li>Device type</li>
                            <li>Location (approximate)</li>
                            <li>Time of scan</li>
                            <li>Interaction data</li>
                        </ul>
                        <p>Optional (with user consent):</p>
                        <ul>
                            <li>Name</li>
                            <li>Phone number</li>
                            <li>Age group</li>
                            <li>Gender</li>
                            <li>Basic demographics</li>
                        </ul>
                        <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 my-6 text-indigo-300 font-bold italic">
                            👉 We do not collect sensitive personal data without explicit consent.
                        </div>

                        <h3 className="text-xl font-black text-white mt-8 mb-4">C. Automatically Collected Data</h3>
                        <p>When you visit our website:</p>
                        <ul>
                            <li>IP address</li>
                            <li>Browser type</li>
                            <li>Device information</li>
                            <li>Pages visited</li>
                        </ul>

                        <SectionTitle>2. HOW WE USE YOUR INFORMATION</SectionTitle>
                        <p>We use the collected data to:</p>
                        <ul>
                            <li>Provide product authentication services</li>
                            <li>Generate and manage QR codes</li>
                            <li>Deliver analytics and insights</li>
                            <li>Detect duplicate or suspicious scans</li>
                            <li>Improve platform performance</li>
                            <li>Communicate with you (support, updates)</li>
                        </ul>
                        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 my-6 text-emerald-300 font-bold italic">
                            👉 We do not sell your personal data to third parties.
                        </div>

                        <SectionTitle>3. DATA SHARING & DISCLOSURE</SectionTitle>
                        <p>We may share data only in the following cases:</p>
                        <ul>
                            <li>With service providers (hosting, analytics, delivery partners)</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect against fraud or misuse</li>
                        </ul>
                        <p className="italic text-gray-400">All partners are required to maintain confidentiality and data security.</p>

                        <SectionTitle>4. DATA SECURITY</SectionTitle>
                        <p>We implement appropriate measures to protect your data:</p>
                        <ul>
                            <li>Secure servers and infrastructure</li>
                            <li>Controlled access to data</li>
                            <li>Monitoring for unauthorized activity</li>
                        </ul>
                        <p className="italic text-gray-400">While we strive to protect your data, no system is 100% secure.</p>

                        <SectionTitle>5. DATA RETENTION</SectionTitle>
                        <p>We retain data only as long as necessary for:</p>
                        <ul>
                            <li>Providing our services</li>
                            <li>Legal and compliance requirements</li>
                            <li>Business operations</li>
                        </ul>
                        <p>You may request deletion of your data at any time (see Section 8).</p>

                        <SectionTitle>6. COOKIES & TRACKING</SectionTitle>
                        <p>Our website may use cookies to:</p>
                        <ul>
                            <li>Improve user experience</li>
                            <li>Analyze website performance</li>
                        </ul>
                        <p>You can control or disable cookies through your browser settings.</p>

                        <SectionTitle>7. YOUR RIGHTS</SectionTitle>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion</li>
                            <li>Withdraw consent (where applicable)</li>
                        </ul>
                        <p className="italic text-gray-400">To exercise these rights, contact us at the email below.</p>

                        <SectionTitle>8. CONTACT FOR PRIVACY REQUESTS</SectionTitle>
                        <p>For any questions or requests related to privacy:</p>
                        <ul>
                            <li><strong>Email:</strong> support@authentiks.in</li>
                            <li><strong>Company:</strong> Recomm Innovations Private Limited</li>
                            <li><strong>Location:</strong> Chennai, Tamil Nadu, India</li>
                        </ul>

                        <SectionTitle>9. THIRD-PARTY LINKS</SectionTitle>
                        <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>

                        <SectionTitle>10. POLICY UPDATES</SectionTitle>
                        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.</p>

                        <SectionTitle>11. LEGAL COMPLIANCE</SectionTitle>
                        <p>We aim to comply with applicable data protection laws in India and other regions where we operate.</p>

                        <div className="mt-20 glass-effect p-10 rounded-[2.5rem] border border-white/5 text-center">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-4">Final Statement</h3>
                            <p className="text-gray-400 font-bold mb-8 text-lg">At Authentiks, protecting your data is as important as protecting your products.</p>
                            
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl max-w-2xl mx-auto">
                                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">Founder Note</h4>
                                <p className="text-white font-bold italic">“We are building Authentiks on a foundation of trust — not just for products, but for data and relationships as well.”</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <WebFooter />
        </div>
    );
}
