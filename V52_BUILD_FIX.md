V5.2 build fix

Vercel error:
Type 'string | undefined' is not assignable to type 'string'
at BuyNowButton variantId={item.variantId}.

Fix:
- BuyNowButton now accepts variantId?: string
- Button disables itself when no variantId is available
- buyNow() safely exits if variantId is missing

No visual/product-page changes beyond this build correction.
