# Fort Crazypants — Automatic Product Types

The storefront now decides purchase behavior automatically from Shopify data.

## Affiliate
A product is treated as affiliate when any of these are true:
- `custom.is_affiliate_product` is true
- `custom.affiliate_url` has a value
- `custom.product_source` is `affiliate`, `Amazon`, or contains `affiliate` / `amazon`

Behavior: external retailer CTA. Shopify inventory is ignored.

## Zendrop
A product is recognized as Zendrop when:
- `custom.product_source` contains `zendrop`, or
- a Shopify tag contains `zendrop`

Behavior: native Shopify checkout. Zendrop continues to fulfill through its Shopify integration.

## Regular Shopify
Any non-affiliate product that is not tagged/source-marked Zendrop uses native Shopify checkout.

## Homepage collections
Products can be assigned to homepage categories with Shopify collections or tags named:
- Road Trip Rescues
- Kid Approved
- Dog Stuff
- Backyard Fun
- Home Hacks
- Under $25
- Gifts
- Travel
- Trending Finds

`Under $25` is also calculated automatically from price.
