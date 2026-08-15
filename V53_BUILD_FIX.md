V5.3 definitive build fix

Vercel continued reporting:
Type 'string | undefined' is not assignable to type 'string'
at app/find/[slug]/page.tsx BuyNowButton variantId={item.variantId}.

This version fixes the error at the call site:
variantId={item.variantId || ""}

and disables the button when variantId is absent.

Therefore the expression passed to BuyNowButton is always a string,
even if an older/stale BuyNowButton typing still requires `variantId: string`.

All V5.1 product-page readability, full description, verdict removal,
and server-side Shopify checkout changes remain included.
