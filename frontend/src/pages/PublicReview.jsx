import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw, Send, Camera, X, Sparkles } from "lucide-react";
import { publicApi } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import StarRating from "../components/StarRating.jsx";


export default function PublicReview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Photo states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    publicApi(`/api/review/${slug}`)
      .then((payload) => setBusiness(payload.business))
      .catch((err) => setError(err.message));
  }, [slug]);

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

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setEnhancedImage(null);
    setPhotoError("");
    uploadPhoto(file); // Trigger instantly
  }

  function removePhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setEnhancedImage(null);
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadPhoto(fileToUpload) {
    const file = fileToUpload || photoFile;
    if (!file) return;
    setPhotoLoading(true);
    setPhotoError("");
    setEnhancedImage(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      // Using the backend proxy instead of hitting the webhook directly to avoid CORS 
      // and to safely upload the photo to Cloudinary first
      const res = await publicApi(`/api/review/${slug}/enhance-photo`, {
        method: "POST",
        body: formData,
      }, true); // Setting true if publicApi accepts a raw format, but wait!
      // Let's use fetch directly since publicApi might stringify or set headers that conflict with FormData
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/review/${slug}/enhance-photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to enhance photo");
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("image")) {
        // Response is a binary image
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setEnhancedImage(url);
      } else if (contentType.includes("json")) {
        // Response is JSON with image URL or base64
        const data = await response.json();
        if (data.imageUrl) {
          setEnhancedImage(data.imageUrl);
        } else if (data.image) {
          setEnhancedImage(`data:image/png;base64,${data.image}`);
        } else if (data.url) {
          setEnhancedImage(data.url);
        } else {
          throw new Error("No enhanced image returned");
        }
      } else {
        // Try as blob anyway
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setEnhancedImage(url);
      }
    } catch (err) {
      setPhotoError(err.message || "Failed to enhance photo");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function postReview() {
    const copied = await copyToClipboard(reviewText);
    sessionStorage.setItem(
      "review-handoff",
      JSON.stringify({ reviewText, copied, googleReviewUrl: business.googleReviewUrl, businessName: business.name, color: business.branding.primaryColor })
    );
    navigate(`/review/${slug}/thank-you`);
  }

  if (error && !business) return <main className="public-page"><div className="public-card"><p className="error">{error}</p></div></main>;
  if (!business) return <main className="public-page"><div className="public-card"><div className="skeleton tall" /></div></main>;

  return (
    <main className="public-page" style={{ "--brand": business.branding.primaryColor }}>
      <section className="public-card">
        {business.branding.logoDataUrl ? <img className="public-logo" src={business.branding.logoDataUrl} alt={`${business.name} logo`} /> : <div className="public-logo text-logo">{business.name[0]}</div>}
        <h1>How was your experience at {business.name}?</h1>
        <p className="muted">Pick a rating and we will draft a natural review you can paste on Google.</p>
        <StarRating value={rating} onChange={generate} disabled={loading} />
        {loading && <div className="review-card"><div className="skeleton" /><div className="skeleton short" /><div className="skeleton" /></div>}

        {/* Photo Upload Section — visible as soon as stars are picked */}
        {rating > 0 && (
          <div className="photo-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="photo-input-hidden"
              id="photo-input"
            />

            {!photoPreview && !enhancedImage && (
              <label htmlFor="photo-input" className="photo-upload-trigger">
                <Camera size={22} />
                <span>Attach a photo</span>
                <span className="photo-upload-hint">AI will enhance your photo ✨</span>
              </label>
            )}

            {photoPreview && !enhancedImage && (
              <div className="photo-preview-container">
                <div className="photo-preview-wrapper">
                  <img src={photoPreview} alt="Selected" className="photo-preview-img" />
                  {!photoLoading && (
                    <button className="photo-remove-btn" onClick={removePhoto} aria-label="Remove photo">
                      <X size={16} />
                    </button>
                  )}
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

            {enhancedImage && (
              <div className="enhanced-result">
                <div className="enhanced-badge"><Sparkles size={14} /> AI Enhanced</div>
                <img src={enhancedImage} alt="AI Enhanced" className="enhanced-img" />
                <button className="link-button" onClick={removePhoto}>Remove photo</button>
              </div>
            )}

            {photoError && <p className="error photo-error">{photoError}</p>}
          </div>
        )}

        {reviewText && !loading && (
          <>
            <article className="review-card">{reviewText}</article>
            <button className="secondary-button full" onClick={() => generate(rating)}><RefreshCw size={18} /> Generate a different review</button>
            <button className="google-button" onClick={postReview}><Send size={20} /> Post This Review on Google</button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
