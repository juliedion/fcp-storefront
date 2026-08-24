const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

export type ProductPageContent = {
  descriptionHtml: string;
  whyYoullLoveIt: string;
  purchaseBullets: string[];
  isAffiliate: boolean;
  affiliateUrl: string;
  affiliateNetwork: string;
  merchant: string;
  ctaText: string;
  sourceUrl: string;
};

function htmlToParagraphs(raw: string) {
  return (raw || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truthy(value: unknown) {
  return ["true", "1", "yes", "affiliate"].includes(String(value || "").trim().toLowerCase());
}

export async function getProductPageContent(handle: string): Promise<ProductPageContent | null> {
  if (!domain || !token) return null;
  try {
    const query = `#graphql
      query ProductPageContent($handle: String!) {
        product(handle: $handle) {
          descriptionHtml
          why: metafield(namespace: "custom", key: "fcp_verdict") { value }
          purchaseBullets: metafield(namespace: "custom", key: "purchase_bullets") { value }
          isAffiliate: metafield(namespace: "custom", key: "is_affiliate_product") { value }
          affiliateUrl: metafield(namespace: "custom", key: "affiliate_url") { value }
          affiliateNetwork: metafield(namespace: "custom", key: "affiliate_network") { value }
          merchant: metafield(namespace: "custom", key: "merchant") { value }
          ctaText: metafield(namespace: "custom", key: "cta_text") { value }
          sourceUrl: metafield(namespace: "fort_crazypants", key: "source_url") { value }
        }
      }
    `;
    const r = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables: { handle } }),
      cache: "no-store"
    });
    const data = await r.json();
    if (!r.ok || data.errors || !data?.data?.product) return null;
    const p = data.data.product;
    const affiliateUrl = String(p.affiliateUrl?.value || "").trim();
    const sourceUrl = String(p.sourceUrl?.value || "").trim();
    const merchant = String(p.merchant?.value || "").trim();
    const affiliateNetwork = String(p.affiliateNetwork?.value || "").trim();
    const externalSource = /amazon\.|amzn\.|mavely|walmart\.|target\.|bestbuy\.|etsy\./i.test(`${affiliateUrl} ${sourceUrl}`);
    const affiliateMerchant = /amazon|mavely|walmart|target|best buy|etsy/i.test(`${merchant} ${affiliateNetwork}`);

    return {
      descriptionHtml: htmlToParagraphs(p.descriptionHtml || ""),
      whyYoullLoveIt: String(p.why?.value || "").trim(),
      purchaseBullets: String(p.purchaseBullets?.value || "")
        .split(/\n+/)
        .map((x: string) => x.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 6),
      isAffiliate: truthy(p.isAffiliate?.value) || Boolean(affiliateUrl) || externalSource || affiliateMerchant,
      affiliateUrl: affiliateUrl || (externalSource ? sourceUrl : ""),
      affiliateNetwork,
      merchant,
      ctaText: String(p.ctaText?.value || "").trim(),
      sourceUrl
    };
  } catch {
    return null;
  }
}
