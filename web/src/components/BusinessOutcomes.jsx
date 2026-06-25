import React from 'react';

const metrics = [
  { value: '3.2×', label: 'Higher Repeat Purchase Rate', change: '+220%' },
  { value: '89%', label: 'Warranty Activation Rate', change: '+340%' },
  { value: '4.7×', label: 'Consumer Data Collected', change: '+370%' },
  { value: '67%', label: 'Reduction in Counterfeits', change: '−67%' },
  { value: '2.1×', label: 'Marketing ROI Improvement', change: '+110%' },
  { value: '92%', label: 'Consumer Trust Score', change: '+45%' },
];

const BusinessOutcomes = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>Results</span>
          </div>
          <h2>Measurable <span className="text-gradient">Business Impact.</span></h2>
          <p>
            Authentiks doesn't just connect products to consumers — it delivers
            measurable outcomes that transform your business.
          </p>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="glass-card metric-card"
            >
              <div className="metric-value text-gradient">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.1)'
              }}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessOutcomes;
