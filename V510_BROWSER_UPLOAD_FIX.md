V5.10 Browser Upload Fix

- Removes app/cart/[...path], which GitHub's browser uploader can choke on.
- Replaces it with root middleware.ts.
- middleware redirects /cart/* from fortcrazypants.com to SHOPIFY_STORE_DOMAIN.
- Preserves the complete Shopify cart path and query string, including required key parameters.
- Keeps V5.9 heading, Zendrop description, favicon, and checkout fixes.
