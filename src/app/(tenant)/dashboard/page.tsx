import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Car,
  Home,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig } from "@/types/brand";

// ─── Demo data ──────────────────────────────────────────────

const KPI_CARDS = [
  {
    title: "Total Policies",
    value: "156",
    change: "+18%",
    trend: "up" as const,
    description: "from last month",
    icon: FileText,
  },
  {
    title: "Active Customers",
    value: "124",
    change: "+12%",
    trend: "up" as const,
    description: "from last month",
    icon: Users,
  },
  {
    title: "Monthly Revenue",
    value: "£45,230",
    change: "+23%",
    trend: "up" as const,
    description: "from last month",
    icon: DollarSign,
  },
  {
    title: "Conversion Rate",
    value: "28.4%",
    change: "+3.2pp",
    trend: "up" as const,
    description: "from last month",
    icon: TrendingUp,
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

// ─── Page ───────────────────────────────────────────────────

export default async function DashboardOverviewPage() {
  // Fetch company name from brand_config
  let companyName = "your dashboard";
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
          .select("name, brand_config")
          .eq("id", profile.tenant_id)
          .single();

        if (tenant) {
          const config = (tenant.brand_config ?? {}) as Partial<BrandConfig>;
          companyName = config.company_name || tenant.name || "your dashboard";
        }
      }
    }
  } catch {
    // Fallback silently
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {companyName} 👋
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your insurance business today.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon =
            kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendColor =
            kpi.trend === "up" ? "text-emerald-600" : "text-red-500";

          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {kpi.value}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <TrendIcon className={`size-3 ${trendColor}`} />
                  <span className={trendColor}>{kpi.change}</span>
                  <span className="text-muted-foreground">
                    {kpi.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity + Top Products */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {item.text}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.customer}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{item.amount}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="size-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TOP_PRODUCTS.map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.policies} policies
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${product.share}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-14 text-right">
                      {product.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
