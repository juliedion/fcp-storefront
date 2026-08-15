V5.4 final build cleanup

Fixes both remaining BuyNowButton typing issues:

1. components/FindCard.tsx
   variantId={item.variantId || ""}
   disabled={!item.availableForSale || !item.variantId}

2. components/BuyNowButton.tsx
   adds optional className?: string and applies it to the button.

The product detail page already uses a guaranteed string variantId.

All V5.1 product-page readability, full description, verdict removal,
and server-side Shopify checkout behavior remain included.
