import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { variantId, quantity = 1 } = await request.json();

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "Missing product variant." }, { status: 400 });
    }

    const shopDomain = (process.env.SHOPIFY_STORE_DOMAIN || "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (!shopDomain) {
      return NextResponse.json(
        { error: "SHOPIFY_STORE_DOMAIN is not configured." },
        { status: 500 }
      );
    }

    // Shopify cart permalinks require the numeric ProductVariant ID,
    // not the GraphQL gid://shopify/ProductVariant/... form.
    const match = variantId.match(/ProductVariant\/(\d+)$/);
    const numericVariantId = match?.[1];

    if (!numericVariantId) {
      return NextResponse.json(
        { error: "This Shopify variant ID could not be converted for checkout." },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(quantity) || 1);

    // Shopify documents this permalink format for sending a buyer directly
    // to a preloaded cart/checkout. Because the URL uses SHOPIFY_STORE_DOMAIN
    // directly, the headless/Vercel domain can never intercept it.
    const checkoutUrl = `https://${shopDomain}/cart/${numericVariantId}:${qty}`;

    return NextResponse.json({ checkoutUrl });
  } catch {
    return NextResponse.json(
      { error: "Checkout could not be started." },
      { status: 500 }
    );
  }
}
