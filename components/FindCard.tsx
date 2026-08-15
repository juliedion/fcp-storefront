import Link from "next/link";
import type { Find } from "@/lib/finds";
import BuyNowButton from "@/components/BuyNowButton";

export default function FindCard({ item }: { item: Find }) {
  const affiliate = item.purchaseMode === "affiliate" || item.isAffiliate;
  const external = affiliate && item.affiliateUrl && item.affiliateUrl !== "#";
  const rawCardDescription =
    item.whyYoullLoveIt ||
    item.quickTake ||
    item.fullDescription ||
    "";

  function cleanCardDescription(raw: string) {
    let text = (raw || "").replace(/\r/g, " ").trim();

    // Remove only the Product Name field itself. Zendrop often places every
    // field on one line, so never use a "to end of line" expression here.
    if (/^Product Name:/i.test(text)) {
      const labels = [
        "Package Contents:", "Contents:", "Design:", "Colors:", "Color:",
        "Dimensions:", "Material:", "Age Range:", "Size:", "Style:",
        "Features:", "Why You'll Love It", "Why You’ll Love It"
      ];

      const positions = labels
        .map((label) => text.toLowerCase().indexOf(label.toLowerCase()))
        .filter((position) => position > 0);

      if (positions.length) {
        text = text.slice(Math.min(...positions));
      } else {
        // If no importer label exists, remove just the known product title.
        const prefix = `Product Name: ${item.title}`;
        if (text.toLowerCase().startsWith(prefix.toLowerCase())) {
          text = text.slice(prefix.length);
        }
      }
    }

    text = text
      .replace(/^Why You(?:'|’)?ll Love It\\s*:?\\s*/i, "")
      .replace(/\\s*(Package Contents:|Contents:|Design:|Colors:|Color:|Dimensions:|Material:|Age Range:|Size:|Style:|Features:)\\s*/gi, " • $1 ")
      .replace(/\\s+/g, " ")
      .replace(/^\\s*[•·-]\\s*/, "")
      .trim();

    if (text.length > 190) {
      text = `${text.slice(0, 187).replace(/\\s+\\S*$/, "").trim()}…`;
    }

    return text;
  }

  const cleanedCardDescription = cleanCardDescription(rawCardDescription);

  const cardDescription =
    cleanedCardDescription ||
    `${item.title} is a fun, practical Fort Crazypants find picked for everyday family life.`;
  return (
    <article className="findCard">
      <Link href={`/find/${item.slug}`} className={`findVisual ${item.tone}`}>
        {item.imageUrl ? <img className="findProductImage" src={item.imageUrl} alt={item.imageAlt || item.title} /> : <span className="findEmoji">{item.emoji}</span>}
      </Link>
      <div className="findBody">
        {item.badge && <div className="findBadgeRow"><span className="badge cardBadge">{item.badge}</span></div>}
        <p className="micro">{item.category} · {affiliate ? item.retailer : item.productSource === "zendrop" ? "Fort Crazypants" : item.retailer}</p>
        <h3><Link href={`/find/${item.slug}`}>{item.title}</Link></h3>
        <div className="cardWhyBlock">
          <span className="cardWhyHeading">Why You&apos;ll Love It</span>
          <p className="cardDescription">{cardDescription}</p>
        </div>
        <div className="cardBottom hybridCardBottom">
          <strong>{item.price || ""}</strong>
          {external ? (
            <a href={item.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className="textLink">{item.ctaText || `Buy on ${item.retailer}`} →</a>
          ) : item.purchaseMode === "shopify" ? (
            <BuyNowButton variantId={item.variantId || ""} label={item.ctaText || "Buy Now"} disabled={!item.availableForSale || !item.variantId} className="cardBuyButton" />
          ) : (
            <Link href={`/find/${item.slug}`} className="textLink">See the Find →</Link>
          )}
        </div>
      </div>
    </article>
  );
}
