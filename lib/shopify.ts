import type { Find } from "@/lib/finds";

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  seo { description }
  productType
  vendor
  tags
  availableForSale
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 10) {
    nodes { id title availableForSale quantityAvailable price { amount currencyCode } }
  }
  collections(first: 10) { nodes { title handle } }
  affiliateUrl: metafield(namespace: "custom", key: "affiliate_url") { value }
  affiliateNetwork: metafield(namespace: "custom", key: "affiliate_network") { value }
  ctaText: metafield(namespace: "custom", key: "cta_text") { value }
  verdict: metafield(namespace: "custom", key: "fcp_verdict") { value }
  whyYoullLoveIt: metafield(namespace: "custom", key: "why_youll_love_it") { value }
  purchaseBullets: metafield(namespace: "custom", key: "purchase_bullets") { type value }
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
  descriptionHtml?: string;
  seo?: { description?: string | null } | null;
  fullDescription?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  availableForSale?: boolean;
  featuredImage?: { url: string; altText?: string | null } | null;
  images?: { nodes?: { url: string; altText?: string | null }[] };
  priceRange?: { minVariantPrice?: Money };
  variants?: { nodes?: { id: string; title: string; availableForSale: boolean; quantityAvailable?: number | null; price: Money }[] };
  collections?: { nodes?: { title: string; handle: string }[] };
  affiliateUrl?: { value: string } | null;
  affiliateNetwork?: { value: string } | null;
  ctaText?: { value: string } | null;
  verdict?: { value: string } | null;
  whyYoullLoveIt?: { value: string } | null;
  purchaseBullets?: { type?: string; value: string } | null;
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


function htmlToReadableText(raw: string) {
  return (raw || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanImportedDescription(raw: string, productTitle: string) {
  let text = (raw || "").replace(/\r/g, "").trim();

  // Remove importer-style leading "Product Name: ..." field.
  text = text.replace(
    /^Product Name:\s*.*?(?=(?:Package Contents|Contents|Design|Colors?|Dimensions|Material|Age Range|Why You(?:'|’)?ll Love It)\s*:?\s*)/i,
    ""
  );

  // If the exact Shopify title follows Product Name, remove that cleanly too.
  const escapedTitle = productTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  text = text.replace(new RegExp(`^Product Name:\\s*${escapedTitle}\\s*`, "i"), "");

  // Put common supplier/importer labels on their own lines.
  const labels = [
    "Package Contents", "Contents", "Design", "Colors", "Color",
    "Dimensions", "Material", "Age Range", "Size", "Style", "Features"
  ];
  for (const label of labels) {
    text = text.replace(new RegExp(`\\s*(${label}:)\\s*`, "gi"), "\n$1 ");
  }

  // Fix concatenated Why You'll Love It headings.
  text = text.replace(/Why You(?:'|’)?ll Love It\s*:?\s*/gi, "Why You'll Love It\n");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}


function zendropHomepageSummary(raw: string, productTitle: string) {
  let text = htmlToReadableText(raw || "").replace(/\r/g, " ").trim();
  if (!text) return "";

  // Zendrop frequently concatenates importer labels with no spaces:
  // "...SetPackage Contents: ...Design: ...Colors: ..."
  const labels = [
    "Package Contents", "Contents", "Design", "Colors", "Color",
    "Dimensions", "Material", "Age Range", "Size", "Style", "Features"
  ];

  for (const label of labels) {
    text = text.replace(new RegExp(`(${label}:)`, "gi"), "\n$1 ");
  }

  // Remove only the importer Product Name field.
  if (/^Product Name:/i.test(text)) {
    const firstLabelPos = labels
      .map((label) => text.toLowerCase().indexOf(`\n${label.toLowerCase()}:`))
      .filter((pos) => pos > 0)
      .sort((a, b) => a - b)[0];

    if (typeof firstLabelPos === "number") {
      text = text.slice(firstLabelPos + 1);
    } else {
      const escapedTitle = productTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(`^Product Name:\\s*${escapedTitle}\\s*`, "i"), "");
    }
  }

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  const valueFor = (name: string) => {
    const line = lines.find((l) => l.toLowerCase().startsWith(`${name.toLowerCase()}:`));
    return line ? line.slice(line.indexOf(":") + 1).trim() : "";
  };

  const design = valueFor("Design");
  const colors = valueFor("Colors") || valueFor("Color");
  const material = valueFor("Material");

  // Any non-label prose is usually Zendrop's useful selling sentence.
  const prose = lines
    .filter((line) => !/^(Package Contents|Contents|Design|Colors?|Dimensions|Material|Age Range|Size|Style|Features):/i.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  let summary = prose;

  if (!summary) {
    const details = [design, colors, material].filter(Boolean);
    if (details.length) {
      summary = `A fun, practical find featuring ${details.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
    }
  }

  if (!summary) {
    summary = `${productTitle} is a fun, practical Fort Crazypants find picked for everyday family life.`;
  }

  summary = summary.replace(/\s+/g, " ").trim();

  if (summary.length > 190) {
    summary = `${summary.slice(0, 187).replace(/\s+\S*$/, "").trim()}…`;
  }

  return summary;
}


function directShopifyHomepageSummary(raw: string, productTitle: string) {
  let text = htmlToReadableText(raw || "").replace(/\r/g, " ").trim();
  if (!text) return "";

  // Remove only the imported Product Name field/title.
  const escapedTitle = productTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  text = text.replace(new RegExp(`^Product Name:\\s*${escapedTitle}`, "i"), "");
  text = text.replace(/^Product Name:\s*/i, "");

  // Zendrop often concatenates labels and selling sentences with no whitespace.
  // Add boundaries before both spec labels and common benefit phrases.
  const boundaries = [
    "Package Contents:", "Contents:", "Design:", "Colors:", "Color:",
    "Dimensions:", "Material:", "Age Range:", "Size:", "Style:", "Features:",
    "Suitable for", "Ideal for", "Perfect for", "Great for",
    "Designed for", "Made for", "Versatile for"
  ];

  for (const boundary of boundaries) {
    text = text.replace(new RegExp(`(${boundary})`, "gi"), "\n$1");
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  // Prefer actual selling/benefit sentences from the Shopify description.
  const benefits = lines.filter((line) =>
    /^(Suitable for|Ideal for|Perfect for|Great for|Designed for|Made for|Versatile for)/i.test(line)
  );

  let summary = benefits.join(" ");

  // If there are no explicit benefit phrases, use useful descriptive fields.
  if (!summary) {
    const useful = lines
      .filter((line) => /^(Design|Colors?|Material|Features):/i.test(line))
      .map((line) => line.replace(/^[^:]+:\s*/, ""))
      .filter(Boolean);

    if (useful.length) {
      summary = `A fun, practical find featuring ${useful.slice(0, 3).join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
    }
  }

  // Last resort: use the real description itself, not generic filler.
  if (!summary) {
    summary = lines.join(" ");
  }

  summary = summary
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

  if (summary.length > 190) {
    summary = `${summary.slice(0, 187).replace(/\s+\S*$/, "").trim()}…`;
  }

  return summary;
}

function descriptionParts(raw: string, productTitle: string) {
  const cleaned = cleanImportedDescription(raw, productTitle);
  const marker = "Why You'll Love It";
  const markerIndex = cleaned.toLowerCase().indexOf(marker.toLowerCase());

  let whyText = "";
  let detailsText = cleaned;

  if (markerIndex >= 0) {
    const after = cleaned.slice(markerIndex + marker.length).replace(/^[\s:–—-]+/, "").trim();
    const firstLabel = after.search(/\n(?:Package Contents|Contents|Design|Colors?|Dimensions|Material|Age Range|Size|Style|Features):/i);
    whyText = firstLabel >= 0 ? after.slice(0, firstLabel).trim() : after.trim();
    detailsText = firstLabel >= 0 ? after.slice(firstLabel).trim() : "";
  } else {
    // For Zendrop/supplier descriptions, use the opening prose as the friendly summary.
    const firstLabel = cleaned.search(/(?:^|\n)(?:Package Contents|Contents|Design|Colors?|Dimensions|Material|Age Range|Size|Style|Features):/i);
    if (firstLabel > 0) {
      whyText = cleaned.slice(0, firstLabel).trim();
      detailsText = cleaned.slice(firstLabel).trim();
    } else if (firstLabel === 0) {
      // Supplier copy sometimes contains only specs. Keep every spec in Product Details
      // and turn the first few useful values into a friendly Why You'll Love It sentence.
      const values = cleaned
        .split(/\n+/)
        .map((line) => line.replace(/^[^:]{2,32}:\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      whyText = values.length
        ? `A fun, practical find with ${values.join(", ").replace(/, ([^,]*)$/, " and $1")}.`
        : "A fun, practical find picked for everyday family life.";
      detailsText = cleaned;
    } else {
      whyText = cleaned;
      detailsText = cleaned;
    }
  }

  // Keep card/detail intro concise without chopping words.
  const compactWhy = whyText.replace(/\s+/g, " ").trim();
  const cardWhy = compactWhy.length > 190
    ? `${compactWhy.slice(0, 187).replace(/\s+\S*$/, "").trim()}…`
    : compactWhy;

  return {
    whyYoullLoveIt: cardWhy || "A crazy-good find worth checking out.",
    fullDescription: detailsText || cleaned,
  };
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

function parsePurchaseBullets(field?: { type?: string; value: string } | null) {
  const raw = (field?.value || "").trim();
  if (!raw) return [];

  let values: string[] = [];
  if (field?.type?.startsWith("list.") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) values = parsed.map(String);
    } catch {
      values = [];
    }
  }

  if (!values.length) values = raw.split(/\n+|\s*[•|]\s*/);
  return values
    .map((value) => value.replace(/^\s*(?:[-–—•]|\d+[.)])\s*/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 6);
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
  const rawDescription = (p.description || "").trim()
    || htmlToReadableText(p.descriptionHtml || "")
    || (p.seo?.description || "").trim();
  const description = rawDescription || "A crazy-good find worth checking out.";
  const descriptionData = descriptionParts(description, p.title);
  const genericSummary = "A crazy-good find worth checking out.";
  const realDescription = cleanImportedDescription(description, p.title)
    .replace(/Why You(?:'|’)?ll Love It\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Every native Shopify product (including Zendrop) should use the real Shopify
  // product description directly. Do not depend on vendor/tag/source detection.
  const nativeShopifySummary = !affiliate
    ? directShopifyHomepageSummary(rawDescription || description, p.title)
    : "";

  const homepageSummarySource =
    nativeShopifySummary ||
    (descriptionData.whyYoullLoveIt !== genericSummary
      ? descriptionData.whyYoullLoveIt
      : ((p.seo?.description || "").trim() || realDescription || descriptionData.fullDescription || description));

  const homepageSummary = homepageSummarySource.length > 190
    ? `${homepageSummarySource.slice(0, 187).replace(/\s+\S*$/, "").trim()}…`
    : homepageSummarySource;
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
    quickTake: homepageSummary,
    whyYoullLoveIt: homepageSummary,
    fullDescription: descriptionData.fullDescription,
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
    galleryImages: Array.from(
      new Map((p.images?.nodes || []).filter((image) => image.url).map((image) => [image.url, image])).values()
    ).slice(0, 10),
    purchaseBullets: parsePurchaseBullets(p.purchaseBullets),
    savedWhyYoullLoveIt: (p.whyYoullLoveIt?.value || p.verdict?.value || "").trim(),
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
