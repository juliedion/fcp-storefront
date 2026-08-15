V5.9
- Returns product/homepage headings to Luckiest Guy/Lucky Guy at font-weight 400.
- Adds more letter spacing and slightly smaller sizes so the display font is easier to read.
- Guarantees a visible Zendrop homepage description using whyYoullLoveIt -> quickTake -> fullDescription -> product-title fallback.
- Adds /cart/[...path] route that redirects headless checkout paths from fortcrazypants.com to SHOPIFY_STORE_DOMAIN while preserving Shopify's required query key.
- If SHOPIFY_STORE_DOMAIN is mistakenly the public domain, route returns a clear config error rather than looping.
