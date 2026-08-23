"use client";
import { useState } from "react";

export default function ProductGallery({ images, fallbackEmoji = "✨" }: { images: {url:string;altText?:string|null}[]; fallbackEmoji?: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return <div className="productGallery">
    <div className="productGallery__main">
      {current ? <img src={current.url} alt={current.altText || "Product image"}/> : <span>{fallbackEmoji}</span>}
    </div>
    {images.length > 1 && <div className="productGallery__rail" aria-label="Product images">
      {images.map((image, index) => <button key={`${image.url}-${index}`} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`View product image ${index + 1}`}>
        <img src={image.url} alt=""/>
      </button>)}
    </div>}
  </div>;
}
