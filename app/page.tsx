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
            <div className="hero__skyMotion">
              <span className="hero__sun" />
              <span className="hero__cloud hero__cloud--one" />
              <span className="hero__cloud hero__cloud--two" />
              <span className="hero__cloud hero__cloud--three" />
              <span className="hero__plane" aria-hidden="true">
                <svg className="hero__airTrail" viewBox="0 0 330 100" preserveAspectRatio="none">
                  <path d="M320 52 C250 50 230 80 175 72 C125 65 118 32 72 41 C42 47 28 70 4 67" />
                  <path d="M318 58 C252 58 226 88 170 80 C118 73 109 41 66 49" />
                </svg>
                <svg className="hero__planeArt" viewBox="0 0 180 92">
                  <g stroke="#164b78" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
                    <path d="M24 48 C55 44 83 38 116 31 C139 26 158 27 170 35 C174 38 174 43 170 46 C156 57 133 61 108 59 L70 57 L35 65 Z" fill="#fffaf0"/>
                    <path d="M76 40 L103 10 C106 7 111 7 115 10 L129 25 L112 35 Z" fill="#ff4b77"/>
                    <path d="M83 58 L117 82 C121 85 127 84 130 80 L138 62 L110 56 Z" fill="#ff4b77"/>
                    <path d="M36 46 L18 26 L10 31 L23 50 Z" fill="#ff4b77"/>
                    <path d="M35 61 L19 75 L12 69 L25 56 Z" fill="#ff4b77"/>
                    <path d="M158 32 C166 33 173 37 176 41 C171 46 164 49 157 51 Z" fill="#ff9f3c"/>
                  </g>
                  <g fill="#64d8f3" stroke="#164b78" strokeWidth="2.5">
                    <circle cx="118" cy="39" r="5"/><circle cx="135" cy="37" r="5"/><circle cx="151" cy="38" r="5"/>
                  </g>
                  <circle cx="102" cy="48" r="3.5" fill="#ffdd46"/>
                </svg>
              </span>
            </div>
            <div className="hero__art">
              <picture>
                <source media="(max-width: 900px)" srcSet="/fort-hero-bg-m.png" />
                <img src="/fort-hero-bg.png" alt="" width="1800" height="654" />
              </picture>
              <span className="hero__blink-eye" aria-hidden="true"></span>
            </div>
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
        <a href="/" className="footerLogo" aria-label="Fort Crazypants home"><img src="/fort-crazypants-logo.png" alt="Fort Crazypants — Find Your Next Favorite Thing" /></a>
        <p>Crazy good finds for real family life.</p>
        <p className="disclosure">Fort Crazypants may earn a commission when you buy through some links on this site. It doesn't cost you anything extra.</p>
      </footer>
    </>
  );
}
