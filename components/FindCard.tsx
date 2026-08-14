import Link from "next/link";
import type { Find } from "@/lib/finds";

export default function FindCard({ item }: { item: Find }) {
  const external = item.affiliateUrl && item.affiliateUrl !== "#";
  return (
    <article className="findCard">
      <Link href={`/find/${item.slug}`} className={`findVisual ${item.tone}`}>
        {item.imageUrl ? <img className="findProductImage" src={item.imageUrl} alt={item.imageAlt || item.title} /> : <span className="findEmoji">{item.emoji}</span>}
        {item.badge && <span className="badge">{item.badge}</span>}
      </Link>
      <div className="findBody">
        <p className="micro">{item.category} · {item.retailer}</p>
        <h3><Link href={`/find/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.quickTake}</p>
        <div className="cardBottom">
          <strong>{item.price || ""}</strong>
          {external ? <a href={item.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className="textLink">{item.ctaText || "See the Find"} →</a> : <Link href={`/find/${item.slug}`} className="textLink">{item.ctaText || "See the Find"} →</Link>}
        </div>
      </div>
    </article>
  );
}
