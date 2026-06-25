import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShoppingCart, Car, Shirt, Cpu, Gem, UtensilsCrossed } from 'lucide-react';

const industries = [
  { icon: <Pill size={16} />, name: 'Pharmaceuticals', path: '/industries/pharmaceuticals' },
  { icon: <ShoppingCart size={16} />, name: 'FMCG & Retail', path: '/industries/fmcg' },
  { icon: <Car size={16} />, name: 'Automotive', path: '/industries/automotive' },
  { icon: <Shirt size={16} />, name: 'Fashion & Apparel', path: '/industries/fashion' },
  { icon: <Cpu size={16} />, name: 'Electronics', path: null },
  { icon: <Gem size={16} />, name: 'Luxury Goods', path: null },
  { icon: <UtensilsCrossed size={16} />, name: 'Food & Beverage', path: null },
];

const IndustriesSection = () => {
  return (
    <section className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span>Industries</span>
          </div>
          <h2>Trusted By Leading Brands <span className="text-gradient">Across Industries.</span></h2>
          <p>
            From pharmaceuticals to fashion, Authentiks powers connected product
            experiences for the world's most demanding brands.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center'
        }}>
          {industries.map((industry, idx) => {
            const content = (
              <div
                key={idx}
                className="industry-pill"
              >
                {industry.icon}
                {industry.name}
              </div>
            );

            if (industry.path) {
              return (
                <Link
                  key={idx}
                  to={industry.path}
                  style={{ textDecoration: 'none' }}
                >
                  {content}
                </Link>
              );
            }
            return <React.Fragment key={idx}>{content}</React.Fragment>;
          })}
        </div>

        <div style={{
          marginTop: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>50+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Enterprise Brands</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>12+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Countries</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>10M+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Products Connected</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
