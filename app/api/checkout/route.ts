import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { variantId, quantity = 1 } = await request.json();

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "Missing product variant." }, { status: 400 });
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const version = process.env.SHOPIFY_API_VERSION || "2026-04";

    if (!domain || !token) {
      return NextResponse.json({ error: "Shopify checkout is not configured." }, { status: 500 });
    }

    const query = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query,
        variables: {
          input: {
            lines: [{ merchandiseId: variantId, quantity: Number(quantity) || 1 }],
          },
        },
      }),
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Shopify checkout request failed." }, { status: 502 });
    }

    if (payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors.map((e: { message: string }) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const result = payload.data?.cartCreate;

    if (result?.userErrors?.length) {
      return NextResponse.json(
        { error: result.userErrors.map((e: { message: string }) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const checkoutUrl = result?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Shopify did not return a checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch {
    return NextResponse.json(
      { error: "Checkout could not be started." },
      { status: 500 }
    );
  }
}
