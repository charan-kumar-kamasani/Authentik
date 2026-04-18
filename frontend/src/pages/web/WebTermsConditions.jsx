import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";

const SectionTitle = ({ children }) => (
  <h2 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6 mt-16`}>
    {children}
  </h2>
);

export default function WebTermsConditions() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            <section className="py-20 md:py-32 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16 border-b border-white/10 pb-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 uppercase">
                            Terms & <span className="gradient-text">Conditions</span>
                        </h1>
                        <p className="text-gray-400 font-bold mb-2">Effective Date: [1/4/2026]</p>
                        <p className="text-gray-400 font-bold leading-relaxed">
                            These Terms & Conditions (“Terms”) govern your use of Authentiks, a product of Recomm Innovations Private Limited (“Company”, “we”, “our”, “us”).<br/><br/>
                            By accessing or using our website, platform, or services, you agree to these Terms.
                        </p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-gray-400 prose-ul:font-medium prose-ul:text-gray-400">
                        
                        <SectionTitle>1. DEFINITIONS</SectionTitle>
                        <ul>
                            <li><strong>“Platform”</strong> refers to Authentiks website, dashboard, and services</li>
                            <li><strong>“User” / “Client”</strong> refers to any individual or business using Authentiks</li>
                            <li><strong>“End User”</strong> refers to customers who scan QR codes</li>
                            <li><strong>“Services”</strong> include QR code generation, printing, analytics, and related offerings</li>
                        </ul>

                        <SectionTitle>2. SERVICES PROVIDED</SectionTitle>
                        <p>Authentiks provides:</p>
                        <ul>
                            <li>Unique QR code generation (per unit/SKU)</li>
                            <li>Physical QR label printing and delivery</li>
                            <li>Product authentication system</li>
                            <li>Data analytics and insights</li>
                            <li>Customer engagement tools (e.g., coupons, redirects)</li>
                        </ul>
                        <p className="italic text-gray-400">Services may evolve or be updated over time.</p>

                        <SectionTitle>3. USER ELIGIBILITY</SectionTitle>
                        <p>To use our services, you must:</p>
                        <ul>
                            <li>Be at least 18 years old</li>
                            <li>Provide accurate business and contact information</li>
                            <li>Use the platform for lawful purposes only</li>
                        </ul>

                        <SectionTitle>4. PRICING & PAYMENTS</SectionTitle>
                        <h3 className="text-xl font-black text-white mt-8 mb-4">A. Subscription Plans</h3>
                        <ul>
                            <li>Users can subscribe to Starter, Growth or Enterprise plans</li>
                            <li>Plans may be billed monthly, half-yearly, or annually</li>
                        </ul>
                        <h3 className="text-xl font-black text-white mt-8 mb-4">B. QR Code Charges</h3>
                        <ul>
                            <li>QR code printing and delivery are charged separately based on quantity</li>
                        </ul>
                        <h3 className="text-xl font-black text-white mt-8 mb-4">C. Credits</h3>
                        <ul>
                            <li>Annual plans may include credits usable for QR code orders</li>
                            <li>Credits are non-transferable and may have expiry conditions</li>
                        </ul>
                        <h3 className="text-xl font-black text-white mt-8 mb-4">D. Payment Terms</h3>
                        <ul>
                            <li>All payments must be made in advance</li>
                            <li>Failure to pay may result in suspension of services</li>
                        </ul>

                        <SectionTitle>5. FREE TRIAL / PROMOTIONAL OFFERS</SectionTitle>
                        <ul>
                            <li>Authentiks may offer limited-time free trials (e.g., 90 days)</li>
                            <li>Features during the trial may be restricted or promotional</li>
                            <li>We reserve the right to modify or withdraw offers at any time</li>
                        </ul>

                        <SectionTitle>6. ACCOUNT RESPONSIBILITY</SectionTitle>
                        <p>You are responsible for:</p>
                        <ul>
                            <li>Maintaining account confidentiality</li>
                            <li>All activities under your account</li>
                            <li>Ensuring authorized use of your login credentials</li>
                        </ul>

                        <SectionTitle>7. ACCEPTABLE USE</SectionTitle>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Use Authentiks for illegal or fraudulent activities</li>
                            <li>Misuse QR codes or manipulate scan data</li>
                            <li>Attempt to reverse engineer or hack the platform</li>
                            <li>Interfere with system performance</li>
                        </ul>
                        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-6 text-red-300 font-bold italic">
                            👉 Violation may result in immediate suspension or termination.
                        </div>

                        <SectionTitle>8. QR CODE USAGE & LIABILITY</SectionTitle>
                        <p>Each QR code is uniquely generated per product unit. Clients are responsible for:</p>
                        <ul>
                            <li>Proper application of QR labels</li>
                            <li>Ensuring codes are not tampered with post-delivery</li>
                        </ul>
                        <p>Authentiks is not liable for misuse after delivery, including:</p>
                        <ul>
                            <li>Improper labeling</li>
                            <li>Physical damage</li>
                            <li>Unauthorized duplication outside our system</li>
                        </ul>

                        <SectionTitle>9. DATA & ANALYTICS</SectionTitle>
                        <ul>
                            <li>Data generated from scans is provided for insights and analysis</li>
                            <li>Accuracy depends on real-world usage and external factors</li>
                            <li>Authentiks does not guarantee 100% accuracy of analytics</li>
                        </ul>

                        <SectionTitle>10. INTELLECTUAL PROPERTY</SectionTitle>
                        <ul>
                            <li>All platform technology, software, and systems belong to Authentiks</li>
                            <li>Users may not copy, reproduce, or resell our technology</li>
                        </ul>

                        <SectionTitle>11. LIMITATION OF LIABILITY</SectionTitle>
                        <p>To the maximum extent permitted by law, Authentiks shall not be liable for:</p>
                        <ul>
                            <li>Indirect or consequential losses</li>
                            <li>Loss of business, revenue, or reputation</li>
                            <li>Third-party misuse of QR codes</li>
                        </ul>
                        <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 my-6 text-indigo-300 font-bold italic">
                            👉 Our total liability is limited to the amount paid by you in the last billing cycle.
                        </div>

                        <SectionTitle>12. TERMINATION</SectionTitle>
                        <p>We may suspend or terminate your account if:</p>
                        <ul>
                            <li>You violate these Terms</li>
                            <li>Payments are overdue</li>
                            <li>There is suspected misuse or fraud</li>
                        </ul>
                        <p>You may also discontinue services at any time.</p>

                        <SectionTitle>13. REFUNDS & CANCELLATIONS</SectionTitle>
                        <ul>
                            <li>Subscription fees are generally non-refundable</li>
                            <li>Exceptions may be considered at our discretion</li>
                            <li>QR code orders once processed cannot be canceled</li>
                        </ul>

                        <SectionTitle>14. THIRD-PARTY SERVICES</SectionTitle>
                        <p>We may use third-party providers for Hosting, Payment processing, and Delivery/logistics. We are not responsible for third-party service failures.</p>

                        <SectionTitle>15. MODIFICATIONS TO TERMS</SectionTitle>
                        <p>We reserve the right to update these Terms at any time. Continued use of the platform after updates implies acceptance.</p>

                        <SectionTitle>16. GOVERNING LAW & JURISDICTION</SectionTitle>
                        <p>These Terms are governed by the laws of India. Jurisdiction: Courts of Chennai, Tamil Nadu.</p>

                        <SectionTitle>17. CONTACT INFORMATION</SectionTitle>
                        <p>For any queries:</p>
                        <ul>
                            <li><strong>Email:</strong> support@authentiks.in</li>
                            <li><strong>Company:</strong> Recomm Innovations Private Limited</li>
                            <li><strong>Location:</strong> Chennai, Tamil Nadu, India</li>
                        </ul>

                        <div className="mt-20 glass-effect p-10 rounded-[2.5rem] border border-white/5 text-center">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-4">Final Statement</h3>
                            <p className="text-gray-400 font-bold mb-8 text-lg">By using Authentiks, you agree to operate with integrity while we ensure your products remain trusted and intelligent.</p>
                            
                            <div className="p-6 bg-white/5 border border-red-500/20 rounded-2xl max-w-2xl mx-auto shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">Founder Tip (Important)</h4>
                                <p className="text-red-400 font-bold italic mb-4">This clause is powerful for your business:</p>
                                <ul className="text-white font-black italic space-y-2 mb-4 text-left inline-block">
                                    <li>👉 “Liability limited to last billing cycle”</li>
                                    <li>👉 “Not responsible after QR is applied”</li>
                                </ul>
                                <p className="text-gray-400 font-bold text-sm">These protect you from huge enterprise risk exposure.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <WebFooter />
        </div>
    );
}
