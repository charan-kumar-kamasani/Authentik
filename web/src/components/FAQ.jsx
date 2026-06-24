import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "How does the inactive-by-default QR work?",
    a: "When Super Admins generate QR codes during the Processing stage, they are stored in the database as 'inactive'. They remain unscannable until the Authorizer officially marks the order as 'Received' at its final destination."
  },
  {
    q: "Can I customize the email notifications?",
    a: "Yes, our email templates are beautifully crafted using HTML and can be configured or branded via the backend environment settings."
  },
  {
    q: "Is it possible to integrate with existing ERPs?",
    a: "Absolutely. Our Enterprise plan includes full REST API access, allowing you to sync order states directly with your existing supply chain tools."
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section style={{ padding: '6rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="fade-in-up">
          <h2 style={{ fontSize: '2.5rem' }}>Frequently Asked <span className="text-gradient">Questions</span></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card fade-in-up delay-2" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setOpenIdx(openIdx === idx ? null : idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{faq.q}</h4>
                {openIdx === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {openIdx === idx && (
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
