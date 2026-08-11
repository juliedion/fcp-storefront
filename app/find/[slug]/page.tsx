import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { finds, getFind } from "@/lib/finds";

export function generateStaticParams() {
  return finds.map((item) => ({ slug: item.slug }));
}

export default async function FindPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getFind(slug);
  if (!item) notFound();

  return (
    <>
      <Header />
      <main className="findPage">
        <a href="/" className="backLink">← Back to all Finds</a>
        <section className="findDetail">
          <div className={`detailVisual ${item.tone}`}>
            <span>{item.emoji}</span>
            {item.badge && <b>{item.badge}</b>}
          </div>
          <div className="detailCopy">
            <p className="kicker">{item.category} · {item.retailer}</p>
            <h1>{item.title}</h1>
            <p className="eyebrow">{item.eyebrow}</p>
            <div className="verdict"><small>THE FCP VERDICT</small><strong>{item.verdict}</strong></div>
            <p className="detailLead">{item.quickTake}</p>
            <h2>Why we picked it</h2>
            <ul>{item.why.map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>
            <a href={item.affiliateUrl} rel="sponsored nofollow" className="primaryBtn retailerBtn">Check price at {item.retailer} →</a>
            <p className="tinyDisclosure">Affiliate link: we may earn a commission if you buy through this link, at no extra cost to you.</p>
          </div>
        </section>
      </main>
      <footer><p>© Fort Crazypants · Crazy good finds for real family life.</p></footer>
    </>
  );
}
