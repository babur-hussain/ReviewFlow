import { useEffect, useMemo, useState, useRef } from "react";
import { Copy, Download, ExternalLink, RefreshCw, Star, QrCode as QrIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { QRCode } from "react-qrcode-logo";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  async function load() {
    try {
      const payload = await api("/api/business/dashboard");
      setData(payload);
    } finally {
      setLoadingMetrics(false);
    }
  }

  useEffect(() => { load(); }, []);

  const business = data?.business || profile?.business;
  const metrics = data?.metrics;

  const ratingMap = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    metrics?.ratingBreakdown.forEach((row) => { map[row._id] = row.count; });
    return map;
  }, [metrics]);

  if (!business) return <div className="page-center">Loading your workspace...</div>;
  const maxRating = Math.max(1, ...Object.values(ratingMap));

  function downloadQrPng() {
    const canvas = document.getElementById("react-qrcode-logo");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${business.slug}-premium-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{business.name}</h1>
          <p className="muted">Your beautiful public review page and QR code are ready.</p>
        </div>
        <a className="primary-button" href={business.reviewPageUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={18} /> Preview page
        </a>
      </div>

      <motion.div 
        className="dashboard-grid"
        variants={containerVars}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVars} className="dashboard-panel wide">
          <p className="label-text">Review Page URL</p>
          <div className="modern-copy-row">
            <input readOnly value={business.reviewPageUrl} />
            <button 
              className="icon-button" 
              onClick={async () => { await copyToClipboard(business.reviewPageUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            >
              <Copy size={18} />
            </button>
          </div>
          {copied && <p className="success" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Copied to clipboard!</p>}
        </motion.div>

        <motion.div variants={itemVars} className="dashboard-panel stat-panel">
          {loadingMetrics ? <div className="skeleton short" /> : <span>{metrics.thisMonth}</span>}
          <p>Reviews initiated this month</p>
        </motion.div>

        <motion.div variants={itemVars} className="dashboard-panel stat-panel">
          {loadingMetrics ? <div className="skeleton short" /> : <span>{metrics.allTime}</span>}
          <p>Reviews initiated all time</p>
        </motion.div>

        {/* Premium QR Code Standee */}
        <motion.div variants={itemVars} className="dashboard-panel square">
          <p className="label-text">Printable QR Standee</p>
          
          <div className="qr-standee-wrapper">
            <div className="qr-standee" ref={qrRef}>
              <div className="qr-standee-header">Scan to Review Us!</div>
              
              <div style={{ background: 'white', padding: '10px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <QRCode
                  value={business.reviewPageUrl}
                  size={200}
                  qrStyle="dots"
                  eyeRadius={12}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  logoImage={business.branding.logoDataUrl || undefined}
                  logoWidth={50}
                  logoPadding={5}
                  removeQrCodeBehindLogo={true}
                />
              </div>
              
              <div className="qr-standee-footer">
                <Star size={14} fill="#f59e0b" color="#f59e0b" /> Powered by ReviewFlow
              </div>
            </div>
          </div>

          <div className="qr-download-actions">
            <button className="secondary-button" onClick={downloadQrPng}>
              <Download size={16} /> Download PNG
            </button>
            <Link className="secondary-button" to="/settings" style={{ textAlign: 'center' }}>
              Settings
            </Link>
          </div>
        </motion.div>

        {/* Rating Breakdown */}
        <motion.div variants={itemVars} className="dashboard-panel wide">
          <p className="label-text">Star Rating Breakdown</p>
          <div className="modern-bars">
            {loadingMetrics ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '32px', marginBottom: '1rem' }} />)
            ) : (
              [5, 4, 3, 2, 1].map((rating) => (
                <div className="bar-row" key={rating}>
                  <span>{rating} Star</span>
                  <div className="modern-bar-track">
                    <div className="modern-bar-fill" style={{ width: `${maxRating > 0 ? (ratingMap[rating] / maxRating) * 100 : 0}%` }} />
                  </div>
                  <b>{ratingMap[rating]}</b>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVars} className="dashboard-panel wide">
          <p className="label-text">Recent Activity</p>
          <div className="modern-activity-list">
            {loadingMetrics ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '48px', marginBottom: '10px' }} />)
            ) : (
              metrics.recent.length ? (
                metrics.recent.map((item) => (
                  <div className="modern-activity-item" key={item._id}>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <strong>
                      {item.starRating} <Star className="star-icon" size={16} fill="currentColor" />
                    </strong>
                  </div>
                ))
              ) : <p className="muted" style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>No review activity yet.</p>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
