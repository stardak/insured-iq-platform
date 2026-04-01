import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that don't require authentication */
const PUBLIC_PATHS = ["/login", "/auth"];

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

/**
 * Check if a user still needs onboarding (has a placeholder tenant).
 * Returns true if the user's tenant name is 'Onboarding'.
 */
async function needsOnboarding(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, tenants(name)")
    .eq("id", userId)
    .single();

  if (!profile) return true;

  // Check if the tenant is a placeholder
  const tenant = profile.tenants as { name: string } | null;
  return tenant?.name === "Onboarding";
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
    if (isPublicPath(pathname)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Authenticated user on login page → redirect away ───────
  if (pathname === "/login") {
    const onboarding = await needsOnboarding(supabase, user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const dest = ROLE_ROUTES[profile?.role ?? ""] ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // ── Onboarding check for protected routes ──────────────────
  if (!isPublicPath(pathname) && !isOnboardingPath(pathname)) {
    const onboarding = await needsOnboarding(supabase, user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // ── Already onboarded user visiting /onboarding → dashboard ─
  if (isOnboardingPath(pathname)) {
    const onboarding = await needsOnboarding(supabase, user.id);
    if (!onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ── Role-based routing for root "/" ────────────────────────
  if (pathname === "/") {
    const onboarding = await needsOnboarding(supabase, user.id);
    if (onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const dest = ROLE_ROUTES[profile?.role ?? ""] ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Always return the supabaseResponse object as-is.
  // If you create a new NextResponse you will break session refresh.
  return supabaseResponse;
}
