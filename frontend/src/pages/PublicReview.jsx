import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw, Send } from "lucide-react";
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
