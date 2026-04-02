import { requireSuperAdmin } from "../auth";
import { getOverviewStats } from "../actions";
import { OverviewCharts } from "./overview-charts";
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  growth: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export default async function OverviewPage() {
  await requireSuperAdmin();
  const stats = await getOverviewStats();

  const kpis = [
    {
      name: "Total Tenants",
      value: stats.totalTenants.toLocaleString(),
      icon: BuildingOfficeIcon,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      name: "Total Policies",
      value: stats.totalPolicies.toLocaleString(),
      icon: ShieldCheckIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Platform MRR",
      value: formatCurrency(stats.platformMRR),
      icon: BanknotesIcon,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: "bg-amber-50 text-amber-600",
    },
    {
      name: "Active Users",
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time view of the Insured IQ platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.name}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{kpi.name}</p>
                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <OverviewCharts
        signupChart={stats.signupChart}
        productChart={stats.productChart}
      />

      {/* Recent Signups */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Signups</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Last 10 tenants to join the platform
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentTenants.map((tenant: { id: string; name: string; slug: string; plan: string; status: string; created_at: string }) => (
            <div
              key={tenant.id}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                  {tenant.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tenant.name}
                  </p>
                  <p className="text-xs text-gray-500">{tenant.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    PLAN_COLORS[tenant.plan] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tenant.plan}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(tenant.created_at)}
                </span>
              </div>
            </div>
          ))}
          {stats.recentTenants.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No tenants yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
