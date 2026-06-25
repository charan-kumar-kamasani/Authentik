import React from 'react';
import { EyeOff, Users, Database, ShieldAlert, RotateCcw, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: <EyeOff size={22} />,
    title: 'Brands Lose Visibility',
    desc: 'After products leave the factory, brands have zero insight into what happens next.'
  },
  {
    icon: <Users size={22} />,
    title: 'Retailers Own Your Customers',
    desc: 'The retailer builds the relationship. Your brand becomes invisible at the point of sale.'
  },
  {
    icon: <Database size={22} />,
    title: 'Marketplaces Own Your Data',
    desc: 'Consumer behavior, preferences, purchase patterns — none of it flows back to you.'
  },
  {
    icon: <ShieldAlert size={22} />,
    title: 'Counterfeiters Exploit Trust',
    desc: "Without a direct verification channel, consumers can't distinguish real from fake."
  },
  {
    icon: <RotateCcw size={22} />,
    title: 'Marketing Starts From Zero',
    desc: 'Every campaign begins cold. No relationship, no data, no context from the last purchase.'
  },
  {
    icon: <TrendingDown size={22} />,
    title: 'Products Stop Creating Value',
    desc: 'Once sold, your product becomes a static object. It should be your most powerful marketing channel.'
  }
];

const Problem = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>The Problem</span>
          </div>
          <h2>After the Sale, Your Products <span className="text-gradient">Go Silent.</span></h2>
          <p>
            Brands spend millions building products. But the moment those products
            leave the factory, they stop generating value.
          </p>
        </div>

        <div className="problem-grid">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div className="icon-box">
                {problem.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>{problem.title}</h3>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.7,
                margin: 0
              }}>
                {problem.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
