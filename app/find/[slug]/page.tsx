import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BuyNowButton from "@/components/BuyNowButton";
import ProductGallery from "@/components/ProductGallery";
import { getShopifyFindByHandle } from "@/lib/shopify";
import { getProductGallery } from "@/lib/productGallery";
import { getProductPageContent } from "@/lib/productContent";
import "../../product-v2.css";

export const dynamic = "force-dynamic";

function sentences(value: string) {
  return (value || "").replace(/•/g, " ").split(/(?<=[.!?])\s+|\n+/).map(v => v.trim()).filter(v => v.length > 15);
}

function fallbackBullets(value: string) {
  return sentences(value)
    .filter(v => !/^(product details|why you|package contents|contents|color|size|material|dimensions?)\s*:/i.test(v))
    .slice(0, 6)
    .map(v => /[.!?]$/.test(v) ? v : `${v}.`);
}

export default async function FindPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getShopifyFindByHandle(slug);
  if (!item) notFound();
  const affiliate = item.purchaseMode === "affiliate" || item.isAffiliate;
  const [gallery, savedCopy] = await Promise.all([getProductGallery(slug), getProductPageContent(slug)]);
  const images = gallery.length ? gallery : item.imageUrl ? [{ url: item.imageUrl, altText: item.imageAlt || item.title }] : [];
  const details = savedCopy?.descriptionHtml || item.fullDescription || item.quickTake || "";
  const bullets = savedCopy?.purchaseBullets?.length ? savedCopy.purchaseBullets : fallbackBullets(details);
  const whySource = savedCopy?.whyYoullLoveIt || item.whyYoullLoveIt || item.quickTake || details;
  const why = sentences(whySource).slice(0, 3).join(" ");

  return (
    <>
      <Header />
      <main className="findPage">
        <a href="/" className="backLink">← Back to all Finds</a>
        <section className="findDetail findDetail--v2">
          <ProductGallery images={images} fallbackEmoji={item.emoji} />
          <div className="detailCopy detailCopy--v2">
            <p className="productEyebrow">{item.category.toUpperCase()}{item.retailer ? ` · ${item.retailer.toUpperCase()}` : ""}</p>
            <h1>{item.title}</h1>
            {item.price && <p className="detailPrice">{item.price}</p>}

            <section className="productDetailsV2">
              <h2>Product Details</h2>
              <div className="productDetailsV2__copy">
                {details.split(/\n+/).filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}
              </div>
              {bullets.length > 0 && <ul className="purchaseBullets">{bullets.map((bullet, index) => <li key={index}>{/[.!?]$/.test(bullet) ? bullet : `${bullet}.`}</li>)}</ul>}
            </section>

            <section className="whyLoveV2">
              <h2>Why You&apos;ll Love It</h2>
              <p>{why || "A practical, useful find designed to make everyday life a little easier."}</p>
            </section>

            {affiliate ? (
              <>
                <a href={item.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className="primaryBtn retailerBtn">{item.ctaText || `Buy on ${item.retailer}`} →</a>
                <p className="tinyDisclosure">Affiliate link: we may earn a commission if you buy through this link, at no extra cost to you.</p>
              </>
            ) : (
              <>
                <BuyNowButton variantId={item.variantId || ""} label={item.ctaText || "Buy Now"} disabled={!item.availableForSale || !item.variantId} />
                <p className="tinyDisclosure">Secure checkout powered by Shopify. Fulfillment may be handled by Fort Crazypants or one of our fulfillment partners.</p>
              </>
            )}
          </div>
        </section>
      </main>
      <footer><a href="/" className="footerLogo" aria-label="Fort Crazypants home"><img src="/fort-crazypants-logo.png" alt="Fort Crazypants — Find Your Next Favorite Thing" /></a><p>© Fort Crazypants · Crazy good finds for real family life.</p></footer>
    </>
  );
}
