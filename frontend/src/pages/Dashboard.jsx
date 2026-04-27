import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, QrCode, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const payload = await api("/api/business/dashboard");
      setData(payload);
    } finally {
      setLoadingMetrics(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Use profile.business as initial state for the business details
  const business = data?.business || profile?.business;
  const metrics = data?.metrics;

  const ratingMap = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    metrics?.ratingBreakdown.forEach((row) => { map[row._id] = row.count; });
    return map;
  }, [metrics]);

  if (!business) return <div className="page-center">Loading your workspace...</div>;
  const maxRating = Math.max(1, ...Object.values(ratingMap));

  function download(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  function downloadSvg() {
    const blob = new Blob([business.qrCodeSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    download(url, `${business.slug}-qr.svg`);
    URL.revokeObjectURL(url);
  }

  async function regenerateQr() {
    const payload = await api("/api/business/regenerate-qr", { method: "POST", body: "{}" });
    setData((current) => ({ ...current, business: { ...current.business, ...payload } }));
  }

  return (
    <section className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{business.name}</h1>
          <p className="muted">Your public review page and QR code are ready.</p>
        </div>
        <a className="primary-button" href={business.reviewPageUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Preview page</a>
      </div>
      <div className="dashboard-grid">
        <div className="panel wide">
          <p className="label-text">Review page URL</p>
          <div className="copy-row"><input readOnly value={business.reviewPageUrl} /><button className="icon-button" onClick={async () => { await copyToClipboard(business.reviewPageUrl); setCopied(true); }}><Copy size={18} /></button></div>
          {copied && <p className="success">Copied</p>}
        </div>
        <div className="panel">
          <p className="label-text">QR code</p>
          <img className="qr-image" src={business.qrCodePngDataUrl} alt="Business review QR code" />
          <div className="split-actions">
            <button className="secondary-button" onClick={() => download(business.qrCodePngDataUrl, `${business.slug}-qr.png`)}><Download size={16} /> PNG</button>
            <button className="secondary-button" onClick={downloadSvg}><QrCode size={16} /> SVG</button>
            <button className="secondary-button" onClick={regenerateQr}><RefreshCw size={16} /> Regenerate</button>
          </div>
        </div>
        <div className="panel stat">
          {loadingMetrics ? <div className="skeleton short" /> : <span>{metrics.thisMonth}</span>}
          <p>Reviews initiated this month</p>
        </div>
        <div className="panel stat">
          {loadingMetrics ? <div className="skeleton short" /> : <span>{metrics.allTime}</span>}
          <p>Reviews initiated all time</p>
        </div>
        <div className="panel wide">
          <p className="label-text">Star rating breakdown</p>
          <div className="bars">
            {loadingMetrics ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '32px' }} />)
            ) : (
              [5, 4, 3, 2, 1].map((rating) => (
                <div className="bar-row" key={rating}>
                  <span>{rating} star</span>
                  <div><i style={{ width: `${(ratingMap[rating] / maxRating) * 100}%` }} /></div>
                  <b>{ratingMap[rating]}</b>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="panel">
          <p className="label-text">Recent activity</p>
          <div className="activity-list">
            {loadingMetrics ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" />)
            ) : (
              metrics.recent.length ? (
                metrics.recent.map((item) => (
                  <div key={item._id}>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <strong>{item.starRating} stars</strong>
                  </div>
                ))
              ) : <p className="muted">No review activity yet.</p>
            )}
          </div>
        </div>
        <div className="panel">
          <p className="label-text">Business tools</p>
          <Link className="secondary-button full" to="/settings">Edit details and regenerate prompt</Link>
        </div>
      </div>
    </section>
  );
}
