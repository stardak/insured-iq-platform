"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  SwatchIcon,
  RectangleGroupIcon,
  CodeBracketIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

// ─── Navigation items ───────────────────────────────────────

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Products", href: "/dashboard/products", icon: CubeIcon },
  { name: "Brand Settings", href: "/dashboard/brand", icon: SwatchIcon },
  { name: "Page Builder", href: "/dashboard/page-builder", icon: RectangleGroupIcon },
  { name: "Embed", href: "/dashboard/embed", icon: CodeBracketIcon },
  { name: "Team", href: "/dashboard/team", icon: UsersIcon },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCardIcon },
];

// ─── User profile data ─────────────────────────────────────

type UserProfile = {
  email: string;
  first_name: string | null;
  last_name: string | null;
};

function useUserProfile(): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
          else setProfile({ email: user.email ?? "", first_name: null, last_name: null });
        });
    });
  }, []);

  return profile;
}

function getDisplayName(profile: UserProfile): string {
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : profile.email.split("@")[0];
}

function getInitials(profile: UserProfile): string {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }
  return profile.email[0]?.toUpperCase() ?? "U";
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Sidebar component (Tailwind Plus: 02-dark) ────────────

export function DashboardSidebar({ tenantSlug }: { tenantSlug?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useUserProfile();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex h-full w-72 flex-col bg-gray-900">
      {/* ── Logo / Branding ──────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center gap-x-3 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white text-sm font-bold">
          IQ
        </div>
        <span className="text-sm font-semibold text-white">Insured IQ</span>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex flex-1 flex-col px-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {/* Primary nav */}
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? "bg-white/5 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white",
                        "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={cn(
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white",
                          "size-6 shrink-0"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* External links section */}
          {tenantSlug && (
            <li>
              <div className="text-xs/6 font-semibold text-gray-400">
                Quick links
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                <li>
                  <a
                    href={`https://insured-iq-platform.vercel.app/${tenantSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                  >
                    <ArrowTopRightOnSquareIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-white"
                    />
                    <span className="truncate">View public page</span>
                  </a>
                </li>
              </ul>
            </li>
          )}

          {/* ── User profile + logout ─────────────────── */}
          <li className="-mx-6 mt-auto">
            {/* User info */}
            <div className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-medium text-gray-300 ring-1 ring-white/10">
                {profile ? getInitials(profile) : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate" aria-hidden="true">
                  {profile ? getDisplayName(profile) : "Loading…"}
                </span>
                {profile?.email && (
                  <span className="block truncate text-xs font-normal text-gray-400">
                    {profile.email}
                  </span>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowRightStartOnRectangleIcon
                aria-hidden="true"
                className="size-6 shrink-0"
              />
              Log out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
