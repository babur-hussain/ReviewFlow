import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw, Send, Camera, Sparkles, Download } from "lucide-react";
import { publicApi } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import StarRating from "../components/StarRating.jsx";

// localStorage key for storing photo data per slug
function photoStorageKey(slug) {
  return `review-photo-${slug}`;
}

function savePhotoToStorage(slug, data) {
  try {
    localStorage.setItem(photoStorageKey(slug), JSON.stringify(data));
  } catch (e) {
    // ignore quota errors
  }
}

function loadPhotoFromStorage(slug) {
  try {
    const raw = localStorage.getItem(photoStorageKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function PublicReview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Photo states
  const [photoPreview, setPhotoPreview] = useState(null); // base64 for persistence
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);
  const lastNotifiedRef = useRef({ text: null, image: null });

  // Load business
  useEffect(() => {
    publicApi(`/api/review/${slug}`)
      .then((payload) => setBusiness(payload.business))
      .catch((err) => setError(err.message));
  }, [slug]);

  // Restore saved photos from localStorage on mount
  useEffect(() => {
    const saved = loadPhotoFromStorage(slug);
    if (saved?.enhancedImage) {
      setEnhancedImage(saved.enhancedImage);
      if (saved.photoPreview) setPhotoPreview(saved.photoPreview);
    }
  }, [slug]);

  // Trigger combined webhook when BOTH review and enhanced image exist
  useEffect(() => {
    if (reviewText && enhancedImage) {
      if (lastNotifiedRef.current.text !== reviewText || lastNotifiedRef.current.image !== enhancedImage) {
        lastNotifiedRef.current = { text: reviewText, image: enhancedImage };
        
        console.log("[PublicReview] Both review and image ready! Firing notify-combined...");
        
        publicApi(`/api/review/${slug}/notify-combined`, {
          method: "POST",
          body: JSON.stringify({
            reviewText,
            starRating: rating,
            enhancedImageUrl: enhancedImage
          })
        })
        .then(res => console.log("[PublicReview] notify-combined SUCCESS:", res))
        .catch(err => console.error("[PublicReview] notify-combined FAILED:", err));
      }
    }
  }, [reviewText, enhancedImage, slug, rating]);

  async function generate(stars) {
    setRating(stars);
    setLoading(true);
    setError("");
    try {
      const payload = await publicApi(`/api/review/${slug}/generate`, {
        method: "POST",
        body: JSON.stringify({ starRating: stars }),
      });
      setReviewText(payload.reviewText);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Convert file to base64 for persistent storage
  function fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 so it can be stored in localStorage
    const base64 = await fileToBase64(file);
    setPhotoPreview(base64);
    setEnhancedImage(null);
    setPhotoError("");

    // Persist original immediately
    savePhotoToStorage(slug, { photoPreview: base64, enhancedImage: null });

    uploadPhoto(file, base64);
  }

  async function uploadPhoto(file, base64Preview) {
    if (!file) return;
    setPhotoLoading(true);
    setPhotoError("");
    setEnhancedImage(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/review/${slug}/enhance-photo`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        let errMsg = "Failed to enhance photo";
        try {
          // Try to parse the clean JSON error from our updated backend
          const errData = await response.clone().json();
          if (errData.message) errMsg = errData.message;
        } catch {
          // Fallback to text if it's an HTML error from Express
          const errText = await response.text();
          if (errText && errText.length < 200) errMsg = errText;
        }
        throw new Error(errMsg);
      }

      const initData = await response.json();

      if (!initData.jobId) {
        throw new Error("No job ID returned from server. AI service may be unavailable.");
      }

      const jobId = initData.jobId;
      setPhotoError("AI is generating your image... This may take a few minutes.");

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || ""}/api/review/photo-job/${jobId}`
          );
          if (!pollRes.ok) return;

          const jobData = await pollRes.json();
          if (jobData.status === "completed" && jobData.enhancedImageUrl) {
            clearInterval(pollInterval);
            setEnhancedImage(jobData.enhancedImageUrl);
            setPhotoError("");
            setPhotoLoading(false);
            // Persist both original and enhanced permanently
            savePhotoToStorage(slug, {
              photoPreview: base64Preview,
              enhancedImage: jobData.enhancedImageUrl,
            });
          } else if (jobData.status === "failed") {
            clearInterval(pollInterval);
            setPhotoError("AI image generation failed.");
            setPhotoLoading(false);
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 5000);

      return; // keep photoLoading true until poll resolves

    } catch (err) {
      setPhotoError(err.message || "Failed to enhance photo");
      setPhotoLoading(false);
    }
  }

  // Download the enhanced image
  async function downloadEnhancedImage() {
    if (!enhancedImage) return;
    try {
      const response = await fetch(enhancedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enhanced-cake-${slug}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      window.open(enhancedImage, "_blank");
    }
  }

  async function postReview() {
    const copied = await copyToClipboard(reviewText);
    sessionStorage.setItem(
      "review-handoff",
      JSON.stringify({
        reviewText,
        copied,
        googleReviewUrl: business.googleReviewUrl,
        businessName: business.name,
        color: business.branding.primaryColor,
      })
    );
    navigate(`/review/${slug}/thank-you`);
  }

  if (error && !business)
    return (
      <main className="public-page">
        <div className="public-card">
          <p className="error">{error}</p>
        </div>
      </main>
    );
  if (!business)
    return (
      <main className="public-page">
        <div className="public-card">
          <div className="skeleton tall" />
        </div>
      </main>
    );

  return (
    <main className="public-page" style={{ "--brand": business.branding.primaryColor }}>
      <section className="public-card">
        {business.branding.logoDataUrl ? (
          <img className="public-logo" src={business.branding.logoDataUrl} alt={`${business.name} logo`} />
        ) : (
          <div className="public-logo text-logo">{business.name[0]}</div>
        )}
        <h1>How was your experience at {business.name}?</h1>
        <p className="muted">Pick a rating and we will draft a natural review you can paste on Google.</p>
        <StarRating value={rating} onChange={generate} disabled={loading} />
        {loading && (
          <div className="review-card">
            <div className="skeleton" />
            <div className="skeleton short" />
            <div className="skeleton" />
          </div>
        )}

        {/* Photo Upload Section — visible as soon as stars are picked */}
        {rating > 0 && (
          <div className="photo-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="photo-input-hidden"
              id="photo-input"
            />

            {/* Upload trigger — only show if no photo at all yet */}
            {!photoPreview && !enhancedImage && (
              <label htmlFor="photo-input" className="photo-upload-trigger">
                <Camera size={22} />
                <span>Attach a photo</span>
                <span className="photo-upload-hint">AI will enhance your photo ✨</span>
              </label>
            )}

            {/* Original preview while AI is working */}
            {photoPreview && !enhancedImage && (
              <div className="photo-preview-container">
                <div className="photo-preview-wrapper">
                  <img src={photoPreview} alt="Selected" className="photo-preview-img" />
                </div>

                {photoLoading && (
                  <div className="ai-loading-container">
                    <div className="ai-loading-orb">
                      <div className="ai-orb-ring" />
                      <div className="ai-orb-ring delay-1" />
                      <div className="ai-orb-ring delay-2" />
                      <Sparkles size={24} className="ai-orb-icon" />
                    </div>
                    <p className="ai-loading-text">AI is enhancing your photo…</p>
                    <div className="ai-loading-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced result with Download button */}
            {enhancedImage && (
              <div className="enhanced-result">
                <div className="enhanced-badge"><Sparkles size={14} /> AI Enhanced</div>
                <img src={enhancedImage} alt="AI Enhanced" className="enhanced-img" />
                <button className="download-button" onClick={downloadEnhancedImage} id="download-enhanced-photo">
                  <Download size={16} />
                  Download Photo
                </button>
              </div>
            )}

            {photoError && <p className="error photo-error">{photoError}</p>}
          </div>
        )}

        {reviewText && !loading && (
          <>
            <article className="review-card">{reviewText}</article>
            <button className="secondary-button full" onClick={() => generate(rating)}>
              <RefreshCw size={18} /> Generate a different review
            </button>
            <button className="google-button" onClick={postReview}>
              <Send size={20} /> Post This Review on Google
            </button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
