"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/brand": "Brand Settings",
  "/dashboard/team": "Team",
  "/dashboard/brand-settings": "Brand Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();

  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path) && path !== "/dashboard"
    )?.[1] ??
    "Dashboard";

  return (
    <div className="flex flex-1 items-center justify-between">
      <h1 className="text-sm font-medium">{title}</h1>
    </div>
  );
}
