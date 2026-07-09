import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";

const SectionTitle = ({ children }) => (
  <h2 className={`text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 mt-16`}>
    {children}
  </h2>
);

export default function WebSecurityPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden flex flex-col">
            <WebHeader />

            <section className="py-20 md:py-32 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16 border-b border-slate-200 pb-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6 uppercase">
                            Security <span className="gradient-text">Policy</span>
                        </h1>
                        <p className="text-slate-600 font-bold mb-2">Version: 1.0</p>
                        <p className="text-slate-600 font-bold mb-2">Effective Date: May 7, 2026</p>
                        <p className="text-slate-600 font-bold mb-2">Last Updated: May 7, 2026</p>
                    </div>

                    <div className="prose  prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 prose-ul:font-medium prose-ul:text-slate-600">
                        
                        <SectionTitle>1. Security Commitment</SectionTitle>
                        <p>Authentiks is committed to building a secure, trusted, and transparent product authentication ecosystem for brands and consumers.</p>
                        <p>Our platform is designed with a security-first approach to help brands protect products against counterfeiting, unauthorized duplication, fraud, and misuse. We continuously work toward implementing industry-aligned security practices, infrastructure safeguards, and operational controls to maintain platform integrity and customer trust.</p>

                        <SectionTitle>2. Scope</SectionTitle>
                        <p>This Security Policy applies to:</p>
                        <ul>
                            <li>Authentiks web platform</li>
                            <li>Mobile applications</li>
                            <li>QR authentication infrastructure</li>
                            <li>APIs and integrations</li>
                            <li>Cloud-hosted systems and databases</li>
                            <li>Internal operational systems</li>
                            <li>Employees, contractors, vendors, and authorized partners</li>
                        </ul>

                        <SectionTitle>3. Infrastructure & Cloud Security</SectionTitle>
                        <p>Authentiks leverages modern cloud and web security infrastructure to protect platform availability, reliability, and traffic integrity.</p>
                        <p>Security Controls Include:</p>
                        <ul>
                            <li>Enterprise-grade CDN and protection through Cloudflare</li>
                            <li>SSL/TLS encrypted communication across all services</li>
                            <li>DDoS mitigation and automated threat protection</li>
                            <li>Firewall and traffic filtering mechanisms</li>
                            <li>Bot detection and rate limiting</li>
                            <li>Continuous infrastructure monitoring</li>
                            <li>Secure hosting environment with restricted access controls</li>
                            <li>Routine software and security patch updates</li>
                        </ul>

                        <SectionTitle>4. Application Security</SectionTitle>
                        <p>Authentiks follows secure-by-design development practices to reduce vulnerabilities and strengthen platform resilience.</p>
                        <p>Measures Include:</p>
                        <ul>
                            <li>Role-based access control (RBAC)</li>
                            <li>Least-privilege access principles</li>
                            <li>Secure authentication mechanisms</li>
                            <li>API request validation and protection</li>
                            <li>Session and credential security controls</li>
                            <li>Periodic vulnerability assessments</li>
                            <li>Controlled administrative access</li>
                            <li>Logging and monitoring of sensitive activities</li>
                        </ul>

                        <SectionTitle>5. Product Authentication Security</SectionTitle>
                        <p>Security is central to the Authentiks authentication ecosystem.</p>
                        <p>Product-Level Security Features:</p>
                        <ul>
                            <li>Unique digital identity for every product unit</li>
                            <li>Securely generated non-duplicative QR codes</li>
                            <li>Optional tamper-evident scratch label protection</li>
                            <li>Real-time consumer verification capability</li>
                            <li>Scan event tracking and monitoring</li>
                            <li>Detection of suspicious or abnormal scan activity</li>
                            <li>Brand-controlled authentication workflows</li>
                        </ul>
                        <p>These mechanisms are designed to help brands improve authenticity verification and consumer trust.</p>

                        <SectionTitle>6. Data Protection & Privacy</SectionTitle>
                        <p>Authentiks takes commercially reasonable and industry-aligned measures to safeguard customer, consumer, and brand information.</p>
                        <p>Data Protection Practices:</p>
                        <ul>
                            <li>Encrypted transmission of sensitive information</li>
                            <li>Restricted internal data access</li>
                            <li>Secure storage and backup procedures</li>
                            <li>Monitoring for unauthorized access attempts</li>
                            <li>Controlled access to production systems</li>
                            <li>Regular backup and recovery procedures</li>
                        </ul>
                        <p>Authentiks does not sell confidential customer or brand data to third parties.</p>

                        <SectionTitle>7. Monitoring, Logging & Incident Detection</SectionTitle>
                        <p>To maintain platform integrity and security visibility, Authentiks maintains monitoring and logging mechanisms across critical systems.</p>
                        <p>This Includes:</p>
                        <ul>
                            <li>Infrastructure monitoring</li>
                            <li>Scan activity monitoring</li>
                            <li>Suspicious traffic detection</li>
                            <li>Error and performance monitoring</li>
                            <li>Administrative activity logging</li>
                            <li>Abuse prevention and rate limiting</li>
                        </ul>
                        <p>Potential threats or abnormal activity may trigger automated or manual review processes.</p>

                        <SectionTitle>8. Access Management</SectionTitle>
                        <p>Access to internal systems and sensitive resources is strictly controlled.</p>
                        <p>Access Principles:</p>
                        <ul>
                            <li>Access granted only on operational necessity</li>
                            <li>Role-based permissions enforced</li>
                            <li>Restricted administrative privileges</li>
                            <li>Secure credential handling practices</li>
                            <li>Immediate revocation of access upon employee or vendor exit</li>
                            <li>Periodic review of privileged access</li>
                        </ul>

                        <SectionTitle>9. Incident Response & Recovery</SectionTitle>
                        <p>Authentiks maintains procedures to respond to security incidents efficiently and responsibly.</p>
                        <p>In the Event of an Incident:</p>
                        <ul>
                            <li>Identify and contain affected systems</li>
                            <li>Assess scope and impact</li>
                            <li>Implement corrective and recovery actions</li>
                            <li>Notify relevant stakeholders where appropriate</li>
                            <li>Conduct internal review and preventive improvements</li>
                        </ul>

                        <SectionTitle>10. Business Continuity & Backups</SectionTitle>
                        <p>Authentiks maintains backup and recovery procedures designed to support platform continuity and operational resilience.</p>
                        <p>This includes:</p>
                        <ul>
                            <li>Secure backup storage</li>
                            <li>Recovery planning</li>
                            <li>Infrastructure redundancy where applicable</li>
                            <li>Monitoring of critical services</li>
                        </ul>

                        <SectionTitle>11. Third-Party Services & Vendors</SectionTitle>
                        <p>Authentiks may use carefully selected third-party providers for infrastructure, analytics, communication, and operational support.</p>
                        <p>Third-party vendors are evaluated based on reliability, reputation, and security considerations appropriate to their role.</p>

                        <SectionTitle>12. Compliance & Continuous Improvement</SectionTitle>
                        <p>Authentiks continuously works toward improving operational security maturity and platform trustworthiness through:</p>
                        <ul>
                            <li>Security reviews and updates</li>
                            <li>Infrastructure improvements</li>
                            <li>Secure engineering practices</li>
                            <li>Risk assessment processes</li>
                            <li>Ongoing monitoring and operational safeguards</li>
                        </ul>
                        <p>As the platform evolves, Authentiks intends to align with relevant industry best practices and applicable security standards.</p>

                        <SectionTitle>13. Responsible Disclosure</SectionTitle>
                        <p>If you believe you have discovered a security vulnerability related to Authentiks, please report it responsibly.</p>
                        <p><strong>Security Contact:</strong> security@authentiks.com</p>
                        <p>We appreciate responsible disclosure efforts and will investigate legitimate reports promptly.</p>

                        <SectionTitle>14. Contact Information</SectionTitle>
                        <p><strong>Authentiks</strong></p>
                        <p>Website: Authentiks</p>
                        <p>Email: security@authentiks.com</p>

                    </div>
                </div>
            </section>

            <WebFooter />
        </div>
    );
}
