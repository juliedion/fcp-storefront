import Link from "next/link";
import type { Find } from "@/lib/finds";

export default function FindCard({ item }: { item: Find }) {
  return (
    <article className="findCard">
      <Link href={`/find/${item.slug}`} className={`findVisual ${item.tone}`}>
        <span className="findEmoji">{item.emoji}</span>
        {item.badge && <span className="badge">{item.badge}</span>}
      </Link>
      <div className="findBody">
        <p className="micro">{item.category} · {item.retailer}</p>
        <h3><Link href={`/find/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.quickTake}</p>
        <div className="cardBottom">
          <strong>{item.price}</strong>
          <Link href={`/find/${item.slug}`} className="textLink">See the Find →</Link>
        </div>
      </div>
    </article>
  );
}
