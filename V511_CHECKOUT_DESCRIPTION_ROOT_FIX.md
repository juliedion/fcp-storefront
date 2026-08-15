V5.11 root-cause fix

CHECKOUT
- Removes middleware entirely.
- /api/checkout now converts the Shopify GraphQL ProductVariant GID to its numeric ID.
- Returns Shopify's documented cart permalink:
  https://{SHOPIFY_STORE_DOMAIN}/cart/{variant_id}:1
- The browser goes directly to Shopify; fortcrazypants.com/Vercel cannot intercept the cart URL.

ZENDROP HOMEPAGE DESCRIPTION
- Removes the destructive regex that deleted an entire one-line description after "Product Name:".
- Safely strips only the Product Name field.
- Preserves Package Contents / Design / Color / Dimensions / Material etc.
- Guarantees a non-empty card description.
- Mapper now prioritizes real cleaned Shopify/Zendrop description text over generic fallback copy.

This package remains GitHub-browser-upload friendly; there are no bracket/catch-all folders.
