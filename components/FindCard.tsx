import Link from "next/link";
import type { Find } from "@/lib/finds";
import BuyNowButton from "@/components/BuyNowButton";

export default function FindCard({ item }: { item: Find }) {
  const affiliate = item.purchaseMode === "affiliate" || item.isAffiliate;
  const external = affiliate && item.affiliateUrl && item.affiliateUrl !== "#";
  return (
    <article className="findCard">
      <Link href={`/find/${item.slug}`} className={`findVisual ${item.tone}`}>
        {item.imageUrl ? <img className="findProductImage" src={item.imageUrl} alt={item.imageAlt || item.title} /> : <span className="findEmoji">{item.emoji}</span>}
        {item.badge && <span className="badge">{item.badge}</span>}
      </Link>
      <div className="findBody">
        <p className="micro">{item.category} · {affiliate ? item.retailer : item.productSource === "zendrop" ? "Fort Crazypants" : item.retailer}</p>
        <h3><Link href={`/find/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.quickTake}</p>
        <div className="cardBottom hybridCardBottom">
          <strong>{item.price || ""}</strong>
          {external ? (
            <a href={item.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className="textLink">{item.ctaText || `Buy on ${item.retailer}`} →</a>
          ) : item.purchaseMode === "shopify" ? (
            <BuyNowButton variantId={item.variantId} label={item.ctaText || "Buy Now"} disabled={!item.availableForSale} className="cardBuyButton" />
          ) : (
            <Link href={`/find/${item.slug}`} className="textLink">See the Find →</Link>
          )}
        </div>
      </div>
    </article>
  );
}
