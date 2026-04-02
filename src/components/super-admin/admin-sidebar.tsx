"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

const NAV_ITEMS = [
  { name: "Overview", href: "/super-admin/overview", icon: HomeIcon },
  { name: "Tenants", href: "/super-admin/tenants", icon: BuildingOfficeIcon },
  { name: "Policies", href: "/super-admin/policies", icon: ShieldCheckIcon },
  { name: "Revenue", href: "/super-admin/revenue", icon: CurrencyDollarIcon },
  { name: "Leaderboard", href: "/super-admin/leaderboard", icon: TrophyIcon },
  { name: "Compliance", href: "/super-admin/compliance", icon: ClipboardDocumentCheckIcon },
  { name: "Users", href: "/super-admin/users", icon: UsersIcon },
  { name: "System", href: "/super-admin/system", icon: CogIcon },
];

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex h-full w-56 flex-col bg-gray-950">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-white/10">
        <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500 text-xs font-bold text-white">
          IQ
        </div>
        <span className="text-sm font-semibold text-white">Insured IQ Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/super-admin/overview"
              ? pathname === "/super-admin" || pathname === "/super-admin/overview"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
            {adminEmail[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="truncate text-xs text-gray-400">{adminEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="size-3.5" />
          Log out
        </button>
      </div>
    </div>
  );
}
