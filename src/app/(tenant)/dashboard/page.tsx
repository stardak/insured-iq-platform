import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── KPI card data ──────────────────────────────────────────

const KPI_CARDS = [
  {
    title: "Total Policies",
    value: "0",
    change: "+0%",
    trend: "up" as const,
    description: "from last month",
    icon: FileText,
  },
  {
    title: "Active Customers",
    value: "0",
    change: "+0%",
    trend: "up" as const,
    description: "from last month",
    icon: Users,
  },
  {
    title: "Monthly Revenue",
    value: "£0.00",
    change: "+0%",
    trend: "up" as const,
    description: "from last month",
    icon: DollarSign,
  },
  {
    title: "Conversion Rate",
    value: "0%",
    change: "+0pp",
    trend: "up" as const,
    description: "from last month",
    icon: TrendingUp,
  },
];

// ─── Page ───────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your insurance dashboard. Key metrics and activity will
          appear here.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon =
            kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendColor =
            kpi.trend === "up"
              ? "text-emerald-600"
              : "text-red-500";

          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground/60" />
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

      {/* Placeholder for future charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chart will appear here once policies are created
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              No recent activity yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
