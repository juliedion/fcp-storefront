import Header from "@/components/Header";
import FindCard from "@/components/FindCard";
import { categories, finds } from "@/lib/finds";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero hero--fort">
          <div className="hero__scene" aria-hidden="true">
            <img src="/fort-hero-bg.png" alt="" width="1800" height="650" />
            <span className="hero__blink-eye" aria-hidden="true"></span>
          </div>
          <div className="page-width hero__overlay-wrap">
            <div className="hero__copy-card">
              <p className="hero__eyebrow">Cute stuff inside</p>
              <h1 className="hero__title">Crazy Cool <span className="text-pink">Finds</span> You’ll Actually <span className="text-teal">Use</span></h1>
              <p className="hero__subtitle">Clever gadgets, home hacks, family favorites, and gifts that make everyday life easier — and a lot more fun.</p>
              <div className="hero__actions">
                <a href="#finds" className="btn btn--primary">See Today’s Finds →</a>
                <a href="#categories" className="btn btn--outline hero__outline">New Finds</a>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="collectionZone"><div className="collectionTitle">⚡ SHOP BY COLLECTION ⚡</div><div className="categoryBar">
          {categories.map((category) => <a href="#finds" key={category}>{category}</a>)}
        </div></section>

        <section id="finds" className="section">
          <div className="sectionHead">
            <div><p className="kicker">FRESH FROM THE FORT</p><h2>🔥 Crazy-Good Finds</h2></div>
            <a href="#all">See all finds →</a>
          </div>
          <div className="findGrid">
            {finds.slice(0,4).map((item) => <FindCard key={item.slug} item={item} />)}
          </div>
        </section>

        <section className="featureBand">
          <div>
            <p className="kicker light">ROAD TRIP RESCUES</p>
            <h2>Because “are we there yet?” gets old.</h2>
            <p>Backseat sanity, snack containment and things that buy you another 47 minutes.</p>
            <a className="creamBtn" href="#road">Pack the car →</a>
          </div>
          <div className="roadGraphic">🚙<span>ARE<br/>WE<br/>THERE<br/>YET?</span></div>
        </section>

        <section className="section twoCol">
          <div>
            <div className="sectionHead compact"><div><p className="kicker">HOUSEHOLD CHAOS</p><h2>Why didn't I think of that?</h2></div></div>
            <div className="miniGrid">{finds.slice(4,6).map((item) => <FindCard key={item.slug} item={item} />)}</div>
          </div>
          <aside className="under25">
            <p className="kicker light">DANGEROUSLY EASY TO JUSTIFY</p>
            <div className="priceMark">UNDER<br/><strong>$25</strong></div>
            <p>The little finds that somehow end up in the cart because, technically, they solve a problem.</p>
            <a className="creamBtn" href="#finds">Show me →</a>
          </aside>
        </section>

        <section id="crazy-list" className="section crazyList">
          <p className="kicker">FRESH OFF THE PRESS</p>
          <div className="sectionHead"><h2>The Crazy List</h2></div>
          <div className="articleGrid">
            <article><span>01</span><p>ROAD TRIPS</p><h3>10 Road Trip Products That Might Actually Save Your Sanity</h3><a href="#">Read the list →</a></article>
            <article><span>02</span><p>DOGS</p><h3>12 Things Your Dog Definitely Doesn't Need (But Will Love)</h3><a href="#">Read the list →</a></article>
            <article><span>03</span><p>SUMMER</p><h3>9 Backyard Finds That Make Home Feel Like Vacation</h3><a href="#">Read the list →</a></article>
          </div>
        </section>

        <section className="newsletter">
          <div><p className="kicker light">THE GOOD STUFF, WITHOUT THE DOOMSCROLL</p><h2>Get the crazy-good finds.</h2><p>A few genuinely useful things in your inbox. No 87-email welcome sequence.</p></div>
          <form><input aria-label="Email address" placeholder="you@email.com"/><button type="button">I'm in</button></form>
        </section>
      </main>
      <footer>
        <div className="brand footerBrand"><span className="fort">FORT</span><span className="crazy">CRAZYPANTS</span></div>
        <p>Crazy good finds for real family life.</p>
        <p className="disclosure">Fort Crazypants may earn a commission when you buy through some links on this site. It doesn't cost you anything extra.</p>
      </footer>
    </>
  );
}
