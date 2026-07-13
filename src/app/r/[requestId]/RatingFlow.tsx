"use client";

import { useState } from "react";

type Stage = "rate" | "routing" | "google" | "feedback" | "done";

const STAR_COUNT = 5;

export default function RatingFlow({
  requestId,
  businessName,
  alreadyResponded,
}: {
  requestId: string;
  businessName: string;
  alreadyResponded: boolean;
}) {
  const [stage, setStage] = useState<Stage>(alreadyResponded ? "done" : "rate");
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitRating(value: number) {
    setRating(value);
    setStage("routing");

    const res = await fetch(`/api/review-requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: value }),
    });
    const data = await res.json();

    // Small delay so the routing moment is felt, not just flashed.
    setTimeout(() => {
      if (data.googleUrl) {
        setGoogleUrl(data.googleUrl);
        setStage("google");
      } else {
        setStage("feedback");
      }
    }, 650);
  }

  async function submitFeedback() {
    setSubmitting(true);
    await fetch(`/api/review-requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feedbackText }),
    });
    setSubmitting(false);
    setStage("done");
  }

  if (stage === "rate") {
    return (
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-parchment/50 mb-4">
          {businessName}
        </p>
        <h1 className="font-display text-2xl text-parchment mb-10 leading-snug">
          How was your visit?
        </h1>
        <div className="flex justify-center gap-2">
          {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((n) => {
            const filled = hovered !== null ? n <= hovered : false;
            return (
              <button
                key={n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => submitRating(n)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star filled={filled} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (stage === "routing") {
    return (
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((n) => (
            <Star key={n} filled={rating !== null && n <= rating} />
          ))}
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-parchment/40 animate-pulse">
          One moment
        </p>
      </div>
    );
  }

  if (stage === "google" && googleUrl) {
    return (
      <div className="text-center">
        <div className="w-10 h-10 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center mx-auto mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-sage" />
        </div>
        <h1 className="font-display text-2xl text-parchment mb-3">Glad to hear it.</h1>
        <p className="text-parchment/60 mb-8 leading-relaxed">
          Mind sharing that on Google? It takes 30 seconds and means a lot to us.
        </p>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-sage text-parchment font-medium px-6 py-3 rounded-card hover:bg-sage/90 transition-colors"
        >
          Leave a Google review →
        </a>
      </div>
    );
  }

  if (stage === "feedback") {
    return (
      <div>
        <div className="w-10 h-10 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center mx-auto mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-amber" />
        </div>
        <h1 className="font-display text-2xl text-parchment mb-3 text-center">
          Sorry to hear that.
        </h1>
        <p className="text-parchment/60 mb-6 leading-relaxed text-center">
          Tell us what happened — this goes straight to the owner, not to the public.
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={4}
          placeholder="What went wrong?"
          className="w-full bg-parchment/5 border border-parchment/20 rounded-card px-4 py-3 text-parchment placeholder:text-parchment/30 mb-4 focus:border-amber outline-none"
        />
        <button
          onClick={submitFeedback}
          disabled={submitting || feedbackText.trim().length === 0}
          className="w-full bg-amber text-ink font-medium px-6 py-3 rounded-card hover:bg-amber/90 transition-colors disabled:opacity-40"
        >
          {submitting ? "Sending…" : "Send feedback"}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="font-display text-2xl text-parchment mb-3">Thanks for letting us know.</h1>
      <p className="text-parchment/60 leading-relaxed">
        If you'd still like to leave a public review, you're always welcome to search for{" "}
        {businessName} on Google.
      </p>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" className={filled ? "text-amber" : "text-parchment/20"}>
      <path
        fill="currentColor"
        d="M12 2.5l2.87 6.24 6.88.63-5.2 4.53 1.57 6.75L12 17.06l-6.12 3.59 1.57-6.75-5.2-4.53 6.88-.63L12 2.5z"
      />
    </svg>
  );
}
