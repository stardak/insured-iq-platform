"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function RevenueCharts({
  revenueChart,
}: {
  revenueChart: { month: string; revenue: number }[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Revenue Over Time</h3>
      <p className="mt-0.5 text-xs text-gray-500">Monthly active policy revenue</p>
      <div className="mt-4 h-72">
        {revenueChart.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) =>
                  `£${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(value) => [
                  `£${Number(value ?? 0).toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
