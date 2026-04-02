"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";

type TenantStats = {
  id: string;
  name: string;
  slug: string;
  policiesThisMonth: number;
  revenueThisMonth: number;
  policiesLastMonth: number;
  allTimePolicies: number;
  allTimeRevenue: number;
};

const MEDAL_COLORS = ["text-amber-500", "text-gray-400", "text-amber-700"];
const MEDAL_LABELS = ["🥇", "🥈", "🥉"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(value);
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <ArrowUpIcon className="inline size-3.5 text-emerald-500" />;
  if (current < previous) return <ArrowDownIcon className="inline size-3.5 text-red-500" />;
  return <MinusIcon className="inline size-3.5 text-gray-400" />;
}

export function LeaderboardTable({ data }: { data: TenantStats[] }) {
  const [mode, setMode] = useState<"monthly" | "alltime">("monthly");

  const sorted = [...data].sort((a, b) =>
    mode === "monthly"
      ? b.revenueThisMonth - a.revenueThisMonth
      : b.allTimeRevenue - a.allTimeRevenue
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("monthly")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "monthly" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setMode("alltime")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "alltime" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All Time
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-12">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tenant</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Policies (Month)</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Revenue (Month)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Trend</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">All-Time Policies</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">All-Time Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((tenant, i) => (
                <tr key={tenant.id} className={`hover:bg-gray-50 transition-colors ${i < 3 ? "bg-amber-50/30" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {i < 3 ? (
                      <span className="text-lg">{MEDAL_LABELS[i]}</span>
                    ) : (
                      <span className="text-gray-500 font-medium">{i + 1}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex size-7 items-center justify-center rounded-md text-xs font-bold ${i < 3 ? `${MEDAL_COLORS[i]} bg-amber-50` : "bg-indigo-50 text-indigo-600"}`}>
                        {tenant.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">{tenant.policiesThisMonth}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(tenant.revenueThisMonth)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <TrendArrow current={tenant.policiesThisMonth} previous={tenant.policiesLastMonth} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">{tenant.allTimePolicies}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(tenant.allTimeRevenue)}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
