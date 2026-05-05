import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import '../styles/home.css';

export default function PrivacyPolicy() {
  return (
    <div className="home-page-container">
      <nav className="home-nav scrolled">
        <div className="home-nav-container">
          <Link to="/" className="home-logo">
            <Shield className="home-logo-icon" fill="currentColor" />
            <span>ReviewFlow</span>
          </Link>
          <Link to="/" className="home-btn home-btn-outline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 100px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', marginBottom: '3rem' }}>Last Updated: May 6, 2026</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>1. Information We Collect</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            At ReviewFlow, we collect information that you provide directly to us when you create an account, such as your business name, email address, and branding assets (logos). We also collect review data and images uploaded for enhancement to provide our core services.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>2. How We Use Your Information</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            We use the information we collect to:
            <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'disc' }}>
              <li>Provide, maintain, and improve our review automation services.</li>
              <li>Process and enhance images using our proprietary AI algorithms.</li>
              <li>Generate branded QR codes and public review pages for your business.</li>
              <li>Communicate with you about updates, security alerts, and support.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>3. Data Security</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            We implement industry-standard security measures to protect your data. All communication with our servers is encrypted using SSL/TLS, and sensitive business information is stored securely in our databases.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>4. AI Processing & Third Parties</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            Our image enhancement feature utilizes specialized AI partners (such as KIE AI). Images are shared with these partners solely for processing and are not stored permanently by them beyond the necessary processing window. We do not sell your personal or business data to third parties.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>5. Contact Us</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            If you have any questions about this Privacy Policy, please contact us at support@reviewflow.ai.
          </p>
        </section>

        <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>&copy; 2026 ReviewFlow Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
