const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

export type ProductPageContent = {
  descriptionHtml: string;
  whyYoullLoveIt: string;
  purchaseBullets: string[];
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

export async function getProductPageContent(handle: string): Promise<ProductPageContent | null> {
  if (!domain || !token) return null;
  try {
    const query = `#graphql
      query ProductPageContent($handle: String!) {
        product(handle: $handle) {
          descriptionHtml
          why: metafield(namespace: "custom", key: "fcp_verdict") { value }
          purchaseBullets: metafield(namespace: "custom", key: "purchase_bullets") { value }
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
    return {
      descriptionHtml: htmlToParagraphs(p.descriptionHtml || ""),
      whyYoullLoveIt: String(p.why?.value || "").trim(),
      purchaseBullets: String(p.purchaseBullets?.value || "")
        .split(/\n+/)
        .map((x: string) => x.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 6)
    };
  } catch {
    return null;
  }
}
