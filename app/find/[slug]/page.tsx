import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BuyNowButton from "@/components/BuyNowButton";
import { getShopifyFindByHandle } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export default async function FindPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getShopifyFindByHandle(slug);
  if (!item) notFound();
  const affiliate = item.purchaseMode === "affiliate" || item.isAffiliate;

  return (
    <>
      <Header />
      <main className="findPage">
        <a href="/" className="backLink">← Back to all Finds</a>
        <section className="findDetail">
          <div className={`detailVisual ${item.tone}`}>
            {item.imageUrl ? <img className="detailProductImage" src={item.imageUrl} alt={item.imageAlt || item.title} /> : <span>{item.emoji}</span>}
            {item.badge && <b>{item.badge}</b>}
          </div>
          <div className="detailCopy">
            <p className="kicker">{item.category} · {affiliate ? item.retailer : "Fort Crazypants"}</p>
            <h1>{item.title}</h1>
            <p className="eyebrow">{item.eyebrow}</p>
            <div className="verdict"><small>THE FCP VERDICT</small><strong>{item.verdict}</strong></div>
            <p className="detailLead">{item.quickTake}</p>
            {item.price && <p className="detailPrice">{item.price}</p>}

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
