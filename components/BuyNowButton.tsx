"use client";

import { useState } from "react";

export default function BuyNowButton({
  variantId,
  disabled = false,
  label = "Buy Now",
  className = "",
}: {
  variantId: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buyNow() {
    if (disabled || loading || !variantId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Checkout could not be started.");
      }

      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  return (
    <div className="buyNowWrap">
      <button
        type="button"
        className={`btn btn--pink buyNowButton ${className}`.trim()}
        onClick={buyNow}
        disabled={disabled || loading || !variantId}
        aria-busy={loading}
      >
        {disabled || !variantId ? "Currently unavailable" : loading ? "Opening checkout…" : label}
      </button>
      {error && <p className="buyNowError" role="alert">{error}</p>}
    </div>
  );
}
