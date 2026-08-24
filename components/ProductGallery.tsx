"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ProductGallery({ images, fallbackEmoji = "✨" }: { images: {url:string;altText?:string|null}[]; fallbackEmoji?: string }) {
  const cleanImages = useMemo(() => Array.from(new Map(images.filter(image => image.url).map(image => [image.url, image])).values()).slice(0, 10), [images]);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const touchStart = useRef<number | null>(null);
  const available = cleanImages.filter(image => !failed.includes(image.url));
  const current = available[active];

  useEffect(() => { setActive(0); setFailed([]); }, [images]);
  useEffect(() => { if (active >= available.length) setActive(Math.max(0, available.length - 1)); }, [active, available.length]);

  function move(direction: number) {
    if (available.length < 2) return;
    setActive(index => (index + direction + available.length) % available.length);
  }

  return <div className="productGallery">
    <div className="productGallery__main" tabIndex={available.length > 1 ? 0 : undefined} onKeyDown={event => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={event => { if (touchStart.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1); touchStart.current = null; }}>
      {current ? <img src={current.url} alt={current.altText || `Product image ${active + 1}`} onError={() => setFailed(urls => urls.includes(current.url) ? urls : [...urls, current.url])}/> : <span role="img" aria-label="Product image unavailable">{fallbackEmoji}</span>}
      {available.length > 1 && <><button className="productGallery__arrow productGallery__arrow--previous" type="button" onClick={() => move(-1)} aria-label="Previous product image">‹</button><button className="productGallery__arrow productGallery__arrow--next" type="button" onClick={() => move(1)} aria-label="Next product image">›</button></>}
    </div>
    {available.length > 1 && <div className="productGallery__rail" aria-label="Product images">
      {available.map((image, index) => <button key={image.url} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`View product image ${index + 1}`} aria-current={index === active ? "true" : undefined}>
        <img src={image.url} alt="" loading="lazy" decoding="async" onError={() => setFailed(urls => urls.includes(image.url) ? urls : [...urls, image.url])}/>
      </button>)}
    </div>}
  </div>;
}
