V5.14

Root cause:
The homepage description parser was only guaranteed to run when the product was identified as Zendrop.
The imported hair-clip product is reaching the storefront as a native Shopify product but is not reliably tagged/vendor-labeled as Zendrop.

Fix:
- Every NON-AFFILIATE Shopify product now builds its homepage summary directly from Shopify's real Description field.
- No Zendrop vendor/tag/source detection is required.
- Parses concatenated importer text such as:
  Product Name...Package Contents...Design...Colors...Dimensions...Suitable for...Ideal for...
- Prefers real benefit phrases: Suitable for / Ideal for / Perfect for / Great for / Designed for / Made for / Versatile for.
- If benefit phrases don't exist, uses Design/Color/Material/Features.
- FindCard no longer runs another destructive cleanup pass; it simply renders the already-prepared summary.
- V5.12 checkout subdomain behavior is preserved.
