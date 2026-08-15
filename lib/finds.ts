export type Find = {
  slug: string;
  title: string;
  eyebrow: string;
  category: string;
  retailer: string;
  affiliateUrl: string;
  price?: string;
  verdict: string;
  quickTake: string;
  why: string[];
  badge?: string;
  emoji: string;
  tone: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  isAffiliate?: boolean;
  purchaseMode?: "affiliate" | "shopify";
  variantId?: string;
  availableForSale?: boolean;
  productSource?: string;
  tags?: string[];
  collections?: { title: string; handle: string }[];
};

// Demo data is retained only as an emergency local-development fallback.
export const finds: Find[] = [
  {
    slug: "shark-chillpill",
    title: "Shark ChillPill 3-in-1",
    eyebrow: "Tiny fan. Serious chill.",
    category: "Travel",
    retailer: "Amazon",
    affiliateUrl: "#",
    price: "$—",
    verdict: "Road-trip lifesaver.",
    quickTake: "Portable cooling that earns its space in the car, beach bag or sidelines tote.",
    why: ["Portable and rechargeable", "Family-trip friendly", "Easy impulse-buy price point", "Actually useful after vacation"],
    badge: "Crazy Good Find",
    emoji: "❄️",
    tone: "cool"
  }
];

export const categories = [
  "Trending Finds", "Road Trip Rescues", "Kid Approved", "Dog Stuff",
  "Backyard Fun", "Home Hacks", "Under $25", "Gifts"
];

export function getFind(slug: string) {
  return finds.find((item) => item.slug === slug);
}
