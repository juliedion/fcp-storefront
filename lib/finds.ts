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
  whyYoullLoveIt?: string;
  fullDescription?: string;
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
  galleryImages?: { url: string; altText?: string | null }[];
  purchaseBullets?: string[];
  savedWhyYoullLoveIt?: string;
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
  "Best Sellers",
  "Back to School",
  "End of Summer Blowout",
  "Fall Finds",
  "Halloween",
  "Home, Kitchen, Decor & More",
  "Gift-worthy Finds",
  "Boredom Busters",
  "Hot Mama Finds",
  "Home Office & Workday Wins",
  "Sports Parent & Sideline Finds",
  "Baby, Kids & Littles",
  "Teens & Tweens",
  "Travel Finds",
  "Craft & Hobby",
  "Personal Care",
  "Garden & Outdoor",
  "Organization Finds",
  "Hot Romance & Couples",
  "Man Caves, Garages & Grills",
  "Fitness & Sports",
  "Hot Toys",
  "Apparel & Accessories",
  "Electronics, Cameras & More",
  "Dads & Dudes"
];

export function getFind(slug: string) {
  return finds.find((item) => item.slug === slug);
}
