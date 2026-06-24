import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GenericPage = ({ title, children, narrow }) => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '10rem', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: narrow ? '800px' : '1200px' }}>
          <div className="fade-in-up">
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '2rem', textAlign: 'center' }}>
              <span className="text-gradient">{title}</span>
            </h1>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GenericPage;
