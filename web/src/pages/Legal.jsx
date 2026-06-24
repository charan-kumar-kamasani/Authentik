import React from 'react';
import GenericPage from '../components/GenericPage';

export const PrivacyPolicy = () => (
  <GenericPage title="Privacy Policy">
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      Your privacy is critically important to us. At Authentik, we have a few fundamental principles:
      <br /><br />
      We don't ask you for personal information unless we truly need it. We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.
      <br /><br />
      [Standard Privacy Policy Text Placeholder]
    </p>
  </GenericPage>
);

export const TermsConditions = () => (
  <GenericPage title="Terms & Conditions">
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      By accessing or using the Authentik QR Order Management System, you agree to be bound by these Terms.
      <br /><br />
      [Standard Terms Text Placeholder]
    </p>
  </GenericPage>
);

export const SecurityPolicy = () => (
  <GenericPage title="Security Policy">
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      Security is the core of our inactive-by-default QR workflow. We utilize industry-standard encryption for data at rest and in transit.
      <br /><br />
      [Standard Security Policy Text Placeholder]
    </p>
  </GenericPage>
);
