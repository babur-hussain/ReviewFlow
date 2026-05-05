import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import '../styles/home.css';

export default function Terms() {
  return (
    <div className="home-page-container">
      <nav className="home-nav scrolled">
        <div className="home-nav-container">
          <Link to="/" className="home-logo">
            <Scale className="home-logo-icon" fill="currentColor" />
            <span>ReviewFlow</span>
          </Link>
          <Link to="/" className="home-btn home-btn-outline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 100px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Terms & Conditions</h1>
        <p style={{ color: '#64748b', marginBottom: '3rem' }}>Last Updated: May 6, 2026</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            By accessing and using ReviewFlow, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>2. Description of Service</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            ReviewFlow provides a platform for businesses to automate and manage their local customer reviews, including AI-powered image enhancement and branded QR code generation. We reserve the right to modify or discontinue any part of the service at our discretion.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>3. User Accounts</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during the onboarding process.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>4. Prohibited Content & AI Ethics</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            You may not use ReviewFlow to generate misleading or deceptive content. Specifically, our AI enhancement tools must not be used to create fraudulent representations of products or services. You agree to comply with all safety and ethical guidelines provided by our AI processing partners.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>5. Limitation of Liability</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            ReviewFlow shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services, including but not limited to loss of business reputation or revenue.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>6. Termination</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.
          </p>
        </section>

        <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>&copy; 2026 ReviewFlow Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
