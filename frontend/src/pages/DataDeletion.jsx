import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import '../styles/home.css';

export default function DataDeletion() {
  return (
    <div className="home-page-container">
      <nav className="home-nav scrolled">
        <div className="home-nav-container">
          <Link to="/" className="home-logo">
            <Trash2 className="home-logo-icon" fill="currentColor" />
            <span>ReviewFlow</span>
          </Link>
          <Link to="/" className="home-btn home-btn-outline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 100px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Data Deletion Request</h1>
        <p style={{ color: '#64748b', marginBottom: '3rem' }}>How to request the removal of your personal and business data.</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>1. Our Commitment to Privacy</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            At ReviewFlow, we believe you should have complete control over your data. If you decide to stop using our service, you have the right to request that all your personal and business information be permanently deleted from our systems.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>2. What Data Will Be Deleted?</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            Upon a successful deletion request, we will remove:
            <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'disc' }}>
              <li>Your account information (name, email, password hashes).</li>
              <li>Business details, including your branding assets and review configurations.</li>
              <li>All historical logs of review enhancements and generated responses.</li>
              <li>Any cached images associated with your business QR codes and public pages.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>3. How to Submit a Request</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            To request data deletion, please follow these steps:
            <ol style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'decimal' }}>
              <li>Email us at <strong>support@reviewflow.ai</strong> from the email address associated with your account.</li>
              <li>Include the subject line: <strong>"Data Deletion Request - [Your Business Name]"</strong>.</li>
              <li>Our support team will verify your identity and process the deletion within 7-10 business days.</li>
            </ol>
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>4. Important Considerations</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            Please note that data deletion is permanent and cannot be undone. Once deleted, you will lose access to your dashboard, and your public review pages will immediately stop functioning.
          </p>
        </section>

        <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>&copy; 2026 ReviewFlow Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
