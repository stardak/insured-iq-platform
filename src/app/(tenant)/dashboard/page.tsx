import {
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/20/solid";
import {
  Clock,
  Car,
  Home,
  Activity,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig } from "@/types/brand";
import { PublicUrlCard } from "@/components/tenant/public-url-card";

// ─── Demo data ──────────────────────────────────────────────

const KPI_STATS = [
  {
    name: "Total Policies",
    stat: "156",
    previousStat: "132",
    change: "18%",
    changeType: "increase" as const,
  },
  {
    name: "Active Customers",
    stat: "124",
    previousStat: "111",
    change: "12%",
    changeType: "increase" as const,
  },
  {
    name: "Monthly Revenue",
    stat: "£45,230",
    previousStat: "£36,770",
    change: "23%",
    changeType: "increase" as const,
  },
  {
    name: "Conversion Rate",
    stat: "28.4%",
    previousStat: "25.2%",
    change: "3.2pp",
    changeType: "increase" as const,
  },
];

const RECENT_ACTIVITY = [
  {
    icon: Car,
    text: "New car insurance policy sold",
    customer: "Sarah M.",
    time: "2 hours ago",
    amount: "£420",
  },
  {
    icon: Home,
    text: "Home insurance renewal",
    customer: "James L.",
    time: "5 hours ago",
    amount: "£850",
  },
  {
    icon: Shield,
    text: "Health insurance claim approved",
    customer: "Emily R.",
    time: "Yesterday",
    amount: "£1,200",
  },
  {
    icon: Activity,
    text: "New health insurance quote",
    customer: "Tom K.",
    time: "Yesterday",
    amount: "£380",
  },
  {
    icon: Car,
    text: "Car insurance policy renewed",
    customer: "Anna P.",
    time: "2 days ago",
    amount: "£395",
  },
];

const TOP_PRODUCTS = [
  { name: "Car Insurance", policies: 58, revenue: "£18,200", share: 40.2 },
  { name: "Home Insurance", policies: 42, revenue: "£14,900", share: 32.9 },
  { name: "Health Insurance", policies: 31, revenue: "£8,430", share: 18.6 },
  { name: "Life Insurance", policies: 15, revenue: "£2,850", share: 6.3 },
  { name: "Pet Insurance", policies: 10, revenue: "£850", share: 2.0 },
];

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Page ───────────────────────────────────────────────────

export default async function DashboardOverviewPage() {
  // Fetch company name and slug from tenant
  let companyName = "your dashboard";
  let tenantSlug: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (profile?.tenant_id) {
        const { data: tenant } = await admin
          .from("tenants")
          .select("name, slug, brand_config")
          .eq("id", profile.tenant_id)
          .single();

        if (tenant) {
          const config = (tenant.brand_config ?? {}) as Partial<BrandConfig>;
          companyName = config.company_name || tenant.name || "your dashboard";
          tenantSlug = tenant.slug ?? null;
        }
      }
    }
  } catch {
    // Fallback silently
  }

  const publicUrl = tenantSlug
    ? `https://insured-iq-platform.vercel.app/${tenantSlug}`
    : null;

  return (
    <div className="space-y-8">
      {/* ── Page header ────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Welcome back, {companyName} 👋
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your insurance business today.
        </p>
      </div>

      {/* ── KPI Stats (Tailwind Plus: 05-with-shared-borders) ─ */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Last 30 days</h3>
        <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0">
          {KPI_STATS.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900">
                {item.name}
              </dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                  {item.stat}
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    from {item.previousStat}
                  </span>
                </div>

                <div
                  className={cn(
                    item.changeType === "increase"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                    "inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0"
                  )}
                >
                  {item.changeType === "increase" ? (
                    <ArrowUpIcon
                      aria-hidden="true"
                      className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-green-500"
                    />
                  ) : (
                    <ArrowDownIcon
                      aria-hidden="true"
                      className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-red-500"
                    />
                  )}
                  <span className="sr-only">
                    {item.changeType === "increase" ? "Increased" : "Decreased"}{" "}
                    by{" "}
                  </span>
                  {item.change}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Public URL card ────────────────────────────── */}
      {publicUrl && <PublicUrlCard url={publicUrl} />}

      {/* ── Activity + Top Products ────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <div className="lg:col-span-4 overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {RECENT_ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-x-4 px-4 py-4 sm:px-6"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.text}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {item.customer}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.amount}
                      </p>
                      <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-gray-500">
                        <Clock className="size-3" />
                        {item.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-3 overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold text-gray-900">
              Top Products
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-5">
              {TOP_PRODUCTS.map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {product.name}
                    </span>
                    <span className="text-gray-500">
                      {product.policies} policies
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${product.share}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs font-medium text-gray-500">
                      {product.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
