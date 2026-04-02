import { requireSuperAdmin } from "../auth";
import { getRevenueData } from "../actions";
import { RevenueCharts } from "./revenue-charts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default async function RevenuePage() {
  await requireSuperAdmin();
  const data = await getRevenueData();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide revenue analytics and payouts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Revenue", value: formatCurrency(data.totalRevenue), color: "bg-emerald-50 text-emerald-600" },
          { label: "Platform Commission (15%)", value: formatCurrency(data.totalCommission), color: "bg-indigo-50 text-indigo-600" },
          { label: "VAT Liability (20%)", value: formatCurrency(data.vatAmount), color: "bg-amber-50 text-amber-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <RevenueCharts revenueChart={data.revenueChart} />

      {/* Tenant Breakdown */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Revenue by Tenant</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Commission Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.tenantBreakdown
                .sort((a, b) => b.revenue - a.revenue)
                .map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium capitalize text-indigo-700">{tenant.plan}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(tenant.revenue)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(tenant.commission)}</td>
                  </tr>
                ))}
              {data.tenantBreakdown.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No revenue data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Schedule */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Upcoming Payout Schedule</h3>
        <p className="mt-1 text-xs text-gray-500">Payouts are processed on the 1st and 15th of each month.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Next payout date</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date().getDate() < 15
                ? `15 ${new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
                : `1 ${new Date(new Date().getFullYear(), new Date().getMonth() + 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Estimated payout amount</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(data.totalCommission / 2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
