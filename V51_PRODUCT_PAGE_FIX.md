V5.1
- Reduces oversized product-page headings and improves wrapping/readability.
- Removes FCP Verdict from product pages.
- Keeps the complete Shopify description and renders it in a Product details section.
- Replaces browser-side Shopify cart creation with /api/checkout.
- Server route creates a Shopify cart using the selected variant GID and redirects to returned checkoutUrl.
- Displays checkout errors instead of silently doing nothing.
