import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Known platform hostnames that are NOT tenant subdomains.
 * Add any staging/preview domains here.
 */
const PLATFORM_HOSTS = [
  "localhost",
  "127.0.0.1",
  "insurediq.com",
  "www.insurediq.com",
];

/**
 * Extract a tenant slug from the subdomain if applicable.
 * Example: acme.insurediq.com → "acme"
 * Returns null for platform hosts (localhost, www, etc.)
 */
function extractSubdomainSlug(hostname: string): string | null {
  // Strip port number
  const host = hostname.split(":")[0];

  // Skip known platform hosts
  if (PLATFORM_HOSTS.some((ph) => host === ph || host === `www.${ph}`)) {
    return null;
  }

  // Check for subdomain pattern: {slug}.insurediq.com
  const parts = host.split(".");
  if (parts.length >= 3) {
    const slug = parts[0];
    // Don't treat "www" as a tenant slug
    if (slug !== "www") {
      return slug;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

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
