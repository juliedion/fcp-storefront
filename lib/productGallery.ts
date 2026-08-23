const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-04";

export async function getProductGallery(handle: string): Promise<{url:string;altText?:string|null}[]> {
  if (!domain || !token) return [];
  try {
    const query = `#graphql query ProductGallery($handle: String!) { product(handle: $handle) { images(first: 20) { nodes { url altText } } } }`;
    const r = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables: { handle } }),
      cache: "no-store"
    });
    const data = await r.json();
    if (!r.ok || data.errors) return [];
    return data?.data?.product?.images?.nodes || [];
  } catch { return []; }
}
