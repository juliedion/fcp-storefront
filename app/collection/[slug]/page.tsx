import Header from "@/components/Header";
import FindCard from "@/components/FindCard";
import { categories } from "@/lib/finds";
import { getShopifyFinds, productsForCategory } from "@/lib/shopify";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function collectionSlug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collectionName = categories.find((name) => collectionSlug(name) === slug) || slug.replace(/-/g, " ");
  const finds = await getShopifyFinds(100);
  const products = productsForCategory(finds, collectionName);

  return (
    <>
      <Header />
      <main className="collectionPage">
        <div className="collectionPage__head">
          <div>
            <p className="kicker">SHOP THE COLLECTION</p>
            <h1>{collectionName}</h1>
          </div>
          <a className="viewAllLink" href="/#collections">← Back to collections</a>
        </div>
        <div className="collectionPage__grid">
          {products.map((item) => <FindCard key={item.slug} item={item} />)}
        </div>
      </main>
    </>
  );
}
