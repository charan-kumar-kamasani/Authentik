import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "What makes Authentiks different from authentication companies?",
    a: "Authentication companies focus on verifying products — that's just one step. Authentiks is a connected product platform that transforms every physical product into a persistent digital touchpoint. Authentication is the entry point, but the real value is in the consumer relationship, first-party data, and lifetime engagement that follows."
  },
  {
    q: "How does Authentiks help build consumer relationships?",
    a: "Every product interaction creates an opportunity to engage. When a consumer interacts with your product, Authentiks captures their profile, activates warranties, delivers personalized content, enrolls them in loyalty programs, and creates a direct communication channel — all without intermediaries."
  },
  {
    q: "What kind of data does the platform collect?",
    a: "Authentiks collects first-party consumer data including demographics, location, engagement patterns, product preferences, warranty registrations, and behavioral insights. All data is collected with consent and stored in compliance with GDPR and global privacy regulations."
  },
  {
    q: "How long does enterprise deployment take?",
    a: "Most enterprise deployments go live within 4–6 weeks. Our team handles integration, configuration, and onboarding. The platform is designed to work alongside your existing infrastructure with minimal engineering effort."
  },
  {
    q: "Does Authentiks integrate with our existing systems?",
    a: "Yes. Authentiks offers native integrations with leading CRM, ERP, e-commerce, and marketing automation platforms including Salesforce, SAP, Shopify, HubSpot, and more. Our REST API and webhooks enable custom integrations with any system."
  },
  {
    q: "What industries does Authentiks serve?",
    a: "Authentiks serves consumer brands across pharmaceuticals, FMCG, automotive, fashion and apparel, electronics, luxury goods, and food and beverage. Any industry where physical products should create ongoing digital consumer relationships."
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <div className="section-label">
            <span>FAQ</span>
          </div>
          <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <div
                className="faq-question"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <h4>{faq.q}</h4>
                {openIdx === idx ? (
                  <ChevronUp size={20} color="var(--accent-primary)" />
                ) : (
                  <ChevronDown size={20} color="var(--text-tertiary)" />
                )}
              </div>
              {openIdx === idx && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
