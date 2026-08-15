import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

const CART_CREATE = `#graphql
mutation FortCrazypantsCartCreate($lines: [CartLineInput!]) {
  cartCreate(input: { lines: $lines }) {
    cart { id checkoutUrl }
    userErrors { field message }
  }
}`;

export async function POST(request: Request) {
  if (!domain || !token) return NextResponse.json({ error: "Shopify is not configured." }, { status: 500 });
  const body = await request.json().catch(() => ({}));
  const variantId = typeof body.variantId === "string" ? body.variantId : "";
  const quantity = Math.max(1, Number(body.quantity) || 1);
  if (!variantId) return NextResponse.json({ error: "Missing product variant." }, { status: 400 });

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query: CART_CREATE, variables: { lines: [{ merchandiseId: variantId, quantity }] } }),
    cache: "no-store",
  });

  const json = await res.json();
  const errors = json?.data?.cartCreate?.userErrors || json?.errors || [];
  if (!res.ok || errors.length) {
    return NextResponse.json({ error: errors[0]?.message || "Unable to create Shopify cart." }, { status: 400 });
  }
  const checkoutUrl = json?.data?.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) return NextResponse.json({ error: "Shopify did not return a checkout URL." }, { status: 500 });
  return NextResponse.json({ checkoutUrl });
}
