# V5.0 product feed/card fixes

## Zendrop product visibility
The Storefront API only returns products published to the applicable Headless sales channel/catalog.
For a Zendrop-imported product that exists in Shopify but does not appear on Fort Crazypants:

1. Open the product in Shopify.
2. Check Publishing / Sales channels.
3. Make sure the Fort Crazypants Headless storefront is included.
4. Product status must be Active.
5. Save.

This build also makes the homepage force-dynamic, disables Storefront fetch caching,
and fetches up to 100 recently updated products.

## Card fixes
- Long FCP Verdict is no longer used as the card badge.
- Reads `custom.badge` for an optional short badge.
- Affiliate fallback badge = Crazy Good Find.
- Zendrop fallback badge = New Find.
- Badge moved below the image so it cannot cover product photography.
- Product image areas use a consistent square canvas.
- Cards use flex layout with matching heights.
- Titles are capped at 2 lines; descriptions at 3 lines.
- Price/CTA row is pinned to the bottom.
