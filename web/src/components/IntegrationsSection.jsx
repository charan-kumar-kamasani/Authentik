import React from 'react';

const integrations = [
  'Salesforce CRM',
  'SAP ERP',
  'Shopify',
  'HubSpot',
  'Google Analytics',
  'REST API',
  'Zapier',
  'Microsoft Dynamics',
  'Magento',
  'Segment',
  'Webhooks',
  'Custom SDK',
];

const IntegrationsSection = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>Integrations</span>
          </div>
          <h2>Works With Your <span className="text-gradient">Existing Stack.</span></h2>
          <p>
            Authentiks integrates seamlessly with your CRM, ERP, e-commerce platform,
            and marketing tools through native connectors and APIs.
          </p>
        </div>

        <div className="logo-grid">
          {integrations.map((name, idx) => (
            <div key={idx} className="logo-grid-item">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
