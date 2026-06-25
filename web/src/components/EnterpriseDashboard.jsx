import React from 'react';

const widgets = [
  { label: 'Total Scans', value: '2.4M', change: '+18.3% this month' },
  { label: 'Registered Consumers', value: '847K', change: '+12.7% this month' },
  { label: 'Warranty Activations', value: '423K', change: '+24.1% this month' },
  { label: 'Engagement Rate', value: '73.2%', change: '+8.4% this month' },
  { label: 'Counterfeits Blocked', value: '12.8K', change: '−31% vs last quarter' },
  { label: 'Repeat Purchase Rate', value: '34.7%', change: '+15.2% this month' },
];

const chartHeights = [35, 55, 42, 68, 50, 72, 45, 80, 62, 75, 58, 85];

const EnterpriseDashboard = () => {
  return (
    <section className="section" style={{ padding: '7rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>Dashboard</span>
          </div>
          <h2>Enterprise-Grade <span className="text-gradient">Consumer Intelligence.</span></h2>
          <p>
            Real-time visibility into every consumer interaction, across every product,
            in every market.
          </p>
        </div>

        <div className="dashboard-mockup float-animation" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="dashboard-header">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
            <span style={{
              marginLeft: '1rem',
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 500
            }}>
              Authentiks — Consumer Intelligence Dashboard
            </span>
          </div>

          <div className="dashboard-grid">
            {widgets.map((widget, idx) => (
              <div key={idx} className="dashboard-widget">
                <div className="widget-label">{widget.label}</div>
                <div className="widget-value">{widget.value}</div>
                <div className="widget-change">{widget.change}</div>
                {idx < 3 && (
                  <div className="chart-bars">
                    {chartHeights.map((h, i) => (
                      <div
                        key={i}
                        className="chart-bar"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 0.1 + idx * 0.3}s`,
                          opacity: 0.3 + (h / 100) * 0.7
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseDashboard;
