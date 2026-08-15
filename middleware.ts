import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const shopDomain = (process.env.SHOPIFY_STORE_DOMAIN || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!shopDomain) {
    return NextResponse.next();
  }

  const incoming = request.nextUrl;

  // Only hand off Shopify cart/checkout paths that accidentally land
  // on the public headless domain.
  if (incoming.pathname.startsWith("/cart/")) {
    if (incoming.hostname === shopDomain) {
      return NextResponse.next();
    }

    const target = new URL(incoming.toString());
    target.protocol = "https:";
    target.hostname = shopDomain;
    target.port = "";

    return NextResponse.redirect(target, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/:path*"],
};
