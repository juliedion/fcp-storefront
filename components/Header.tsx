import Link from "next/link";

export default function Header() {
  return (
    <header className="siteHeader">
      <Link href="/" className="brand">
        <span className="fort">FORT</span>
        <span className="crazy">CRAZYPANTS</span>
      </Link>
      <nav>
        <a href="#finds">Finds</a>
        <a href="#crazy-list">The Crazy List</a>
        <a href="#categories">Categories</a>
      </nav>
      <a className="headerCta" href="#finds">Find Something Good</a>
    </header>
  );
}
