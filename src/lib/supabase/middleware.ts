import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that don't require authentication */
const PUBLIC_PATHS = ["/login", "/register", "/auth", "/portal/login"];

/** Check if a path is a public tenant page (e.g. /acme, /acme/car, /acme/blog, /acme/blog/post-slug) */
function isPublicTenantPath(pathname: string): boolean {
  // Exclude known app route prefixes — use segment boundary matching
  // to avoid false positives (e.g. slug "onboarding-abc" != route "/onboarding")
  const appRoutes = ["/super-admin", "/dashboard", "/portal", "/onboarding", "/api", "/login", "/register", "/auth", "/preview"];
  const isAppRoute = appRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (isAppRoute) return false;
  // Match /{slug}, /{slug}/{segment}, /{slug}/{segment}/{segment} etc.
  // Slug and path segments are lowercase alphanumeric + hyphens.
  return /^\/[a-z0-9][a-z0-9-]*((\/[a-z0-9][a-z0-9-]*)*\/?)?$/.test(pathname);
}

/** Routes accessible to authenticated users who haven't completed onboarding */
const ONBOARDING_PATHS = ["/onboarding"];

/** Role → path prefix mapping */
const ROLE_ROUTES: Record<string, string> = {
  super_admin: "/super-admin",
  owner: "/dashboard",
  sales: "/dashboard",
  finance: "/dashboard",
  marketing: "/dashboard",
  viewer: "/dashboard",
  customer: "/portal",
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isOnboardingPath(pathname: string): boolean {
  return ONBOARDING_PATHS.some((p) => pathname.startsWith(p));
}

function isPortalPath(pathname: string): boolean {
  return pathname.startsWith("/portal");
}

/**
 * Check if a user still needs onboarding.
 * Uses the service role key to bypass RLS, because the self-referencing
 * RLS policy on profiles prevents new users from reading their own row
 * with the anon key.
 *
 * Returns true if either:
 *  - No profile exists for the user
 *  - The profile's tenant is the placeholder ('Onboarding')
 */
async function needsOnboarding(userId: string): Promise<boolean> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id, role, tenants(name)")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return true;

  // Super admins never need tenant onboarding
  if (profile.role === "super_admin") return false;

  // No tenant assigned yet
  if (!profile.tenant_id) return true;

  const tenants = profile.tenants as { name: string }[] | null;
  return tenants?.[0]?.name === "Onboarding";
}

/**
 * Look up the user's role using the service role key.
 */
async function getUserRole(userId: string): Promise<string | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role ?? null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake here could make it
  // very difficult to debug session issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Unauthenticated users ──────────────────────────────────
  if (!user) {
    if (isPublicPath(pathname) || isPublicTenantPath(pathname)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    // Portal routes redirect to portal login, not the tenant login
    url.pathname = isPortalPath(pathname) ? "/portal/login" : "/login";
    return NextResponse.redirect(url);
  }

  // ── Authenticated customer on portal login → redirect to portal ─
  if (pathname === "/portal/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  // ── Authenticated user on login page → redirect away ───────
  if (pathname === "/login") {
    const onboarding = await needsOnboarding(user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    const role = await getUserRole(user.id);
    const dest = ROLE_ROUTES[role ?? ""] ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // ── Allow authenticated users to view public tenant pages ───
  if (isPublicTenantPath(pathname)) {
    return supabaseResponse;
  }

  // ── Onboarding check for protected routes (skip portal) ────
  if (!isPublicPath(pathname) && !isOnboardingPath(pathname) && !isPortalPath(pathname)) {
    const onboarding = await needsOnboarding(user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // ── Already onboarded user visiting /onboarding → dashboard ─
  if (isOnboardingPath(pathname)) {
    const onboarding = await needsOnboarding(user.id);
    if (!onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ── Role-based routing for root "/" ────────────────────────
  if (pathname === "/") {
    const onboarding = await needsOnboarding(user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    const role = await getUserRole(user.id);
    const dest = ROLE_ROUTES[role ?? ""] ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Always return the supabaseResponse object as-is.
  // If you create a new NextResponse you will break session refresh.
  return supabaseResponse;
}
