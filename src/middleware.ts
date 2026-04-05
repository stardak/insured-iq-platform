import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * The production domain where tenant subdomains are expected.
 * e.g. acme.insurediq.com → slug "acme"
 */
const TENANT_DOMAIN = "insurediq.com";

/**
 * Extract a tenant slug from the subdomain if applicable.
 * Only matches: {slug}.insurediq.com
 * Returns null for everything else (Vercel previews, localhost, etc.)
 */
function extractSubdomainSlug(hostname: string): string | null {
  // Strip port number
  const host = hostname.split(":")[0];

  // Only detect subdomains on the production tenant domain
  if (!host.endsWith(`.${TENANT_DOMAIN}`)) {
    return null;
  }

  // Extract the subdomain part
  const slug = host.slice(0, -(TENANT_DOMAIN.length + 1)); // strip ".insurediq.com"

  // Must be a single subdomain segment (no dots), not empty, not "www"
  if (!slug || slug.includes(".") || slug === "www") {
    return null;
  }

  return slug;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // ── Site-wide password gate ────────────────────────────────
  // Skip the gate for: /gate page, /api/gate endpoint, /embed routes
  const isGateRoute = pathname === "/gate" || pathname === "/api/gate";
  const isEmbedRoute = pathname.startsWith("/embed");

  if (!isGateRoute && !isEmbedRoute) {
    const siteAccess = request.cookies.get("site_access")?.value;
    if (siteAccess !== "granted") {
      const url = request.nextUrl.clone();
      url.pathname = "/gate";
      return NextResponse.redirect(url);
    }
  }

  // ── Subdomain routing ──────────────────────────────────────
  // If we detect a tenant subdomain, rewrite to the (public) route group.
  // acme.insurediq.com → rewrite to /(public)/acme
  // acme.insurediq.com/car → rewrite to /(public)/acme/car
  const slug = extractSubdomainSlug(hostname);

  if (slug) {
    // Rewrite to the public route group
    const url = request.nextUrl.clone();
    url.pathname = `/${slug}${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-tenant-slug", slug);
    return response;
  }

  // ── Default: run the Supabase auth middleware ──────────────
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
