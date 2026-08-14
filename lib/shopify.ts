import type { Find } from "@/lib/finds";

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

const QUERY = `#graphql
query FortCrazypantsProducts($first: Int!) {
  products(first: $first, sortKey: UPDATED_AT, reverse: true) {
    nodes {
      handle
      title
      description
      productType
      vendor
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
      affiliateUrl: metafield(namespace: "custom", key: "affiliate_url") { value }
      affiliateNetwork: metafield(namespace: "custom", key: "affiliate_network") { value }
      ctaText: metafield(namespace: "custom", key: "cta_text") { value }
      verdict: metafield(namespace: "custom", key: "fcp_verdict") { value }
      isAffiliate: metafield(namespace: "custom", key: "is_affiliate_product") { value }
      merchant: metafield(namespace: "custom", key: "merchant") { value }
      productSource: metafield(namespace: "custom", key: "product_source") { value }
      sourceUrl: metafield(namespace: "fort_crazypants", key: "source_url") { value }
    }
  }
}`;

type ShopifyProduct = {
  handle: string; title: string; description: string; productType?: string; vendor?: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: { minVariantPrice?: { amount: string; currencyCode: string } };
  affiliateUrl?: { value: string } | null; affiliateNetwork?: { value: string } | null;
  ctaText?: { value: string } | null; verdict?: { value: string } | null;
  isAffiliate?: { value: string } | null; merchant?: { value: string } | null;
  productSource?: { value: string } | null; sourceUrl?: { value: string } | null;
};

function money(p: ShopifyProduct) {
  const v = p.priceRange?.minVariantPrice;
  if (!v || Number(v.amount) <= 0) return "";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: v.currencyCode, maximumFractionDigits: 2 }).format(Number(v.amount)); }
  catch { return `$${v.amount}`; }
}

function toneFor(i: number) { return ["cool", "play", "dog", "road", "home", "sun"][i % 6]; }

export async function getShopifyFinds(first = 12): Promise<Find[]> {
  if (!domain || !token) return [];
  try {
    const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query: QUERY, variables: { first } }),
      next: { revalidate: 60 },
    });
    if (!res.ok) { console.error("Shopify Storefront API", res.status, await res.text()); return []; }
    const json = await res.json();
    if (json.errors) { console.error("Shopify GraphQL", json.errors); return []; }
    const products: ShopifyProduct[] = json.data?.products?.nodes || [];
    return products.map((p, i) => {
      const retailer = p.merchant?.value || p.productSource?.value || p.vendor || "Fort Crazypants";
      const affiliateUrl = p.affiliateUrl?.value || p.sourceUrl?.value || "#";
      const description = (p.description || "A crazy-good find worth checking out.").trim();
      return {
        slug: p.handle,
        title: p.title,
        eyebrow: p.verdict?.value || "Crazy-good find.",
        category: p.productType || "Trending Finds",
        retailer,
        affiliateUrl,
        price: money(p),
        verdict: p.verdict?.value || "Fort Crazypants approved.",
        quickTake: description.length > 150 ? `${description.slice(0, 147).trim()}…` : description,
        why: [],
        badge: p.verdict?.value ? "Crazy Good Find" : undefined,
        emoji: "✨",
        tone: toneFor(i),
        imageUrl: p.featuredImage?.url || undefined,
        imageAlt: p.featuredImage?.altText || p.title,
        ctaText: p.ctaText?.value || (affiliateUrl !== "#" ? `Buy on ${retailer}` : "See the Find"),
        isAffiliate: p.isAffiliate?.value === "true",
      };
    });
  } catch (e) { console.error("Shopify fetch failed", e); return []; }
}
