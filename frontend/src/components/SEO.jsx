import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogType = 'website' 
}) => {
  const siteTitle = 'Authentik';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Default values
  const defaultDescription = 'Authentik provides advanced anti-counterfeit solutions, smart packaging, and secure product authentication to protect your brand.';
  const defaultKeywords = 'anti counterfeit solutions, product authentication, smart packaging, qr code authentication, product traceability';
  
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;
