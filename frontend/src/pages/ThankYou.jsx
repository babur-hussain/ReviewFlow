import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "../lib/clipboard";

export default function ThankYou() {
  const handoff = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("review-handoff") || "{}");
    } catch {
      return {};
    }
  }, []);
  const [copied, setCopied] = useState(Boolean(handoff.copied));
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const countdown = setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    const opener = setTimeout(() => {
      if (handoff.googleReviewUrl) window.location.href = handoff.googleReviewUrl;
    }, 3000);
    return () => {
      clearInterval(countdown);
      clearTimeout(opener);
    };
  }, [handoff.googleReviewUrl]);

  async function manualCopy() {
    const ok = await copyToClipboard(handoff.reviewText || "");
    setCopied(ok);
  }

  return (
    <main className="public-page" style={{ "--brand": handoff.color || "#2563eb" }}>
      <section className="public-card thank-card">
        <div className="checkmark"><Check size={42} /></div>
        <h1>Your review is ready</h1>
        <p className="muted">Google opens in {seconds} seconds. Long press inside the Google review text box, then tap Paste.</p>
        <div className="phone-demo">
          <div className="fake-input">Paste your copied review here</div>
          <div className="hand"><span /></div>
        </div>
        <article className="review-card">{handoff.reviewText || "Your review text will appear here."}</article>
        {!copied && <button className="google-button" onClick={manualCopy}><Copy size={20} /> Copy review manually</button>}
        {copied && <p className="success">Review copied to clipboard</p>}
        {handoff.googleReviewUrl && <a className="secondary-button full" href={handoff.googleReviewUrl}>Open Google now</a>}
      </section>
    </main>
  );
}
