import React from 'react';
import GenericPage from '../../components/GenericPage';
import { Plus } from 'lucide-react';

const FAQs = () => {
    const faqs = [
        {
            question: "How is Authentik different from standard QR code generators?",
            answer: "Standard QR codes can be photocopied. Authentik generates non-clonable, cryptographically secure QR codes. Even if a counterfeiter copies the visual pattern, our AI system detects the anomaly upon scan and flags the item as a duplicate immediately."
        },
        {
            question: "Do consumers need to download an app to verify products?",
            answer: "No. Our Web3-enabled verification runs natively in the smartphone's browser. Consumers simply point their standard camera at the tag. Removing the app download friction increases scan engagement rates by over 10x."
        },
        {
            question: "Can this integrate with our existing ERP (SAP, Oracle)?",
            answer: "Yes. Authentik provides enterprise REST APIs and out-of-the-box connectors for SAP, Oracle, and Microsoft Dynamics. We can pull batch data directly from your MES systems and push serialization data back into your ERP."
        },
        {
            question: "How do you handle aggregation at the factory level?",
            answer: "We support parent-child aggregation. Item-level QR codes are scanned and aggregated into a carton-level barcode, which are then aggregated into a pallet-level barcode. Scanning the pallet instantly updates the chain-of-custody for all 10,000 items inside."
        },
        {
            question: "Is the data stored securely?",
            answer: "Absolutely. We utilize military-grade AES-256 encryption. For clients requiring immutable audit trails (such as in Pharmaceuticals), we offer a private blockchain ledger module to guarantee data integrity."
        }
    ];

    return (
        <GenericPage title="Frequently Asked Questions" narrow={true}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8 }}>
                    Everything you need to know about implementing the world's most advanced anti-counterfeiting platform.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{faq.question}</h3>
                            <Plus size={20} color="var(--accent-color)" />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingRight: '2rem' }}>
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Still have questions?</p>
                <a href="/contact-us" className="btn btn-primary">Contact our Engineering Team</a>
            </div>
        </GenericPage>
    );
};

export default FAQs;
