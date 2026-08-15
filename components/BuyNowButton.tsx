"use client";

import { useState } from "react";

export default function BuyNowButton({ variantId, label = "Buy Now", disabled = false, className = "primaryBtn retailerBtn" }: {
  variantId?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    if (!variantId || disabled || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "Unable to start checkout");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className={className} onClick={checkout} disabled={disabled || loading || !variantId}>
        {loading ? "Opening checkout…" : disabled ? "Sold Out" : label}
      </button>
      {error && <p className="tinyDisclosure" role="alert">{error}</p>}
    </div>
  );
}
