import type { Find } from "@/lib/finds";

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  vendor
  tags
  availableForSale
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 10) {
    nodes { id title availableForSale quantityAvailable price { amount currencyCode } }
  }
  collections(first: 10) { nodes { title handle } }
  affiliateUrl: metafield(namespace: "custom", key: "affiliate_url") { value }
  affiliateNetwork: metafield(namespace: "custom", key: "affiliate_network") { value }
  ctaText: metafield(namespace: "custom", key: "cta_text") { value }
  verdict: metafield(namespace: "custom", key: "fcp_verdict") { value }
  badge: metafield(namespace: "custom", key: "badge") { value }
  isAffiliate: metafield(namespace: "custom", key: "is_affiliate_product") { value }
  merchant: metafield(namespace: "custom", key: "merchant") { value }
  productSource: metafield(namespace: "custom", key: "product_source") { value }
  sourceUrl: metafield(namespace: "fort_crazypants", key: "source_url") { value }
`;

const PRODUCTS_QUERY = `#graphql
query FortCrazypantsProducts($first: Int!) {
  products(first: $first, sortKey: UPDATED_AT, reverse: true) {
    nodes { ${PRODUCT_FIELDS} }
  }
}`;

const PRODUCT_QUERY = `#graphql
query FortCrazypantsProduct($handle: String!) {
  product(handle: $handle) { ${PRODUCT_FIELDS} }
}`;

type Money = { amount: string; currencyCode: string };
type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  availableForSale?: boolean;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: { minVariantPrice?: Money };
  variants?: { nodes?: { id: string; title: string; availableForSale: boolean; quantityAvailable?: number | null; price: Money }[] };
  collections?: { nodes?: { title: string; handle: string }[] };
  affiliateUrl?: { value: string } | null;
  affiliateNetwork?: { value: string } | null;
  ctaText?: { value: string } | null;
  verdict?: { value: string } | null;
  badge?: { value: string } | null;
  isAffiliate?: { value: string } | null;
  merchant?: { value: string } | null;
  productSource?: { value: string } | null;
  sourceUrl?: { value: string } | null;
};

async function storefrontFetch<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  if (!domain || !token) return null;
  try {
    const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Shopify Storefront API", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    if (json.errors) {
      console.error("Shopify GraphQL", json.errors);
      return null;
    }
    return json.data as T;
  } catch (error) {
    console.error("Shopify fetch failed", error);
    return null;
  }
}

function formatMoney(v?: Money) {
  if (!v || Number(v.amount) <= 0) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: v.currencyCode,
      maximumFractionDigits: 2,
    }).format(Number(v.amount));
  } catch {
    return `$${v.amount}`;
  }
}

function truthy(value?: string | null) {
  return ["true", "1", "yes", "affiliate"].includes((value || "").trim().toLowerCase());
}

function normalizedSource(p: ShopifyProduct) {
  return (p.productSource?.value || "").trim().toLowerCase();
}

function isAffiliateProduct(p: ShopifyProduct) {
  const source = normalizedSource(p);
  return Boolean(
    truthy(p.isAffiliate?.value) ||
    p.affiliateUrl?.value ||
    source === "affiliate" ||
    source === "amazon" ||
    source.includes("affiliate") ||
    source.includes("amazon")
  );
}

function isZendropProduct(p: ShopifyProduct) {
  const source = normalizedSource(p);
  const tags = (p.tags || []).map((tag) => tag.toLowerCase());
  const vendor = (p.vendor || "").toLowerCase();
  return source.includes("zendrop") || vendor.includes("zendrop") || tags.some((tag) => tag.includes("zendrop"));
}

function categoryFor(p: ShopifyProduct) {
  const preferred = [
    "Road Trip Rescues", "Kid Approved", "Dog Stuff", "Backyard Fun",
    "Home Hacks", "Under $25", "Gifts", "Travel", "Crazy-Good Finds", "Trending Finds"
  ];
  const collections = p.collections?.nodes || [];
  const matchedCollection = collections.find((c) => preferred.includes(c.title));
  if (matchedCollection) return matchedCollection.title;
  const matchedTag = (p.tags || []).find((tag) => preferred.includes(tag));
  return matchedTag || p.productType || "Trending Finds";
}

function toneFor(i: number) {
  return ["cool", "play", "dog", "road", "home", "sun"][i % 6];
}

function toFind(p: ShopifyProduct, i = 0): Find {
  const affiliate = isAffiliateProduct(p);
  const zendrop = isZendropProduct(p);
  const source = p.productSource?.value || (affiliate ? "affiliate" : zendrop ? "zendrop" : "shopify");
  const retailer = p.merchant?.value || (affiliate ? source : "Fort Crazypants") || p.vendor || "Fort Crazypants";
  const affiliateUrl = p.affiliateUrl?.value || (affiliate ? p.sourceUrl?.value : "") || "";
  const variant = p.variants?.nodes?.find((v) => v.availableForSale) || p.variants?.nodes?.[0];
  const description = (p.description || "A crazy-good find worth checking out.").trim();
  const purchaseMode: Find["purchaseMode"] = affiliate ? "affiliate" : "shopify";
  const available = affiliate ? true : Boolean(p.availableForSale && variant?.availableForSale);
  const defaultCta = affiliate
    ? `Buy on ${p.merchant?.value || retailer || "retailer"}`
    : available
      ? "Buy Now"
      : "Sold Out";

  return {
    slug: p.handle,
    title: p.title,
    eyebrow: p.verdict?.value || (affiliate ? "Affiliate find." : zendrop ? "Ships from our fulfillment partner." : "Fort Crazypants find."),
    category: categoryFor(p),
    retailer,
    affiliateUrl,
    price: formatMoney(variant?.price || p.priceRange?.minVariantPrice),
    verdict: p.verdict?.value || "Fort Crazypants approved.",
    quickTake: description.length > 180 ? `${description.slice(0, 177).trim()}…` : description,
    why: [],
    badge: p.badge?.value || (affiliate ? "Crazy Good Find" : zendrop ? "New Find" : undefined),
    emoji: "✨",
    tone: toneFor(i),
    imageUrl: p.featuredImage?.url || undefined,
    imageAlt: p.featuredImage?.altText || p.title,
    ctaText: p.ctaText?.value || defaultCta,
    isAffiliate: affiliate,
    purchaseMode,
    variantId: variant?.id,
    availableForSale: available,
    productSource: source,
    tags: p.tags || [],
    collections: p.collections?.nodes || [],
  };
}

export async function getShopifyFinds(first = 100): Promise<Find[]> {
  const data = await storefrontFetch<{ products?: { nodes?: ShopifyProduct[] } }>(PRODUCTS_QUERY, { first });
  return (data?.products?.nodes || []).map((p, i) => toFind(p, i));
}

export async function getShopifyFindByHandle(handle: string): Promise<Find | null> {
  const data = await storefrontFetch<{ product?: ShopifyProduct | null }>(PRODUCT_QUERY, { handle });
  return data?.product ? toFind(data.product) : null;
}

export function productsForCategory(products: Find[], category: string) {
  if (category === "Under $25") {
    return products.filter((p) => {
      const value = Number((p.price || "").replace(/[^0-9.]/g, ""));
      return value > 0 && value < 25;
    });
  }
  const needle = category.toLowerCase();
  return products.filter((p) =>
    p.category.toLowerCase() === needle ||
    p.tags?.some((tag) => tag.toLowerCase() === needle) ||
    p.collections?.some((collection) => collection.title.toLowerCase() === needle)
  );
}
