import { Star } from "lucide-react";

export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star-button ${value >= star ? "active" : ""}`}
          onClick={() => onChange(star)}
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star fill="currentColor" size={34} />
        </button>
      ))}
    </div>
  );
}
